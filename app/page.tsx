"use client";

import { useClientInvoiceSummary, useClientMemberships } from "@/hooks/client/useClientBusinessData";

export default function ClientPortalPage() {
  const { data: invoiceData } = useClientInvoiceSummary();
  const { data: membershipData } = useClientMemberships();

  // Calculations for accurate totals
  const totalBilled = invoiceData.invoices?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;
  const totalPaid = invoiceData.invoices?.reduce((acc, inv) => acc + (inv.paid_amount || 0), 0) || 0;
  const totalOutstanding = totalBilled - totalPaid;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 bg-[#FFD233] text-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-7 bg-red-600 rounded-xs"></div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase italic">Lift & Shift</h1>
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Business Hub</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-lg font-semibold border-l-4 border-[#FFD233]">
            Dashboard Overview
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-lg">
            Invoices & Billing
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-lg">
            Memberships & Access
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-lg">
            Account Settings
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Workspace</p>
          <p className="text-slate-200 font-medium mt-0.5">Demo Client Alpha</p>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-18 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Client Portal Overview</h2>
            <p className="text-xs text-slate-500">Secure organization workspace and active financial records.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Verified Client</p>
              <p className="text-[11px] text-emerald-600 font-medium">Secure Connection Active</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-[#FFD233] font-black text-sm flex items-center justify-center border border-slate-700 shadow-xs">
              LS
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed</p>
              <p className="text-2xl font-black text-slate-900 mt-2">₹{totalBilled.toLocaleString()}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Aggregated period invoices</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid</p>
              <p className="text-2xl font-black text-slate-900 mt-2">₹{totalPaid.toLocaleString()}</p>
              <p className="mt-2 text-xs font-medium text-emerald-600">Cleared payments</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-black text-red-600 mt-2">₹{totalOutstanding.toLocaleString()}</p>
              <p className="mt-2 text-xs font-medium text-red-600">Pending settlement</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Membership</p>
              <p className="text-sm font-bold text-slate-900 mt-3 truncate">{membershipData[0]?.planName || "Standard Tier"}</p>
              <p className="mt-2 text-xs font-medium text-amber-600">Renewal: {membershipData[0]?.renewalDate || "N/A"}</p>
            </div>
          </div>

          {/* Invoices Table Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Outstanding Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage and track billing statements for your organization.</p>
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-[#FFD233] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs">
                Download Statement
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-6">Invoice Number</th>
                    <th className="py-3.5 px-6">Billing Period</th>
                    <th className="py-3.5 px-6">Due Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {invoiceData.invoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{inv.invoice_number}</td>
                      <td className="py-4 px-6 text-slate-600">{inv.billing_period}</td>
                      <td className="py-4 px-6 text-slate-600">{inv.due_date}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        ₹{inv.total_amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
