-- Repair the single-campus tenant bootstrap.
-- IIT Bhilai remains "pending": an email domain is not institutional endorsement
-- or proof of current enrolment.
begin;

-- Tenant initialization must not require a profile to exist first.
alter table public.institutions
  alter column requested_by drop not null;

insert into public.institutions (
  name, slug, email_domain, website, approval_status, requested_by
)
values (
  'IIT Bhilai', 'iit-bhilai', 'iitbhilai.ac.in',
  'https://www.iitbhilai.ac.in/', 'pending', null
)
on conflict (slug) do update
set
  name = excluded.name,
  email_domain = excluded.email_domain,
  website = excluded.website,
  updated_at = now();

-- Backfill only confirmed campus mailbox accounts that have no tenant assigned.
-- Existing non-null affiliations and profile preferences are untouched.
update public.profiles as p
set institution_id = i.id,
    institution_slug = 'iit-bhilai'
from public.institutions as i, auth.users as u
where i.slug = 'iit-bhilai'
  and u.id = p.id
  and p.institution_id is null
  and u.email_confirmed_at is not null
  and lower(btrim(coalesce(u.email, ''))) ~ '^[^@[:space:]]+@iitbhilai[.]ac[.]in$';

commit;
