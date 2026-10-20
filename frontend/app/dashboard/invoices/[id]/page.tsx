"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getInvoice, InvoiceDetail } from "@/lib/api";
import { StatusPill } from "@/components/StatusPill";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvoice(params.id)
      .then(setInvoice)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!invoice) return <div className="text-sm text-slate-400">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-ink">{invoice.invoice_number}</h1>
          <p className="text-sm text-slate-500">
            {invoice.issue_date}
            {invoice.due_date ? ` · due ${invoice.due_date}` : ""}
          </p>
        </div>
        <StatusPill status={invoice.status} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-normal">Description</th>
              <th className="px-5 py-2 font-normal">HSN/SAC</th>
              <th className="px-5 py-2 font-normal">Qty</th>
              <th className="px-5 py-2 font-normal">Unit Price</th>
              <th className="px-5 py-2 font-normal">GST %</th>
              <th className="px-5 py-2 font-normal text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((li) => (
              <tr key={li.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 text-ink">{li.description}</td>
                <td className="px-5 py-3 text-slate-500">{li.hsn_sac_code || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{li.quantity}</td>
                <td className="px-5 py-3 text-slate-500">₹{li.unit_price}</td>
                <td className="px-5 py-3 text-slate-500">{li.gst_rate}%</td>
                <td className="px-5 py-3 text-right text-ink">₹{li.line_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 ml-auto max-w-sm space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>₹{invoice.subtotal}</span>
        </div>
        {parseFloat(invoice.cgst_total) > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>CGST</span>
            <span>₹{invoice.cgst_total}</span>
          </div>
        )}
        {parseFloat(invoice.sgst_total) > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>SGST</span>
            <span>₹{invoice.sgst_total}</span>
          </div>
        )}
        {parseFloat(invoice.igst_total) > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>IGST</span>
            <span>₹{invoice.igst_total}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-ink border-t border-slate-100 pt-2">
          <span>Grand Total</span>
          <span>{invoice.currency} {invoice.grand_total}</span>
        </div>
      </div>
    </div>
  );
}
