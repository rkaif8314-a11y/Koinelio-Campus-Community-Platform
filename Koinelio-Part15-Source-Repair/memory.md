# Koinelio Project Memory / Handoff

> Durable project context for future coding sessions and agents. Updated: 7 November 2026. Do not store personal secrets, API keys, passwords, tokens, or private user data here.

## 1. Project identity

- Product: **Koinelio**.
- Tagline currently used: **One campus. Every connection.**
- Product: campus community pilot for student profiles, clubs, events, conversations, alumni connections, and campus opportunities.
- Current codebase is IIT Bhilai-oriented and restricts account sign-up to confirmed `@iitbhilai.ac.in` email accounts.
- Koinelio is not an official IIT Bhilai service unless formal authorization is granted. A confirmed email address is not proof of current enrolment or endorsement.

## 2. Current technical baseline

- Next.js 16.4.0 / React 19.3.0 / TypeScript.
- Tailwind CSS v4, Lucide React.
- Supabase Auth, Postgres RLS, Storage.
- pnpm 11.24.0; `.nvmrc` says Node 22; CI is configured for Node 22.
- TypeScript strict mode.
- Automated tests use Node's built-in test runner (`node --test tests/*.test.mjs`).
- Local environment requires `.env.local`, copied from `.env.example` and populated with a development/staging Supabase URL and publishable key.

## 3. Project source-of-truth

Read `architecture.md`, `design.md`, `prd.md`, and `rules.md` before making broad changes. `tasks.md` is the agreed execution order. SQL migrations and current source code outrank these notes if there is a discrepancy.

## 4. Existing product areas

The repository has routes and implementations for:

- Public landing page and auth (sign-up, sign-in, email callback, forgot/reset password).
- Dashboard shell and home.
- Profiles, profile directory/discovery, alumni directory.
- Campus feed with post types, likes, comments, reports, and media.
- Clubs, membership requests, invitations, governance and management.
- Club rooms: General, Members, Core Team.
- Events and registrations.
- Notifications.
- Recruitment drives, applications and interviews.
- Campus elections and result publication.
- Moderation and admin pages.
- Campus information, help and settings.

Implementation existing does not equal staging-verified. Check actual route/data path before claiming a feature is production-ready.

## 5. Important security and governance invariants

- Authenticated data access relies on RLS; client-side route checks are not the data security boundary.
- Public self-signup must not grant campus leadership, moderator, coordinator, or administrator privileges.
- Institution and club roles come from trusted database workflows.
- The IIT Bhilai tenant is currently pending in the bootstrap migration.
- Club room access differs by room type; General, Members, and Core Team access must remain separate.
- Feed media bucket `campus-post-media` is private. Keep object paths, signed URLs, owner folders, and visibility checks intact.
- Avatar bucket `profile-avatars` is public for image display but owner/domain restricted for writes.
- Election ballots are kept separate from voter identity; preserve secret ballot design and one-person-one-vote enforcement.
- Report submission and report resolution are RPC-mediated; direct report-table writes are not allowed by the intended design.
- Never expose service-role credentials to browser code or `NEXT_PUBLIC_*` variables.
- Do not collect institute/LDAP passwords.

## 6. Live data and public-source content boundary

- The unused global demo provider and its synthetic fixture module were removed in Part 15; they are not mounted in the current application runtime.
- The Campus Guide reads public-source reference data from `lib/institution-config.ts`. It is read-only informational content, not an official IIT Bhilai notice or endorsement.
- Signed-in features use their own Supabase-backed workflows. A local build or source-level test does not prove staging RLS, Storage, email, realtime or multi-account behavior.
- Event detail uses account-scoped Supabase reads for the event and current user's registration. Registration UI distinguishes registered, attended, cancelled and no-show records; staging verification remains open.
- Campus Guide event entries are dated source records. Do not label a past event as upcoming; refresh the source before presenting new event dates.

## 7. Known technical caveats at last inspected snapshot

- 14 SQL migration files are present.
- `README.md` explicitly states governance/access migrations have not been validated against staging or applied to production.
- No production database change, deployment, or GitHub push is authorized in this workflow.
- One small profile edit route (`/dashboard/profile/[id]/edit`) redirects/acts as a stub; own-profile editing lives under `/dashboard/profile`. Verify navigation remains coherent.
- `node --test` emits a `MODULE_TYPELESS_PACKAGE_JSON` warning for `lib/post-classification.js`; don't add `"type": "module"` without evaluating the whole JS module/tooling impact.
- ESLint has previously reported warnings for unused imports and `<img>` elements. Warnings should be triaged; do not suppress them blindly.
- PowerShell may block the `pnpm.ps1` shim. Use `pnpm.cmd` instead of weakening machine-wide execution policy.

## 8. Agreed collaboration workflow

- Work in explicit parts from `tasks.md`.
- ChatGPT is engineering coordinator/reviewer and can prepare/modify the uploaded working copy; it cannot directly control the user's local OpenCode/Antigravity processes.
- OpenCode may be the local writing agent; Antigravity is an independent read-only reviewer when available.
- Do not run two writing agents against the same working tree or same files at once.
- For each part: inspect → scope exact files → implement → review diff → run focused tests → generate light/dark preview → accept or fix → continue.
- Keep each agent's file ownership explicit.
- Never claim a preview is a live browser screenshot if it is a static mock preview.
- Never claim a test/build passed unless the exact command was run against the current combined working tree.

