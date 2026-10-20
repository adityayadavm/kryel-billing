const STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  sent: "bg-blue-100 text-blue-700",
  partially_paid: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-600",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-400",
};

export function StatusPill({ status }: { status: string }) {
  const style = STYLES[status] || STYLES.draft;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.replace("_", " ")}
    </span>
  );
}
