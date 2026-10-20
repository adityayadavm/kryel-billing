"use client";

import { useEffect, useState } from "react";
import { listInvoices, Invoice } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message));
  }, []);

  const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.amount_paid), 0);
  const outstanding = invoices.reduce(
    (sum, i) => sum + (parseFloat(i.grand_total) - parseFloat(i.amount_paid)),
    0
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-5">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Outstanding Dues" value={`₹${outstanding.toLocaleString("en-IN")}`} />
        <StatCard label="Invoices This Month" value={String(invoices.length)} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 font-medium text-ink">
          Recent Invoices
        </div>
        {error && <div className="px-5 py-4 text-sm text-red-600">{error}</div>}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-normal">Invoice #</th>
              <th className="px-5 py-2 font-normal">Date</th>
              <th className="px-5 py-2 font-normal">Amount</th>
              <th className="px-5 py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{inv.invoice_number}</td>
                <td className="px-5 py-3 text-slate-500">{inv.issue_date}</td>
                <td className="px-5 py-3">
                  {inv.currency} {inv.grand_total}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={inv.status} />
                </td>
              </tr>
            ))}
            {invoices.length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No invoices yet — create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
