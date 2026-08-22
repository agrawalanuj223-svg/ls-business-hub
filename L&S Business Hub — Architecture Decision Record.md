# L&S Business Hub — Architecture Decision Record

**Status:** Proposed first deliverable  
**Author:** Manus AI  
**Scope:** Phase 1 foundation for a multi-company internal business portal and isolated external client portal  
**Primary principle:** Correctness and authorization take precedence over speed or visual polish.

## 1. Executive decision

L&S Business Hub will be implemented as a single secure application with two separately routed experiences: an **Internal Business Portal** and a **Client Portal**. Both experiences share a PostgreSQL database and private object storage, but they do not share authorization assumptions. Every server request will establish an authenticated actor, derive the permitted company or client-organization scope from database memberships, and query only through authorization-aware service functions.

The recommended stack is **Next.js with TypeScript**, Tailwind CSS and shadcn/ui, **Supabase Auth** with Google OAuth for internal users, Supabase PostgreSQL with Row Level Security, and private Supabase Storage buckets accessed only through short-lived signed URLs. Zod schemas will validate all API inputs. Financial mutations will execute transactionally in server-side service functions.

The product will use a normalized relational model. `company_id` is mandatory on company-owned records. Client visibility is not inferred from a document's parent invoice or storage path; it is an explicit `document_access` grant. Internal and client roles are separate, and client identities must have an explicit membership to a client-type business partner.

## 2. Scope and assumptions

The initial release covers companies, business partners, service orders, recurring billing schedules, invoices, payments, receivables, private documents, reminders, audit logs, client invitations, client-safe views, reports and exports. It does not include OCR, WhatsApp, bank integrations, automatic reconciliation, Tally, GST filing, payment gateways, payroll, inventory, a mobile app, expense management or a general accounting ledger.

The following assumptions resolve ambiguities safely:

| Area | Decision | Reason |
|---|---|---|
| Identity | Supabase `auth.users` is the identity source; application profile rows reference it. | Passwords and provider credentials must not be duplicated in application tables. |
| Client organization | A client organization is represented by a `business_partners` row with `partner_type` `CLIENT` or `BOTH`. | Avoids a second organization master and preserves the requested partner model. |
| `client_users` | Implement as a client-account/profile extension or compatibility view, not an independent identity source. | Prevents duplicate user identities and conflicting memberships. |
| Company context | A request has an explicit selected company context; `ALL_COMPANIES` is a privileged reporting scope only. | Prevents accidental cross-company reads and ambiguous writes. |
| Money | Store monetary values as PostgreSQL `numeric(19,4)` with currency code. | Avoids floating-point errors and supports future currencies. |
| Overpayments | V1 rejects a payment if it would exceed the invoice total, unless a later credit-allocation model is approved. | A payment cannot silently create an untracked credit balance. |
| Deletion | Financial and audit records are never hard-deleted through the application. | Preserves traceability and recovery. |
| Notifications | Email and in-app notifications only in V1. | WhatsApp is explicitly out of scope. |
| Statements | Generated from authorized invoices and payments, using a server-side PDF renderer. | Ensures client-safe output and consistent balances. |

## 3. System architecture

```text
Browser
  | HTTPS, secure cookies, CSP
  v
Next.js application on Vercel
  |-- route handlers / server actions
  |-- authorization-aware service layer
  |-- Zod validation
  |-- report and statement renderers
  |-- signed URL broker
  v
Supabase Auth ---- PostgreSQL + RLS ---- Supabase private Storage
  |                    |                         |
  |                    |                         +-- company-scoped objects
  |                    +-- business metadata, memberships, audit trail
  +-- Google OAuth / invitation completion

Scheduled execution
  -> idempotent billing/reminder jobs
  -> database transaction and audit event
  -> email provider / in-app notification
```

The browser never receives a service-role key, database credential, storage credential or unrestricted object URL. The application server may use privileged capabilities only inside narrowly scoped, audited operations; normal data access should run with the user's authenticated Supabase session so that PostgreSQL RLS remains a second enforcement layer.

## 4. Technology stack

