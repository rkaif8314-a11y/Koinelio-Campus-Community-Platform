-- Repair the single-campus tenant bootstrap.
-- This migration deliberately keeps IIT Bhilai in "pending" status: an email
-- domain is not institutional endorsement or proof of current enrolment.
begin;

-- Tenant bootstrap must not depend on a profile already existing, because
-- profile creation itself needs the tenant row to set institution_id.
alter table public.institutions
  alter column requested_by drop not null;

insert into public.institutions (
  name,
  slug,
  email_domain,
  website,
  approval_status,
  requested_by
)
values (
  'IIT Bhilai',
  'iit-bhilai',
  'iitbhilai.ac.in',
  'https://www.iitbhilai.ac.in/',
  'pending',
  null
)
on conflict (slug) do update
set
  name = excluded.name,
  email_domain = excluded.email_domain,
  website = excluded.website,
  updated_at = now();

-- Backfill only confirmed institute-mailbox accounts that have no tenant
-- assigned. Existing non-null affiliations and all user profile preferences
-- remain untouched.
update public.profiles as p
set
  institution_id = i.id,
  institution_slug = 'iit-bhilai'
from public.institutions as i
join auth.users as u on u.id = p.id
where i.slug = 'iit-bhilai'
  and p.institution_id is null
  and u.email_confirmed_at is not null
  and lower(btrim(coalesce(u.email, ''))) ~ '^[^@[:space:]]+@iitbhilai[.]ac[.]in$';

commit;
