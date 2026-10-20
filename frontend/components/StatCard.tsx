export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-ink mt-1">{value}</div>
    </div>
  );
}
