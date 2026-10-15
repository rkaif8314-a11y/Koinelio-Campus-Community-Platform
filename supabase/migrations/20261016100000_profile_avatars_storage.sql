-- Profile image storage for the single-campus Koinelio product.
-- Public URLs are intentional for profile avatars; writes are owner/domain-gated.
-- This migration has not been applied to production. Validate on staging first.

begin;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Verified campus users upload their own avatar" on storage.objects;
create policy "Verified campus users upload their own avatar"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

drop policy if exists "Verified campus users update their own avatar" on storage.objects;
create policy "Verified campus users update their own avatar"
on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

drop policy if exists "Verified campus users delete their own avatar" on storage.objects;
create policy "Verified campus users delete their own avatar"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

-- Storage object metadata can be read by the owner; public bucket URLs handle
-- display in avatars without exposing a directory-listing API.
drop policy if exists "Verified campus users list their own avatars" on storage.objects;
create policy "Verified campus users list their own avatars"
on storage.objects
for select to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.is_iit_bhilai_email_verified((select auth.uid()))
);

commit;
