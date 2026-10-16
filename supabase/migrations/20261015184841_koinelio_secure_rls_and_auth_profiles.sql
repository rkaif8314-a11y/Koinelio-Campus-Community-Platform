-- Koinelio security, row-level access policies, and signup/profile automation.

create table if not exists public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;

-- Safe helper functions used by RLS. These only answer questions about the
-- currently authenticated user; they do not expose secret records.
create or replace function public.current_user_institution_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.institution_id
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function public.has_institution_role(
  p_institution_id uuid,
  p_allowed_roles text[] default null
)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.institution_roles ir
    where ir.institution_id = p_institution_id
      and ir.user_id = (select auth.uid())
      and ir.status = 'active'
      and (p_allowed_roles is null or ir.role = any(p_allowed_roles))
  )
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = (select auth.uid())
  )
$$;

create or replace function public.can_manage_club(p_club_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
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
    )
  end
$$;

create or replace function public.is_active_club_member(p_club_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.club_memberships cm
    where cm.club_id = p_club_id
      and cm.user_id = (select auth.uid())
      and cm.status = 'active'
  ) or public.can_manage_club(p_club_id)
$$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = (select auth.uid())
  )
$$;

create or replace function public.can_view_post(p_post_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.posts p
    left join public.profiles author on author.id = p.author_id
    where p.id = p_post_id
      and (
        p.author_id = (select auth.uid())
        or (
          p.moderation_status = 'published'
          and (
            p.visibility = 'public'
            or (
              p.visibility = 'campus'
              and author.institution_id is not null
              and author.institution_id = public.current_user_institution_id()
            )
            or (
              p.visibility = 'club'
              and p.club_id is not null
              and public.is_active_club_member(p.club_id)
            )
          )
        )
      )
  )
$$;

create or replace function public.profile_is_visible_to_current_user(p_profile_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_profile_id
      and (
        p.id = (select auth.uid())
        or p.profile_visibility = 'public'
        or (
          p.profile_visibility = 'campus'
          and p.institution_id is not null
          and p.institution_id = public.current_user_institution_id()
        )
      )
  )
$$;

