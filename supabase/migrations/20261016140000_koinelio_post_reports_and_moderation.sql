-- Database-backed post reporting and trusted moderation decisions.
-- Reporting is available to confirmed campus accounts; review is restricted to moderators/admins.
begin;

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'misinformation', 'inappropriate', 'other')),
  details text not null default '' check (char_length(details) <= 1200),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text not null default '' check (char_length(resolution_note) <= 1200),
  created_at timestamptz not null default now(),
  constraint post_reports_no_self_report unique (post_id, reporter_id)
);

create index if not exists idx_post_reports_status_created
  on public.post_reports(status, created_at desc);
create index if not exists idx_post_reports_reporter_created
  on public.post_reports(reporter_id, created_at desc);

alter table public.post_reports enable row level security;

drop policy if exists "Reporters and moderators read reports" on public.post_reports;
create policy "Reporters and moderators read reports"
on public.post_reports for select to authenticated
using (
  private.is_iit_bhilai_email_verified((select auth.uid()))
  and (
    reporter_id = (select auth.uid())
    or public.is_platform_admin()
    or public.has_institution_role(
      private.current_user_institution_id(),
      array['institution_admin', 'moderator']
    )
  )
);

-- No direct insert/update/delete policies: callers must use validated RPCs.
create or replace function public.submit_post_report(
  p_post_id uuid,
  p_reason text,
  p_details text default ''
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_report_id uuid;
  v_author_id uuid;
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required to report a post';
  end if;

  if p_reason not in ('spam', 'harassment', 'misinformation', 'inappropriate', 'other') then
    raise exception 'Choose a valid report reason';
  end if;

  if char_length(coalesce(p_details, '')) > 1200 then
    raise exception 'Report details must be 1200 characters or fewer';
  end if;

  select p.author_id into v_author_id
  from public.posts p
  where p.id = p_post_id
    and public.can_view_post(p.id);

  if not found then
    raise exception 'Post not found or not accessible';
  end if;
  if v_author_id = auth.uid() then
    raise exception 'You cannot report your own post';
  end if;

  insert into public.post_reports(post_id, reporter_id, reason, details)
  values (p_post_id, auth.uid(), p_reason, coalesce(btrim(p_details), ''))
  returning id into v_report_id;

  return v_report_id;
exception
  when unique_violation then
    raise exception 'You have already reported this post';
end;
$function$;

revoke all on function public.submit_post_report(uuid, text, text) from public, anon;
grant execute on function public.submit_post_report(uuid, text, text) to authenticated;

create or replace function public.resolve_post_report(
  p_report_id uuid,
  p_decision text,
  p_resolution_note text default ''
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_report public.post_reports%rowtype;
  v_institution_id uuid;
begin
  if auth.uid() is null or not private.is_iit_bhilai_email_verified(auth.uid()) then
    raise exception 'A confirmed campus account is required';
  end if;

  if p_decision not in ('hide_post', 'dismiss') then
    raise exception 'Choose hide_post or dismiss';
  end if;
  if char_length(coalesce(p_resolution_note, '')) > 1200 then
    raise exception 'Resolution note must be 1200 characters or fewer';
  end if;

  if not (
    public.is_platform_admin()
    or public.has_institution_role(
      private.current_user_institution_id(),
      array['institution_admin', 'moderator']
    )
  ) then
    raise exception 'Only a campus moderator or administrator can resolve reports';
  end if;

  select * into v_report
  from public.post_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Report not found';
  end if;
  if v_report.status <> 'open' then
    raise exception 'This report has already been reviewed';
  end if;

  select institution_id into v_institution_id
  from public.profiles where id = v_report.reporter_id;

  update public.post_reports
  set status = case when p_decision = 'dismiss' then 'dismissed' else 'reviewed' end,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      resolution_note = coalesce(btrim(p_resolution_note), '')
  where id = p_report_id;

  if p_decision = 'hide_post' then
    update public.posts
    set moderation_status = 'hidden'
    where id = v_report.post_id;
  end if;
end;
$function$;

revoke all on function public.resolve_post_report(uuid, text, text) from public, anon;
grant execute on function public.resolve_post_report(uuid, text, text) to authenticated;

commit;
