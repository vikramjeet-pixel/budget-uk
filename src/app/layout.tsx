import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Header } from "@/components/features/Header";
import { Footer } from "@/components/features/Footer";
import { StatusBanner } from "@/components/features/StatusBanner";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetUK",
  description: "BudgetUK - Explore, map and save places across London.",
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
      <body className="min-h-full flex flex-col bg-[#f7f4ed]">
        <AuthProvider>
          <StatusBanner />
          <Header />
          <main className="flex-1 w-full pt-[72px]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