revoke all on function public.current_user_institution_id() from public, anon;
revoke all on function public.has_institution_role(uuid, text[]) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.can_manage_club(uuid) from public, anon;
revoke all on function public.is_active_club_member(uuid) from public, anon;
revoke all on function public.is_conversation_member(uuid) from public, anon;
revoke all on function public.can_view_post(uuid) from public, anon;
revoke all on function public.profile_is_visible_to_current_user(uuid) from public, anon;
grant execute on function public.current_user_institution_id() to authenticated;
grant execute on function public.has_institution_role(uuid, text[]) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.can_manage_club(uuid) to authenticated;
grant execute on function public.is_active_club_member(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_view_post(uuid) to authenticated;
grant execute on function public.profile_is_visible_to_current_user(uuid) to authenticated;

-- Timestamp utility.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Prevent ordinary users from changing institution affiliation, campus role,
-- verification status, or ownership / approval fields directly.
create or replace function public.guard_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.id is distinct from old.id
      or new.institution_id is distinct from old.institution_id
      or new.campus_role is distinct from old.campus_role
      or new.verification_status is distinct from old.verification_status then
      raise exception 'Institution affiliation, campus role, and verification status require an approved workflow';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_club_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.created_by is distinct from old.created_by
      or new.institution_id is distinct from old.institution_id then
      raise exception 'Club ownership and institution cannot be changed directly';
    end if;
    if new.approval_status is distinct from old.approval_status
      and not public.has_institution_role(old.institution_id, array['institution_admin']) then
      raise exception 'Club approval status requires an institution administrator';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_membership_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and (
    new.club_id is distinct from old.club_id
    or new.user_id is distinct from old.user_id
    or new.role is distinct from old.role
  ) then
    raise exception 'Membership identity and role cannot be changed directly';
  end if;
  return new;
end;
$$;

create or replace function public.guard_post_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_author_institution uuid;
begin
  if current_user = 'authenticated' then
    if new.author_id is distinct from old.author_id then
      raise exception 'Post author cannot be changed';
    end if;

    if new.moderation_status is distinct from old.moderation_status then
      select p.institution_id into v_author_institution
      from public.profiles p where p.id = old.author_id;

      if not public.has_institution_role(v_author_institution, array['institution_admin', 'moderator']) then
        raise exception 'Post moderation status requires an authorized moderator';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_event_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.created_by is distinct from old.created_by
      or new.club_id is distinct from old.club_id
      or new.institution_id is distinct from old.institution_id then
      raise exception 'Event ownership and scope cannot be changed directly';
    end if;

    if new.status is distinct from old.status
      and not (
        public.can_manage_club(old.club_id)
        or public.has_institution_role(old.institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
      ) then
      raise exception 'Publishing or cancelling an event requires an authorized organizer';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.guard_notification_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and (
    new.recipient_id is distinct from old.recipient_id
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Recipients can only mark their notifications as read';
  end if;
  return new;
end;
$$;

create or replace function public.guard_application_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' and (
    new.drive_id is distinct from old.drive_id
    or new.applicant_id is distinct from old.applicant_id
  ) then
    raise exception 'Application ownership and recruitment drive cannot be changed';
  end if;
  return new;
end;
$$;

create or replace function public.guard_announcement_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.institution_id is distinct from old.institution_id
      or new.created_by is distinct from old.created_by then
      raise exception 'Announcement institution and creator cannot be changed';
    end if;
    if new.status is distinct from old.status
      and not public.has_institution_role(old.institution_id, array['institution_admin', 'technical_gs', 'cultural_gs']) then
      raise exception 'Publishing announcements requires an authorized institutional role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged_fields on public.profiles;
create trigger profiles_guard_privileged_fields
before update on public.profiles
for each row execute function public.guard_profile_privileged_fields();

drop trigger if exists clubs_guard_privileged_fields on public.clubs;
create trigger clubs_guard_privileged_fields
before update on public.clubs
for each row execute function public.guard_club_privileged_fields();

drop trigger if exists memberships_guard_privileged_fields on public.club_memberships;
create trigger memberships_guard_privileged_fields
before update on public.club_memberships
for each row execute function public.guard_membership_privileged_fields();

drop trigger if exists posts_guard_privileged_fields on public.posts;
create trigger posts_guard_privileged_fields
before update on public.posts
for each row execute function public.guard_post_privileged_fields();

drop trigger if exists events_guard_privileged_fields on public.events;
create trigger events_guard_privileged_fields
before update on public.events
for each row execute function public.guard_event_privileged_fields();

drop trigger if exists notifications_guard_update on public.notifications;
create trigger notifications_guard_update
before update on public.notifications
for each row execute function public.guard_notification_update();

drop trigger if exists applications_guard_identity on public.recruitment_applications;
create trigger applications_guard_identity
before update on public.recruitment_applications
for each row execute function public.guard_application_identity();

drop trigger if exists announcements_guard_privileged_fields on public.announcements;
create trigger announcements_guard_privileged_fields
before update on public.announcements
for each row execute function public.guard_announcement_privileged_fields();

-- Keep updated_at consistent on tables that expose it.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists institutions_set_updated_at on public.institutions;
create trigger institutions_set_updated_at before update on public.institutions
for each row execute function public.set_updated_at();
drop trigger if exists clubs_set_updated_at on public.clubs;
create trigger clubs_set_updated_at before update on public.clubs
for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();
drop trigger if exists career_experiences_set_updated_at on public.career_experiences;
create trigger career_experiences_set_updated_at before update on public.career_experiences
for each row execute function public.set_updated_at();
drop trigger if exists student_projects_set_updated_at on public.student_projects;
create trigger student_projects_set_updated_at before update on public.student_projects
for each row execute function public.set_updated_at();
drop trigger if exists recruitment_drives_set_updated_at on public.recruitment_drives;
create trigger recruitment_drives_set_updated_at before update on public.recruitment_drives
for each row execute function public.set_updated_at();
drop trigger if exists recruitment_applications_set_updated_at on public.recruitment_applications;
create trigger recruitment_applications_set_updated_at before update on public.recruitment_applications
for each row execute function public.set_updated_at();
drop trigger if exists recruitment_interviews_set_updated_at on public.recruitment_interviews;
create trigger recruitment_interviews_set_updated_at before update on public.recruitment_interviews
for each row execute function public.set_updated_at();
drop trigger if exists event_registrations_set_updated_at on public.event_registrations;
create trigger event_registrations_set_updated_at before update on public.event_registrations
for each row execute function public.set_updated_at();
drop trigger if exists post_comments_set_updated_at on public.post_comments;
create trigger post_comments_set_updated_at before update on public.post_comments
for each row execute function public.set_updated_at();
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at before update on public.announcements
for each row execute function public.set_updated_at();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

-- Create a secure conversation with all participants in a single transaction.
create or replace function public.create_conversation(
  p_member_ids uuid[],
  p_title text default null,
  p_kind text default 'direct'
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_conversation_id uuid;
  v_profile_count integer;
  v_unique_count integer;
begin
  if v_user_id is null then
    raise exception 'Sign in is required to create a conversation';
  end if;
  if p_kind not in ('direct', 'group') then
    raise exception 'Conversation kind must be direct or group';
  end if;
  if p_member_ids is null or cardinality(p_member_ids) < 2 or cardinality(p_member_ids) > 20 then
    raise exception 'A conversation must have between 2 and 20 participants';
  end if;
  if not (v_user_id = any(p_member_ids)) then
    raise exception 'The current user must be a conversation participant';
  end if;

  select count(distinct member_id) into v_unique_count
  from unnest(p_member_ids) as t(member_id);
  if v_unique_count <> cardinality(p_member_ids) then
    raise exception 'Duplicate participants are not allowed';
  end if;
  if p_kind = 'direct' and cardinality(p_member_ids) <> 2 then
    raise exception 'A direct conversation must have exactly 2 participants';
  end if;

  select count(*) into v_profile_count
  from public.profiles p
  where p.id = any(p_member_ids)
    and (
      p.id = v_user_id
      or p.profile_visibility = 'public'
      or (
        p.profile_visibility = 'campus'
        and p.institution_id is not null
        and p.institution_id = public.current_user_institution_id()
      )
    );
  if v_profile_count <> cardinality(p_member_ids) then
    raise exception 'One or more participants cannot be contacted under their current visibility settings';
  end if;

  insert into public.conversations (created_by, kind, title)
  values (v_user_id, p_kind, nullif(trim(coalesce(p_title, '')), ''))
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, user_id)
  select v_conversation_id, member_id
  from unnest(p_member_ids) as t(member_id);

  return v_conversation_id;
end;
$$;

revoke all on function public.create_conversation(uuid[], text, text) from public, anon;
grant execute on function public.create_conversation(uuid[], text, text) to authenticated;

-- Institution owners are not auto-approved. The platform owner must explicitly
-- approve a request; approval grants the requester the first institution_admin role.
create or replace function public.approve_institution_request(
  p_institution_id uuid,
  p_approve boolean
)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := (select auth.uid());
  v_requested_by uuid;
begin
  if v_admin_id is null or not public.is_platform_admin() then
    raise exception 'Only a platform administrator can approve institutions';
  end if;

  select i.requested_by into v_requested_by
  from public.institutions i
  where i.id = p_institution_id and i.approval_status = 'pending'
  for update;

  if v_requested_by is null then
    raise exception 'Pending institution request not found';
  end if;

  update public.institutions
  set approval_status = case when p_approve then 'verified' else 'rejected' end,
      updated_at = now()
  where id = p_institution_id;

  if p_approve then
    insert into public.institution_roles (institution_id, user_id, role, status, granted_by)
    values (p_institution_id, v_requested_by, 'institution_admin', 'active', v_admin_id)
    on conflict do nothing;

    update public.profiles
    set institution_id = p_institution_id,
        verification_status = 'verified'
    where id = v_requested_by;
  end if;
end;
$$;
revoke all on function public.approve_institution_request(uuid, boolean) from public, anon;
grant execute on function public.approve_institution_request(uuid, boolean) to authenticated;

create or replace function public.decide_affiliation_request(
  p_request_id uuid,
  p_approve boolean
)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_request public.institution_affiliation_requests%rowtype;
  v_decider uuid := (select auth.uid());
begin
  select * into v_request
  from public.institution_affiliation_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending affiliation request not found';
  end if;

  if not public.has_institution_role(v_request.institution_id, array['institution_admin']) then
    raise exception 'Only the institution administrator can decide this request';
  end if;

  update public.institution_affiliation_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      decided_by = v_decider,
      decided_at = now()
  where id = p_request_id;

  if p_approve then
    update public.profiles
    set institution_id = v_request.institution_id,
        verification_status = 'verified'
    where id = v_request.user_id;
  else
    update public.profiles
    set verification_status = 'rejected'
    where id = v_request.user_id
      and institution_id is null;
  end if;
end;
$$;
revoke all on function public.decide_affiliation_request(uuid, boolean) from public, anon;
grant execute on function public.decide_affiliation_request(uuid, boolean) to authenticated;

create or replace function public.decide_institution_role_request(
  p_request_id uuid,
  p_approve boolean
)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_request public.institution_role_requests%rowtype;
  v_decider uuid := (select auth.uid());
  v_authorized boolean := false;
begin
  select * into v_request
  from public.institution_role_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending role request not found';
  end if;

  if v_request.requested_role = 'club_coordinator' then
    v_authorized :=
      public.has_institution_role(v_request.institution_id, array['institution_admin'])
      or public.has_institution_role(v_request.institution_id, array['technical_gs', 'cultural_gs']);
  else
    v_authorized := public.has_institution_role(v_request.institution_id, array['institution_admin']);
  end if;

  if not v_authorized then
    raise exception 'Your institutional role is not authorized to decide this request';
  end if;

  update public.institution_role_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      decided_by = v_decider,
      decided_at = now()
  where id = p_request_id;

  if p_approve then
    insert into public.institution_roles (
      institution_id, user_id, role, club_id, status, granted_by
    )
    values (
      v_request.institution_id, v_request.user_id,
      v_request.requested_role, v_request.club_id, 'active', v_decider
    )
    on conflict do nothing;
  end if;
end;
$$;
revoke all on function public.decide_institution_role_request(uuid, boolean) from public, anon;
grant execute on function public.decide_institution_role_request(uuid, boolean) to authenticated;

-- Refresh the signup trigger so the form's self-reported, non-privileged profile
-- fields are saved at account creation. Institution affiliation remains pending.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
  v_campus_role text;
  v_department text;
  v_interests text[];
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Student'
  );

  v_campus_role := case
    when new.raw_user_meta_data ->> 'role' in ('student', 'faculty', 'alumni')
      then new.raw_user_meta_data ->> 'role'
    else 'student'
  end;

  v_department := nullif(trim(new.raw_user_meta_data ->> 'department'), '');

  v_interests := array(
    select jsonb_array_elements_text(
      case
        when jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array'
          then new.raw_user_meta_data -> 'interests'
        else '[]'::jsonb
      end
    )
  );

  insert into public.profiles (id, display_name, campus_role, department, interests)
  values (new.id, v_display_name, v_campus_role, v_department, v_interests)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Replace initial broad demo policies with scoped policies.
drop policy if exists "Read visible profiles" on public.profiles;
drop policy if exists "Update own profile" on public.profiles;
drop policy if exists "Authenticated users read clubs" on public.clubs;
drop policy if exists "Authenticated users create clubs" on public.clubs;
drop policy if exists "Club creator updates club" on public.clubs;
drop policy if exists "Read own memberships" on public.club_memberships;
drop policy if exists "Join as self" on public.club_memberships;
drop policy if exists "Leave own membership" on public.club_memberships;
drop policy if exists "Authenticated users read posts" on public.posts;
drop policy if exists "Create own posts" on public.posts;
drop policy if exists "Update own posts" on public.posts;
drop policy if exists "Delete own posts" on public.posts;
drop policy if exists "Authenticated users read events" on public.events;
drop policy if exists "Create events as self" on public.events;
drop policy if exists "Creator updates events" on public.events;
drop policy if exists "Creator deletes events" on public.events;
drop policy if exists "Read own notifications" on public.notifications;
drop policy if exists "Mark own notifications read" on public.notifications;

-- Profiles.
create policy "Profiles visible by privacy and campus"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or profile_visibility = 'public'
  or (
    profile_visibility = 'campus'
    and institution_id is not null
    and institution_id = (select public.current_user_institution_id())
  )
);

