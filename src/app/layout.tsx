import "@/lib/env";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "../styles/globals.css";
import { Header } from "@/components/features/Header";
import { Footer } from "@/components/features/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CookieConsentBanner } from "@/components/features/CookieConsentBanner";
import { InstallPrompt } from "@/components/features/InstallPrompt";
import { WelcomeModal } from "@/components/features/WelcomeModal";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://budgetuk.io";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BudgetUK — Budget-Friendly London Guide",
    template: "%s | BudgetUK",
  },
  description:
    "Explore, map and save the best budget-friendly places across London. Community-curated spots for food, coffee, workspaces, entertainment and more.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "BudgetUK",
    locale: "en_GB",
    title: "BudgetUK — Budget-Friendly London Guide",
    description:
      "Explore, map and save the best budget-friendly places across London.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "BudgetUK — Budget-Friendly London Guide",
    description:
      "Explore, map and save the best budget-friendly places across London.",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      <body className="min-h-full flex flex-col bg-[#f7f4ed]">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full pt-[72px]">
            {children}
          </main>
          <Footer />
          <CookieConsentBanner />
          <InstallPrompt />
          <WelcomeModal />
        </AuthProvider>
      </body>
    </html>
  );
}
