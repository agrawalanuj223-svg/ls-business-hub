# L&S Business Hub — Vercel and Supabase Cloud Staging Deployment Guide

**Purpose:** Stand up a live, stakeholder-facing staging environment for demonstrating project progress and thoroughly testing the current Phase 1–3 implementation.  
**Status:** Staging enablement guide, not a final production-release runbook.  
**Data policy:** Use fictional `DEMO/SAMPLE` data only. Never introduce real company, client, invoice, payment, identity or document data into this staging environment unless a separate approved data-protection process exists.

## 1. Staging objective

The first online environment should be treated as **L&S Business Hub Staging**, not as a completed product or production system. Its purpose is to let stakeholders review the internal and client portal experiences, verify that seeded multi-tenant records appear correctly, exercise RLS and authorization behavior online, and provide feedback while the application is still under incremental development.

| Environment | Vercel deployment | Supabase project | Data policy | Audience |
|---|---|---|---|---|
| Local | Docker Compose / local Next.js | Local Supabase | Fictional demo data | Engineering |
| Staging | Vercel Preview or dedicated staging project | Dedicated Supabase Cloud staging project | Fictional demo data only | Engineering and stakeholders |
| Production | Future Vercel Production deployment | Future production Supabase project | Approved live data only | Authorized business users |

Do not point a Vercel Preview deployment at a production Supabase project. Do not point stakeholder testing at a database containing live financial records. The staging project should be independently resettable.

## 2. Prerequisites

Create or identify a Git repository containing the current project. The repository should include the ordered migrations in `supabase/migrations`, the fictional seed in `supabase/seed/001_demo_seed.sql`, the Phase 4 tests, the Next.js source tree and `.env.example`. Install the Supabase CLI and Vercel CLI on the deployment workstation, authenticate to both services, and obtain access to the relevant Supabase organization and Vercel team.

Create a new Supabase Cloud project whose name clearly identifies it as staging, for example `l-and-s-business-hub-staging`. Record its project reference ID. Enable a database backup policy suitable for a non-production environment, private Storage, and the required Auth provider configuration. Create a separate Vercel project linked to the repository, with the production branch reserved for a future release and stakeholder builds delivered through Preview or a dedicated custom environment.

## 3. Staging secrets and environment variables

Vercel supports separate environment-variable scopes for Preview, Production, Custom environments and Development. Configure the staging values only in the Preview or named Custom environment, then create a new deployment after changing variables because variable changes do not retroactively alter previous deployments.[1]

| Variable | Vercel staging scope | Browser-visible | Value source |
|---|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview/staging | Yes | Supabase staging project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview/staging | Yes | Supabase staging publishable/anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | None for standard app routes; server-only setup/job scope only | No | Supabase staging secret, if a trusted operation requires it |
| `GOOGLE_OAUTH_CLIENT_ID` | Preview/staging | No | OAuth provider configuration |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Preview/staging | No | OAuth provider configuration |
| `APP_BASE_URL` | Preview/staging | No | Stakeholder-facing Vercel staging URL |
| `EMAIL_PROVIDER_API_KEY` | Optional staging only | No | Test email provider or local capture service |
| `SCHEDULED_JOB_SECRET` | Preview/staging | No | Random staging-only secret |

The normal Phase 2 API routes and client-side hooks must use the authenticated session with the anonymous key so RLS remains active. Do not provide the service-role key to browser code, standard query hooks, ordinary API routes or client portal routes. If a staging seed or cleanup command uses the service-role key, keep it outside the deployed application and rotate it if it is exposed.

## 4. Configure Supabase Auth for staging

In the staging Supabase dashboard, configure Google OAuth with a staging-specific OAuth client or an explicitly approved test configuration. Add the Vercel staging URL and callback route to the Supabase Auth redirect allowlist. The callback must correspond to the application's actual authentication route, for example:

```text
https://<staging-domain>/auth/callback
```

