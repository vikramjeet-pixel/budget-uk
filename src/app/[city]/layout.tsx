import { Metadata } from "next";
import { CITIES } from "@/data/cities";
import { notFound } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = CITIES.find(c => c.slug === citySlug.toLowerCase());
  
  if (!city) {
    return {
      title: "City Not Found | BudgetUK",
    };
  }

  const title = `BudgetUK — Budget-Friendly Spots in ${city.name}`;
  const description = `Cheap spots for students and founders in ${city.name}. Food, housing, work spaces, gyms, and events — all on a budget.`;
  const url = `https://budgetuk.io/${city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "BudgetUK",
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: `/api/og?city=${city.slug}`,
          width: 1200,
          height: 630,
          alt: `Budget-friendly spots in ${city.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?city=${city.slug}`],
    },
  };
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
