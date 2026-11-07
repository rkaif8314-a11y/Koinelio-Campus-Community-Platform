# Account, onboarding and privacy boundaries

## Current account flow

Koinelio uses Supabase Authentication. Public signup is restricted to confirmed `@iitbhilai.ac.in` email accounts. The signup form collects the profile and academic metadata shown in `app/auth/signup/page.tsx`; those self-reported values do not grant institution, moderation, coordinator or platform-admin privileges.

Users must confirm mailbox ownership before accessing the authenticated application. Sign-in, email callback, forgot-password and reset-password routes are implemented in `app/auth/`. Email delivery, redirect configuration and the complete recovery journey still require verification against a staging Supabase project.

## Institute identity and endorsement

A confirmed institute-domain mailbox demonstrates control of that mailbox; it does not prove current enrollment, student status, employment, or institutional endorsement. Koinelio is independently operated and must not be presented as an official IIT Bhilai service without written authorization.

The Campus Guide is read-only informational content sourced from public institute pages. It is not an official notice or announcement. Do not use institute/LDAP passwords, collect student-record identifiers, or imply an official affiliation workflow that has not been authorized and staging-tested.

## Trusted roles and data access

A profile label, signup field, department, degree programme, batch year or interest cannot grant trusted permissions. Institution roles, club roles, moderation, election administration and platform administration must remain controlled by the existing database workflows, RPCs and RLS policies. UI checks are not a security boundary.

## Before a real pilot

- Confirm Supabase email confirmation and redirect allowlists.
- Configure auth rate limits and appropriate CAPTCHA/abuse protections.
- Test sign-up, confirmation, sign-in, sign-out and recovery with separate staging accounts.
- Test profile privacy, avatar upload, RLS and Storage policies with cross-user attempts.
- Establish privacy notice, data retention/deletion, support, moderation and incident-response ownership.
- Keep the institution tenant pending until written institutional authorization exists.
