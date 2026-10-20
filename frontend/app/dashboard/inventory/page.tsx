"use client";

import { useEffect, useState } from "react";
import { listProducts, createProduct, Product } from "@/lib/api";

const GST_RATES = ["0", "5", "12", "18", "28"];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    hsn_sac_code: "",
    unit_price: "",
    gst_rate: "18",
  });

  function refresh() {
    listProducts()
      .then(setProducts)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createProduct({
        name: form.name,
        hsn_sac_code: form.hsn_sac_code || undefined,
        unit_price: form.unit_price as any,
        gst_rate: form.gst_rate as any,
      } as any);
      setForm({ name: "", hsn_sac_code: "", unit_price: "", gst_rate: "18" });
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-ink">Products &amp; Services</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-ink text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">HSN/SAC Code</label>
            <input
              value={form.hsn_sac_code}
              onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })}
              placeholder="e.g. 998314"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GST Rate</label>
            <select
              value={form.gst_rate}
              onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {GST_RATES.map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹) *</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-normal">Name</th>
              <th className="px-5 py-2 font-normal">HSN/SAC</th>
              <th className="px-5 py-2 font-normal">Unit Price</th>
              <th className="px-5 py-2 font-normal">GST Rate</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-5 py-3 text-slate-500">{p.hsn_sac_code || "—"}</td>
                <td className="px-5 py-3 text-slate-500">₹{p.unit_price}</td>
                <td className="px-5 py-3 text-slate-500">{p.gst_rate}%</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No products yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