create policy "Users update their own editable profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Institutions and affiliation.
create policy "Read verified or own institution requests"
on public.institutions for select to authenticated
using (
  approval_status = 'verified'
  or requested_by = (select auth.uid())
  or public.has_institution_role(id, array['institution_admin'])
);

create policy "Request an institution"
on public.institutions for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and approval_status = 'pending'
);

create policy "Institution admins update institution details"
on public.institutions for update to authenticated
using (
  public.is_platform_admin()
  or public.has_institution_role(id, array['institution_admin'])
)
with check (
  public.is_platform_admin()
  or public.has_institution_role(id, array['institution_admin'])
);

create policy "Users read own or institution affiliation requests"
on public.institution_affiliation_requests for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_institution_role(institution_id, array['institution_admin'])
);

create policy "Users request their own affiliation"
on public.institution_affiliation_requests for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
);

create policy "Institution admins decide affiliation requests"
on public.institution_affiliation_requests for update to authenticated
using (public.has_institution_role(institution_id, array['institution_admin']))
with check (public.has_institution_role(institution_id, array['institution_admin']));

create policy "Read own institutional roles or admin roles"
on public.institution_roles for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_institution_role(institution_id, array['institution_admin'])
);

create policy "Read own or pending role requests"
on public.institution_role_requests for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_institution_role(institution_id, array['institution_admin'])
  or public.has_institution_role(institution_id, array['technical_gs', 'cultural_gs'])
);

