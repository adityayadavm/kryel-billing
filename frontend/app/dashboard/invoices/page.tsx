"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listInvoices, Invoice } from "@/lib/api";
import { StatusPill } from "@/components/StatusPill";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-ink">Invoices</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Create Invoice
        </Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
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
              <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-ink hover:underline">
                    {inv.invoice_number}
                  </Link>
                </td>
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
