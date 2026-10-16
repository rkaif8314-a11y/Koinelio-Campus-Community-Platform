# IIT Bhilai Access and Club Governance — Launch Checklist

## Status

This is a **production-hardening change under review**, not a deployed release. The migration in this branch has not been applied to the live Supabase database. The signed-in pilot surfaces now use Supabase for the profile, avatar upload, club membership/governance, feed, events, notifications, and club-room messaging rather than fictional account personas. Production launch remains blocked on staging migration tests, full route/security review, Auth/Storage configuration, backups/privacy/abuse operations, and explicit IIT Bhilai authorization. Do not advertise Koinelio as an institutionally official IIT Bhilai service without written authorization.

## What this branch adds

- New signups must use an `@iitbhilai.ac.in` mailbox. Supabase must confirm the email before authenticated database access is granted. The database trigger enforces the domain; frontend checks are only user experience.
- Public signup always creates a student profile. A signup field or client metadata cannot grant administrator, president, General Secretary, moderator, or club-coordinator privileges.
- Platform administrators are provisioned only through the owner-controlled `private.bootstrap_admin_emails` allowlist. This private table has no client read/write policy.
- Campus president and institution-scoped administrator roles can oversee club governance. Platform admins approve president/General Secretary appointments. Technical/Cultural General Secretaries approve coordinators in their corresponding club category; the president or administrator can handle categories that cannot be safely classified automatically.
- Clubs must be approved before invitations, member promotion, and normal room access are available.
- Coordinator invitations can offer `member` or `core_member`; an invitee must explicitly accept. Existing membership requests remain pending until a coordinator reviews them.
- Each club has three room types: **General** (all confirmed institute-email accounts for an approved club), **Members** (active members, core members, and coordinators), and **Core Team** (active core members and coordinators). Campus president/platform admin can oversee club rooms. Personal direct messages are not opened to campus leadership by this feature.
- Authenticated RLS policies on public tables are wrapped with the same confirmed-domain check so a client-side form cannot bypass the institute-email requirement.

## Migration sequence to validate in staging

After the repository's existing base schema/security migrations, apply the new migrations in filename order to a disposable/staging project:

1. `20261016090000_iit_bhilai_access_and_club_governance.sql`
2. `20261016100000_profile_avatars_storage.sql`
3. `20261016110000_koinelio_campus_tenant_bootstrap.sql`
4. `20261016120000_koinelio_feed_media_and_classification.sql`
5. `20261016130000_koinelio_profile_directory_category.sql`

Do not apply this sequence to the current live project without staging tests and a reviewed rollback/backup plan. The live project currently records only the earlier seven base migrations, so the signed-in app may report missing functions, columns or Storage buckets until the newer schema is applied correctly.

## Important verification limitation

The `@iitbhilai.ac.in` address proves access to a mailbox on that domain after confirmation; it **does not by itself prove that the person is currently an enrolled student**. IIT Bhilai's official ITIS services page describes email/LDAP access for students, staff, researchers, and faculty, so a strict student-only launch needs an institute-approved enrolment verification method. Do not collect or ask for anyone's LDAP password. Use an official SSO/verification integration or a documented approval process authorised by IIT Bhilai.

Official references:

- ITIS services and institute email/LDAP: https://www.iitbhilai.ac.in/index.php?pid=itis_services
- ITIS FAQ: https://iitbhilai.ac.in/index.php?pid=itis_faq
- Official contacts (Academics/Admissions and Administration): https://www.iitbhilai.ac.in/index.php?pid=reach_us

## Owner-only initial administrator and tenant setup

**Run these steps only after an authorised owner has chosen the first administrator and has the right to operate this service.** Replace the placeholder email with that person's institute email. Do not put the email, credentials, or secrets into GitHub source code.

### 1. Add the first administrator to the private allowlist

Run in the Supabase SQL Editor (owner privileges):

```sql
insert into private.bootstrap_admin_emails(email)
values (lower('FIRST_ADMIN@iitbhilai.ac.in'))
on conflict (email) do nothing;
```

The allowlisted account must use that exact mailbox and confirm it through Supabase Auth. If it is confirmed after allowlisting, the trigger provisions `public.platform_admins` automatically.

If that account was already confirmed **before** it was allowlisted, the trigger does not run retroactively. After checking the exact address and authorisation, provision it explicitly:

