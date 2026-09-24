import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BRAND_CONFIG } from "@/config/brand";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono",
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
      className={`${interTight.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#ffffff] text-[#000000] flex flex-col antialiased selection:bg-[#e3fc03] selection:text-[#000000]">
        {children}
      </body>
    </html>
  );
}
