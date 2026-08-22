"use client";

import { useClientInvoiceSummary, useClientMemberships } from "@/hooks/client/useClientBusinessData";

export default function ClientPortalPage() {
  const { data: invoiceData, isLoading: invoiceLoading } = useClientInvoiceSummary();
  const { data: membershipData, isLoading: membershipLoading } = useClientMemberships();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block"></span>
            L&S Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Business Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-slate-800 text-white rounded-lg transition-colors">
            📊 Dashboard Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/60 hover:text-white rounded-lg transition-colors text-slate-400">
            📄 Invoices & Billing
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/60 hover:text-white rounded-lg transition-colors text-slate-400">
            🛡️ Memberships & Access
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/60 hover:text-white rounded-lg transition-colors text-slate-400">
            ⚙️ Account Settings
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Organization: <span className="text-slate-300 font-medium">Demo Client Alpha</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Client Portal Overview</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">Verified Organization</p>
              <p className="text-xs text-slate-500">Secure Client Space</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm">
              DC
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">₹{invoiceData.total_amount?.toLocaleString()}</p>
              <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Updated Live</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Paid</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">₹{invoiceData.paid_amount?.toLocaleString()}</p>
              <span className="inline-block mt-2 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">0 Completed</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">₹{invoiceData.outstanding_amount?.toLocaleString()}</p>
              <span className="inline-block mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Action Required</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Membership</p>
              <p className="text-lg font-bold text-slate-900 mt-3 truncate">{membershipData[0]?.planName || "Standard"}</p>
              <span className="inline-block mt-2 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">Tier Active</span>
            </div>
          </div>

          {/* Invoices Table Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Outstanding Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage and track billing records for your organization.</p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
                Download Statement
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Billing Period</th>
                    <th className="py-3.5 px-6">Due Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {invoiceData.invoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">{inv.invoice_number}</td>
                      <td className="py-4 px-6 text-slate-600">{inv.billing_period}</td>
                      <td className="py-4 px-6 text-slate-600">{inv.due_date}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-900">
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
