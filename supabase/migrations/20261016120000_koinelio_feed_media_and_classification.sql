-- Persisted post classification plus private upload storage for campus-feed media.
-- Media objects remain private and can only be signed/read by confirmed campus
-- accounts. The app stores an object path in posts.media_url, not a public URL.
begin;

alter table public.posts
  add column if not exists post_type text not null default 'discussion',
  add column if not exists media_url text;

do $post_type_constraint$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'posts_post_type_allowed'
      and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_post_type_allowed
      check (post_type in ('discussion', 'question', 'project', 'achievement', 'opportunity', 'announcement'));
  end if;
end;
$post_type_constraint$;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'campus-post-media',
  'campus-post-media',
  false,
  26214400,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Verified campus members read campus post media" on storage.objects;
create policy "Verified campus members read campus post media"
on storage.objects for select to authenticated
using (
  bucket_id = 'campus-post-media'
  and private.is_iit_bhilai_email_verified((select auth.uid()))
  and (
    -- Users can always read their own uploaded object, including an upload
    -- whose post insert failed and is awaiting cleanup.
    (storage.foldername(name))[1] = (select auth.uid())::text
    -- Other members can read media only when its parent post is visible to them.
    or exists (
      select 1
      from public.posts p
      where p.media_url = storage.objects.name
        and private.can_view_post(p.id)
    )
  )
);

drop policy if exists "Verified campus members upload their own post media" on storage.objects;
create policy "Verified campus members upload their own post media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'campus-post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

drop policy if exists "Verified campus members update their own post media" on storage.objects;
create policy "Verified campus members update their own post media"
on storage.objects for update to authenticated
using (
  bucket_id = 'campus-post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
)
with check (
  bucket_id = 'campus-post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

drop policy if exists "Verified campus members delete their own post media" on storage.objects;
create policy "Verified campus members delete their own post media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'campus-post-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

-- Announcement posts require an already-authorized platform or campus leader.
-- Other post classes remain available to confirmed campus members.
drop policy if exists "Create posts as self" on public.posts;
create policy "Create posts as self"
on public.posts for insert to authenticated
with check (
  private.is_iit_bhilai_email_verified((select auth.uid()))
  and author_id = (select auth.uid())
  and moderation_status = 'published'
  and (
    visibility <> 'club'
    or (club_id is not null and public.is_active_club_member(club_id))
  )
  and (
    post_type <> 'announcement'
    or public.is_platform_admin()
    or exists (
      select 1
      from public.institution_roles ir
      where ir.user_id = (select auth.uid())
        and ir.institution_id = (select private.current_user_institution_id())
        and ir.status = 'active'
        and ir.role in ('institution_admin', 'president', 'technical_gs', 'cultural_gs', 'moderator')
        and ir.club_id is null
    )
  )
);

commit;
