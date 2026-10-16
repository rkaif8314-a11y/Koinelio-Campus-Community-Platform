## Purpose
<!-- What user problem does this change solve? -->

## Change type
- [ ] Bug fix
- [ ] Security / access-control change
- [ ] Product feature
- [ ] Documentation / release process
- [ ] Database migration

## Validation
- [ ] pnpm test
- [ ] pnpm lint
- [ ] pnpm build
- [ ] Relevant database/RLS tests performed on disposable staging (if applicable)
- [ ] Mobile and keyboard accessibility checked (if UI changed)
- [ ] Failure and empty states reviewed

## Security and data
- [ ] No secrets, production data, or credentials committed
- [ ] Server/database permissions enforce access; UI checks are not the only control
- [ ] Migration is additive/reviewed and has a documented rollback or recovery plan
- [ ] No role, endorsement, or verification status can be self-assigned

## Release approval
- [ ] Exact commit and preview reviewed
- [ ] Staging gates recorded in docs/PHASE_6_RELEASE_CANDIDATE.md
- [ ] Explicit owner approval obtained before merge or production deployment

**Do not merge or deploy production solely because CI is green.**
