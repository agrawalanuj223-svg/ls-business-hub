#!/usr/bin/env bash
set -euo pipefail

cd /workspace
mkdir -p /shared
supabase start
supabase status -o env > /shared/supabase.env
printf 'NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321\n' >> /shared/supabase.env
printf 'SUPABASE_URL=http://host.docker.internal:54321\n' >> /shared/supabase.env
printf 'TEST_BASE_URL=http://host.docker.internal:3000\n' >> /shared/supabase.env
touch /shared/supabase-ready

# Keep the service alive so Compose can manage its lifecycle.
trap 'supabase stop || true; exit 0' TERM INT
while true; do sleep 3600; done
