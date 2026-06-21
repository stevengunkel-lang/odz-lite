import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import LiteNav from "../components/LiteNav";
import AuthGuard from "../components/AuthGuard";

export const metadata: Metadata = {
  title: "ODZ. Lite",
  description: "Einfache Einsatz- und Monatszeit-Abrechnung.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-white">
        <AuthGuard>
          <main className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-5">
            {children}
          </main>

          <LiteNav />
        </AuthGuard>
      </body>
    </html>
  );
}