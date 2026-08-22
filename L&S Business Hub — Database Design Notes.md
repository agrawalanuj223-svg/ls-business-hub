# L&S Business Hub — Database Design Notes

## Sources of truth

PostgreSQL is the source of truth for business metadata, company memberships, financial records, document metadata, explicit client-sharing grants, reminders and audit events. Supabase Storage is the source of truth for file bytes. A storage object without a corresponding `documents` row is an orphan and must be removed or reconciled; a document row without a valid object is an operational error.

## RLS policy pattern

The production migration must enable RLS on every application table and define deny-by-default policies. The recommended helper functions are:

```sql
has_active_company_membership(target_company uuid, allowed_roles internal_role[])
is_group_admin()
is_active_client_member(target_partner uuid)
can_view_document(target_document uuid, requested_level document_access_level)
```

Each helper must be `SECURITY DEFINER`, owned by a non-login role, use a fixed safe `search_path`, and avoid dynamic SQL. The functions should inspect `auth.uid()` and active membership rows. Client policies must never grant access through an internal membership.

Example policy intent, to be implemented and tested in a migration:

```sql
-- Internal rows are visible only inside an active company membership.
create policy company_read on invoices
for select to authenticated
using (has_active_company_membership(company_id, array['GROUP_ADMIN','COMPANY_ADMIN','FINANCE','STAFF','VIEWER']::internal_role[]));

-- Client rows should be exposed through client-safe views or functions rather
-- than unrestricted table selects. Any direct client policy must additionally
-- require is_active_client_member(business_partner_id).
```

## Integrity constraints

The schema uses UUID keys, foreign keys, scoped uniqueness, positive monetary checks, lifecycle enums, and composite company-parent foreign keys. Composite references are intentional: they prevent a caller from combining a Company A child key with a Company B parent key. Application transactions must add the invariants that SQL checks cannot safely derive, especially payment totals and status transitions.

## Derived financial values

Do not store a manually editable outstanding amount. Use an authorized view or service query that calculates:

```text
outstanding = invoices.total_amount - sum(valid payments.amount)
```

The view must exclude cancelled/voided payment records if such a lifecycle is added. Paid, partially paid and overdue statuses should be maintained by a transaction-safe service function or derived report logic, with one clearly documented source of truth.

## Index strategy

Indexes cover active memberships by user and company, partner search by company and normalized name, service orders by partner/status, invoice due dates and status, invoice history by partner, schedule queue dates, payments by invoice, document entity lookups and hashes, client memberships, invitation expiry, reminder queue status/date and audit history by company/time. New indexes should be added only after query plans or a demonstrated access path justify them.

## Migration rules

Migrations are immutable, ordered and reviewed. Prefer additive changes and compatibility windows. Avoid destructive changes in the same release as application code that still depends on the old shape. Every RLS, storage-policy or financial-function change requires a corresponding authorization or financial-integrity test.

## Seed and isolation fixture

The test seed must create:

| Fixture | Expected result |
|---|---|
| Company A and Company B | Both exist with separate records |
| Invoice A and Invoice B | Each belongs to its own company |
| User A with Company A only | Cannot read or mutate Company B data |
| Client A and Client B | Separate client memberships |
| Shared document for Client A | Client B cannot see it even if the URL/path is guessed |
| Payment A and Payment B | Cross-company attachment is rejected |

Run the fixture through RLS-aware database tests, route-handler tests and browser tests. Direct ID lookup and storage access must be included, not only navigation tests.