create policy "Request an institutional role"
on public.institution_role_requests for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
);

create policy "Authorized staff decide role requests"
on public.institution_role_requests for update to authenticated
using (
  public.has_institution_role(institution_id, array['institution_admin'])
  or (
    requested_role = 'club_coordinator'
    and public.has_institution_role(institution_id, array['technical_gs', 'cultural_gs'])
  )
)
with check (
  public.has_institution_role(institution_id, array['institution_admin'])
  or (
    requested_role = 'club_coordinator'
    and public.has_institution_role(institution_id, array['technical_gs', 'cultural_gs'])
  )
);

-- Clubs and membership requests.
create policy "Read approved same-campus clubs or own clubs"
on public.clubs for select to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_club(id)
  or (
    approval_status = 'approved'
    and (
      institution_id is null
      or institution_id = (select public.current_user_institution_id())
    )
  )
);

create policy "Create pending club as self"
on public.clubs for insert to authenticated
with check (
  created_by = (select auth.uid())
  and approval_status = 'pending'
  and (
    institution_id is null
    or institution_id = (select public.current_user_institution_id())
  )
);

create policy "Club owners or institution admins update clubs"
on public.clubs for update to authenticated
using (
  public.can_manage_club(id)
  or public.has_institution_role(institution_id, array['institution_admin'])
)
with check (
  public.can_manage_club(id)
  or public.has_institution_role(institution_id, array['institution_admin'])
);

