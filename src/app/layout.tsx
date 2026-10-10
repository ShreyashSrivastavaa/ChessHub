import type { Metadata, Viewport } from "next";
import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BUSINESS_CONFIG } from "@/config/business";

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
  metadataBase: new URL(BUSINESS_CONFIG.siteUrl),
  title: {
    default: "ChessHub | Learn. Play. Improve.",
    template: "%s | ChessHub",
  },
  description: BUSINESS_CONFIG.heroSubtext,
  keywords: [
    "ChessHub",
    "Chess Hub",
    "chess coaching",
    "online chess tutor",
    "1 on 1 chess coaching",
    "beginner chess coaching",
    "advanced chess coaching",
    "Shreyash chess coach",
    "Tapesnu chess coach",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  alternates: {
    canonical: BUSINESS_CONFIG.siteUrl,
  },
  openGraph: {
    title: "ChessHub | Learn. Play. Improve.",
    description: BUSINESS_CONFIG.heroSubtext,
    url: BUSINESS_CONFIG.siteUrl,
    siteName: "ChessHub",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChessHub — Learn. Play. Improve.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChessHub | Learn. Play. Improve.",
    description: BUSINESS_CONFIG.heroSubtext,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data with ONLY verified facts (no address, hours, reviews or ratings)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: BUSINESS_CONFIG.name,
    url: BUSINESS_CONFIG.siteUrl,
    email: BUSINESS_CONFIG.email,
    telephone: BUSINESS_CONFIG.phone,
    description: BUSINESS_CONFIG.heroSubtext,
    founder: [
      {
        "@type": "Person",
        name: "Shreyash",
        jobTitle: "Chess Coach",
      },
      {
        "@type": "Person",
        name: "Tapesnu",
        jobTitle: "Chess Coach",
      },
    ],
    makesOffer: [
      {
        "@type": "Offer",
        name: BUSINESS_CONFIG.plans.beginner.name,
        price: BUSINESS_CONFIG.plans.beginner.priceRupees,
        priceCurrency: "INR",
        description: BUSINESS_CONFIG.plans.beginner.description,
      },
      {
        "@type": "Offer",
        name: BUSINESS_CONFIG.plans.advanced.name,
        price: BUSINESS_CONFIG.plans.advanced.priceRupees,
        priceCurrency: "INR",
        description: BUSINESS_CONFIG.plans.advanced.description,
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${featureDeck.variable} ${sohne.variable} ${mono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#0e0e10] text-[#f5f3ef] flex flex-col antialiased selection:bg-[#cfa859]/30 selection:text-[#f5f3ef]">
        {children}
      </body>
    </html>
  );
}
