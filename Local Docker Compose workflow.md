# Local Docker Compose workflow

This setup is for local development and disposable integration testing only. It starts the Supabase CLI-managed local stack, applies the ordered Phase 1 migrations, loads the fictional `DEMO/SAMPLE` seed, starts Next.js, and starts the Phase 4 integration suite after Supabase and Next.js health checks pass.

## Ports

| URL | Service |
|---|---|
| `http://localhost:3000` | Next.js internal/client frontend |
| `http://localhost:54321` | Local Supabase API |
| `http://localhost:54322` | Local PostgreSQL |
| `http://localhost:54323` | Supabase Studio |
| `http://localhost:54324` | Inbucket local email UI |

## Start

From the repository root, run:

```bash
docker compose up --build
```

The `supabase` container runs `supabase start` using `supabase/config.toml`. Supabase discovers and applies files under `supabase/migrations` in order, then runs `supabase/seed/001_demo_seed.sql`. The startup container writes the local API URL and generated local keys to an internal named volume; those values are loaded by the Next.js and test containers. The generated file is not bind-mounted to the host.

The integration test container runs automatically after the Supabase and Next.js health checks pass. Its successful exit means the suite completed; inspect its logs for the test report.

## Reset

To destroy the local database, storage and generated credentials and start from an empty disposable state:

```bash
docker compose down -v
docker compose up --build
```

Do not use `docker compose down -v` against any shared or production environment.

## Important limitations

Docker is not installed in the current sandbox, so the Compose stack has not been executed here. Run it on a machine with Docker Engine, Docker Compose v2 and permission to access the Docker socket. The Supabase CLI image needs access to `/var/run/docker.sock` because it manages the local Supabase child containers.

The integration harness uses the service-role key only for disposable test setup. Application routes and hooks continue to use the authenticated session with the anonymous key. Do not copy the generated local credentials or demo identities into production.
