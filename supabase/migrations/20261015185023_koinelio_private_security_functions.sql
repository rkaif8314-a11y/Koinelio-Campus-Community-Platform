-- Hide SECURITY DEFINER functions from the public PostgREST schema.
-- RLS policies continue referencing the same function OIDs after the schema move.
create schema if not exists private authorization postgres;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.current_user_institution_id() set schema private;
alter function public.has_institution_role(uuid, text[]) set schema private;
alter function public.is_platform_admin() set schema private;
alter function public.can_manage_club(uuid) set schema private;
alter function public.is_active_club_member(uuid) set schema private;
alter function public.is_conversation_member(uuid) set schema private;
alter function public.can_view_post(uuid) set schema private;
alter function public.profile_is_visible_to_current_user(uuid) set schema private;
alter function public.create_conversation(uuid[], text, text) set schema private;
alter function public.approve_institution_request(uuid, boolean) set schema private;
alter function public.decide_affiliation_request(uuid, boolean) set schema private;
alter function public.decide_institution_role_request(uuid, boolean) set schema private;
alter function public.handle_new_user() set schema private;

-- Only signed-in clients may call private helper functions from RLS expressions.
grant execute on function private.current_user_institution_id() to authenticated;
grant execute on function private.has_institution_role(uuid, text[]) to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.can_manage_club(uuid) to authenticated;
grant execute on function private.is_active_club_member(uuid) to authenticated;
grant execute on function private.is_conversation_member(uuid) to authenticated;
grant execute on function private.can_view_post(uuid) to authenticated;
grant execute on function private.profile_is_visible_to_current_user(uuid) to authenticated;
grant execute on function private.create_conversation(uuid[], text, text) to authenticated;
grant execute on function private.approve_institution_request(uuid, boolean) to authenticated;
grant execute on function private.decide_affiliation_request(uuid, boolean) to authenticated;
grant execute on function private.decide_institution_role_request(uuid, boolean) to authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Public invoker wrappers preserve supported RPC calls while running the
-- authorization checks inside private SECURITY DEFINER implementations.
create or replace function public.current_user_institution_id()
returns uuid
language sql stable
set search_path = ''
as $$ select private.current_user_institution_id() $$;

create or replace function public.has_institution_role(
  p_institution_id uuid,
  p_allowed_roles text[] default null
)
returns boolean
language sql stable
set search_path = ''
as $$ select private.has_institution_role(p_institution_id, p_allowed_roles) $$;

create or replace function public.is_platform_admin()
returns boolean
language sql stable
set search_path = ''
as $$ select private.is_platform_admin() $$;

create or replace function public.can_manage_club(p_club_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$ select private.can_manage_club(p_club_id) $$;

create or replace function public.is_active_club_member(p_club_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$ select private.is_active_club_member(p_club_id) $$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$ select private.is_conversation_member(p_conversation_id) $$;

create or replace function public.can_view_post(p_post_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$ select private.can_view_post(p_post_id) $$;

create or replace function public.profile_is_visible_to_current_user(p_profile_id uuid)
returns boolean
language sql stable
set search_path = ''
as $$ select private.profile_is_visible_to_current_user(p_profile_id) $$;

create or replace function public.create_conversation(
  p_member_ids uuid[],
  p_title text default null,
  p_kind text default 'direct'
)
returns uuid
language sql
set search_path = ''
as $$ select private.create_conversation(p_member_ids, p_title, p_kind) $$;

create or replace function public.approve_institution_request(
  p_institution_id uuid,
  p_approve boolean
)
returns void
language sql
set search_path = ''
as $$ select private.approve_institution_request(p_institution_id, p_approve) $$;

create or replace function public.decide_affiliation_request(
  p_request_id uuid,
  p_approve boolean
)
returns void
language sql
set search_path = ''
as $$ select private.decide_affiliation_request(p_request_id, p_approve) $$;

create or replace function public.decide_institution_role_request(
  p_request_id uuid,
  p_approve boolean
)
returns void
language sql
set search_path = ''
as $$ select private.decide_institution_role_request(p_request_id, p_approve) $$;

revoke all on function public.current_user_institution_id() from public, anon;
revoke all on function public.has_institution_role(uuid, text[]) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.can_manage_club(uuid) from public, anon;
revoke all on function public.is_active_club_member(uuid) from public, anon;
revoke all on function public.is_conversation_member(uuid) from public, anon;
revoke all on function public.can_view_post(uuid) from public, anon;
revoke all on function public.profile_is_visible_to_current_user(uuid) from public, anon;
revoke all on function public.create_conversation(uuid[], text, text) from public, anon;
revoke all on function public.approve_institution_request(uuid, boolean) from public, anon;
revoke all on function public.decide_affiliation_request(uuid, boolean) from public, anon;
revoke all on function public.decide_institution_role_request(uuid, boolean) from public, anon;

grant execute on function public.current_user_institution_id() to authenticated;
grant execute on function public.has_institution_role(uuid, text[]) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.can_manage_club(uuid) to authenticated;
grant execute on function public.is_active_club_member(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.can_view_post(uuid) to authenticated;
grant execute on function public.profile_is_visible_to_current_user(uuid) to authenticated;
grant execute on function public.create_conversation(uuid[], text, text) to authenticated;
grant execute on function public.approve_institution_request(uuid, boolean) to authenticated;
grant execute on function public.decide_affiliation_request(uuid, boolean) to authenticated;
grant execute on function public.decide_institution_role_request(uuid, boolean) to authenticated;
