"use client";

import { useClientInvoiceSummary, useClientMemberships } from "@/hooks/client/useClientBusinessData";

export default function ClientPortalPage() {
  const { data: invoiceData } = useClientInvoiceSummary();
  const { data: membershipData } = useClientMemberships();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      {/* Brand Sidebar */}
      <aside className="w-full md:w-72 bg-[#1a1a1a] text-white flex flex-col border-r border-slate-800 shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-[#FFD233] text-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-4 h-8 bg-[#e60000] rounded-xs"></div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase italic">Lift & Shift</h1>
              <p className="text-xs font-bold tracking-widest opacity-80">BUSINESS HUB</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 text-sm font-medium">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#FFD233] text-[#1a1a1a] font-bold rounded-lg shadow-sm">
            📊 Dashboard Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 text-slate-300 rounded-lg transition-colors">
            📄 Invoices & Billing
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 text-slate-300 rounded-lg transition-colors">
            🛡️ Memberships & Access
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/80 text-slate-300 rounded-lg transition-colors">
            ⚙️ Account Settings
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-900/50">
          Client Workspace: <span className="text-[#FFD233] font-bold block mt-0.5">Demo Client Alpha</span>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Client Portal Overview</h2>
            <p className="text-xs text-slate-500">Secure organization workspace and active financial records.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Verified Client</p>
              <p className="text-xs text-emerald-600 font-medium">● Connection Secure</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] text-[#FFD233] font-black text-lg flex items-center justify-center shadow-md border-2 border-[#FFD233]">
              LS
            </div>
          </div>
        </header>

        {/* Dashboard Grid & Tables */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all border-l-4 border-l-[#1a1a1a]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Billed</p>
              <p className="text-2xl font-black text-slate-900 mt-2">₹{invoiceData.total_amount?.toLocaleString()}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">Live Account Total</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all border-l-4 border-l-emerald-500">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid</p>
              <p className="text-2xl font-black text-slate-900 mt-2">₹{invoiceData.paid_amount?.toLocaleString()}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">0 Completed</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all border-l-4 border-l-[#e60000]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-black text-[#e60000] mt-2">₹{invoiceData.outstanding_amount?.toLocaleString()}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md">Action Required</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all border-l-4 border-l-[#FFD233]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Membership</p>
              <p className="text-base font-black text-slate-900 mt-3 truncate">{membershipData[0]?.planName || "Standard"}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-amber-800 bg-[#FFD233]/20 px-2.5 py-1 rounded-md">Tier Active</span>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Outstanding Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track and download billing statements for your organization.</p>
              </div>
              <button className="bg-[#1a1a1a] hover:bg-black text-[#FFD233] px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                📥 Download Statement
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th className="py-4 px-6">Invoice #</th>
                    <th className="py-4 px-6">Billing Period</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {invoiceData.invoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{inv.billing_period}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{inv.due_date}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFD233]/30 text-amber-900 border border-[#FFD233]">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-900">
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