| Concern | Choice | Boundary |
|---|---|---|
| UI | Next.js App Router, TypeScript, Tailwind, shadcn/ui | Desktop-first responsive B2B interface |
| Server | Next.js route handlers/server actions plus `services/` layer | No direct database writes from UI components |
| Database | Supabase PostgreSQL | RLS, constraints, indexes, transactions |
| Authentication | Supabase Auth, Google OAuth | No local passwords in V1 |
| Validation | Zod | Parse at every external boundary |
| Storage | Supabase Storage private bucket | Signed URLs generated only after authorization |
| Charts | Recharts | Authorized report data only |
| Jobs | Supabase scheduled invocation or Vercel-compatible scheduled endpoint | Idempotent and auditable |
| Deployment | Vercel application, Supabase data services | Separate preview and production environments |
| Testing | Vitest, Playwright, SQL/RLS integration tests | Security tests are release gates |

No additional microservice, queue, cache or event bus is required for V1. If volume or job reliability later requires one, it should be introduced behind the service layer rather than coupled to UI code.

## 5. Database architecture

The database is the source of truth for business metadata, financial records, memberships, authorization grants and audit events. PostgreSQL constraints enforce relationships and basic invariants; server-side transactions enforce multi-row financial invariants. Derived values such as paid and outstanding balances are computed from valid payments rather than stored as manually editable amounts.

All primary keys are UUIDs. All mutable business tables contain `created_at` and `updated_at`; records that require lifecycle retention use status values and, where useful, `archived_at`. Company ownership is duplicated on child records deliberately so RLS can enforce tenant scope without relying on joins through mutable parent records. Triggers or service-layer checks must guarantee that duplicated ownership keys agree.

The core relationships are:

```text
companies
  ├── user_company_roles ── profiles/auth.users
  ├── business_partners
  │     ├── service_orders ── billing_schedules ── invoices ── payments
  │     └── client_company_memberships ── client identities
  ├── documents ── document_access ── client business partner
  ├── reminders
  └── audit_logs
```

The normalized schema is delivered separately in `database/schema.sql`, with supporting tables for invitations, notification preferences, report-safe views and job idempotency where required.

## 6. Authentication architecture

Internal users authenticate through Google OAuth using Supabase Auth. The `profiles.id` value equals `auth.users.id`. Application profile data contains display name, email, avatar and status but never a password. New internal identities do not receive business access until a group administrator or authorized company administrator creates an active `user_company_roles` row.

Client users authenticate through the same identity provider and complete an invitation flow. An invitation is created for one specific client organization and role, expires, and can be redeemed only by the authenticated email address for which it was issued. A client user cannot select or change their organization during onboarding. The redeem operation creates or activates the explicit client membership in one transaction and writes an audit event.

Authentication answers **who the actor is**. It does not answer what the actor may access; that decision is made by memberships, role permissions, document grants and RLS.

## 7. Authorization architecture

Authorization is enforced in four layers:

1. **Route boundary:** protected layouts and handlers reject missing or invalid sessions and distinguish internal from client routes.
2. **Service layer:** every operation invokes a permission check using the authenticated actor, selected company context, target record and action.
3. **Database RLS:** policies restrict rows to active internal company memberships or active client memberships and explicit document grants.
4. **Storage broker and policies:** object access is granted only after the corresponding document row and access policy authorize it; storage paths are not treated as permissions.

Frontend conditionals are solely presentational. They may improve UX but are never security controls. APIs must not trust a caller-supplied `company_id`; the server derives or validates it against the actor's active membership and the target record. When an unauthorized record exists, the preferred external response is a generic not-found result to reduce enumeration.

### Internal roles

| Role | Scope | Primary capabilities |
|---|---|---|
| `GROUP_ADMIN` | Group or explicitly authorized companies | Manage companies, users, permissions and consolidated reporting |
| `COMPANY_ADMIN` | Assigned companies | Manage company records and authorized staff permissions |
| `FINANCE` | Assigned companies | Invoices, payments, receivables and reports |
| `STAFF` | Assigned companies | Service orders, schedules, documents and granted operational records |
| `VIEWER` | Assigned companies | Read-only access to permitted internal data |