```sql
insert into public.platform_admins(user_id)
select u.id
from auth.users u
where lower(u.email) = lower('FIRST_ADMIN@iitbhilai.ac.in')
  and u.email_confirmed_at is not null
on conflict (user_id) do nothing;

insert into public.institution_roles(
  institution_id, user_id, role, status, granted_by
)
select i.id, pa.user_id, 'institution_admin', 'active', null
from public.institutions i
cross join public.platform_admins pa
join auth.users u on u.id = pa.user_id
where i.slug = 'iit-bhilai'
  and lower(u.email) = lower('FIRST_ADMIN@iitbhilai.ac.in')
  and i.approval_status in ('pending', 'verified')
  and not exists (
    select 1 from public.institution_roles ir
    where ir.institution_id = i.id
      and ir.user_id = pa.user_id
      and ir.role = 'institution_admin'
      and ir.club_id is null
      and ir.status = 'active'
  );
```

### 2. Create the single-campus tenant as pending

After the first administrator has a confirmed account/profile, create the row using the SQL Editor. This deliberately starts as **pending**; it does not claim institutional endorsement.

```sql
insert into public.institutions(
  name, slug, email_domain, website, approval_status, requested_by
)
select
  'Indian Institute of Technology Bhilai',
  'iit-bhilai',
  'iitbhilai.ac.in',
  'https://www.iitbhilai.ac.in/',
  'pending',
  p.id
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('FIRST_ADMIN@iitbhilai.ac.in')
  and u.email_confirmed_at is not null
on conflict (slug) do nothing;
```

The migration's institution trigger assigns the scoped administrator role and associates profiles that have the fixed IIT Bhilai onboarding label. If the tenant already exists, verify its ID, status, admin role, and profile assignments rather than blindly re-running unrelated updates.

### 3. Mark the institute verified only after authorisation

The `verified` status is a governance assertion, not a setting to enable product features. Change the institution's status only after the responsible IIT Bhilai authority has expressly authorised the service and branding. Until then, leave it pending and describe Koinelio as an independent campus project/pilot.

## Supabase Auth and Storage configuration

Before using account confirmation or recovery links, set the Supabase Auth Site URL to the intended application origin and add the exact local/staging/production callback URLs to the Auth redirect allowlist, including:

- `/auth/callback` for email confirmation
- `/auth/reset-password` for recovery links

Confirm email confirmation is enabled. The profile-avatar Storage bucket is defined as `profile-avatars`, currently public for display URLs, with JPG/PNG/WebP limited to 2 MB. Profile pictures should be treated as public display assets even if the profile details themselves are private. Do not upload sensitive images/documents.

## Configuration and rollout checklist

- [ ] Confirm the first administrator's authorisation and add only their intended institute email to the private allowlist.
- [ ] Enable Supabase email confirmation; keep compromised/leaked-password protection enabled.
- [ ] Review existing Auth accounts before applying this migration. Existing accounts with an unconfirmed or non-`@iitbhilai.ac.in` email will lose access to RLS-protected public data after migration.
- [ ] Apply the SQL migration first in a disposable/staging Supabase project and check every DDL, trigger, role transition, and RLS path before production.
- [ ] Test as an unconfirmed user, a confirmed institute-domain user, a non-domain existing user, a member, a core member, a coordinator, a General Secretary, the president, and a platform administrator. Verify cross-room reads/writes and attempts to self-promote fail.
- [x] Replace primary signed-in surfaces (dashboard feed, club membership/detail, profile and profile image, settings, notifications, events, discovery, alumni, governance and club rooms) with Supabase-backed data and actions; remove the demo user switcher.
- [ ] Complete end-to-end staging tests for signup/confirmation/recovery, profile changes/image upload, club requests/invitations/Core Member access, and all three room tiers. This branch has not run those tests against a staging Supabase project yet.
- [ ] Review remaining direct-entry routes and implement/report/flag queues, audit history, backup/restore, incident response, privacy/retention terms, abuse handling and end-user support.
- [ ] Verify all RLS and Storage policies with at least two separate accounts per role, including attempts to self-promote or read another room.
- [ ] Review the deployment and branding with IIT Bhilai before announcing it as an official institute service.

## Northstar University

Northstar may remain in the **isolated demo environment only**. Do not allow it to appear as a real institution, mix its fixtures with the IIT Bhilai tenant, or accept Northstar accounts in the single-campus production path.
