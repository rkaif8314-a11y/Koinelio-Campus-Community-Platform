# IIT Bhilai Access and Club Governance — Launch Checklist

## Status

This is a **production-hardening change under review**, not a deployed release. The migration in this branch has not been applied to the live Supabase database. The current dashboard still uses browser-local demo records, including the demo user switcher, sample posts, events, and counts. Do not advertise Koinelio as an institutionally official IIT Bhilai service until written authorization has been obtained from the institute.

## What this branch adds

- New signups must use an `@iitbhilai.ac.in` mailbox. Supabase must confirm the email before authenticated database access is granted. The database trigger enforces the domain; frontend checks are only user experience.
- Public signup always creates a student profile. A signup field or client metadata cannot grant administrator, president, General Secretary, moderator, or club-coordinator privileges.
- Platform administrators are provisioned only through the owner-controlled `private.bootstrap_admin_emails` allowlist. This private table has no client read/write policy.
- Campus president and institution-scoped administrator roles can oversee club governance. Platform admins approve president/General Secretary appointments. Technical/Cultural General Secretaries approve coordinators in their corresponding club category; the president or administrator can handle categories that cannot be safely classified automatically.
- Clubs must be approved before invitations, member promotion, and normal room access are available.
- Coordinator invitations can offer `member` or `core_member`; an invitee must explicitly accept. Existing membership requests remain pending until a coordinator reviews them.
- Each club has three room types: **General** (all confirmed institute-email accounts for an approved club), **Members** (active members, core members, and coordinators), and **Core Team** (active core members and coordinators). Campus president/platform admin can oversee club rooms. Personal direct messages are not opened to campus leadership by this feature.
- Authenticated RLS policies on public tables are wrapped with the same confirmed-domain check so a client-side form cannot bypass the institute-email requirement.

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

## Configuration and rollout checklist

- [ ] Confirm the first administrator's authorisation and add only their intended institute email to the private allowlist.
- [ ] Enable Supabase email confirmation; keep compromised/leaked-password protection enabled.
- [ ] Review existing Auth accounts before applying this migration. Existing accounts with an unconfirmed or non-`@iitbhilai.ac.in` email will lose access to RLS-protected public data after migration.
- [ ] Apply the SQL migration first in a disposable/staging Supabase project and check every DDL, trigger, role transition, and RLS path before production.
- [ ] Test as an unconfirmed user, a confirmed institute-domain user, a non-domain existing user, a member, a core member, a coordinator, a General Secretary, the president, and a platform administrator. Verify cross-room reads/writes and attempts to self-promote fail.
- [ ] Replace dashboard mock/local-storage persistence with Supabase-backed queries and writes; remove the demo user switcher and synthetic records from the normal signed-in product.
- [ ] Implement the UI for room messages, pending membership requests, coordinator invitations, invitation accept/decline, promotion to Core Member, club approval, and leadership appointments.
- [ ] Add backup/restore and incident-response procedures, privacy/retention terms, abuse reporting, moderator actions, logging/audit history, and end-user support.
- [ ] Review the deployment and branding with IIT Bhilai before announcing it as an official institute service.

## Northstar University

Northstar may remain in the **isolated demo environment only**. Do not allow it to appear as a real institution, mix its fixtures with the IIT Bhilai tenant, or accept Northstar accounts in the single-campus production path.