### Client roles

| Role | Scope | Primary capabilities |
|---|---|---|
| `CLIENT_ADMIN` | One client organization | View authorized client-safe information and manage invited client users if enabled |
| `CLIENT_USER` | One client organization | View authorized client-safe information and shared documents |
| `CLIENT_VIEWER` | One client organization | Read-only client-safe access |

A role is not enough by itself: company membership status, client organization membership status, record status and document grant status must also be active.

## 8. Multi-company isolation and RLS

Every internal query is scoped by an active row in `user_company_roles`, except group-level operations explicitly permitted to use a controlled all-company report function. Client queries are scoped by `client_company_memberships` joined to a `business_partners` row whose type is `CLIENT` or `BOTH`. Client policies never use internal role membership as a fallback.

RLS policies should call small `SECURITY DEFINER` helper functions owned by a non-login database owner, such as `has_company_role(company_id, allowed_roles[])`, `is_client_member(partner_id)`, and `can_view_document(document_id, access_level)`. These helpers must set a safe search path, avoid dynamic SQL, and be covered by integration tests. Direct table grants to the browser role are limited to what is necessary; privileged writes occur through controlled server operations.

Cross-tenant integrity is enforced by composite foreign keys or deferred constraint triggers where a child contains both `company_id` and a parent ID. For example, `payments(company_id, invoice_id)` must reference the matching company-owned invoice key, preventing Company A payment records from being attached to Company B invoices.

The critical test fixture creates Company A and Company B, records in each, and User A with only Company A membership. The same fixture creates Client A and Client B and verifies isolation through UI navigation, direct record lookup, route handlers, manipulated IDs, guessed storage paths and download attempts.

## 9. Storage and document access

All financial and business files are stored in a private bucket such as `business-documents`. Object paths are generated by the server using UUIDs and validated entity context, for example `companies/{company_id}/invoices/{invoice_id}/{document_id}.bin`. Original filenames are metadata only and are never used as authorization keys.

Upload flow: authorize the target company and entity, validate MIME type and extension, enforce a size limit, generate a safe object key, stream the file to private storage, calculate a SHA-256 hash where practical, insert the document row transactionally, and write an audit event. If metadata insertion fails, the orphan object is deleted by a compensating operation or reconciliation job.

Download flow: authorize the document row and requested access level, create a short-lived signed URL or stream through the server, and record the access where practical. A document linked to an invoice is not automatically client-visible. An internal user must create an active `document_access` row for the specific client business partner, with `VIEW` or `DOWNLOAD` and optional expiry. Client-safe application views expose allowlisted fields rather than serialized internal records.

## 10. Financial integrity

Invoice totals are validated from subtotal, tax and any explicitly supported adjustments. Payment creation locks the invoice row, validates currency and amount, verifies company ownership, rejects zero/negative values and rejects an overpayment in V1. The transaction inserts the payment, recalculates the valid payment sum, updates the invoice lifecycle status, writes an audit log and commits atomically. A payment update or reversal follows the same path and is never a silent direct edit.

Outstanding is defined as `invoice.total_amount - sum(valid payments)`. Aging uses due date and the computed outstanding amount; paid invoices are excluded from outstanding buckets. Amounts are displayed in INR using Indian numbering conventions in the UI and exports.

## 11. Billing schedules and reminders

A scheduled job creates missing billing schedule rows using a uniqueness key such as `(service_order_id, billing_period)`. The job is safe to retry. A second job transitions schedules and invoices based on dates and creates at most one reminder per logical event using an idempotency key. Reminder delivery records sent status, recipient, failure reason and timestamps. V1 supports email and in-app notifications only.

Reminder creation and sending are auditable. Time zones are stored explicitly or normalized to the configured company time zone, with dates rendered in Indian-friendly format.

## 12. Audit logging

