import type { Metadata, Viewport } from "next";
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BRAND_CONFIG } from "@/config/brand";

const featureDeck = Newsreader({
  subsets: ["latin"],
  variable: "--font-feature-deck",
  display: "swap",
});

const sohne = Inter({
  subsets: ["latin"],
  variable: "--font-sohne",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}`,
    template: `%s | ${BRAND_CONFIG.name}`,
  },
  description: BRAND_CONFIG.heroSubcopy,
  keywords: [
    "chess coaching",
    "online chess tutor",
    "learn chess 1 on 1",
    "FIDE rated chess coach",
    "beginner chess class",
    "kids chess academy",
  ],
  openGraph: {
    title: `${BRAND_CONFIG.name} — Live Chess Coaching`,
    description: BRAND_CONFIG.heroSubcopy,
    siteName: BRAND_CONFIG.name,
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${featureDeck.variable} ${sohne.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col antialiased selection:bg-[#1d1d1d] selection:text-[#ffffff]">
        {children}
      </body>
    </html>
  );
}
