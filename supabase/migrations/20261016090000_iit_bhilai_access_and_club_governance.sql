-- IIT Bhilai email-gated access, controlled platform-admin bootstrap,
-- club leadership approval, interview invitations, and permission-aware club rooms.
-- This migration intentionally does NOT mark IIT Bhilai as institutionally endorsed.
-- It only restricts the single-campus product to confirmed @iitbhilai.ac.in email accounts.

begin;

-- ---------------------------------------------------------------------------
-- 1. Restrict future account creation at the database boundary.
--    Client-side validation is UX only; this trigger cannot be bypassed by
--    calling Supabase Auth directly.
-- ---------------------------------------------------------------------------
create or replace function private.enforce_iit_bhilai_signup_email()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.email is null
     or lower(btrim(new.email)) !~ '^[^@[:space:]]+@iitbhilai[.]ac[.]in$' then
    raise exception 'Koinelio signup requires a confirmed IIT Bhilai institute email (@iitbhilai.ac.in).'
      using errcode = '23514';
  end if;

  -- A signup field is never permitted to assign campus administration roles.
  -- Platform administration is granted only by the private email allowlist
  -- below, following email confirmation.
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', 'student');
  return new;
end;
$function$;

drop trigger if exists koinelio_enforce_iit_bhilai_signup_email on auth.users;
create trigger koinelio_enforce_iit_bhilai_signup_email
before insert on auth.users
for each row execute function private.enforce_iit_bhilai_signup_email();

create or replace function private.is_iit_bhilai_email_verified(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from auth.users u
    where u.id = p_user_id
      and u.email_confirmed_at is not null
      and lower(btrim(coalesce(u.email, ''))) ~ '^[^@[:space:]]+@iitbhilai[.]ac[.]in$'
  );
$function$;

