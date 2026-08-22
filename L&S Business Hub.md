# L&S Business Hub

L&S Business Hub is a secure multi-company business management platform for **LIFT & SHIFT and its sister companies**. It will manage business partners, service orders, recurring billing, invoices, payments, receivables, private documents, reminders, reports and an isolated external client portal.

> The first deliverable is the system foundation, not a large dashboard. Authorization, tenant isolation, private storage and financial integrity must be verified before real business data is introduced.

## First deliverable

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | System decisions, tenancy, authentication, authorization, storage, threat model and phased plan |
| `database/schema.sql` | Normalized PostgreSQL schema baseline |
| `SECURITY.md` | Threat model and required security tests |
| `DEPLOYMENT.md` | Environment, deployment, backup and recovery guidance |
| `.env.example` | Variable names only; no secrets |
| `docs/ERD.mmd` | Entity relationship diagram source |

## Planned technology

The planned implementation uses Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth with Google OAuth, PostgreSQL with Row Level Security, private Supabase Storage, Zod and Recharts. The application is expected to deploy on Vercel with Supabase providing database, authentication and storage services.

## Local setup after application scaffolding

Install Node.js dependencies with the repository's package manager, copy `.env.example` to `.env.local`, configure a development Supabase project, apply reviewed migrations and configure Google OAuth redirect URLs. Do not place service-role keys or OAuth secrets in client-side variables.

The local workflow should be:

1. Start the development server.
2. Apply database migrations to the development project.
3. Seed Company A/B and Client A/B security fixtures.
4. Run unit, integration, RLS and browser authorization tests.
5. Inspect failures before implementing the next product phase.

## Implementation phases

Phase 1 establishes schema, authentication, roles, RLS, private storage policies and isolation tests. Phase 2 adds companies, business partners and service orders. Phase 3 adds billing schedules, invoices, payments and computed receivables. Phase 4 adds documents, reminders and audit logs. Phase 5 adds the client portal, invitations and statements. Phase 6 adds reports and exports. Phase 7 completes UI refinement, security hardening, deployment and restore testing.

## Important boundaries

V1 does not include OCR, WhatsApp, bank APIs, automatic reconciliation, Tally, GST filing, a payment gateway, an AI chatbot, a mobile application, payroll, inventory, expense management or a complex accounting ledger. These may be considered later without weakening the V1 security model.

## Production readiness

Do not claim production readiness because screens render successfully. Before release, verify authentication, server-side authorization, RLS, company isolation, client isolation, private storage, signed downloads, transactional payments, document associations, audit immutability, backups, secret protection, error handling and the complete negative authorization test suite described in `SECURITY.md`.
