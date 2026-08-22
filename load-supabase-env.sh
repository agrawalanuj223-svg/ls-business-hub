#!/usr/bin/env bash
set -euo pipefail
until [ -f /shared/supabase-ready ] && [ -f /shared/supabase.env ]; do sleep 1; done
set -a
source /shared/supabase.env
set +a
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$API_URL}"
export SUPABASE_URL="${SUPABASE_URL:-$API_URL}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-${ANON_KEY:-}}"
export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${ANON_KEY:-}}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SERVICE_ROLE_KEY:-}}"
export TEST_BASE_URL="${TEST_BASE_URL:-http://host.docker.internal:3000}"
