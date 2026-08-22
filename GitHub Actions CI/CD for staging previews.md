# GitHub Actions CI/CD for staging previews

The workflow at `.github/workflows/staging-preview.yml` runs on pull requests opened against, synchronized with, or reopened on the repository. Its purpose is to make current project updates easy to review online while preserving the staging security boundary. It does not deploy production and it does not imply that a pull request represents a completed release.

## Workflow order

| Job | Runs when | Purpose |
|---|---|---|
| `static-checks` | Every pull request | Installs dependencies, verifies Phase 1 migration/demo-data invariants and builds Next.js |
| `integration-tests` | Same-repository pull requests, after static checks | Runs the live Phase 4 RLS, API and private-storage suite against isolated staging |
| `deploy-preview` | Same-repository pull requests, after both earlier jobs pass | Builds and deploys a Vercel Preview using the Vercel CLI |
| `fork-pr-note` | Fork pull requests | Explains why protected staging secrets are skipped and records the safe behavior in the job summary |

The workflow uses a concurrency group per pull request and cancels superseded runs. This prevents stale preview builds from consuming time after a newer commit is pushed.

## Required GitHub secrets

Configure these repository or environment secrets in GitHub. Use a dedicated `staging` environment for the integration and deployment jobs where practical.

| Secret | Used by | Notes |
|---|---|---|
| `SUPABASE_URL` | Static/build and integration jobs | Dedicated Supabase Cloud staging URL |
| `SUPABASE_ANON_KEY` | Static/build and integration jobs | Public anonymous/publishable key for staging |
| `SUPABASE_SERVICE_ROLE_KEY` | Integration setup only | Staging-only setup/cleanup credential; never placed in application runtime code or browser variables |
| `STAGING_BASE_URL` | Integration job | Stable deployed staging URL used by API integration tests |
| `VERCEL_TOKEN` | Preview deployment | Deployment token with the minimum required Vercel scope |
| `VERCEL_ORG_ID` | Preview deployment | Vercel team/organization ID |
| `VERCEL_PROJECT_ID` | Preview deployment | Staging Vercel project ID |

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Preview environment variables as well. The workflow's `SUPABASE_SERVICE_ROLE_KEY` is only available to the test job and is not passed to the Vercel deployment job.

## Staging prerequisites

The Supabase staging project must already contain the reviewed Phase 1 schema and security migrations, the fictional multi-tenant fixtures, and disposable test identities expected by `tests/integration/phase4.security.test.ts`. The staging URL must point to that same project. The suite must not target production or a database containing real client information.

The Vercel project must be connected to the repository and have Preview environment variables configured. `vercel pull --environment=preview` obtains the project configuration, `vercel build` creates the preview artifact, and `vercel deploy --prebuilt` publishes it. The deployment URL is written to the GitHub Actions job summary for reviewers.

## Security behavior

The workflow grants `contents: read` only. It does not grant pull-request write permissions, so it does not automatically post comments or modify pull requests. Fork pull requests do not receive repository secrets; therefore static checks run, while live integration tests and Vercel deployment are skipped. This prevents untrusted fork code from receiving staging credentials.

The integration suite uses the service-role credential only for disposable identity setup. The subject-under-test routes and RLS operations use authenticated anonymous-key clients, preserving the actual authorization boundary. Do not weaken this by replacing the test client with a service-role client.

## Maintainer checklist

Before enabling the workflow, verify that the staging Supabase project is disposable or independently backed up, that all demo records are fictional and marked `DEMO/SAMPLE`, that private storage has no direct client-upload policy, and that `STAGING_BASE_URL` points to the same deployment context used for the demo. Review the workflow changes like application code because a secret-handling mistake can change the security boundary.
