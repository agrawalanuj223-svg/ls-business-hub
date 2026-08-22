"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function useInternalCompanies() {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["internal", "companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, company_code, legal_name, display_name, status, city, state, email, phone, created_at, updated_at")
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });
}

export function useInternalPartners(companyId?: string) {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["internal", "business-partners", companyId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("business_partners")
        .select("id, company_id, partner_code, partner_type, company_name, contact_person, email, phone, payment_terms_days, status, created_at, updated_at")
        .order("company_name");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInternalServiceOrders(companyId?: string) {
  const supabase = createBrowserSupabase();
  return useQuery({
    queryKey: ["internal", "service-orders", companyId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("service_orders")
        .select("id, company_id, business_partner_id, order_number, service_description, start_date, end_date, contract_value, billing_frequency, billing_day, payment_terms_days, status, notes, created_by, created_at, updated_at")
        .order("start_date", { ascending: false });
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
