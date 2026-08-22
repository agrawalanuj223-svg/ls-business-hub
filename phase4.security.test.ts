import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IDS, TEST_USERS, apiRequest, signIn, testAdminClient } from "@/tests/helpers/supabase-test-harness";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const admin = testAdminClient();

async function createDisposableUsers() {
  for (const user of Object.values(TEST_USERS)) {
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = existing.users.find((candidate) => candidate.email === user.email);
    if (!found) {
      const { error } = await admin.auth.admin.createUser({ email: user.email, password: user.password, email_confirm: true });
      if (error) throw error;
    }
  }
}

async function assertNoRows(query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
  const result = await query;
  expect(result.error).toBeNull();
  expect(result.data ?? []).toHaveLength(0);
}

describe("Phase 4 live Supabase RLS isolation", () => {
  beforeAll(async () => {
    await createDisposableUsers();
    // The disposable project must already contain the Phase 4 membership and
    // record fixtures, created by a privileged setup migration/seed.
  });

  it("blocks internal User A from reading Company B through direct table queries", async () => {
    const { client } = await signIn("internalA");
    await assertNoRows(client.from("companies").select("id").eq("id", IDS.companyB));
    await assertNoRows(client.from("invoices").select("id").eq("id", IDS.invoiceB));
    await assertNoRows(client.from("service_orders").select("id").eq("company_id", IDS.companyB));
  });

  it("allows User A to read Company A but rejects a forged company_id write", async () => {
    const { client } = await signIn("internalA");
    const own = await client.from("companies").select("id").eq("id", IDS.companyA);
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);

    const forged = await client.from("business_partners").insert({
      company_id: IDS.companyB,
      partner_code: "PHASE4-ATTACK-PARTNER",
      partner_type: "CLIENT",
      company_name: "PHASE4 ATTACK RECORD",
    });
    expect(forged.data).toBeNull();
    expect(forged.error).not.toBeNull();
  });

  it("blocks Client A from fetching Client B invoice data through the safe RPC", async () => {
    const { client } = await signIn("clientA");
    const { data, error } = await client.rpc("client_invoice_summary", { p_invoice_id: IDS.invoiceB });
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("blocks Client A from direct invoice-table access, including guessed IDs", async () => {
    const { client } = await signIn("clientA");
    await assertNoRows(client.from("invoices").select("*").eq("id", IDS.invoiceB));
    await assertNoRows(client.from("payments").select("*").eq("invoice_id", IDS.invoiceB));
  });

  it("blocks Client A from reading Client B document metadata and guessed storage paths", async () => {
    const { client } = await signIn("clientA");
    const metadata = await client.rpc("client_document_metadata", { p_document_id: "84000000-0000-4000-8000-000000000002" });
    expect(metadata.error).toBeNull();
    expect(metadata.data ?? []).toHaveLength(0);

    const storage = await client.storage.from("business-documents").download(`companies/${IDS.companyB}/invoices/${IDS.invoiceB}/secret.pdf`);
    expect(storage.data).toBeNull();
    expect(storage.error).not.toBeNull();
  });

  it("blocks an authenticated client from uploading to the private bucket", async () => {
    const { client } = await signIn("clientA");
    const upload = await client.storage.from("business-documents").upload(
      `companies/${IDS.companyB}/invoices/${IDS.invoiceB}/client-attack.pdf`,
      new Blob(["PHASE4 TEST ONLY"]),
      { contentType: "application/pdf", upsert: false },
    );
    expect(upload.data).toBeNull();
    expect(upload.error).not.toBeNull();
    expect(upload.error?.message.toLowerCase()).toMatch(/(not authorized|permission|row-level|violat)/);
  });

  it("blocks unauthenticated private-storage upload", async () => {
    const { data, error } = await (await import("@/tests/helpers/supabase-test-harness")).anonClient()
      .storage.from("business-documents").upload("companies/unauthenticated/attack.pdf", new Blob(["PHASE4 TEST ONLY"]), { contentType: "application/pdf" });
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  it("blocks cross-tenant API access and accepts own-scope API reads", async () => {
    const { client } = await signIn("internalA");
    const forbidden = await apiRequest(baseUrl, `/api/internal/partners?company_id=${IDS.companyB}`, client);
    expect(forbidden.status).toBe(200);
    expect(await forbidden.json()).toMatchObject({ data: [] });

    const allowed = await apiRequest(baseUrl, `/api/internal/partners?company_id=${IDS.companyA}`, client);
    expect(allowed.status).toBe(200);
    expect((await allowed.json()).data.length).toBeGreaterThan(0);
  });

  it("rejects unauthenticated API access", async () => {
    const response = await fetch(new URL("/api/internal/companies", baseUrl));
    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    // Cleanup should be implemented in the disposable project only. It must
    // remove test rows and users without touching DEMO/SAMPLE or production data.
  });
});
