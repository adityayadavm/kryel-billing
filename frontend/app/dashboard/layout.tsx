import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/estimates", label: "Estimates" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-ink text-white flex flex-col">
        <div className="px-5 py-5 text-lg font-semibold border-b border-white/10">
          KRYEL Billing
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/invoices/new"
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
            >
              + Create Invoice
            </Link>
            <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
