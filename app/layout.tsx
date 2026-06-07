import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { AuthProvider } from "@/app/lib/auth";
import { CompareProvider } from "@/app/lib/compare";
import { SavedSearchesProvider } from "@/app/lib/saved-searches";
import CompareTray from "@/app/components/CompareTray";
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
  title: "Bhūmi — Trusted agricultural land marketplace",
  description: "Find verified agricultural land, farmhouse plots, and orchards with legal clarity and real boundaries.",
  openGraph: {
    title: "Bhūmi — Trusted agricultural land marketplace",
    description: "Verified listings with legal clarity and real boundaries.",
    type: "website",
    siteName: "Bhūmi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhūmi — Trusted agricultural land marketplace",
    description: "Verified listings with legal clarity and real boundaries.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}>
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
      </body>
    </html>
  );
}
