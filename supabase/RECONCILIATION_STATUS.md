# Supabase migration reconciliation status

**Project:** Koinelio (qtokzhydezurbsmkbbjo, ap-south-1)  
**Updated:** 7 November 2026  
**Plan target:** Supabase Free  
**Production migration execution:** Not performed by this commit

## Migration ledger

The live project records seven applied migration versions:

- 20261015184711_koinelio_expand_product_schema
- 20261015184841_koinelio_secure_rls_and_auth_profiles
- 20261015184927_koinelio_security_and_foreign_key_indexes
- 20261015185023_koinelio_private_security_functions
- 20261015211152_koinelio_signup_academic_metadata
- 20261015211348_koinelio_safe_batch_year_validation
- 20261015213710_koinelio_profile_affiliation_hardening

The following seven repository migrations are present but are not recorded as applied in production:

1. 20261016090000_iit_bhilai_access_and_club_governance.sql
2. 20261016100000_profile_avatars_storage.sql
3. 20261016110000_koinelio_campus_tenant_bootstrap.sql
4. 20261016120000_koinelio_feed_media_and_classification.sql
5. 20261016130000_koinelio_profile_directory_category.sql
6. 20261016140000_koinelio_post_reports_and_moderation.sql
7. 20261016160000_koinelio_campus_elections.sql

Seven applied out of fourteen tracked migrations is a migration-history count, not a percentage of product features completed.

## Current production observations

- All 24 inspected public tables have RLS enabled.
- public.platform_admins has no RLS policies. This is currently fail-closed and should not be opened to clients.
- The profile-avatars and campus-post-media bucket rows have been created in the Storage registry. Their intended configuration is public avatars (2 MB, JPEG/PNG/WebP) and private feed media (25 MB, JPEG/PNG/WebP/GIF/MP4/WebM).
- At the time of the audit, there were no policies on storage.objects. The pending Storage migrations define the required owner/domain-scoped policies; bucket rows alone do not enable uploads.
- The IIT Bhilai tenant row and several governance, moderation, profile-category, and election objects are still missing.
- Event registration RLS currently checks that an event is published and in campus scope, but does not enforce start time or capacity at the database boundary.
- Supabase Security Advisor reports leaked-password protection disabled. This must be enabled in the Auth dashboard settings.
- Performance Advisor reports unused indexes. Do not drop them without workload evidence.
- Health Advisor reported no findings.

## Reconciliation blockers

### 1. Bootstrap baseline is not self-contained

The earliest tracked migration creates public.institutions with a foreign key to public.profiles, which is already assumed to exist. The repository does not currently contain a baseline migration that creates the complete pre-existing core schema, policies, functions, triggers, grants, and extensions. A clean local supabase db reset cannot be claimed to work until that baseline is captured and validated.

### 2. Local validation is required

The seven pending migrations depend on existing core tables, private helper functions, Auth triggers, and Storage schemas. They must be replayed against a local Supabase stack and checked with database advisors before production application. Supabase branching is unavailable on the current Free organization plan, so use local Docker + Supabase CLI rather than paid branches or another project.

### 3. Event-registration guard remains a follow-up migration

The existing registration policy does not serialize capacity checks or reject a registration at the database boundary after an event starts. Add this as a separately generated migration using supabase migration new, then validate it locally before applying it anywhere.

## Safe next steps

1. Capture and review the existing database baseline, including Auth-trigger definitions that are not included in a default schema dump.
2. Initialize the Supabase CLI project configuration and link it to the existing project without applying changes.
3. Replay the complete migration history on a local Supabase stack.
4. Fix any dependency/order/SQL errors and run the Supabase security, performance, and health advisors.
5. Test RLS and Storage using separate authenticated accounts, including unauthorized cross-user and cross-tenant attempts.
6. Review a production backup/restore plan and apply the validated migration sequence only after explicit release approval.

This document is a reconciliation record, not evidence that the seven pending migrations have been applied or that production database behavior has passed end-to-end tests.
