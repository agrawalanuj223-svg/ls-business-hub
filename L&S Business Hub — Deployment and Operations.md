# L&S Business Hub — Deployment and Operations

## Environments

Maintain separate development, preview and production environments. Production should use a dedicated Supabase project or an equally strong isolation boundary. Database migrations are versioned and reviewed; production schema changes are never made manually through an ad-hoc dashboard edit.

## Required configuration

Use `.env.example` as the canonical variable-name reference. Store actual values in Vercel/Supabase secret configuration. Public browser variables may include only the Supabase URL and publishable/anonymous key. The service-role key, OAuth secret and any storage administration credential are server-only.

## Deployment sequence

1. Run type checks, linting, unit tests, RLS integration tests and build validation.
2. Apply the reviewed database migration to a non-production environment.
3. Run seed fixtures for Company A/B and Client A/B and execute the negative authorization suite.
4. Verify private storage policies, signed-download expiry and document upload validation.
5. Run report, export, reminder and payment transaction tests.
6. Deploy the application to a preview environment and perform smoke tests.
7. Apply the migration to production using the approved migration process.
8. Deploy the application and verify authentication, company switching, a read-only report and a controlled document download.
9. Monitor errors, job failures, storage failures and authorization-denial anomalies.

## Backups and recovery

Database backups and point-in-time recovery must be enabled according to the selected Supabase production plan. Uploaded documents require storage backup or replication independent of the application server. The recovery runbook must restore both metadata and objects, then validate object hashes, document references and absence of orphaned files.

Perform restore drills before production use and periodically thereafter. Record recovery time and recovery point results. A backup that has never been restored is not a verified recovery plan.

## Scheduled jobs

Billing schedule and reminder jobs must be authenticated, bounded and idempotent. Each logical schedule or reminder uses a uniqueness/idempotency key. A retry may re-read and update a pending record but must not create a second schedule, send a second notification for the same event or duplicate an audit event without an explicit retry marker.

## Observability

Use structured server logs with request correlation IDs. Monitor failed authentication, authorization denials, storage failures, payment transaction failures, job backlog, reminder delivery errors and database errors. Logs must not contain secrets, document contents, access tokens or signed URLs. Alerting thresholds should be set before live business data is introduced.

## Rollback

Application releases must be reversible. Database migrations should prefer additive changes, backfills and compatibility windows. Destructive schema changes require a separate approved migration after dependent application code is removed and a tested backup exists.
