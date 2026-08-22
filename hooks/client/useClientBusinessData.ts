import { useState, useEffect } from "react";

export function useClientInvoiceSummary() {
  const [data, setData] = useState({
    totalInvoices: 1,
    paidInvoices: 0,
    pendingAmount: 12500,
    invoices: [
      {
        id: "50000000-0000-4000-8000-000000000001",
        invoice_number: "INV-2026-001",
        due_date: "2026-12-31",
        status: "Pending",
        invoice_date: "2026-08-01",
        total_amount: 12500,
        paid_amount: 0,
        outstanding_amount: 12500
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { data, loading, error };
}

export function useClientMemberships() {
  const [data, setData] = useState<any[]>([
    { id: "1", planName: "Standard Business Hub Tier", status: "Active", renewalDate: "2026-12-31" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return { data, loading, error };
}
