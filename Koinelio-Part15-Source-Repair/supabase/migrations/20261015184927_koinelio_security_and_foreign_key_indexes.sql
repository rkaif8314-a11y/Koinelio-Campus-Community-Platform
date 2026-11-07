-- Security fix: auth trigger is invoked by the database trigger; it must not be
-- callable as a public RPC endpoint.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Index all remaining foreign-key columns that aren't leading columns of an
-- appropriate index, to avoid expensive deletes/updates as data grows.
create index if not exists announcements_created_by_idx on public.announcements (created_by);
create index if not exists clubs_created_by_idx on public.clubs (created_by);
create index if not exists conversation_members_user_id_idx on public.conversation_members (user_id);
create index if not exists conversations_created_by_idx on public.conversations (created_by);
create index if not exists events_club_id_idx on public.events (club_id);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists events_institution_id_idx on public.events (institution_id);
create index if not exists affiliation_requests_decided_by_idx on public.institution_affiliation_requests (decided_by);
create index if not exists affiliation_requests_user_id_idx on public.institution_affiliation_requests (user_id);
create index if not exists role_requests_club_id_idx on public.institution_role_requests (club_id);
create index if not exists role_requests_decided_by_idx on public.institution_role_requests (decided_by);
create index if not exists role_requests_user_id_idx on public.institution_role_requests (user_id);
create index if not exists institution_roles_club_id_idx on public.institution_roles (club_id);
create index if not exists institution_roles_granted_by_idx on public.institution_roles (granted_by);
create index if not exists institution_roles_user_id_idx on public.institution_roles (user_id);
create index if not exists institutions_requested_by_idx on public.institutions (requested_by);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists post_comments_author_id_idx on public.post_comments (author_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);
create index if not exists posts_club_id_idx on public.posts (club_id);
create index if not exists recruitment_drives_created_by_idx on public.recruitment_drives (created_by);
create index if not exists recruitment_interviews_application_id_idx on public.recruitment_interviews (application_id);
create index if not exists recruitment_interviews_created_by_idx on public.recruitment_interviews (created_by);
create index if not exists recruitment_interviews_interviewer_id_idx on public.recruitment_interviews (interviewer_id);
create index if not exists saved_posts_user_id_idx on public.saved_posts (user_id);
