# Koinelio Engineering Rules

> Mandatory rules for ChatGPT, OpenCode, Antigravity, local agents, and human contributors. Updated: 7 November 2026.

## 1. Before changing code

1. Read `architecture.md`, `design.md`, `prd.md`, `memory.md`, and the relevant section of `tasks.md`.
2. Inspect the current working tree and target files. Never rely on a stale chat summary or a historical commit diff when reviewing uncommitted work.
3. Identify exact files in scope and state file ownership when multiple agents are involved.
4. Inspect the final/current version of relevant SQL functions and policies, not only the earliest migration occurrence.
5. Preserve existing working functionality unless a confirmed bug requires a scoped fix.

## 2. Source-of-truth hierarchy

- Current source code and ordered SQL migrations are authoritative.
- Package files, CI and tests define the current tooling baseline.
- `README.md`, `SECURITY.md`, and rollout docs define known operational constraints.
- These context files are durable guidance and must be updated when approved decisions change.
- Agent output is an analysis, not proof. Require file evidence, actual diffs and executed test results.

## 3. Git and collaboration

- Preserve the existing Git history and `.git` directory.
- Do not reset, clean, force-checkout, rebase, amend, or discard the user's work without explicit approval.
- Do not use `git restore`, `git checkout --`, or broad formatting commands to erase unrelated modifications.
- Parallelize read-only investigation and review; serialize writes to a shared working tree.
- Each writing agent must have an explicit file allowlist. Do not let agents edit the same file concurrently.
- Review `git status`, `git diff --stat`, `git diff --check`, and the full diff before accepting a change.
- Commit only after the owner reviews/approves the diff and the relevant tests pass.
- No GitHub push or production deploy in the current authorization.

## 4. Database and security rules

- Never apply migrations to production in this workflow.
- Never change production data, tenant approval, auth settings, Storage settings, or live policies without explicit owner authorization.
- Stage-test all SQL migrations on a disposable/staging Supabase project before any production plan.
- Never expose the service-role key to browser code, `NEXT_PUBLIC_*`, Git, logs, prompts, screenshots, or chat.
- Do not collect institute/LDAP passwords.
- Treat Supabase RLS as the security boundary. Client-side route guards and hidden UI controls are not authorization.
- Keep `SECURITY DEFINER` functions narrowly scoped, use a safe `search_path` (inspect existing convention, typically empty path plus qualified names), revoke broad execution grants, and grant only the required role.
- Do not accept privileged values from signup metadata or editable profile fields.
- Keep role assignment, invitation acceptance, election voting, moderation, and approvals inside validated database policies/functions.
- Do not make `campus-post-media` public or weaken owner-folder/parent-post visibility rules.
- Keep election voter identity separate from anonymous ballot choice.

## 5. Demo and factuality rules

- The live application must not mount synthetic demo people, posts, club rosters, event registrations or activity counts as campus records.
- Public institutional facts belong in `lib/institution-config.ts` with a direct source link and visible unofficial-status wording.
- Current IIT Bhilai tenant status is pending. Do not claim institutional verification or endorsement without written proof.
- A confirmed institute email demonstrates mailbox control, not current enrollment.
- Do not create fabricated user testimonials, official notices, campus metrics, events, or endorsements.

## 6. UI and accessibility rules

- Follow `design.md`; use the `--k-*` tokens and reusable `components/ui/*` primitives.
- Do not introduce a new one-off palette, gradient system, or visual language.
- Keep light and dark themes coherent. Check both when changing CSS, layout, status colors or shared components.
- Do not regress mobile navigation or keyboard interactions.
- Every interactive control must have a visible focus state and accessible name.
- Inputs require labels; validation messages should be linked and expose invalid state.
- Use status text/icons in addition to color.
- Respect reduced motion and maintain adequate target sizes.
- Keep text concise and avoid generic AI-style filler or fake metrics.

## 7. Code quality rules

- TypeScript strictness remains enabled. Avoid `any` unless there is a documented narrow reason.
- Keep components and changes focused; prefer reusable primitives when the same behavior repeats.
- Handle loading, empty, error, success and disabled states for data-driven controls.
- Do not swallow real errors or display blank sections on failed requests.
- Avoid introducing dependencies for small utility needs.
- Do not rename/move routes or files without updating imports, links, docs and tests.
- Never add mock data to a live Supabase feature as a fallback that could be mistaken for real data.

## 8. Testing and review rules

For meaningful changes, run the narrowest relevant checks first, then the full suite when integrating:

```bash
pnpm test
pnpm type-check
pnpm lint
pnpm build
git diff --check
```

On Windows PowerShell with script execution restrictions, call `pnpm.cmd`.

- Report the exact command and outcome.
- Separate errors from warnings; do not call lint clean if it has warnings.
- A static preview is not a live browser test.
- Source-text RLS tests are not staging integration tests.
- A successful frontend build does not prove RLS, Auth email, realtime, Storage, production schema, or institutional governance is ready.

## 9. Change acceptance protocol

Every part follows:

1. Scope: identify target behavior and files.
2. Inspect: understand existing logic and constraints.
3. Implement: make small focused modifications.
4. Diff review: inspect all additions/deletions and check for unrelated changes.
5. Test: run relevant tests/checks.
6. Preview: provide both light/dark visual review where UI changes.
7. Accept/fix: address confirmed defects before the next part.
8. Update: mark `tasks.md` and `memory.md` only after acceptance.

## 10. Explicitly forbidden without fresh approval

- GitHub push, PR merge, Vercel promotion/deployment.
- Production SQL migration or data modification.
- Production Auth/Storage configuration change.
- Disabling RLS, bypassing role checks, using service-role keys in browser code.
- Removing existing product functionality to make a test pass.
- Replacing the application with a newly generated unrelated website.
