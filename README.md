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

Apply migrations to a disposable/staging project first, in ascending filename order:

- The earlier schema/security migrations already required by the application.
- `20261016090000_iit_bhilai_access_and_club_governance.sql` — confirmed campus-email restriction, leadership workflows, and role-restricted club rooms.
- `20261016100000_profile_avatars_storage.sql` — private write controls for profile photos.
- `20261016110000_koinelio_campus_tenant_bootstrap.sql` — creates the pending IIT Bhilai tenant row and backfills only confirmed campus-email profiles that have no tenant.
- `20261016120000_koinelio_feed_media_and_classification.sql` — persisted post categories, role-gated official announcements, and private storage for feed images, GIFs, and videos.
- `20261016130000_koinelio_profile_directory_category.sql` — keeps self-reported student/alumni directory category separate from trusted campus roles and permissions.
- `20261016140000_koinelio_post_reports_and_moderation.sql` — adds a report queue and trusted moderator-only resolution RPCs; direct report-table writes are denied.

Do **not** apply these to production until staging tests pass. Do not mark the IIT Bhilai tenant as institutionally verified unless formal authorization has actually been granted. The migration intentionally uses `pending` status.

### Required staging checks

1. Create a fresh account with a confirmed `@iitbhilai.ac.in` email and verify its profile is assigned to the pending campus tenant.
2. Test profile edits and upload a JPG/PNG/WebP avatar; verify it persists after sign-out and sign-in.
3. Propose a club, verify it remains pending, and test an authorized approval flow.
4. Test invitations, membership activation, General/Members/Core Team room access, and realtime messages with separate student and leadership accounts.
5. Publish a discussion, question, project, achievement, or opportunity with text, emoji, image, GIF, and video. Confirm signed media URLs work and official announcements are rejected for ordinary users at the database boundary.
6. Confirm Row Level Security denies cross-user profile edits, unauthorized approvals, and unauthorized access to private rooms/media.
7. Submit a report from a second account, verify reporters can only read their own reports, and verify only a moderator/administrator can dismiss or hide a reported post.

Production Supabase migration history and Vercel deployment status must be checked independently of a successful frontend build.

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

## Recruitment and release candidate

The signed-in app includes a Club Recruitment page at `/dashboard/recruitment` for open drives, applications, reviewer status/notes, and interview scheduling. These flows rely on the existing recruitment tables and Row Level Security; validate them with separate staging accounts before pilot acceptance. See [Phase 6 release-candidate checklist](docs/PHASE_6_RELEASE_CANDIDATE.md) and [Security Policy](SECURITY.md) for the remaining release gates.

## Production launch requirements

Before merging to the deployment branch, validate the SQL migration and role transitions on staging with multiple accounts, audit Row Level Security and Storage, configure redirect URLs and leaked-password protection, confirm an authorized first-admin identity, review privacy/retention and abuse-reporting operations, and obtain written IIT Bhilai authorization before calling the service official or using institute branding as an endorsement.
