import { useState, useEffect } from "react";

export function useClientInvoiceSummary() {
  const [data, setData] = useState({ totalInvoices: 0, paidInvoices: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock client invoice summary data for staging preview
    setData({ totalInvoices: 5, paidInvoices: 4, pendingAmount: 12500 });
  }, []);

  return { data, loading, error };
}

export function useClientMemberships() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock client memberships data for staging preview
    setData([
      { id: "1", planName: "Standard Business Hub Tier", status: "Active", renewalDate: "2026-12-31" }
    ]);
  }, []);

  return { data, loading, error };
}