Audit logs are append-only from the application's perspective. Important events include invitations, membership and permission changes, partner/order/invoice/payment mutations, document upload/share/access, reminder creation/sending and destructive lifecycle changes. The actor type is `INTERNAL_USER`, `CLIENT_USER` or `SYSTEM`; metadata contains structured, non-secret context and must not contain credentials or file contents.

Normal users cannot update or delete audit rows. Database privileges and a restrictive policy must prevent application clients from mutating them. Retention, export and access to audit logs are themselves permission-controlled.

## 13. Threat model

| Threat | Control | Verification |
|---|---|---|
| IDOR or URL manipulation | Target-record authorization plus RLS; generic not-found response | Playwright and API tests with foreign UUIDs |
| Cross-company leakage | Membership-derived scope, company-key constraints and RLS | Company A/B fixture tests |
| Cross-client leakage | Explicit client membership and document grants | Client A/B fixture tests |
| Storage path guessing | Private bucket, random IDs, broker authorization, short TTL URLs | Direct storage access tests |
| Role escalation | Server-side role checks; admin mutations audited | Negative permission matrix |
| Malicious upload | MIME/extension/size/hash validation and safe names | Upload fuzz and policy tests |
| CSRF/session theft | Secure HttpOnly cookies, origin checks and CSRF protection where applicable | Browser security tests |
| Injection/XSS | Parameterized queries, Zod, output escaping, CSP | SAST and integration tests |
| Data loss | Automated database and storage backups, restore drills | Scheduled restore test |
| Duplicate jobs | Unique keys and idempotent transactions | Retry tests |
| Sensitive error disclosure | Sanitized errors and server-side logging | Error-response tests |

## 14. Backup, recovery and deployment

Supabase PostgreSQL backups and point-in-time recovery should be enabled according to the production plan, and private object storage must have an independent backup or replication strategy. Metadata and objects are a pair: a restore runbook must cover both, including orphan detection and hash verification. Restore testing is required before production use and periodically thereafter.

Vercel preview and production environments use separate Supabase projects or clearly isolated environments. Secrets are configured in deployment settings and documented only by names in `.env.example`; they are never committed. Production deployment requires migrations, RLS policy review, smoke tests, authorization tests and rollback readiness.

## 15. Testing and release gates

The release is not production-ready when only the UI works. Automated coverage must include authentication, every role boundary, RLS, company and client isolation, invoice and payment calculations, partial/full/overpayment behavior, document upload and sharing, billing schedule idempotency, reminders, reports, exports and signed downloads. Security review specifically covers IDOR, direct API calls, invalid `company_id`, role escalation, client-to-internal access and storage guessing.

Each implementation phase ends with tests, error inspection, documentation updates and an authorization review. Phase 1 cannot be considered complete until the database schema, RLS policies, storage policies and isolation fixtures pass together in an environment representative of production.

## 16. Future scalability

The service layer allows later OCR, bank reconciliation, integrations and richer accounting without exposing database details to the UI. Future additions should use append-only integration events or job tables, versioned APIs and explicit data ownership. If reporting load becomes significant, authorized materialized views or a reporting replica may be introduced; no denormalized financial balance should become a second source of truth.

## 17. Known limitations

V1 does not provide a full accounting ledger, payment gateway, automated reconciliation, GST filing, WhatsApp delivery, OCR or mobile clients. Supabase Storage signed URLs are time-limited rather than permanent shares. Fine-grained per-record operational permissions beyond the required roles may require an additional permission-grant model after real workflows are validated.

## 18. Phase plan

| Phase | Deliverables | Exit criteria |
|---|---|---|
| 1 | Schema, auth, roles, RLS, storage, isolation fixtures | Cross-company/client negative tests pass |
| 2 | Companies, partners, service orders | CRUD is scoped and audited |
| 3 | Schedules, invoices, payments, receivables | Transactional calculations and retry tests pass |
| 4 | Documents, reminders, audit logs | Private upload/share/download flow passes |
| 5 | Client portal, invitations, statements | Client-safe allowlists and isolation pass |
| 6 | Reports and exports | Permission-aware report tests pass |
| 7 | UX refinement, hardening, deployment and restore drill | Production-readiness checklist is signed off |
