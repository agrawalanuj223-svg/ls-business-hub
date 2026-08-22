"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function useClientMemberships() {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["client", "memberships"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Unauthenticated");
      const { data, error } = await supabase
        .from("client_company_memberships")
        .select("id, business_partner_id, role, status, created_at, updated_at")
        .eq("user_id", userData.user.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useClientInvoiceSummary(invoiceId?: string) {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["client", "invoice-summary", invoiceId],
    enabled: Boolean(invoiceId),
    queryFn: async () => {
      if (!invoiceId) throw new Error("Invoice ID is required");
      const { data, error } = await supabase.rpc("client_invoice_summary", { p_invoice_id: invoiceId });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useClientDocumentMetadata(documentId?: string) {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["client", "document-metadata", documentId],
    enabled: Boolean(documentId),
    queryFn: async () => {
      if (!documentId) throw new Error("Document ID is required");
      const { data, error } = await supabase.rpc("client_document_metadata", { p_document_id: documentId });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}
