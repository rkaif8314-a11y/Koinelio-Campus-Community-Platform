# Phase 6 — Release Candidate and Git Governance

**Status:** In progress. Green CI is necessary, but does not prove the live Supabase schema, RLS, Storage, or institutional authorisation is correct.

## Release policy

- Keep unfinished work on the feature branch and keep PR #6 as a draft until the owner explicitly requests review.
- Never push directly to main, merge the draft PR, promote the Vercel preview to production, or change production Supabase state without explicit owner approval.
- Use small, reviewable commits with descriptive messages. Before each branch update, verify the current head and use a compare-and-swap update so concurrent work is not overwritten.
- Do not commit credentials, service-role keys, personal data, real user reports, production dumps, or populated .env files. Use only public/publishable client configuration in browser code.
- Do not mark the IIT Bhilai tenant as verified or describe Koinelio as institute-endorsed without written authorisation.

## Candidate acceptance checklist

### Git and CI
- [x] Run post-classification regression tests in CI.
- [x] Run lint and a Next.js production build in CI.
- [x] Run CI on feature-branch pushes and pull requests targeting main.
- [x] Confirm CI is green for commit 0f5aaaf2cd317a95a5f20811bcb5b7fa06f90e4e (tests, lint, production build). Reconfirm after every subsequent code change.
- [ ] Review the full PR diff and verify no generated output, secrets, accidental unrelated edits, or destructive migration changes are included.
- [ ] Obtain explicit owner approval before merging; do not merge while staging or governance gates remain open.

### Staging database and access controls
- [ ] Replay all migrations, in filename order, into a disposable staging project starting from the documented base schema.
- [ ] Compare applied migration history and schema to the repository; record the exact tested commit and migration set.
- [ ] Test signup, email confirmation, sign-in, sign-out, password recovery, and expired/invalid links with separate accounts.
- [ ] Test profile edits and avatar upload, including invalid file type, oversize file, unauthorised object access, and persistence after re-login.
- [ ] Exercise club proposal, approval, coordinator request, invitation acceptance, member/core-member transitions, and room access using separate accounts.
- [ ] Verify cross-user writes, role self-promotion, cross-tenant reads, announcement publishing, and private room/media access are denied at the database boundary.
- [ ] Verify report submission rejects self-reports, duplicate reports, invalid reasons, and overlong details; only trusted moderators/admins can resolve reports.
- [ ] Test post hide/dismiss outcomes and confirm hidden content is no longer visible to ordinary users.

### Product and usability
- [ ] Test profiles, directory/alumni, clubs, events/registrations, posts/comments/likes, notifications, and moderation using real staging records.
- [ ] Test photo, GIF, and video uploads and signed URL expiry/failure states.
- [ ] Test mobile and desktop layouts, keyboard-only navigation, visible focus, form labels/errors, contrast in both themes, and empty/loading/error states.
- [ ] Test slow network, unavailable Supabase, expired session, and failed upload/retry behaviour.
- [ ] Review privacy notice, retention/deletion process, report handling, support contact, backup/restore procedure, and incident response ownership.

### Deployment and launch
- [ ] Confirm Vercel preview is built from the exact candidate commit and inspect runtime logs for errors.
- [ ] Verify production environment variable names and redirect allowlists without exposing their values.
- [ ] Confirm backups and perform a documented restore rehearsal before any production migration.
- [ ] Confirm domain ownership, privacy/support pages, and the user-facing description of pilot status.
- [ ] Obtain written institutional authorisation before institutional endorsement, official branding claims, or changing the campus tenant from pending.
- [ ] Record a rollback plan and the person authorised to execute it.
- [ ] Freeze nonessential features by **26 December 2026**; use **17–31 December 2026** for release-candidate testing and critical fixes only.
- [ ] Launch on **1 January 2027** only if every required safety, security, operational, and authorisation gate is passed.

## Remaining product workflows from the roadmap

These are explicit backlog items, not claims of completed functionality. Each item needs a schema/RLS review and tests before release.

- [x] **Club recruitment UI:** applications, deadlines, review status, coordinator decisions, applicant status visibility, and online/offline interview scheduling are implemented on /dashboard/recruitment. [ ] Staging-test all applicant/organizer access paths, deadline enforcement, and interview privacy.
- [ ] **Interview scheduling:** online meeting link or offline location, scheduled time, timezone, status, and access limited to the applicant and authorised club reviewers.
- [ ] **Role approvals and badges:** visible role/badge state must come from trusted, active database assignments; never from self-entered profile text or signup metadata.
- [x] **Priority baseline:** category/mine filters exist in the campus feed and priority labels appear for campus announcements. [ ] Review server-side ordering, expiry handling, and filter access controls on staging.
- [ ] **Elections module:** separate secured workflow for eligibility, nominations, voting windows, one-person-one-vote enforcement, ballot privacy, auditability, and authorised result publication. Do not implement elections as ordinary posts or client-only counters.

## Current known blockers

- New Supabase migrations have **not** been validated against a staging database or applied to production.
- Full real-account RLS/Storage tests, accessibility review, backup/restore rehearsal, privacy/retention review, and operational checks remain outstanding.
- The campus tenant must remain pending until written institutional authorisation is obtained.
- Vercel production release and PR merge remain approval-gated.

**Release rule:** if a checklist item is untested, mark it untested. Do not turn a documentation checkbox into a claim that the feature has passed.