Do not use a production callback URL for staging testing. Create stakeholder test identities using non-production accounts, and keep client test identities mapped only to the fictional seeded organizations. A client user must never be able to select an arbitrary organization during invitation or onboarding.

## 5. Link the Supabase CLI to staging

From the repository root, log in and link the local migration directory to the staging project. Supabase's documented workflow is to link the remote project and then push versioned migrations with `supabase db push`; the CLI also supports `supabase db push --include-seed` when the remote seed should be included.[2]

```bash
supabase login
supabase link --project-ref <STAGING_PROJECT_REF>
supabase db diff --linked
```

Treat the output of `supabase db diff --linked` as a review artifact. An empty or expected diff should be confirmed before pushing. Do not use a destructive reset command against the staging project unless the project is disposable and the reset has been explicitly approved.

## 6. Safely apply Phase 1 schema and RLS

The repository currently contains two ordered Phase 1 migrations:

| Order | File | Purpose |
|---:|---|---|
| 1 | `supabase/migrations/202608220000_phase1_schema.sql` | Types, companies, profiles, memberships, partners, service orders, schedules, invoices, payments, documents, client memberships, reminders and audit logs |
| 2 | `supabase/migrations/202608220001_phase1_security.sql` | Private schema helpers, RLS enablement and policies, client-safe RPCs, audit restrictions and private Storage bucket policies |

Before applying them to Cloud, review the SQL against the current Supabase/PostgreSQL version and take a staging backup or confirm that the project can be recreated. Apply the migrations through the CLI rather than pasting SQL into the dashboard:

```bash
supabase db push
```

After the push, verify in the Supabase dashboard that RLS is enabled on every application table. Confirm that the `business-documents` bucket exists and is private. Confirm that there is no direct browser insert policy for the financial-document bucket and that normal application queries still use the authenticated session. Check that the client-safe RPCs exist and expose only allowlisted fields.

The Phase 1 security migration is intentionally conservative: base table policies are internal-oriented, while client invoice and document metadata access is through allowlisted RPC functions. This prevents client sessions from selecting internal notes, vendors, margins, employee records or audit logs merely because an invoice is visible.

## 7. Apply fictional demo data safely

The seed script is explicitly for disposable development/staging use. It contains two fictional internal companies, four distinct fictional client organizations, synthetic test identities, service orders, invoices and payments. It uses `example.invalid` email addresses, clearly marked demo labels and no uploaded documents or storage objects.

Review the seed file once more before every staging load:

```bash
grep -o "DEMO-CLIENT-[A-Z]*" supabase/seed/001_demo_seed.sql | sort -u
grep -Eic "^[[:space:]]*insert into documents|^[[:space:]]*insert into storage\.objects" supabase/seed/001_demo_seed.sql
```

The first command should show four demo client codes. The second should return zero. If the staging database is disposable and the seed has not already been applied, use:

```bash
supabase db push --include-seed
```

If the migrations were already pushed and only the seed must be reloaded, use an approved disposable reset procedure rather than manually duplicating rows. Never run the fictional seed against a production project. Never upload real invoices, payment proofs, contracts or receipts to staging.

The current seed creates synthetic Auth rows for local-style fixtures. For Supabase Cloud, verify that the target Auth schema accepts the seed approach before applying it. If Cloud-managed Auth prevents direct `auth.users` seed inserts, create disposable test users through the Supabase Auth admin API or dashboard using a setup-only credential, then insert the matching application profile and membership rows. This setup credential must never be used by the application runtime.

## 8. Deploy the Next.js staging application to Vercel

Import the repository into Vercel and select Next.js when prompted. Set the build command and install command according to the repository's package manager. Configure the staging environment variables from Section 3, then deploy a non-production branch or named staging environment. Vercel Preview variables apply to non-production branch deployments, while a custom environment can isolate a longer-lived stakeholder URL.[1]

After deployment, open the generated URL and verify:

| Check | Expected result |
|---|---|
| `/internal` | Internal staff shell loads only for an authenticated internal user |
| `/client` | Client shell shows client-safe information only |
| Internal company list | Fictional demo companies appear according to membership scope |
| Internal service orders | Fictional demo orders appear through the Phase 2 internal hooks |
| Client invoice summary | Only the matching fictional client organization can see its summary |
| Unauthenticated API call | Protected endpoint returns HTTP 401 |
| Unknown/foreign IDs | No cross-tenant rows or documents are returned |
| Demo banner | UI clearly identifies the workspace as DEMO/SAMPLE |

Use a stable staging domain for stakeholder demonstrations if possible. If the Vercel Preview URL changes per branch, update the Supabase Auth redirect allowlist and the staging `APP_BASE_URL` whenever the stakeholder deployment target changes.

## 9. Run the online integration suite

Run the Phase 4 suite against the staging URL and staging Supabase project, not against production. The test harness may use the staging service-role key only to provision disposable test users or clean up test fixtures. The operations being tested must use anonymous-key clients with authenticated sessions so the RLS policies are genuinely exercised.

```bash
export SUPABASE_URL="https://<staging-project-ref>.supabase.co"
export SUPABASE_ANON_KEY="<staging-publishable-or-anon-key>"
export SUPABASE_SERVICE_ROLE_KEY="<staging-setup-only-key>"
export TEST_BASE_URL="https://<staging-domain>"
npm run test:integration
```

The suite should prove that Internal User A cannot access Company B, Client A cannot read Client B's invoice or document, forged `company_id` writes fail, guessed private paths fail, client uploads to the private bucket fail, unauthenticated uploads fail, cross-tenant API responses are empty or denied, and unauthenticated API routes return 401. Record the test run date, commit SHA, staging project reference and result in the stakeholder release note.

## 10. Stakeholder demonstration workflow

Use a short-lived stakeholder test account or a controlled demo identity. Start with the internal portal to show the two fictional companies, partner counts and service orders. Then use the separate client test identity to show the client-safe invoice summary and privacy boundary. Do not demonstrate with a real employee's personal account if a disposable test identity is available.

The demo should explicitly state that the environment is **staging**, the data is fictional, some features are incomplete, and the visible screens do not by themselves establish production readiness. Collect feedback against the current phase rather than promising unreleased integrations such as OCR, WhatsApp, bank reconciliation, GST filing or payment gateways.

## 11. Rollback and reset

Application rollback is performed by promoting a previously known-good Vercel deployment or reverting the branch. Database rollback should not be treated as an automatic reversal of arbitrary SQL migrations. Prefer additive migrations and forward fixes. Before any staging migration that changes data shape, create a backup or confirm that the disposable project can be recreated from the migration history and seed.

For a complete staging reset, create a new Supabase staging project or use a documented destructive reset only after confirming that no stakeholder data needs to be preserved. Re-link the CLI, push migrations, include the fictional seed, configure Auth redirects and redeploy Vercel. Do not reset a shared project casually because stakeholders may have active test sessions.

## 12. Staging readiness checklist

| Area | Ready when |
|---|---|
| Supabase project | Dedicated, clearly named staging project with non-production ownership |
| Migrations | Phase 1 schema and security migration applied through CLI and reviewed |
| RLS | Enabled and verified on every application table |
| Storage | `business-documents` is private and direct browser uploads are not allowed |
| Seed | Two fictional companies, four fictional clients, and no document objects loaded |
| Auth | Google OAuth and callback redirects point only to staging |
| Vercel | Preview/custom environment points only to staging Supabase |
| Tests | Phase 4 integration suite passes against the online staging URL |
| Secrets | Service-role key is setup-only and never exposed to browser/application fetch paths |
| Stakeholder UX | Internal and client portals are visibly distinct and marked DEMO/SAMPLE |
| Release status | Stakeholders understand this is an in-progress staging environment |

## References

[1]: https://vercel.com/docs/environment-variables "Vercel — Environment Variables"  
[2]: https://supabase.com/docs/guides/deployment/database-migrations "Supabase — Database Migrations"