create policy "Read own or managed club memberships"
on public.club_memberships for select to authenticated
using (
  user_id = (select auth.uid())
  or public.can_manage_club(club_id)
);

create policy "Join club as pending member"
on public.club_memberships for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'member'
  and status = 'pending'
);

create policy "Club managers review memberships"
on public.club_memberships for update to authenticated
using (public.can_manage_club(club_id))
with check (public.can_manage_club(club_id));

create policy "Leave own club membership"
on public.club_memberships for delete to authenticated
using (user_id = (select auth.uid()) or public.can_manage_club(club_id));

-- Posts and feed interaction.
create policy "Read posts allowed by audience and moderation"
on public.posts for select to authenticated
using (public.can_view_post(id));

create policy "Create posts as self"
on public.posts for insert to authenticated
with check (
  author_id = (select auth.uid())
  and moderation_status = 'published'
  and (
    visibility <> 'club'
    or (
      club_id is not null
      and public.is_active_club_member(club_id)
    )
  )
);

create policy "Authors update own posts"
on public.posts for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Authors or moderators delete posts"
on public.posts for delete to authenticated
using (
  author_id = (select auth.uid())
  or public.has_institution_role(
    public.current_user_institution_id(),
    array['institution_admin', 'moderator']
  )
);

create policy "Read comments on visible posts"
on public.post_comments for select to authenticated
using (public.can_view_post(post_id));