revoke all on function private.enforce_iit_bhilai_signup_email() from public, anon, authenticated;
revoke all on function private.is_iit_bhilai_email_verified(uuid) from public, anon;
grant execute on function private.is_iit_bhilai_email_verified(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Owner-managed, private bootstrap allowlist for platform administrators.
--    There are deliberately no client-side SELECT/INSERT/UPDATE policies.
--    Add only owner-designated @iitbhilai.ac.in emails from the Supabase SQL
--    Editor; a user cannot make themselves an administrator in signup metadata.
-- ---------------------------------------------------------------------------
create table if not exists private.bootstrap_admin_emails (
  email text primary key,
  added_at timestamptz not null default now(),
  constraint bootstrap_admin_emails_lowercase check (email = lower(email)),
  constraint bootstrap_admin_emails_iit_domain check (
    email ~ '^[^@[:space:]]+@iitbhilai[.]ac[.]in$'
  )
);

revoke all on table private.bootstrap_admin_emails from public, anon, authenticated;

create or replace function private.provision_bootstrap_admin()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.email_confirmed_at is not null
     and new.email is not null
     and exists (
       select 1 from private.bootstrap_admin_emails allowlist
       where allowlist.email = lower(btrim(new.email))
     ) then
    insert into public.platform_admins (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$function$;

revoke all on function private.provision_bootstrap_admin() from public, anon, authenticated;

drop trigger if exists zzz_koinelio_provision_bootstrap_admin on auth.users;
create trigger zzz_koinelio_provision_bootstrap_admin
after insert or update of email, email_confirmed_at on auth.users
for each row execute function private.provision_bootstrap_admin();

-- ---------------------------------------------------------------------------
-- 3. Add the Core Member tier and campus-president governance role.
-- ---------------------------------------------------------------------------
alter table public.club_memberships
  drop constraint if exists club_memberships_role_check;
alter table public.club_memberships
  add constraint club_memberships_role_check
  check (role in ('member', 'core_member', 'coordinator'));

alter table public.institution_roles
  drop constraint if exists institution_roles_role_check;
alter table public.institution_roles
  add constraint institution_roles_role_check
  check (role in (
    'institution_admin',
    'president',
    'technical_gs',
    'cultural_gs',
    'moderator',
    'club_coordinator'
  ));

alter table public.institution_role_requests
  drop constraint if exists institution_role_requests_requested_role_check;
alter table public.institution_role_requests
  add constraint institution_role_requests_requested_role_check
  check (requested_role in (
    'institution_admin',
    'president',
    'technical_gs',
    'cultural_gs',
    'moderator',
    'club_coordinator'
  ));

-- ---------------------------------------------------------------------------
-- 4. Club interview invitations. A coordinator may invite a selected person
--    as a general member or core member. The invitee must explicitly accept.
--    Direct table writes are disabled; use the secure RPCs below.
-- ---------------------------------------------------------------------------
create table if not exists public.club_member_invitations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  invited_role text not null default 'member'
    check (invited_role in ('member', 'core_member')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  message text not null default '' check (char_length(message) <= 1200),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint club_member_invitation_not_self check (invitee_id <> invited_by)
);

create index if not exists idx_club_member_invitations_invitee_status
  on public.club_member_invitations (invitee_id, status, created_at desc);
create index if not exists idx_club_member_invitations_club_status
  on public.club_member_invitations (club_id, status, created_at desc);
create unique index if not exists uq_pending_club_member_invitation
  on public.club_member_invitations (club_id, invitee_id)
  where status = 'pending';

alter table public.club_member_invitations enable row level security;

drop policy if exists "Users and club leaders read relevant invitations" on public.club_member_invitations;
create policy "Users and club leaders read relevant invitations"
on public.club_member_invitations
for select to authenticated
using (
  invitee_id = (select auth.uid())
  or invited_by = (select auth.uid())
  or private.can_manage_club(club_id)
);

-- No INSERT/UPDATE/DELETE policy is intentional. Invitation operations happen
-- through security-definer RPCs that validate the current caller and target.

-- ---------------------------------------------------------------------------
-- 5. Three permission-controlled rooms for every club:
--    general = all confirmed campus-email accounts (approved clubs only)
--    members = active club members, core members, and coordinators
--    core = core members and coordinators
--    platform admins and the appointed campus president can oversee all rooms.
-- ---------------------------------------------------------------------------
create table if not exists public.club_rooms (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  room_type text not null check (room_type in ('general', 'members', 'core')),
  name text not null,
  created_at timestamptz not null default now(),
  unique (club_id, room_type),
  check (char_length(btrim(name)) between 1 and 100)
);

create table if not exists public.club_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.club_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (
    char_length(btrim(content)) between 1 and 5000
  ),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create index if not exists idx_club_room_messages_room_created
  on public.club_room_messages (room_id, created_at desc);
create index if not exists idx_club_room_messages_sender_created
  on public.club_room_messages (sender_id, created_at desc);

alter table public.club_rooms enable row level security;
alter table public.club_room_messages enable row level security;

create or replace function private.is_campus_president()
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.institution_roles ir
    where ir.user_id = (select auth.uid())
      and ir.role = 'president'
      and ir.status = 'active'
      and ir.club_id is null
  );
$function$;

create or replace function private.can_oversee_club(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select case
    when p_club_id is null then false
    else private.is_platform_admin()
      or private.is_campus_president()
  end;
$function$;

-- Extend the existing manager check: preserve coordinators and institution
-- admins, and allow the platform administrator/campus president to oversee all
-- club operations. Keep this SECURITY DEFINER so nested private checks execute
-- with the function owner's privileges.
-- Presidents and platform administrators may approve/suspend any club. The
-- existing trigger continues to block all other users from changing approval.
create or replace function public.guard_club_privileged_fields()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if current_user = 'authenticated' then
    if new.created_by is distinct from old.created_by
      or new.institution_id is distinct from old.institution_id then
      raise exception 'Club ownership and institution cannot be changed directly';
    end if;
    if new.approval_status is distinct from old.approval_status
      and not public.has_institution_role(old.institution_id, array['institution_admin'])
      and not private.can_oversee_club(old.id) then
      raise exception 'Club approval status requires an administrator or campus president';
    end if;
  end if;
  return new;
end;
$function$;

create or replace function private.can_manage_club(p_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select case when p_club_id is null then false else
    (
      exists (
        select 1 from public.clubs c
        where c.id = p_club_id and c.created_by = (select auth.uid())
      )
      or exists (
        select 1 from public.club_memberships cm
        where cm.club_id = p_club_id
          and cm.user_id = (select auth.uid())
          and cm.role = 'coordinator'
          and cm.status = 'active'
      )
      or exists (
        select 1 from public.institution_roles ir
        where ir.club_id = p_club_id
          and ir.user_id = (select auth.uid())
          and ir.role = 'club_coordinator'
          and ir.status = 'active'
      )
      or exists (
        select 1
        from public.clubs c
        join public.institution_roles ir
          on ir.institution_id = c.institution_id
        where c.id = p_club_id
          and ir.user_id = (select auth.uid())
          and ir.role = 'institution_admin'
          and ir.status = 'active'
      )
      or private.can_oversee_club(p_club_id)
    )
  end
$function$;

-- A central definition shared by room RLS and all UI entry points.
create or replace function private.can_access_club_room(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1
    from public.club_rooms room
    join public.clubs club on club.id = room.club_id
    where room.id = p_room_id
      and (
        private.can_oversee_club(club.id)
        or (
          private.is_iit_bhilai_email_verified((select auth.uid()))
          and club.approval_status = 'approved'
          and (
            room.room_type = 'general'
            or (
              room.room_type = 'members'
              and exists (
                select 1 from public.club_memberships cm
                where cm.club_id = club.id
                  and cm.user_id = (select auth.uid())
                  and cm.status = 'active'
                  and cm.role in ('member', 'core_member', 'coordinator')
              )
            )
            or (
              room.room_type = 'core'
              and exists (
                select 1 from public.club_memberships cm
                where cm.club_id = club.id
                  and cm.user_id = (select auth.uid())
                  and cm.status = 'active'
                  and cm.role in ('core_member', 'coordinator')
              )
            )
          )
        )
      )
  );
$function$;

revoke all on function private.is_campus_president() from public, anon;
revoke all on function private.can_oversee_club(uuid) from public, anon;
revoke all on function private.can_access_club_room(uuid) from public, anon;
grant execute on function private.can_oversee_club(uuid) to authenticated;
grant execute on function private.can_access_club_room(uuid) to authenticated;

drop policy if exists "Read accessible club rooms" on public.club_rooms;
create policy "Read accessible club rooms"
on public.club_rooms
for select to authenticated
using (private.can_access_club_room(id));

drop policy if exists "Read messages in accessible club rooms" on public.club_room_messages;
create policy "Read messages in accessible club rooms"
on public.club_room_messages
for select to authenticated
using (private.can_access_club_room(room_id));

drop policy if exists "Send messages in accessible club rooms" on public.club_room_messages;
create policy "Send messages in accessible club rooms"
on public.club_room_messages
for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and private.can_access_club_room(room_id)
);

drop policy if exists "Authors edit their own accessible room messages" on public.club_room_messages;
create policy "Authors edit their own accessible room messages"
on public.club_room_messages
for update to authenticated
using (
  sender_id = (select auth.uid())
  and private.can_access_club_room(room_id)
)
with check (
  sender_id = (select auth.uid())
  and private.can_access_club_room(room_id)
);

drop policy if exists "Authors and club leaders remove room messages" on public.club_room_messages;
create policy "Authors and club leaders remove room messages"
on public.club_room_messages
for delete to authenticated
using (
  (sender_id = (select auth.uid()) and private.can_access_club_room(room_id))
  or exists (
    select 1 from public.club_rooms room
    where room.id = room_id
      and private.can_manage_club(room.club_id)
  )
);

create or replace function private.create_default_club_rooms()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.club_rooms (club_id, room_type, name)
  values
    (new.id, 'general', 'General'),
    (new.id, 'members', 'Members'),
    (new.id, 'core', 'Core Team')
  on conflict (club_id, room_type) do nothing;

  return new;
end;
$function$;

revoke all on function private.create_default_club_rooms() from public, anon, authenticated;

drop trigger if exists clubs_create_default_rooms on public.clubs;
create trigger clubs_create_default_rooms
after insert on public.clubs
for each row execute function private.create_default_club_rooms();

insert into public.club_rooms (club_id, room_type, name)
select clubs.id, rooms.room_type, rooms.name
from public.clubs
cross join (values
  ('general'::text, 'General'::text),
  ('members'::text, 'Members'::text),
  ('core'::text, 'Core Team'::text)
) as rooms(room_type, name)
on conflict (club_id, room_type) do nothing;

-- ---------------------------------------------------------------------------
-- 6. Secure role decision workflow. Only the platform admin may appoint the
--    president and general secretaries. A Technical/Cultural GS may approve
--    coordinators in that council's category; the president or admin can
--    oversee/approve any club's leadership request.
-- ---------------------------------------------------------------------------
create or replace function public.decide_institution_role_request(
  p_request_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_request public.institution_role_requests%rowtype;
  v_category text;
  v_required_council_role text;
  v_is_admin boolean;
  v_is_president boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected.' using errcode = '22023';
  end if;

  select request.*
    into v_request
  from public.institution_role_requests request
  where request.id = p_request_id
  for update;

  if not found then
    raise exception 'Role request not found.' using errcode = 'P0002';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'Only pending role requests can be decided.' using errcode = '23514';
  end if;

  v_is_admin := private.is_platform_admin();
  v_is_president := private.is_campus_president();

  if v_request.requested_role in (
    'institution_admin', 'president', 'technical_gs', 'cultural_gs', 'moderator'
  ) then
    if not v_is_admin then
      raise exception 'Only a platform administrator may appoint campus leadership.' using errcode = '42501';
    end if;
  elsif v_request.requested_role = 'club_coordinator' then
    if v_request.club_id is null then
      raise exception 'A coordinator request must name a club.' using errcode = '23514';
    end if;

    select lower(coalesce(club.category, ''))
      into v_category
    from public.clubs club
    where club.id = v_request.club_id
      and club.institution_id = v_request.institution_id;

    if not found then
      raise exception 'The club does not belong to this institution.' using errcode = '23514';
    end if;

    v_required_council_role := case
      when v_category ~ '(technical|engineering|robot|electronics|computer|coding|science|data science|artificial intelligence|innovation|startup)' then 'technical_gs'
      when v_category ~ '(culture|art|music|dance|film|photo|literary|oratory|debate|performing)' then 'cultural_gs'
      else null
    end;

    if not (v_is_admin or v_is_president) then
      if v_required_council_role is null then
        raise exception 'This club category needs the campus administrator or president to decide the coordinator request.' using errcode = '42501';
      end if;

      if not private.has_institution_role(v_request.institution_id, array[v_required_council_role]) then
        raise exception 'Only the General Secretary responsible for this council may approve this coordinator.' using errcode = '42501';
      end if;
    end if;
  else
    raise exception 'Unsupported requested role.' using errcode = '23514';
  end if;

  if p_decision = 'approved' then
    if v_request.requested_role = 'club_coordinator' then
      insert into public.institution_roles (
        institution_id, user_id, role, club_id, status, granted_by
      )
      select v_request.institution_id, v_request.user_id, 'club_coordinator',
             v_request.club_id, 'active', (select auth.uid())
      where not exists (
        select 1 from public.institution_roles existing
        where existing.institution_id = v_request.institution_id
          and existing.user_id = v_request.user_id
          and existing.role = 'club_coordinator'
          and existing.club_id = v_request.club_id
          and existing.status = 'active'
      );

      insert into public.club_memberships (club_id, user_id, role, status)
      values (v_request.club_id, v_request.user_id, 'coordinator', 'active')
      on conflict (club_id, user_id) do update
        set role = 'coordinator', status = 'active';
    else
      insert into public.institution_roles (
        institution_id, user_id, role, club_id, status, granted_by
      )
      select v_request.institution_id, v_request.user_id,
             v_request.requested_role, null, 'active', (select auth.uid())
      where not exists (
        select 1 from public.institution_roles existing
        where existing.institution_id = v_request.institution_id
          and existing.user_id = v_request.user_id
          and existing.role = v_request.requested_role
          and existing.club_id is null
          and existing.status = 'active'
      );
    end if;
  end if;

  update public.institution_role_requests
    set status = p_decision,
        decided_by = (select auth.uid()),
        decided_at = now()
  where id = v_request.id;
end;
$function$;

revoke all on function public.decide_institution_role_request(uuid, text) from public, anon;
grant execute on function public.decide_institution_role_request(uuid, text) to authenticated;

-- Leadership requests may only be decided through the validated RPC above.
drop policy if exists "Authorized staff decide role requests" on public.institution_role_requests;

-- The campus president may oversee pending governance requests across the
-- institute, while ordinary users can only see their own requests.
drop policy if exists "Read own or pending role requests" on public.institution_role_requests;
create policy "Read own or pending role requests"
on public.institution_role_requests
for select to authenticated
using (
  user_id = (select auth.uid())
  or private.has_institution_role(
    institution_id,
    array['institution_admin', 'president', 'technical_gs', 'cultural_gs']
  )
);

-- ---------------------------------------------------------------------------
-- 7. Coordinator-controlled interview invitations and Core Member promotion.
-- ---------------------------------------------------------------------------
create or replace function public.invite_club_member(
  p_club_id uuid,
  p_invitee_id uuid,
  p_invited_role text default 'member',
  p_message text default ''
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_invitation_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if p_invitee_id is null or p_invitee_id = (select auth.uid()) then
    raise exception 'Choose another campus user to invite.' using errcode = '22023';
  end if;
  if p_invited_role not in ('member', 'core_member') then
    raise exception 'Invitations may only assign member or core_member.' using errcode = '22023';
  end if;
  if not private.can_manage_club(p_club_id) then
    raise exception 'Only an approved club coordinator or overseer can invite members.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.clubs club
    where club.id = p_club_id and club.approval_status = 'approved'
  ) then
    raise exception 'Invitations are available only for approved clubs.' using errcode = '42501';
  end if;
  if not private.is_iit_bhilai_email_verified(p_invitee_id) then
    raise exception 'The invitee must have a confirmed IIT Bhilai email.' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.club_memberships membership
    where membership.club_id = p_club_id
      and membership.user_id = p_invitee_id
      and membership.status = 'active'
      and membership.role in ('member', 'core_member', 'coordinator')
  ) then
    raise exception 'This user is already an active club member.' using errcode = '23505';
  end if;

  insert into public.club_member_invitations (
    club_id, invitee_id, invited_by, invited_role, message
  )
  values (
    p_club_id, p_invitee_id, (select auth.uid()), p_invited_role,
    left(coalesce(p_message, ''), 1200)
  )
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$function$;

create or replace function public.respond_to_club_invitation(
  p_invitation_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_invitation public.club_member_invitations%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select invitation.*
    into v_invitation
  from public.club_member_invitations invitation
  where invitation.id = p_invitation_id
    and invitation.invitee_id = (select auth.uid())
    and invitation.status = 'pending'
  for update;

  if not found then
    raise exception 'Pending invitation not found for this account.' using errcode = 'P0002';
  end if;

  if not p_accept then
    update public.club_member_invitations
      set status = 'declined', responded_at = now()
    where id = v_invitation.id;
    return;
  end if;

  if not private.is_iit_bhilai_email_verified((select auth.uid())) then
    raise exception 'A confirmed IIT Bhilai email is required.' using errcode = '42501';
  end if;

  insert into public.club_memberships (club_id, user_id, role, status)
  values (
    v_invitation.club_id, v_invitation.invitee_id, v_invitation.invited_role, 'active'
  )
  on conflict (club_id, user_id) do update
    set role = case
      when public.club_memberships.role = 'coordinator' then 'coordinator'
      else excluded.role
    end,
    status = 'active';

  update public.club_member_invitations
    set status = 'accepted', responded_at = now()
  where id = v_invitation.id;
end;
$function$;

create or replace function public.promote_club_core_member(
  p_club_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_rows integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  if not private.can_manage_club(p_club_id) then
    raise exception 'Only the club coordinator or an administrator/president can promote Core Members.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.clubs club
    where club.id = p_club_id and club.approval_status = 'approved'
  ) then
    raise exception 'Membership roles can be changed only in approved clubs.' using errcode = '42501';
  end if;

  update public.club_memberships
    set role = 'core_member'
  where club_id = p_club_id
    and user_id = p_user_id
    and status = 'active'
    and role = 'member';

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Only an active general member can be promoted to Core Member.' using errcode = '23514';
  end if;
end;
$function$;

revoke all on function public.invite_club_member(uuid, uuid, text, text) from public, anon;
revoke all on function public.respond_to_club_invitation(uuid, boolean) from public, anon;
revoke all on function public.promote_club_core_member(uuid, uuid) from public, anon;
grant execute on function public.invite_club_member(uuid, uuid, text, text) to authenticated;
grant execute on function public.respond_to_club_invitation(uuid, boolean) to authenticated;
grant execute on function public.promote_club_core_member(uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 8. Enforce confirmed @iitbhilai.ac.in email possession across EVERY current
--    authenticated public-table RLS policy, not only signup screens or rooms.
--    This modifies policy expressions in place (no permissive policy is added).
--    Tables with RLS but no policy (for example platform_admins) remain closed.
-- ---------------------------------------------------------------------------
do $policy_hardening$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname, roles, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and roles @> array['authenticated']::name[]
  loop
    if p.qual is not null then
      execute format(
        'alter policy %I on %I.%I using (private.is_iit_bhilai_email_verified((select auth.uid())) and (%s))',
        p.policyname, p.schemaname, p.tablename, p.qual
      );
    end if;

    if p.with_check is not null then
      execute format(
        'alter policy %I on %I.%I with check (private.is_iit_bhilai_email_verified((select auth.uid())) and (%s))',
        p.policyname, p.schemaname, p.tablename, p.with_check
      );
    end if;
  end loop;
end;
$policy_hardening$;

commit;
