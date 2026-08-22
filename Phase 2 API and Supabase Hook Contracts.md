# Phase 2 API and Supabase Hook Contracts

## Session and RLS boundary

Every internal route calls `requireSession()`, which creates a Supabase server client using the request's authenticated cookies and the publishable/anonymous key. Every client hook creates a browser Supabase client using the same public credentials. Standard reads and writes therefore execute with the actor's session and remain subject to PostgreSQL RLS.

The service-role key is intentionally absent from the Phase 2 route and hook modules. It must not be added to standard fetching, list operations, CRUD operations or client portal queries. If a future trusted job needs service-role access, it must be isolated in a server-only job module with explicit authorization, idempotency and audit logging.

## Routes

| Route | Methods | Audience | Data boundary |
|---|---|---|---|
| `/api/internal/companies` | `GET`, `POST` | Internal | Company membership and group-admin RLS |
| `/api/internal/partners` | `GET`, `POST` | Internal | Company membership and role RLS |
| `/api/internal/service-orders` | `GET`, `POST` | Internal | Company membership and role RLS |
| `/api/client/companies` | `GET` | Client | Authenticated user's own client memberships only |

The `company_id` query parameter is treated as a filter, not as authorization. RLS decides whether rows are visible. `created_by` on service orders is derived from the authenticated user rather than accepted from the request body.

## Hooks

`src/hooks/internal/useInternalBusinessData.ts` contains internal staff hooks for companies, business partners and service orders. `src/hooks/client/useClientBusinessData.ts` contains client hooks for client memberships, client-safe invoice summaries and client document metadata. The client hooks do not select internal invoice tables or internal business-partner fields; they call the allowlisted RPC functions created in the Phase 1 security migration.

## Required application dependencies

The eventual Next.js application must install and configure `@supabase/ssr`, `@supabase/supabase-js`, `@tanstack/react-query`, `zod` and their TypeScript tooling. The source files assume the `@/*` path alias maps to `src/*`.

## Remaining implementation work

Before production use, add authenticated mutation hooks for any UI forms, complete detail/update routes, implement explicit staff permission policy refinements, add route-handler and browser tests, generate database types from the deployed schema, and execute the RLS test suite against a disposable Supabase project. No endpoint should be considered production-ready solely because it returns data for an authorized session.
