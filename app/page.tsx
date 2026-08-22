"use client";

import { useState } from "react";
import { useClientInvoiceSummary, useClientMemberships } from "@/hooks/client/useClientBusinessData";

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "memberships" | "settings">("overview");
  
  const { data: invoiceData } = useClientInvoiceSummary();
  const { data: membershipData } = useClientMemberships();

  const totalBilled = invoiceData.invoices?.reduce((acc, inv) => acc + (inv.total_amount || 0), 0) || 0;
  const totalPaid = invoiceData.invoices?.reduce((acc, inv) => acc + (inv.paid_amount || 0), 0) || 0;
  const totalOutstanding = totalBilled - totalPaid;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 bg-[#FFD233] flex items-center justify-center">
          <img src="/logo.png" alt="Lift & Shift Logo" className="h-12 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "overview" 
                ? "bg-slate-800 text-white font-semibold border-l-4 border-[#FFD233]" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "invoices" 
                ? "bg-slate-800 text-white font-semibold border-l-4 border-[#FFD233]" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            Invoices & Billing
          </button>
          <button
            onClick={() => setActiveTab("memberships")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "memberships" 
                ? "bg-slate-800 text-white font-semibold border-l-4 border-[#FFD233]" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            Memberships & Access
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "settings" 
                ? "bg-slate-800 text-white font-semibold border-l-4 border-[#FFD233]" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            Account Settings
          </button>
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight capitalize">
              {activeTab === "overview" && "Client Portal Overview"}
              {activeTab === "invoices" && "Invoices & Billing Records"}
              {activeTab === "memberships" && "Memberships & Access Tiers"}
              {activeTab === "settings" && "Account & Organization Settings"}
            </h2>
            <p className="text-xs text-slate-500">Secure organization workspace and active records.</p>
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

        {/* Dynamic Content Views */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
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

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Recent Outstanding Invoices</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Quick summary of pending billing actions.</p>
                  </div>
                  <button onClick={() => setActiveTab("invoices")} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                    View All Invoices →
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
            </>
          )}

          {/* TAB 2: INVOICES & BILLING */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Complete Invoice Registry</h3>
                  <p className="text-xs text-slate-500">Download official tax statements and review payment histories.</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-[#FFD233] px-4 py-2 rounded-lg text-xs font-bold transition-all">
                  Export Statement PDF
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <th className="py-3.5 px-6">Invoice ID</th>
                      <th className="py-3.5 px-6">Billing Period</th>
                      <th className="py-3.5 px-6">Invoice Date</th>
                      <th className="py-3.5 px-6">Due Date</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {invoiceData.invoices?.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">{inv.invoice_number}</td>
                        <td className="py-4 px-6 text-slate-600">{inv.billing_period}</td>
                        <td className="py-4 px-6 text-slate-600">{inv.invoice_date}</td>
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
          )}

          {/* TAB 3: MEMBERSHIPS */}
          {activeTab === "memberships" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-base font-bold text-slate-900">Active Organization Membership</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your current subscription tier and feature access rights.</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {membershipData.map((m, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
                        {m.status}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">{m.planName}</h4>
                      <p className="text-xs text-slate-500 mt-1">Next Renewal Date: {m.renewalDate}</p>
                      <button className="mt-5 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold transition-all">
                        Manage Subscription
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Organization Settings</h3>
                <p className="text-xs text-slate-500">Update your corporate profile and notification preferences.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Organization Name</label>
                  <input type="text" disabled value="Demo Client Alpha" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Billing Email Contact</label>
                  <input type="email" defaultValue="billing@democlient.com" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-[#FFD233] px-5 py-2.5 rounded-lg text-xs font-bold transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