create policy "Create comments as self"
on public.post_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and public.can_view_post(post_id)
);

create policy "Authors edit comments"
on public.post_comments for update to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

create policy "Authors delete comments"
on public.post_comments for delete to authenticated
using (
  author_id = (select auth.uid())
  or public.has_institution_role(
    public.current_user_institution_id(),
    array['institution_admin', 'moderator']
  )
);

create policy "Read likes on visible posts"
on public.post_likes for select to authenticated
using (public.can_view_post(post_id));

create policy "Like visible posts as self"
on public.post_likes for insert to authenticated
with check (user_id = (select auth.uid()) and public.can_view_post(post_id));

create policy "Unlike as self"
on public.post_likes for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Read own saved posts"
on public.saved_posts for select to authenticated
using (user_id = (select auth.uid()));

create policy "Save visible posts as self"
on public.saved_posts for insert to authenticated
with check (user_id = (select auth.uid()) and public.can_view_post(post_id));

create policy "Remove own saved posts"
on public.saved_posts for delete to authenticated
using (user_id = (select auth.uid()));

-- Events and registrations.
create policy "Read published events in scope or own drafts"
on public.events for select to authenticated
using (
  created_by = (select auth.uid())
  or (
    status = 'published'
    and (
      institution_id is null
      or institution_id = (select public.current_user_institution_id())
    )
    and (
      club_id is null
      or exists (
        select 1 from public.clubs c
        where c.id = events.club_id
          and c.approval_status = 'approved'
      )
    )
  )
  or public.can_manage_club(club_id)
  or public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
);

create policy "Create event drafts"
on public.events for insert to authenticated
with check (
  created_by = (select auth.uid())
  and status = 'draft'
  and (institution_id is null or institution_id = (select public.current_user_institution_id()))
  and (club_id is null or public.can_manage_club(club_id))
);

create policy "Authorized organizers update events"
on public.events for update to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_club(club_id)
  or public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
)
with check (
  created_by = (select auth.uid())
  or public.can_manage_club(club_id)
  or public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
);

create policy "Event creators delete drafts"
on public.events for delete to authenticated
using (
  (created_by = (select auth.uid()) and status = 'draft')
  or public.can_manage_club(club_id)
  or public.has_institution_role(institution_id, array['institution_admin'])
);

create policy "Read own registrations or registrations for managed events"
on public.event_registrations for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and (
        e.created_by = (select auth.uid())
        or public.can_manage_club(e.club_id)
        or public.has_institution_role(e.institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
      )
  )
);

create policy "Register yourself for published events"
on public.event_registrations for insert to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'registered'
  and exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and e.status = 'published'
      and (e.institution_id is null or e.institution_id = (select public.current_user_institution_id()))
  )
);

