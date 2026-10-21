# Security Policy

## Reporting a vulnerability

Please do not disclose exploitable details in a public issue. Contact the repository owner privately through GitHub's available private contact/reporting channel and include:
- affected page, workflow, or migration;
- impact and conditions needed to reproduce;
- a minimal reproduction that does not expose real user data;
- any suggested mitigation.

Do not include passwords, access tokens, service-role keys, private user records, or production database exports in a report.

## Project security boundaries

- Client-side role checks are for user experience only. Supabase RLS and trusted database functions must enforce authorisation.
- Never request institute/LDAP passwords.
- Keep the IIT Bhilai tenant in pending status until written institutional authorisation exists.
- Do not apply unvalidated migrations to production. Test migration replay, RLS, Storage, and rollback/restore in a disposable staging project first.
- If an incident is suspected, restrict access using authorised provider controls, preserve minimal relevant logs, and notify the project owner; do not publish user data.
