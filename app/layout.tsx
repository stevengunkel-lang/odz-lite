import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthGuard from "../components/AuthGuard";
import LiteNav from "../components/LiteNav";

export const metadata: Metadata = {
  title: "ODZ. Lite",
  description: "Einfache Zeiterfassung und Monatszeit-Abrechnung.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png?v=4", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=4", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png?v=4",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ODZ. Lite",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "ODZ. Lite",
    "mobile-web-app-capable": "yes",
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
      <head>
        <link rel="manifest" href="/manifest.json?v=4" />
        <link rel="icon" href="/favicon.ico?v=4" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" />
        <link
          rel="apple-touch-icon-precomposed"
          href="/apple-touch-icon.png?v=4"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="ODZ. Lite" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>

      <body className="min-h-svh overflow-x-hidden overscroll-none bg-slate-950 text-white antialiased">
        <AuthGuard>
          <div className="relative min-h-svh overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.16),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)]">
            <main className="mx-auto min-h-svh w-full max-w-md px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
              {children}
            </main>

            <LiteNav />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
