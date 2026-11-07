# Koinelio Architecture

> Living engineering reference. Updated: 7 November 2026. Verify every statement against the current source and migrations before making implementation decisions.

## 1. Product and deployment shape

Koinelio is a campus community web application built with the Next.js App Router. The current implementation is a single-campus IIT Bhilai-oriented pilot, backed by Supabase Auth, Postgres, Row Level Security (RLS), and Supabase Storage.

Koinelio is independently operated unless and until formal institutional authorization exists. The current IIT Bhilai tenant is deliberately `pending`; a confirmed `@iitbhilai.ac.in` mailbox proves control of that mailbox, not current student status or institute endorsement.

## 2. Technology stack

- Next.js `16.4.0`, App Router (current snapshot; upgrade to patched `16.4.5` before release).
- React and React DOM `19.3.0`.
- TypeScript (`strict: true`).
- Tailwind CSS v4 with the Turbopack CSS loader.
- Lucide React icons.
- Supabase JavaScript client `@supabase/supabase-js`.
- pnpm `11.24.0` (`packageManager` in `package.json`).
- Node.js local baseline recorded in `.nvmrc` as `22`; CI uses Node 22.

Do not upgrade or downgrade framework packages casually. Check Next.js/React peer compatibility, lockfile impact, and the current stable security release before changing versions.

## 3. Runtime and data flow

1. `app/layout.tsx` loads global styles, the Inter font, and `ThemeProvider`. No global demo-state provider is mounted.
2. Next.js renders public routes and authenticated dashboard routes under `app/`.
3. Client pages call `supabase.auth.getUser()` and use the configured Supabase browser client from `lib/supabase.ts`.
4. The browser client uses `NEXT_PUBLIC_SUPABASE_URL` and a publishable key (or legacy anon-key fallback). These are public client credentials; database authorization must be enforced by RLS and validated database functions.
5. Postgres constraints, RLS policies, triggers, and narrowly granted RPCs enforce ownership, campus verification, role boundaries, workflow transitions, and data visibility.
6. Supabase Storage bucket configuration and `storage.objects` policies enforce file access separately from database-row access.

There is no evidence in this source snapshot of a centralized Next.js middleware route gate. Dashboard pages contain client-side authentication checks. Treat these checks as navigation/UX guards only; they are not a replacement for RLS.

## 4. Application structure

```text
app/
  page.tsx                         Public landing page
  layout.tsx                       Root providers, font, metadata, global CSS
  auth/                            Sign-in, sign-up, callback, password recovery
  dashboard/
    layout.tsx                     Shared dashboard shell and navigation
    page.tsx                       Dashboard home
    community/                     Campus feed
    discover/                      People, clubs and event discovery
    profile/                       Own profile and public profile views
    alumni/                         Alumni directory
    clubs/                          Club directory and membership actions
      [id]/                         Club details
        dashboard/                  Club management workspace
    messages/                       Club-room messaging
    events/                         Event listing
      [id]/                         Supabase-backed event details
    notifications/                  Notifications
    recruitment/                    Recruitment drives and applications
    elections/                      Campus elections
    moderation/                     Post reports and moderation
    admin/                          Administrative interface
    campus/                         Campus information
    help/, settings/                Help and account settings
components/
  theme-provider.tsx
  theme-toggle.tsx
  koinelio-logo-mark.tsx
  ui/                               Shared Button, Input, Card, Badge, Alert,
                                    StatePill, EmptyState
lib/
  supabase.ts                       Supabase browser client/config validation
  institution-config.ts             Source-backed public institute reference data
  supabase-errors.ts                User-facing Supabase error mapping
  post-classification.js/.d.ts      Local post-type suggestion helper
supabase/migrations/                Ordered SQL schema, policy, trigger and RPC changes
tests/                              Node native test-runner security/logic tests
docs/                               Governance, research, rollout and release notes
```

## 5. Main domain entities

The migrations extend existing core tables and add product-specific tables. Names below are grounded in the SQL migrations; inspect the SQL for the definitive columns and constraints.

- **Institution and identity:** `institutions`, `profiles`, `platform_admins`, `institution_roles`, `institution_role_requests`, `institution_affiliation_requests`.
- **Clubs and membership:** `clubs`, `club_memberships`, `club_member_invitations`, `club_rooms`, `club_room_messages`.
- **Campus feed:** `posts`, `post_comments`, `post_likes`, `saved_posts`, `post_reports`, `announcements`.
- **Events:** `events`, `event_registrations`.
- **Messaging:** `conversations`, `conversation_members`, `messages` (general conversations) and club-specific `club_rooms` / `club_room_messages`.
- **Profiles and portfolio:** `career_experiences`, `student_projects`.
- **Recruitment:** `recruitment_drives`, `recruitment_applications`, `recruitment_interviews`.
- **Notifications:** `notifications`.
- **Elections:** `campus_elections`, `campus_election_candidates`, private `campus_election_voters`, and private `campus_election_ballots`.

## 6. Authentication and trusted roles

