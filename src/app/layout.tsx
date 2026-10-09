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
    default: `${BUSINESS_CONFIG.name} — ${BUSINESS_CONFIG.tagline}`,
    template: `%s | ${BUSINESS_CONFIG.name}`,
  },
  description: BUSINESS_CONFIG.heroSubtext,
  keywords: [
    "Chess Hub",
    "chess coaching",
    "online chess tutor",
    "1 on 1 chess coaching",
    "beginner chess coaching",
    "advanced chess coaching",
    "Shreyash chess coach",
    "Tapesnu chess coach",
  ],
  alternates: {
    canonical: BUSINESS_CONFIG.siteUrl,
  },
  openGraph: {
    title: `${BUSINESS_CONFIG.name} — ${BUSINESS_CONFIG.tagline}`,
    description: BUSINESS_CONFIG.heroSubtext,
    url: BUSINESS_CONFIG.siteUrl,
    siteName: BUSINESS_CONFIG.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_CONFIG.name} — ${BUSINESS_CONFIG.tagline}`,
    description: BUSINESS_CONFIG.heroSubtext,
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
