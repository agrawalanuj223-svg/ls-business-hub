import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const TEST_USERS = {
  internalA: { email: "phase4.internal.a@example.invalid", password: "Phase4-Internal-A-Only!" },
  internalB: { email: "phase4.internal.b@example.invalid", password: "Phase4-Internal-B-Only!" },
  clientA: { email: "phase4.client.a@example.invalid", password: "Phase4-Client-A-Only!" },
  clientB: { email: "phase4.client.b@example.invalid", password: "Phase4-Client-B-Only!" },
} as const;

export const IDS = {
  companyA: "81000000-0000-4000-8000-000000000001",
  companyB: "81000000-0000-4000-8000-000000000002",
  clientA: "82000000-0000-4000-8000-000000000001",
  clientB: "82000000-0000-4000-8000-000000000002",
  invoiceA: "83000000-0000-4000-8000-000000000001",
  invoiceB: "83000000-0000-4000-8000-000000000002",
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing integration-test environment variable: ${name}`);
  return value;
}

export function anonClient(): SupabaseClient {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Setup/cleanup only. Never pass this client to route or policy code under test. */
export function testAdminClient(): SupabaseClient {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function signIn(user: keyof typeof TEST_USERS) {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword(TEST_USERS[user]);
  if (error || !data.user) throw error ?? new Error(`Unable to sign in test user ${user}`);
  return { client, user: data.user };
}

export async function apiRequest(baseUrl: string, path: string, client: SupabaseClient, init: RequestInit = {}) {
  const { data } = await client.auth.getSession();
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (data.session?.access_token) headers.set("authorization", `Bearer ${data.session.access_token}`);
  return fetch(new URL(path, baseUrl), { ...init, headers });
}
