# Koinelio

**One campus. Every connection.**

Koinelio is a Supabase-backed campus community pilot for profiles, approved clubs, student leadership, events, notifications, and role-restricted club rooms.

> **Important status:** This repository contains an implementation under production hardening. The IIT Bhilai access/governance migrations have not been validated on a staging database or applied to the live Supabase project. Do not treat Koinelio as an official IIT Bhilai service unless the institute has formally authorized it. An `@iitbhilai.ac.in` email confirms mailbox access after confirmation, not current enrolment.

## Real account flows in this branch

- Supabase Auth sign-up and sign-in restricted to confirmed `@iitbhilai.ac.in` accounts.
- Database-triggered profile creation with student-only self-signup; administrative and leadership roles cannot be set from sign-up metadata.
- Persisted profile editing for display name, bio, academic details, skills/interests, and visibility.
- Profile image upload using the `profile-avatars` Storage bucket (JPG, PNG or WebP, up to 2 MB).
- Database-backed campus posts, likes, comments, published events, event registrations, announcements, and notifications.
- Club proposals, membership requests, coordinator review, explicit member invitations, Core Member assignments, and governance requests.
- Three club rooms—General, Members, Core Team—with database RLS controlling access and message persistence.
- Administrator/president/General Secretary approvals and password reset flows.

These flows require the new migrations and Supabase Auth/Storage configuration described below. They have not yet been tested end-to-end against a staging Supabase instance.

## Stack

- Next.js App Router, React and TypeScript
- Tailwind CSS v4 and Lucide React
- Supabase Auth, Postgres Row Level Security, and Storage
- pnpm

## Run locally

Requirements: a supported Node.js LTS release and pnpm.

1. Copy `.env.example` to `.env.local`.
2. Set the Supabase project URL and publishable key for your own development/staging project.
3. Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm lint
pnpm build
```

## Supabase setup

Apply migrations only to a disposable/staging project first, in filename order:

- The previously applied schema/security migrations under `supabase/migrations/`
- `20261016090000_iit_bhilai_access_and_club_governance.sql`
- `20261016100000_profile_avatars_storage.sql`

Do **not** run the new migrations on the current live project until they have been validated in staging. The current project has no staging branches, so staging validation remains outstanding.

In Supabase Auth, configure the Site URL and allowed redirect URLs for:

- `/auth/callback` (email confirmation)
- `/auth/reset-password` (password recovery)

Email confirmation must be enabled. Enable leaked-password protection in Auth settings. Never collect or store institute/LDAP passwords.

Read [IIT Bhilai access and governance rollout](docs/IIT_BHILAI_PRODUCTION_ACCESS_AND_GOVERNANCE.md) before initializing the campus tenant or administrator.

## Roles and security

- Public sign-up always creates a student profile. Club coordinator, Core Member, General Secretary, president, and administrator privileges come only through validated database workflows.
- Coordinators manage membership requests and invite selected members; the invitee must accept before becoming active.
- The campus president and administrator can oversee club governance. General Secretaries review coordinator requests in their council. Ordinary students cannot approve their own requests.
- Club-room policies separate campus General chat, active Members chat, and Core Team chat. Personal direct messages are not opened to campus leadership by this feature.
- Northstar University is demo-only and must not be mixed into the IIT Bhilai tenant.

## Production launch requirements

Before merging to the deployment branch, validate the SQL migration and role transitions on staging with multiple accounts, audit Row Level Security and Storage, configure redirect URLs and leaked-password protection, confirm an authorized first-admin identity, review privacy/retention and abuse-reporting operations, and obtain written IIT Bhilai authorization before calling the service official or using institute branding as an endorsement.