- Sign-up is restricted to confirmed `@iitbhilai.ac.in` email accounts.
- The current public self-sign-up path creates a student profile. Signup metadata must never grant trusted leadership or administrative privileges.
- Profile creation and campus identity enforcement are database-triggered/validated by migrations.
- Trusted institution roles are granted through approval workflows and database functions, not by editing client metadata.
- Club roles include member, Core Member, and coordinator. Club membership approval and Core Member promotion are separate operations.
- Institution roles include institution administrator, president, technical/cultural General Secretary, moderator, and club coordinator (club-scoped where required). Confirm exact accepted values in the latest migration before editing role handling.
- Never infer current enrollment or authorization from an email suffix alone.

## 7. Club rooms

Each approved club has three room types:

- `general`: confirmed campus accounts can access the approved club's General room.
- `members`: active members, Core Members, and the coordinator can access it.
- `core`: active Core Members and the coordinator can access it.

The `private.can_access_club_room(...)` function and RLS policies are the database enforcement boundary. UI hiding is not security.

## 8. Storage buckets

### `profile-avatars`

- Public bucket for avatar display URLs by design.
- Maximum configured file size: 2 MiB.
- MIME types: JPEG, PNG, WebP.
- Writes, updates, deletes, and object-list metadata reads are restricted to the verified account's own UID folder by Storage policies.

### `campus-post-media`

- Private bucket; media is stored as an object path in `posts.media_url`, not as a public URL.
- Maximum configured file size: 25 MiB.
- MIME types: JPEG, PNG, WebP, GIF, MP4, WebM.
- Verified campus users upload under their own UID folder.
- Owners can read their own objects; other users can read only when the parent post is visible to them.
- The application signs URLs for private media. Keep signed URLs short-lived and never replace private bucket policy with public access as a shortcut.

## 9. Migrations and database boundaries

Current repository snapshot contains 14 ordered migrations:

1. `20261015184711_koinelio_expand_product_schema.sql`
2. `20261015184841_koinelio_secure_rls_and_auth_profiles.sql`
3. `20261015184927_koinelio_security_and_foreign_key_indexes.sql`
4. `20261015185023_koinelio_private_security_functions.sql`
5. `20261015211152_koinelio_signup_academic_metadata.sql`
6. `20261015211348_koinelio_safe_batch_year_validation.sql`
7. `20261015213710_koinelio_profile_affiliation_hardening.sql`
8. `20261016090000_iit_bhilai_access_and_club_governance.sql`
9. `20261016100000_profile_avatars_storage.sql`
10. `20261016110000_koinelio_campus_tenant_bootstrap.sql`
11. `20261016120000_koinelio_feed_media_and_classification.sql`
12. `20261016130000_koinelio_profile_directory_category.sql`
13. `20261016140000_koinelio_post_reports_and_moderation.sql`
14. `20261016160000_koinelio_campus_elections.sql`

Migrations are chronological and may replace/redefine functions or policies from earlier migrations. Read the complete lifecycle; do not assume the first occurrence of a function is the final definition.

**Never edit an already-applied migration to change production state.** Add a new forward migration only after review and explicit approval. Do not run migrations against production in this workflow. All new migrations must be tested on a disposable/staging Supabase project first.

## 10. Current implementation caveats

- The current institution tenant is intentionally pending. Do not mark it verified without documented institutional authorization.
- The new governance/access migrations have not been validated on staging or applied to the live Supabase project. A local build is not evidence of deployed schema state.
- Next.js `16.4.5` is the stable security-patched release in the reviewed release listing; this source snapshot still pins `16.4.0`. Update `next` and `eslint-config-next` together, refresh `pnpm-lock.yaml`, and rerun the full checks before public deployment.
- Next.js `16.4.5` is the stable security-patched release in the reviewed release listing; this source snapshot still pins `16.4.0`. Update `next` and `eslint-config-next` together, refresh `pnpm-lock.yaml`, and rerun the full checks before any public deployment.
- The unused global demo provider and its fixture module were removed from the runtime. The Campus Guide is read-only public-source content; signed-in product workflows use their own Supabase paths. No synthetic demo people, posts, club rosters or registrations are mounted in the live route tree.
- Event registration UI blocks new registration after the event start time and preserves terminal attendance states. **Database-side capacity/time integrity is still incomplete:** the current insert RLS policy checks self-registration, published status and institution scope, but does not atomically check `events.capacity` or `starts_at`. A client-side check is not an enforcement boundary. Before production use with capacity/closing promises, implement and staging-test a database-side atomic registration operation or remove those promises.
- `app/dashboard/profile/[id]/edit/page.tsx` is an intentional legacy-route redirect to `/dashboard/profile`; the editable own-profile experience is canonical at `/dashboard/profile`. Keep links pointed to the canonical route.
- Client-side route guards are not sufficient to protect data. RLS remains the enforcement boundary; consider centralized server-side routing only as a separate, tested hardening task.
- Do not claim staging RLS, Storage, email delivery, realtime or multi-account workflows passed unless they were actually executed against a staging project.

## 11. Local verification commands

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm type-check
pnpm lint
pnpm build
```

For PowerShell where the `.ps1` shim is blocked by execution policy, use `pnpm.cmd` instead of changing the machine-wide execution policy.

## 12. Source-of-truth order

When these documents disagree, use this order:

1. Current source code and the latest ordered SQL migrations.
2. Current package/configuration files and passing automated tests.
3. `README.md`, `SECURITY.md`, and the existing `docs/` rollout/research documents.
4. These six project context files.
5. Agent-generated summaries or prior chat descriptions.

Update these documents when an approved architecture or product decision changes.
