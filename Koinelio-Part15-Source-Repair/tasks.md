# Koinelio Master Task Plan

> Agreed execution order: Parts 5–7 → add the six project-context files → Parts 8–10 → Parts 11–14 → Part 15. Updated: 7 November 2026.

## Status legend

- [x] Implementation/checkpoint reported complete in the current working-copy history; still subject to final combined local verification where noted.
- [ ] Not yet accepted or requires additional implementation/verification.
- [~] Partially present; integration or staging verification remains.

Do not mark work complete based only on a visual mockup or an agent summary. Update this checklist after reviewing the actual diff and test output.

## Baseline: Parts 1–4

- [x] **Part 1 — Codebase audit:** route, code, migration and release-readiness inventory created.
- [x] **Part 2 — Development foundation:** package scripts, Node/pnpm baseline, CI workflow and local setup instructions exist in the current snapshot.
- [x] **Part 3 — Shared design system:** neutral/sage tokens, graphite dark theme and reusable UI components exist.
- [x] **Part 4 — Authentication flows:** sign-in, sign-up, callback, forgot-password and reset-password routes exist.

## Batch A — Parts 5–7

- [x] **Part 5 — Profiles and directory**
  - Own-profile editing and avatar flow.
  - Profile visibility and directory category remain separate from trusted campus roles.
  - Discover and alumni directory surfaces.
  - Review both themes, search/filter accessibility and visibility behavior.
- [x] **Part 6 — Campus feed**
  - Post types, creation, likes, comments, saved state, reporting and moderation paths.
  - Preserve post visibility and announcement authorization.
  - Review loading/empty/error states and responsive feed layout.
- [x] **Part 7 — Media and Storage**
  - Private `campus-post-media` and owner-gated public-avatar bucket behavior.
  - File type/size checks, per-user object paths and signed URLs.
  - Invalid/oversized selection must clear stale valid attachments.
  - Source review does not replace staging Storage-policy tests.

## Project context handoff — six files added after Parts 5–7

- [x] `architecture.md` — system, routes, data flow, schema, security boundaries and known integration caveats.
- [x] `design.md` — visual tokens, components, light/dark themes and accessibility rules.
- [x] `memory.md` — durable project state, constraints, known caveats and handoff context.
- [x] `prd.md` — product goal, personas, requirements, boundaries and acceptance scenarios.
- [x] `rules.md` — mandatory agent, Git, security, UI and testing rules.
- [x] `tasks.md` — this master execution plan.

## Batch B — Parts 8–10

- [x] **Part 8 — Discovery and global search**
  - People, clubs and published-event discovery.
  - Search/filter controls, clear state and keyboard accessibility.
  - Validate RLS-respecting results and avoid demo/live data mixing.
  - Batch B verification: approved-club/published-event filters and profile privacy policy assertions pass; directory load errors now expose a retry action and result counts are announced.
- [x] **Part 9 — Clubs and memberships**
  - Club discovery/details and membership request states.
  - Invitations and explicit acceptance.
  - Coordinator/Core Member governance and role-state presentation.
  - Batch B verification: platform-admin authority is included in the governance UI; institution-role and platform-admin lookup errors are surfaced instead of silently hiding approval controls.
- [x] **Part 10 — Governance and permissions**
  - Institution role workflows and club approval.
  - General/Members/Core room permission boundaries.
  - Security guardrail tests cover critical SQL invariants; staging tests still required.
  - Batch B verification: election controls include platform admins as permitted by existing RPC checks; election-window UI refreshes every 30 seconds; moderation/election UI consumes semantic design tokens. Eight additional discovery/governance invariants are covered by `tests/discovery-governance-invariants.test.mjs`.

## Batch C — Parts 11–14

- [x] **Part 11 — Messaging and club rooms**
  - General, Members, and Core Team room access.
  - Message list/composer, realtime behavior, loading/error states.
  - Ensure RLS—not UI filtering—controls read/write access.
- [x] **Part 12 — Events and notifications**
  - Published events, details, registration and capacity/status handling.
  - Notification list and read/unread state.
  - Event detail now reads the persisted Supabase event, current user's registration, organizer and related published events; registration/cancellation is scoped to the signed-in account. No demo event/context dependency remains in the detail route.
  - Registration UI distinguishes registered, attended, cancelled and no-show records. Attendance and organizer-closed records are not presented as cancellable/re-registerable; regression tests cover the unique event/user history row.
- [x] **Part 13 — Recruitment and interviews**
  - Open/closed drives, application submit/review states, interview scheduling and participant-only access.
  - Management affordances include trusted platform/institution/club manager roles already recognized by the database. Deadline and interview inputs validate future times; online meeting links require HTTPS and offline location is required.
- [x] **Part 14 — Elections and moderation**
  - Election windows, nominations, one-person-one-vote, secret ballot separation, result publication.
  - Election creation validates chronological nomination/voting windows before the existing RPC.
  - Post report resolution uses the restricted `resolve_post_report` RPC and an accessible confirmation dialog; no direct post-table update was introduced.

## Batch D — Part 15: final integration and release readiness

- [ ] **Part 15 — Full system verification**
  - [x] Inspect the combined source inventory; remove the unused global demo provider/fixtures and refresh stale Campus Guide copy.
  - [ ] Inspect the final local Git diff after applying the archive; confirm no unrelated or generated files.
  - [ ] Apply the patched Next.js package update and lockfile refresh before final release verification.
  - [x] Resolve the source-level event-detail demo/live inconsistency in Part 12.
  - [ ] Verify the event detail route against staging records and RLS with separate accounts.
  - [x] Confirm `/dashboard/profile/[id]/edit` is an intentional redirect to `/dashboard/profile`; verify browser navigation locally.
  - [x] Run source-level regression tests on the combined copy: 45 passed, 0 failed; see `docs/PART_15_RELEASE_READINESS.md`.
  - [ ] Run dependency-backed TypeScript type-check locally after extracting this archive.
  - [ ] Run ESLint locally and triage warnings on the combined copy.
  - [ ] Run a fresh production build locally on the combined copy.
  - [ ] Browser smoke test: landing, auth, dashboard, profile, feed, discovery, clubs, rooms, events, notifications, recruitment, elections, moderation and Campus Guide.
  - [ ] Verify light and dark theme on desktop and mobile.
  - [ ] Verify keyboard focus, labels, validation errors, empty/loading/error states.
  - [ ] Test Supabase staging with multiple accounts: auth confirmation, profile creation, role changes, RLS, Storage, realtime, event registration, recruitment and elections.
  - [ ] Confirm backups and recovery plan before any production migration.
  - [ ] Confirm written institutional authorization before any official IIT Bhilai branding/announcement.
  - [ ] Owner reviews full diff and explicitly approves local commit.

- [ ] Upgrade `next` and `eslint-config-next` together from `16.4.0` to stable security-patched `16.4.5`, refresh the lockfile and rerun every check before public deployment.

## Suggested execution commands

Windows PowerShell (use `.cmd` shim if execution policy blocks `.ps1`):

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
pnpm.cmd type-check
pnpm.cmd lint
pnpm.cmd build
git diff --check
git status --short
```

## Release decision

A task is not production-ready solely because the frontend compiles. Production release requires staging RLS/Storage/Auth/realtime validation, safe migration history, privacy/operations readiness, recovery procedures, and formal institutional authorization where the product implies institute endorsement.
