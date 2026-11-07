# Part 15 — Final Integration and Release Readiness

**Snapshot date:** 7 November 2026  
**Scope:** Combined Parts 5–14 source archive plus release-readiness cleanup.  
**Decision:** Source-level checks pass. Local dependency-backed validation and staging verification remain required; this is not production approval.

## Part 15 changes

- Removed the unused global `AppProvider` from `app/layout.tsx`. The app had no route/component consumers of `useAppContext`; the provider only initialized synthetic demo users, posts, clubs, events, notifications and localStorage state.
- Removed the now-unreferenced `lib/app-context.tsx` and `lib/demo-data.ts` modules.
- Updated the Campus Guide to describe itself accurately as read-only public-source content for an independently operated, unofficial campus pilot. Removed obsolete statements that all dashboard interactions are local demo state.
- Migrated the Campus Guide's remaining legacy blue/purple/amber styling to the shared `--k-*` tokens for light and dark mode.
- Corrected the Campus Guide event section: the 6th Convocation listing is dated 24 October 2026, which is past as of this snapshot date. The page now labels it as a dated public listing, renders its configured date, and does not call it an upcoming event.
- Kept the legacy `/dashboard/profile/[id]/edit` route as an intentional redirect to `/dashboard/profile`; the canonical own-profile editor remains in place.
- Added `tests/part-15-release-readiness.test.mjs` to guard against reintroducing global demo context, stale Campus Guide claims, incorrectly labelled past events, unsafe environment handling and CI omissions.

## Checks performed in this source workspace

| Check | Result | Notes |
|---|---|---|
| `node --test tests/*.test.mjs` | **45 passed, 0 failed** | Native Node test runner; includes the existing Parts 5–14 invariants and eight Part 15 checks. |
| TypeScript/TSX syntax transpilation | **42 files, 0 syntax errors** | Global TypeScript transpile only; this does not replace `tsc --noEmit`. |
| CSS parser | **95 top-level nodes, 0 parse errors** | Syntax parse only; this does not replace browser rendering. |
| Browser build / render | Not run | Requires the dependency-backed local toolchain. |
| Full `pnpm type-check` | Not run | `node_modules` is intentionally not included in the source archive. |
| Full `pnpm lint` | Not run | Must be run locally on the combined working tree. |
| Full Next.js production build | Not run | Must be run locally after dependency update. |
| Supabase staging Auth/RLS/Storage/realtime | Not run | Requires a staging project and separate test accounts. |

The test runner may print the existing Node `MODULE_TYPELESS_PACKAGE_JSON` warning for `lib/post-classification.js`; the tests still pass. Do not add a package-wide module type change solely to hide this warning without checking the rest of the toolchain.

## Release blockers / actions before public deployment

1. **Framework security patch:** this source snapshot pins `next` and `eslint-config-next` at `16.4.0`. The official Next.js release listing shows stable `16.4.5` with fixes for multiple moderate security advisories. Upgrade both packages together, refresh `pnpm-lock.yaml`, and rerun every check. Do not install a canary build. See the [official Next.js releases](https://github.com/vercel/next.js/releases).
2. **Event capacity and closing time:** the existing event-registration insert policy does not atomically enforce event capacity or start-time closure. Client checks are not a security boundary. Add and staging-test a database-side atomic registration operation before promising capacity or registration cutoffs.
3. **Staging database validation:** replay the ordered migrations on a disposable/staging Supabase project, test cross-user and cross-role access, Storage object access, signed URLs, realtime room access, auth confirmation/recovery, event registration, recruitment and election flows.
4. **Operational readiness:** document privacy/retention/deletion, support, moderation, incident response, backups and restore rehearsal.
5. **Institutional boundary:** keep the IIT Bhilai tenant pending and do not claim institute endorsement without written authorization.
6. **Browser acceptance:** run the full local app and smoke-test desktop/mobile, light/dark themes, keyboard focus, labels, form errors, loading/empty/error states, and all route families.

## Git and deployment status

- No commit created by this Part 15 workspace.
- No GitHub push or PR merge.
- No production database migration or data change.
- No deployment.

The owner should inspect the local `git status`, full diff, and command output after applying this archive. Commit only after local checks pass and the remaining source changes are reviewed.