create policy "Organizers update event attendance"
on public.event_registrations for update to authenticated
using (
  exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and (
        e.created_by = (select auth.uid())
        or public.can_manage_club(e.club_id)
        or public.has_institution_role(e.institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
      )
  )
)
with check (
  exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and (
        e.created_by = (select auth.uid())
        or public.can_manage_club(e.club_id)
        or public.has_institution_role(e.institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
      )
  )
);

create policy "Unregister yourself or organizer removes registration"
on public.event_registrations for delete to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.events e
    where e.id = event_registrations.event_id
      and (e.created_by = (select auth.uid()) or public.can_manage_club(e.club_id))
  )
);

-- Career experiences and portfolio projects obey profile privacy.
create policy "Career experience follows profile visibility"
on public.career_experiences for select to authenticated
using (
  profile_id = (select auth.uid())
  or (
    visibility = 'public'
    and public.profile_is_visible_to_current_user(profile_id)
  )
  or (
    visibility = 'campus'
    and public.profile_is_visible_to_current_user(profile_id)
  )
);

create policy "Users manage their career experience"
on public.career_experiences for insert to authenticated
with check (profile_id = (select auth.uid()));
create policy "Users update their career experience"
on public.career_experiences for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));
create policy "Users delete their career experience"
on public.career_experiences for delete to authenticated
using (profile_id = (select auth.uid()));

create policy "Projects follow profile visibility"
on public.student_projects for select to authenticated
using (
  profile_id = (select auth.uid())
  or (
    visibility in ('public', 'campus')
    and public.profile_is_visible_to_current_user(profile_id)
  )
);

create policy "Users create their own projects"
on public.student_projects for insert to authenticated
with check (profile_id = (select auth.uid()));
create policy "Users update their own projects"
on public.student_projects for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));
create policy "Users delete their own projects"
on public.student_projects for delete to authenticated
using (profile_id = (select auth.uid()));

-- Recruitment: applicants see their own records, organizers manage the drive.
create policy "Read open drives or drives you manage"
on public.recruitment_drives for select to authenticated
using (
  public.can_manage_club(club_id)
  or (
    status = 'open'
    and (deadline is null or deadline > now())
    and exists (
      select 1 from public.clubs c
      where c.id = recruitment_drives.club_id
        and c.approval_status = 'approved'
        and (c.institution_id is null or c.institution_id = (select public.current_user_institution_id()))
    )
  )
);

create policy "Club managers create recruitment drives"
on public.recruitment_drives for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.can_manage_club(club_id)
  and (
    status = 'draft'
    or (
      status = 'open'
      and exists (
        select 1 from public.clubs c
        where c.id = recruitment_drives.club_id
          and c.approval_status = 'approved'
      )
    )
  )
);

create policy "Club managers update recruitment drives"
on public.recruitment_drives for update to authenticated
using (public.can_manage_club(club_id))
with check (public.can_manage_club(club_id));

create policy "Club managers delete recruitment drives"
on public.recruitment_drives for delete to authenticated
using (public.can_manage_club(club_id));

create policy "Applicants and club managers read applications"
on public.recruitment_applications for select to authenticated
using (
  applicant_id = (select auth.uid())
  or exists (
    select 1 from public.recruitment_drives d
    where d.id = recruitment_applications.drive_id
      and public.can_manage_club(d.club_id)
  )
);

create policy "Apply to open recruitment drives"
on public.recruitment_applications for insert to authenticated
with check (
  applicant_id = (select auth.uid())
  and status = 'submitted'
  and exists (
    select 1 from public.recruitment_drives d
    join public.clubs c on c.id = d.club_id
    where d.id = recruitment_applications.drive_id
      and d.status = 'open'
      and c.approval_status = 'approved'
      and (d.deadline is null or d.deadline > now())
      and (c.institution_id is null or c.institution_id = (select public.current_user_institution_id()))
  )
);

