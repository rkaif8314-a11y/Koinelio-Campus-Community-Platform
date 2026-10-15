# Koinelio demo review, onboarding and privacy boundary

## Public demo
Visitors can open `/dashboard` from the landing page without creating an account. The dashboard is a local prototype: demo profile names, avatars, posts, club memberships, activity totals, registrations and sample events are fictional. Interactions modify browser demo state and do not create official institute records, registrations or announcements.

## Signup fields
- Institution choice: IIT Bhilai (only configured pilot selection).
- Role label: student, faculty or alumni.
- Department/discipline, degree programme, admission/joining year and interests.
- Email and password handled by Supabase Authentication.

The institution choice is saved as a **self-reported label** (`institution_slug = iit-bhilai`). It is intentionally not mapped to `profiles.institution_id` and does not unlock campus-scoped data. `campus_role` is a profile label, not an authorization role. Trusted institution roles and platform-admin permissions must continue to come only from `institution_roles` / `platform_admins` and their database checks.

## Institute ID and verification
The Institute/LDAP ID field is deliberately not collected in this first release. The existing affiliation-request table has no dedicated identity-proof field, and there is no approved IIT Bhilai reviewer configured. Do not save an institute ID, document image or LDAP password in Supabase Auth metadata, the public profile, event messages or free-text notes. Add ID capture only after a private server-side verification route, narrow reviewer authorization, retention/deletion rules and institutional permission are in place.

A selected institution, email address, department, programme, batch year or role is not proof of affiliation. The prototype has no institute SSO or student-record verification, and IIT Bhilai has not approved or endorsed Koinelio.

## Database hardening
The `koinelio_profile_affiliation_hardening` migration adds a self-reported `institution_slug`, bounds and validates signup metadata in the user-creation trigger, and prevents users from editing their own `institution_id`, `institution_slug`, `campus_role` or `verification_status`. This reduces the risk of a user self-assigning campus access or marking themselves verified. The trigger leaves `institution_id` unset; an authorized affiliation flow must decide that later.

## Before a real pilot
- Keep Supabase email confirmation enabled and configure CAPTCHA / auth rate limits for the expected public traffic.
- Verify redirect URLs and password policies in Supabase Auth.
- Keep service-role keys server-side only; never expose them as `NEXT_PUBLIC_*` variables.
- Audit RLS on every table before connecting production campus records.
- Establish a privacy notice, retention period and deletion process before collecting identity documents or institute IDs.
- Institution representatives should only edit public institute content after a verified role has been granted through the database workflow. Public facts and source links are in `lib/institution-config.ts`; historical figures/events must be reconfirmed before being presented as current.