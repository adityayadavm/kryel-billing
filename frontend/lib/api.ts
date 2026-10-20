const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kryel_token");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) throw new Error("Invalid email or password");
  const data = await res.json();
  localStorage.setItem("kryel_token", data.access_token);
  return data;
}

export type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  currency: string;
  grand_total: string;
  amount_paid: string;
};

export function listInvoices() {
  return apiFetch<Invoice[]>("/invoices");
}

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstin: string | null;
  state: string | null;
  country: string;
  currency: string;
};

export type CustomerInput = Omit<Customer, "id">;

export function listCustomers() {
  return apiFetch<Customer[]>("/customers");
}

export function createCustomer(payload: Partial<CustomerInput> & { name: string }) {
  return apiFetch<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Product = {
  id: string;
  name: string;
  description: string | null;
  hsn_sac_code: string | null;
  unit_price: string;
  gst_rate: string;
  track_inventory: boolean;
  stock_qty: number | null;
};

export type ProductInput = Omit<Product, "id">;

export function listProducts() {
  return apiFetch<Product[]>("/products");
}

export function createProduct(payload: Partial<ProductInput> & { name: string }) {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type Company = {
  id: string;
  name: string;
  state: string | null;
  country: string;
  default_currency: string;
  gstin: string | null;
};

export function getCompany() {
  return apiFetch<Company>("/company/me");
}

export type LineItemInput = {
  description: string;
  hsn_sac_code?: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  product_id?: string;
};

export type InvoiceDetail = Invoice & {
  subtotal: string;
  cgst_total: string;
  sgst_total: string;
  igst_total: string;
  line_items: (LineItemInput & { id: string; line_total: string })[];
};

export function getInvoice(id: string) {
  return apiFetch<InvoiceDetail>(`/invoices/${id}`);
}

export function createInvoice(payload: {
  customer_id: string;
  invoice_type?: string;
  issue_date: string;
  due_date?: string;
  currency?: string;
  notes?: string;
  line_items: LineItemInput[];
}) {
  return apiFetch<InvoiceDetail>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