## 9. Git and release constraints

- Preserve `.git` and the existing history.
- The verified local bundle backup created on 7 November 2026 is `Koinelio-Backup-2026-11-07.bundle` on the user's Desktop.
- The owner authorized local edits, local tests, and approved local commits only.
- No GitHub push, production deployment, or production database operation without a new explicit authorization.
- Do not commit until the owner has reviewed the combined diff and the relevant checks pass.

## 10. Current work ordering

See `tasks.md`. Agreed sequence:

1. Parts 5–7.
2. Add and maintain these six root project-context files: `architecture.md`, `design.md`, `memory.md`, `prd.md`, `rules.md`, `tasks.md`.
3. Parts 8–10.
4. Parts 11–14.
5. Part 15 final integration and release gate.

Update this file after accepted changes, not after speculative plans.


## 11. Batch B verification follow-up — Parts 8–10 (7 November 2026)

- Discovery still queries only approved clubs and published events. The profile list relies on the `Profiles visible by privacy and campus` RLS policy (own profile, public profiles, or campus-visible profiles in the same tenant); never widen this query or replace RLS with client-only filters.
- Discovery now exposes a retry action after directory load errors and announces the visible profile count to assistive technology.
- Clubs now reads `public.is_platform_admin()` in addition to active institution roles when deciding whether to show the campus-wide governance review UI. Both lookup errors are surfaced; errors must not silently produce a misleading role state.
- Elections now reads `public.is_platform_admin()` alongside institution roles because its create/publish RPCs authorize platform admins as well as institution admins/presidents. Election-window affordances refresh every 30 seconds while the route remains open; database RPC checks remain authoritative.
- Moderation presentation uses the direct `--k-*` semantic tokens, including `--k-on-danger` for the destructive action foreground.
- `tests/discovery-governance-invariants.test.mjs` adds source-level assertions for privacy-scoped discovery, role/query error handling, room access separation, platform-admin/election authorization, anonymous ballot separation, and report/moderation rules.
- Current source-level automated suite: 23 passing tests. This does not replace a staging Supabase RLS/Storage/realtime test or full browser/assistive-technology review.


## 12. Batch C implementation follow-up — Parts 11–14

- Messaging keeps room access enforced by existing RLS; the UI now announces successful sends and exposes the bounded 5,000-character composer to assistive technology.
- Event detail is now Supabase-backed instead of reading demo event/context data. It reads the signed-in user's own registration, displays permitted organizer data, and uses the existing event-registration table for registration/cancellation. The RLS policy and publication trigger remain unchanged.
- Events management UI recognizes existing platform/institution/club manager roles for affordance visibility; database policies/triggers remain authoritative.
- Recruitment management visibility includes existing platform/institution/club roles accepted by the database. Client validation checks deadlines, interview schedule and secure HTTPS meeting URLs; database RLS still controls writes.
- Election creation performs client-side chronology validation for nomination and voting windows before calling the existing RPC. Secret ballot separation, one-person-one-vote, candidate membership and publication authorization remain enforced in SQL.
- Moderation resolves reports only through `resolve_post_report`; an accessible confirmation dialog collects a bounded optional note.
- `tests/parts-11-14-workflow-invariants.test.mjs` covers source-level event, registration, messaging, recruitment, election and moderation invariants. At the end of Batch C the combined source-level suite had 37 passing tests, 0 failures. These static source assertions do not replace staging Auth/RLS/Storage/realtime testing.
- `next.config.ts` disables the optional Next.js agent-upgrade helper to prevent dev startup from waiting on a canary download; it does not change the pinned framework version.
- Batch C did not modify Supabase migrations, dependency versions or environment files.


## 13. Part 15 release-readiness follow-up — 7 November 2026

- Removed the unused global AppProvider and its synthetic demo fixture modules. No live app/component source imports those modules; no page used the context actions.
- Campus Guide wording now describes read-only public-source content for an independently operated, unofficial pilot. It no longer claims all dashboard activity is local demo state.
- The fixed 24 October 2026 convocation listing is presented as a dated public listing, not an upcoming event; the configured date is rendered from the source record.
- Profile legacy edit route is an intentional redirect to `/dashboard/profile`; the canonical own-profile editor remains the destination.
- `tests/part-15-release-readiness.test.mjs` adds eight release invariant checks. Combined source-level suite: 45 passing tests, 0 failures.
- Syntax transpilation of 42 TS/TSX/MTS files completed with 0 syntax errors. This is not a full dependency-backed TypeScript type-check.
- Next.js and eslint-config-next remain pinned at 16.4.0 in the snapshot. Upgrade both to stable 16.4.5 and refresh the lockfile before public deployment; rerun all local checks.
- Staging RLS/Storage/Auth/realtime and event capacity/start-time enforcement remain release blockers.
