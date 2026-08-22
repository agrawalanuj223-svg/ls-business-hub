# L&S Business Hub — Security Design

## Security objective

L&S Business Hub will handle confidential business, financial and client information. Security is enforced as a property of the data layer and server-side service layer, not as a collection of frontend visibility rules.

## Trust boundaries

| Boundary | Untrusted input or actor | Required control |
|---|---|---|
| Browser to application | Users can modify URLs, IDs, payloads and headers | Session verification, Zod validation, authorization before every read/write |
| Application to database | Bugs could request an incorrect tenant | RLS, company-key constraints, parameterized queries, transaction boundaries |
| Application to storage | Guessable paths or leaked URLs | Private bucket, authorization broker, short-lived signed URLs |
| OAuth provider to application | Identity claims and invitation completion | Provider verification, exact invitation email match, explicit membership creation |
| Scheduled job to application | Retries and duplicate execution | Authenticated job endpoint, idempotency keys, append-only audit events |
| Export/download surface | Sensitive aggregated data | Allowlisted DTOs, permission-aware queries, expiring files |

## Authorization rules

The server derives the actor from the authenticated session. A request cannot select an arbitrary company or client organization merely by submitting a different identifier. Internal access requires an active `user_company_roles` row and an action permitted by that role. Client access requires an active `client_company_memberships` row for the target business partner and a client-safe projection or explicit document grant.

RLS must remain enabled on every business table exposed to the application role. Policies should be deny-by-default and use tested helper functions with a fixed `search_path`. Service-role access, where unavoidable for jobs or storage orchestration, is isolated to server-only code and performs an explicit authorization check before operating on user-owned records.

## Storage controls

The business document bucket is private. Accepted initial types are PDF, JPEG and PNG, with a configured maximum size. The server generates a UUID-based path, validates the entity and company, records the file hash, and inserts a document row. The original filename is never used as an object key. Downloads require a current document grant or internal permission and use a short-lived signed URL. Public buckets and permanent links are prohibited for financial documents.

## Financial controls

Payments are created, changed or reversed only through transaction-safe server functions. The function locks the invoice, checks the company relationship, validates positive amount and currency, sums valid payments and rejects a V1 overpayment. Outstanding is computed from invoice total minus valid payment sum. All financial mutations write audit events and cannot be hard-deleted by normal users.

## Secrets and privacy

Secrets must be held in deployment secret storage and represented only by names in `.env.example`. Never expose database credentials, Supabase service-role keys, OAuth secrets or storage credentials to the browser. Logs must exclude access tokens, invitation tokens, signed URLs, document contents and unnecessary personal data. Error responses should be generic while server logs retain a correlation ID and safe diagnostic context.

## Required security tests

| Test family | Required assertion |
|---|---|
| Company isolation | User with Company A access cannot read or mutate Company B records through UI, API, direct lookup or export |
| Client isolation | Client A cannot read Client B invoices, payments, service orders, statements or documents |
| IDOR | Replacing every route or payload UUID with another tenant's UUID returns a generic not-found/forbidden result and causes no side effect |
| Storage | Guessing a path, reusing an expired URL or calling storage directly cannot retrieve unauthorized content |
| Role escalation | Viewer, staff and client roles cannot invoke admin-only mutations |
| Client-to-internal | A client session cannot access internal routes, reports, audit logs, vendors or internal notes |
| Invalid tenant input | A caller-supplied `company_id` inconsistent with membership or target row is rejected |
| Invitations | A token cannot be reused, transferred to another email or redeemed after expiry |
| Financial integrity | Cross-company payment attachment, negative payments, duplicate invoices and V1 overpayments are rejected |
| Job safety | Retrying schedule/reminder jobs does not create duplicate schedules, reminders or notifications |

## Authorization review gate

Before V1 is declared complete, run the complete matrix against a seeded Company A/Company B and Client A/Client B environment. Test both browser behavior and direct HTTP/database/storage access. Review RLS policies, storage policies, service-role usage, secret exposure, audit immutability and backup restoration. A functioning dashboard is not evidence of production readiness.
