import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import InstallPrompt from "@/components/InstallPrompt";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://weerzone.nl"),
  icons: {
    icon: [
      { url: "/favicon-icon.png", type: "image/png" },
    ],
    shortcut: "/favicon-icon.png",
    apple: "/favicon-icon.png",
  },
  title: {
    default: "WeerZone — 48 uur. De rest is ruis.",
    template: "%s | WeerZone — 48 uur. De rest is ruis.",
  },
  description:
    "WeerZone.nl — Vergeet de 14-daagse. De komende 48 uur op de vierkante meter. KNMI HARMONIE + ICON + ICON-D2. De enige weerdienst die de waarheid durft te vertellen.",
  keywords: [
    "weer", "weer nederland", "weerbericht", "weersverwachting", "weer vandaag",
    "weer morgen", "48 uur weer", "weer komende 48 uur", "fietsweer", "regen verwachting",
    "weerzone", "nauwkeurig weer", "KNMI", "KNMI HARMONIE", "DWD ICON", "ICON-D2",
    "weerbericht vandaag", "temperatuur nederland", "wind nederland",
    "neerslag radar", "buienradar alternatief", "weer per postcode",
    "weer exact locatie", "hyperlocaal weer", "weerzone.nl",
  ],
  openGraph: {
    title: "WeerZone — 48 uur. De rest is ruis.",
    description: "Vergeet de 14-daagse. De komende 48 uur, op de vierkante meter. De enige weerdienst die niet liegt.",
    type: "website",
    locale: "nl_NL",
    url: "https://weerzone.nl",
    siteName: "WeerZone",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WeerZone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeerZone — 48 uur. De rest is ruis.",
    description: "Vergeet de 14-daagse. De komende 48 uur op de vierkante meter. KNMI HARMONIE + ICON + ICON-D2.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WeerZone",
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} antialiased`}>
      <head>
        <meta name="theme-color" content="#4a9ee8" />
      </head>
      <body className="min-h-screen">
        <Providers>
          {children}
          <CookieBanner />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
