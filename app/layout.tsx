import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { AuthProvider } from "@/app/lib/auth";
import { CompareProvider } from "@/app/lib/compare";
import { SavedSearchesProvider } from "@/app/lib/saved-searches";
import { LanguageProvider } from "@/app/lib/i18n-client";
import { getLocale } from "@/app/lib/i18n-server";
import CompareTray from "@/app/components/CompareTray";
import Analytics from "@/app/components/Analytics";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bhumi.vercel.app"),
  title: "AcreHub — Trusted agricultural land marketplace",
  description: "Find verified agricultural land, farmhouse plots, and orchards with legal clarity and real boundaries.",
  openGraph: {
    title: "AcreHub — Trusted agricultural land marketplace",
    description: "Verified listings with legal clarity and real boundaries.",
    type: "website",
    siteName: "AcreHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcreHub — Trusted agricultural land marketplace",
    description: "Verified listings with legal clarity and real boundaries.",
  },
};

export const viewport: Viewport = {
  themeColor: "#445626",
};

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "AcreHub",
      url: "https://bhumi.vercel.app",
      description: "Trusted, parcel-first agricultural land marketplace for India.",
      areaServed: "IN",
    },
    {
      "@type": "WebSite",
      name: "AcreHub",
      url: "https://bhumi.vercel.app",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://bhumi.vercel.app/explore?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <Analytics />
        <LanguageProvider locale={locale}>
        <AuthProvider>
          <SavedSearchesProvider>
            <CompareProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-green-700 focus:px-4 focus:py-2 focus:text-white"
              >
                Skip to content
              </a>
              <div id="main-content">{children}</div>
              <CompareTray />
            </CompareProvider>
          </SavedSearchesProvider>
        </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
