-- Phase 6: campus elections with private ballots and database-enforced one-person-one-vote.
-- Apply only to a disposable staging project first; do not run against production without approval.
begin;

create table if not exists public.campus_elections (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 3 and 180),
  description text not null default '' check (char_length(description) <= 5000),
  nominations_open_at timestamptz not null,
  nominations_close_at timestamptz not null,
  voting_opens_at timestamptz not null,
  voting_closes_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','open','closed','published','cancelled')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint campus_election_windows_valid check (
    nominations_open_at < nominations_close_at
    and nominations_close_at <= voting_opens_at
    and voting_opens_at < voting_closes_at
  )
);

create table if not exists public.campus_election_candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.campus_elections(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  statement text not null default '' check (char_length(statement) <= 2500),
  nominated_at timestamptz not null default now(),
  constraint campus_election_one_nomination unique (election_id, candidate_id)
);

-- This table records only whether a person voted; it contains no candidate choice.
create table if not exists private.campus_election_voters (
  election_id uuid not null references public.campus_elections(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  cast_at timestamptz not null default now(),
  primary key (election_id, voter_id)
);
-- Ballots intentionally contain no voter identifier. No authenticated client gets SELECT.
create table if not exists private.campus_election_ballots (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.campus_elections(id) on delete cascade,
  candidate_id uuid not null references public.campus_election_candidates(id) on delete restrict,
  cast_at timestamptz not null default now()
);

create index if not exists campus_elections_status_window_idx
  on public.campus_elections(status, voting_opens_at, voting_closes_at);
create index if not exists campus_election_candidates_election_idx
  on public.campus_election_candidates(election_id);

alter table public.campus_elections enable row level security;
alter table public.campus_election_candidates enable row level security;
alter table private.campus_election_voters enable row level security;
alter table private.campus_election_ballots enable row level security;
revoke all on table private.campus_election_voters from public, anon, authenticated;
revoke all on table private.campus_election_ballots from public, anon, authenticated;
revoke all on table public.campus_elections from anon;
revoke all on table public.campus_election_candidates from anon;
grant select on public.campus_elections to authenticated;
grant select on public.campus_election_candidates to authenticated;

drop policy if exists "Campus members read non-cancelled elections" on public.campus_elections;
create policy "Campus members read non-cancelled elections"
on public.campus_elections for select to authenticated
using (
  private.is_iit_bhilai_email_verified((select auth.uid()))
  and institution_id = (select private.current_user_institution_id())
  and status <> 'cancelled'
);

drop policy if exists "Read candidates for visible elections" on public.campus_election_candidates;
create policy "Read candidates for visible elections"
on public.campus_election_candidates for select to authenticated
using (
  exists (
    select 1 from public.campus_elections e
    where e.id = campus_election_candidates.election_id
      and e.institution_id = (select private.current_user_institution_id())
      and e.status <> 'cancelled'
      and private.is_iit_bhilai_email_verified((select auth.uid()))
  )
);

create or replace function public.create_campus_election(
  p_title text,
  p_description text,
  p_nominations_open_at timestamptz,
  p_nominations_close_at timestamptz,
  p_voting_opens_at timestamptz,
  p_voting_closes_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_election_id uuid;
  v_institution_id uuid;
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;
  if not (public.is_platform_admin() or public.has_institution_role(
    private.current_user_institution_id(), array['institution_admin','president']
  )) then
    raise exception 'Only an authorised campus administrator can create elections';
  end if;
  if char_length(btrim(coalesce(p_title,''))) not between 3 and 180
     or char_length(coalesce(p_description,'')) > 5000 then
    raise exception 'Election title or description is invalid';
  end if;
  if p_nominations_open_at <= now()
     or p_nominations_open_at >= p_nominations_close_at
     or p_nominations_close_at > p_voting_opens_at
     or p_voting_opens_at >= p_voting_closes_at then
    raise exception 'Election windows are invalid or in the past';
  end if;
  v_institution_id := private.current_user_institution_id();
  if v_institution_id is null then
    raise exception 'The campus tenant has not been initialized';
  end if;
  insert into public.campus_elections(
    institution_id,title,description,nominations_open_at,nominations_close_at,
    voting_opens_at,voting_closes_at,created_by,status
  ) values (
    v_institution_id,btrim(p_title),coalesce(p_description,''),p_nominations_open_at,
    p_nominations_close_at,p_voting_opens_at,p_voting_closes_at,auth.uid(),'open'
  ) returning id into v_election_id;
  return v_election_id;
end;
$function$;
revoke all on function public.create_campus_election(text,text,timestamptz,timestamptz,timestamptz,timestamptz) from public, anon;
grant execute on function public.create_campus_election(text,text,timestamptz,timestamptz,timestamptz,timestamptz) to authenticated;

create or replace function public.nominate_campus_election_candidate(
  p_election_id uuid,
  p_statement text default ''
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_candidate_row uuid;
  v_election public.campus_elections%rowtype;
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;
  if char_length(coalesce(p_statement,'')) > 2500 then
    raise exception 'Candidate statement must be 2500 characters or fewer';
  end if;
  select * into v_election from public.campus_elections
  where id = p_election_id
    and institution_id = private.current_user_institution_id()
  for share;
  if not found or v_election.status <> 'open'
     or now() < v_election.nominations_open_at
     or now() >= v_election.nominations_close_at then
    raise exception 'Nominations are not open for this election';
  end if;
  insert into public.campus_election_candidates(election_id,candidate_id,statement)
  values (p_election_id,auth.uid(),coalesce(btrim(p_statement),'' ))
  returning id into v_candidate_row;
  return v_candidate_row;
exception when unique_violation then
  raise exception 'You have already nominated yourself for this election';
end;
$function$;
revoke all on function public.nominate_campus_election_candidate(uuid,text) from public, anon;
grant execute on function public.nominate_campus_election_candidate(uuid,text) to authenticated;

create or replace function public.cast_campus_election_vote(
  p_election_id uuid,
  p_candidate_row_id uuid
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_election public.campus_elections%rowtype;
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;
  select * into v_election from public.campus_elections
  where id = p_election_id
    and institution_id = private.current_user_institution_id()
  for share;
  if not found or v_election.status <> 'open'
     or now() < v_election.voting_opens_at
     or now() >= v_election.voting_closes_at then
    raise exception 'Voting is not open for this election';
  end if;
  if exists (
    select 1 from public.campus_election_candidates
    where election_id = p_election_id and candidate_id = auth.uid()
  ) then
    raise exception 'Candidates cannot vote in their own election';
  end if;
  if not exists (
    select 1 from public.campus_election_candidates
    where id = p_candidate_row_id and election_id = p_election_id
  ) then
    raise exception 'Candidate is not part of this election';
  end if;
  insert into private.campus_election_voters(election_id,voter_id)
  values (p_election_id,auth.uid());
  insert into private.campus_election_ballots(election_id,candidate_id)
  values (p_election_id,p_candidate_row_id);
exception when unique_violation then
  raise exception 'You have already voted in this election';
end;
$function$;
revoke all on function public.cast_campus_election_vote(uuid,uuid) from public, anon;
grant execute on function public.cast_campus_election_vote(uuid,uuid) to authenticated;

create or replace function public.publish_campus_election_results(p_election_id uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;
  if not (public.is_platform_admin() or public.has_institution_role(
    private.current_user_institution_id(), array['institution_admin','president']
  )) then
    raise exception 'Only an authorised campus administrator can publish results';
  end if;
  update public.campus_elections
  set status = 'published', published_at = now()
  where id = p_election_id
    and institution_id = private.current_user_institution_id()
    and status in ('open','closed')
    and voting_closes_at <= now();
  if not found then
    raise exception 'Election is not ready to publish results';
  end if;
end;
$function$;
revoke all on function public.publish_campus_election_results(uuid) from public, anon;
grant execute on function public.publish_campus_election_results(uuid) to authenticated;

create or replace function public.get_campus_election_results(p_election_id uuid)
returns table(candidate_row_id uuid, candidate_id uuid, display_name text, vote_count bigint)
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;
  if not exists (
    select 1 from public.campus_elections e
    where e.id = p_election_id
      and e.institution_id = private.current_user_institution_id()
      and e.status = 'published'
  ) then
    raise exception 'Election results are not published';
  end if;
  return query
  select c.id, c.candidate_id, p.display_name,
    count(b.id)::bigint as vote_count
  from public.campus_election_candidates c
  join public.profiles p on p.id = c.candidate_id
  left join private.campus_election_ballots b
    on b.election_id = c.election_id and b.candidate_id = c.id
  where c.election_id = p_election_id
  group by c.id, c.candidate_id, p.display_name
  order by vote_count desc, p.display_name asc;
end;
$function$;
revoke all on function public.get_campus_election_results(uuid) from public, anon;
grant execute on function public.get_campus_election_results(uuid) to authenticated;

commit;