create policy "Club managers review applications"
on public.recruitment_applications for update to authenticated
using (
  exists (
    select 1 from public.recruitment_drives d
    where d.id = recruitment_applications.drive_id
      and public.can_manage_club(d.club_id)
  )
)
with check (
  exists (
    select 1 from public.recruitment_drives d
    where d.id = recruitment_applications.drive_id
      and public.can_manage_club(d.club_id)
  )
);

create policy "Applicants withdraw submitted applications"
on public.recruitment_applications for delete to authenticated
using (applicant_id = (select auth.uid()) and status = 'submitted');

create policy "Applicants and organizers read interviews"
on public.recruitment_interviews for select to authenticated
using (
  interviewer_id = (select auth.uid())
  or exists (
    select 1
    from public.recruitment_applications a
    join public.recruitment_drives d on d.id = a.drive_id
    where a.id = recruitment_interviews.application_id
      and (
        a.applicant_id = (select auth.uid())
        or public.can_manage_club(d.club_id)
      )
  )
);

create policy "Club managers schedule interviews"
on public.recruitment_interviews for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.recruitment_applications a
    join public.recruitment_drives d on d.id = a.drive_id
    where a.id = recruitment_interviews.application_id
      and public.can_manage_club(d.club_id)
  )
);

create policy "Club managers update interviews"
on public.recruitment_interviews for update to authenticated
using (
  exists (
    select 1
    from public.recruitment_applications a
    join public.recruitment_drives d on d.id = a.drive_id
    where a.id = recruitment_interviews.application_id
      and public.can_manage_club(d.club_id)
  )
)
with check (
  exists (
    select 1
    from public.recruitment_applications a
    join public.recruitment_drives d on d.id = a.drive_id
    where a.id = recruitment_interviews.application_id
      and public.can_manage_club(d.club_id)
  )
);

create policy "Club managers delete interviews"
on public.recruitment_interviews for delete to authenticated
using (
  exists (
    select 1
    from public.recruitment_applications a
    join public.recruitment_drives d on d.id = a.drive_id
    where a.id = recruitment_interviews.application_id
      and public.can_manage_club(d.club_id)
  )
);

-- Institutional announcements.
create policy "Read published announcements for your campus"
on public.announcements for select to authenticated
using (
  status = 'published'
  and institution_id = (select public.current_user_institution_id())
  and (expires_at is null or expires_at > now())
  or public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
);

create policy "Authorized institutional roles create announcements"
on public.announcements for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    public.has_institution_role(institution_id, array['institution_admin'])
    or public.has_institution_role(institution_id, array['technical_gs', 'cultural_gs'])
  )
  and status in ('draft', 'published')
);

create policy "Authorized institutional roles update announcements"
on public.announcements for update to authenticated
using (
  public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
)
with check (
  public.has_institution_role(institution_id, array['institution_admin', 'technical_gs', 'cultural_gs'])
);

create policy "Authorized institutional roles delete announcements"
on public.announcements for delete to authenticated
using (public.has_institution_role(institution_id, array['institution_admin']));

-- Private messages. Recipient/member access is confined to conversation members.
create policy "Participants read their conversations"
on public.conversations for select to authenticated
using (
  created_by = (select auth.uid())
  or public.is_conversation_member(id)
);

create policy "Signed-in users create conversations"
on public.conversations for insert to authenticated
with check (created_by = (select auth.uid()));

create policy "Participants read conversation membership"
on public.conversation_members for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_conversation_member(conversation_id)
);

create policy "Participants read messages"
on public.messages for select to authenticated
using (public.is_conversation_member(conversation_id));

create policy "Participants send messages as themselves"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);

create policy "Authors delete their own messages"
on public.messages for delete to authenticated
using (
  sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);

-- Notifications remain server-created; users can read only their own and mark read.
create policy "Users read their own notifications"
on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()));

create policy "Users mark their own notifications read"
on public.notifications for update to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

-- Remove direct row-creation rights on official role assignments and platform admins.
-- Privileged grants occur only through controlled approval functions or the dashboard.
