import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KRYEL Billing",
  description: "Invoicing and billing for growing businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
