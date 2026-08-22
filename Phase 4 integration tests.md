# Phase 4 integration tests

These tests must run only against a disposable Supabase/PostgreSQL project. They create synthetic test identities using `example.invalid` email addresses and use the service-role key only inside the setup harness to provision or clean up test fixtures. The route, RLS and storage operations under test use authenticated clients initialized with the public anonymous key and their own user sessions.

## Required environment

```text
SUPABASE_URL=https://your-disposable-project.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # setup/cleanup only; never application runtime
TEST_BASE_URL=http://localhost:3000
```

Apply the Phase 1 schema and security migrations, then create the Phase 4 fixture rows with two companies, two isolated internal memberships, two client organizations, two isolated client memberships, two invoices and one document metadata row. Do not point the suite at production or at the general DEMO/SAMPLE environment.

Install the project's Vitest and Supabase client dependencies, start the Next.js application, and run the suite with the integration environment loaded. The tests cover direct RLS queries, safe client RPCs, forged `company_id` writes, API requests with bearer sessions, unauthenticated API calls, guessed document paths, unauthorized client uploads and unauthenticated uploads.

The expected denial behavior differs by surface: RLS reads generally return zero rows, RLS writes return a non-null authorization error, private storage returns a non-null storage error, and protected API routes return HTTP 401 for missing sessions. A full run against a live disposable environment is a release gate; static checks alone are insufficient.
