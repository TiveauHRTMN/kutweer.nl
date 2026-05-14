import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import PostHogPageView from "@/components/PostHogPageView";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://weerzone.nl"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headers } = await import("next/headers");
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const lang = pathname === "/de" || pathname.startsWith("/de/") ? "de" : "nl";

  return (
    <html lang={lang} className="antialiased">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="min-h-screen">
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
