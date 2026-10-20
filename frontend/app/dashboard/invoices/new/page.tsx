"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listCustomers,
  listProducts,
  getCompany,
  createInvoice,
  Customer,
  Product,
  Company,
  LineItemInput,
} from "@/lib/api";

type DraftLine = LineItemInput & { key: string };

function newLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    description: "",
    hsn_sac_code: "",
    quantity: 1,
    unit_price: 0,
    gst_rate: 18,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([listCustomers(), listProducts(), getCompany()])
      .then(([c, p, co]) => {
        setCustomers(c);
        setProducts(p);
        setCompany(co);
      })
      .catch((err) => setError(err.message));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === customerId) || null;

  // Live GST preview — mirrors the backend's app/core/gst.py split logic
  // (CGST+SGST for intra-state, IGST for inter-state, nothing for international).
  const totals = useMemo(() => {
    const isInternational =
      selectedCustomer != null &&
      company != null &&
      (selectedCustomer.country !== company.country ||
        selectedCustomer.currency !== company.default_currency);

    const intraState =
      !isInternational &&
      company?.state &&
      selectedCustomer?.state &&
      company.state.trim().toLowerCase() === selectedCustomer.state.trim().toLowerCase();

    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    for (const line of lines) {
      const lineTotal = round2((line.quantity || 0) * (line.unit_price || 0));
      subtotal += lineTotal;
      if (!isInternational) {
        const gstAmount = round2((lineTotal * (line.gst_rate || 0)) / 100);
        if (intraState) {
          cgst += round2(gstAmount / 2);
          sgst += round2(gstAmount / 2);
        } else {
          igst += gstAmount;
        }
      }
    }

    const grandTotal = round2(subtotal + cgst + sgst + igst);
    return { subtotal: round2(subtotal), cgst, sgst, igst, grandTotal, isInternational, intraState };
  }, [lines, selectedCustomer, company]);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function applyProduct(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateLine(key, {
      product_id: product.id,
      description: product.name,
      hsn_sac_code: product.hsn_sac_code || "",
      unit_price: parseFloat(product.unit_price),
      gst_rate: parseFloat(product.gst_rate),
    });
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      setError("Pick a customer first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const invoice = await createInvoice({
        customer_id: customerId,
        invoice_type: "gst_service",
        issue_date: issueDate,
        due_date: dueDate || undefined,
        currency: company?.default_currency || "INR",
        line_items: lines.map(({ key, ...rest }) => rest),
      });
      router.push(`/dashboard/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-ink mb-5">New Invoice</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">
                No customers yet — add one on the Customers page first.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date *</label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <span className="font-medium text-ink">Line Items</span>
            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, newLine()])}
              className="text-sm text-accent font-medium hover:underline"
            >
              + Add line
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-5 py-2 font-normal">Description</th>
                <th className="px-5 py-2 font-normal w-28">HSN/SAC</th>
                <th className="px-5 py-2 font-normal w-20">Qty</th>
                <th className="px-5 py-2 font-normal w-28">Unit Price</th>
                <th className="px-5 py-2 font-normal w-20">GST %</th>
                <th className="px-5 py-2 font-normal w-10" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-2">
                    <select
                      className="w-full text-xs text-slate-500 mb-1 border-0 p-0 focus:ring-0"
                      value=""
                      onChange={(e) => e.target.value && applyProduct(line.key, e.target.value)}
                    >
                      <option value="">Pick from catalog…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      value={line.description}
                      onChange={(e) => updateLine(line.key, { description: e.target.value })}
                      placeholder="Line description"
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      value={line.hsn_sac_code}
                      onChange={(e) => updateLine(line.key, { hsn_sac_code: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) => updateLine(line.key, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(line.key, { unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.gst_rate}
                      onChange={(e) => updateLine(line.key, { gst_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </td>
                  <td className="px-5 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Remove line"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 ml-auto max-w-sm space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {totals.isInternational ? (
            <div className="text-slate-400 text-xs">International invoice — no GST applied</div>
          ) : (
            <>
              <div className="flex justify-between text-slate-600">
                <span>{totals.intraState ? "CGST" : "IGST (inter-state)"}</span>
                <span>₹{(totals.intraState ? totals.cgst : totals.igst).toLocaleString("en-IN")}</span>
              </div>
              {totals.intraState && (
                <div className="flex justify-between text-slate-600">
                  <span>SGST</span>
                  <span>₹{totals.sgst.toLocaleString("en-IN")}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between font-semibold text-ink border-t border-slate-100 pt-2">
            <span>Grand Total</span>
            <span>₹{totals.grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
