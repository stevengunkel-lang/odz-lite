import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthGuard from "../components/AuthGuard";
import LiteNav from "../components/LiteNav";

export const metadata: Metadata = {
  title: "ODZ. Lite",
  description: "Einfache Zeiterfassung und Monatszeit-Abrechnung.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ODZ. Lite",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="bg-slate-950">
      <body className="min-h-dvh overflow-x-hidden bg-slate-950 text-white antialiased">
        <AuthGuard>
          <div className="min-h-dvh bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.16),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)]">
            <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
              {children}
            </main>

            <LiteNav />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}