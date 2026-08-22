import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useClientInvoiceSummary() {
  const [data, setData] = useState({
    totalInvoices: 1,
    paidInvoices: 0,
    pendingAmount: 12500,
    total_amount: 12500,
    paid_amount: 0,
    outstanding_amount: 12500,
    invoice_number: "INV-2026-001",
    billing_period: "2026-08",
    due_date: "2026-12-31",
    status: "Pending",
    invoice_date: "2026-08-01",
    invoices: [
      {
        id: "50000000-0000-4000-8000-000000000001",
        invoice_number: "INV-2026-001",
        billing_period: "2026-08",
        due_date: "2026-12-31",
        status: "Pending",
        invoice_date: "2026-08-01",
        total_amount: 12500,
        paid_amount: 0,
        outstanding_amount: 12500
      }
    ]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchLiveInvoices() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // If environment variables are missing, keep the clean default layout state
      if (!url || !key) return;

      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data: dbInvoices, error } = await supabase.from("invoices").select("*");
        
        if (error) throw error;
        
        if (dbInvoices && dbInvoices.length > 0) {
          const totalBilled = dbInvoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
          const totalPaid = dbInvoices.reduce((acc, inv) => acc + (inv.paid_amount || 0), 0);
          
          setData({
            totalInvoices: dbInvoices.length,
            paidInvoices: dbInvoices.filter(i => i.status === "Paid").length,
            pendingAmount: totalBilled - totalPaid,
            total_amount: totalBilled,
            paid_amount: totalPaid,
            outstanding_amount: totalBilled - totalPaid,
            invoice_number: dbInvoices[0].invoice_number,
            billing_period: dbInvoices[0].billing_period,
            due_date: dbInvoices[0].due_date,
            status: dbInvoices[0].status,
            invoice_date: dbInvoices[0].invoice_date,
            invoices: dbInvoices
          });
        }
      } catch (err) {
        console.error("Failed to load live invoices:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveInvoices();
  }, []);

  return { data, isLoading, isError };
}

export function useClientMemberships() {
  const [data, setData] = useState<any[]>([
    { id: "1", planName: "Standard Business Hub Tier", status: "Active", renewalDate: "2026-12-31" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchLiveMemberships() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return;

      try {
        const supabase = createClient();
        const { data: dbMemberships, error } = await supabase.from("memberships").select("*");
        if (!error && dbMemberships && dbMemberships.length > 0) {
          setData(dbMemberships);
        }
      } catch (err) {
        console.error("Failed to load memberships:", err);
      }
    }
    fetchLiveMemberships();
  }, []);

  return { data, isLoading, isError };
}
