import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, CheckCircle } from "lucide-react";
import { TRANSPORT_CONTENT } from "@/data/transport-content";
import type { TransportMode } from "@/data/transport";
import { getCityBySlug } from "@/data/cities";
import { FareCalculator } from "./FareCalculator";

type Props = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: cityParam } = await params;
  const citySlug = cityParam.toLowerCase();
  const content = TRANSPORT_CONTENT[citySlug];
  const city = getCityBySlug(citySlug);

  if (!content || !city) {
    return {
      title: "Transport Guide | BudgetUK",
    };
  }

  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: `/${citySlug}/transport` },
  };
}

function TransportCard({ mode }: { mode: TransportMode }) {
  return (
    <article id={mode.id} className="bg-[#fcfbf8] border border-passive rounded-2xl overflow-hidden scroll-mt-24">
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-passive">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[28px] leading-none">{mode.icon}</span>
            <div>
              <h2 className="text-[18px] font-semibold text-[#1c1c1c] leading-tight">{mode.name}</h2>
              <p className="text-[13px] text-[#5f5f5d] mt-0.5">{mode.tagline}</p>
            </div>
          </div>
          <a
            href={mode.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors mt-1"
          >
            Official site
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="mt-3 text-[14px] text-[#5f5f5d] leading-relaxed">{mode.body}</p>
      </div>

      {/* Key facts + budget tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-passive">
        <div className="px-6 py-5">
          <h3 className="text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider mb-3">
            Key fares &amp; facts
          </h3>
          <dl className="flex flex-col gap-2">
            {mode.facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-4 items-baseline">
                <dt className="text-[13px] text-[#5f5f5d] shrink-0">{f.label}</dt>
                <dd className="text-[13px] font-semibold text-[#1c1c1c] text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-6 py-5">
          <h3 className="text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider mb-3">
            Budget tips
          </h3>
          <ul className="flex flex-col gap-2.5">
            {mode.tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 items-start">
                <CheckCircle className="w-3.5 h-3.5 text-[#1c1c1c] mt-0.5 shrink-0" />
                <span className="text-[13px] text-[#5f5f5d] leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function TrainlineCTA() {
  return (
    <aside
      aria-label="Sponsored"
      className="relative bg-[#1c1c1c] rounded-2xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
    >
      <span className="absolute top-4 right-4 text-[10px] font-semibold text-white/40 uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full">
        Sponsored
      </span>
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Affiliate partner
        </p>
        <h3 className="text-[20px] font-semibold text-[#fcfbf8] leading-snug">
          Book Rail tickets on Trainline
        </h3>
        <p className="text-[14px] text-white/60 leading-relaxed max-w-md">
          Trainline&apos;s smart fare finder splits tickets automatically and shows the cheapest advance fares across all operators.
        </p>
      </div>
      <a
        href="https://www.thetrainline.com"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[#fcfbf8] text-[#1c1c1c] text-[14px] font-semibold rounded-full hover:bg-white transition-colors"
      >
        Find cheapest fares
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </aside>
  );
}

function ModeNav({ modes }: { modes: TransportMode[] }) {
  return (
    <nav aria-label="Jump to section" className="flex flex-wrap gap-2">
      {modes.map((m) => (
        <a
          key={m.id}
          href={`#${m.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-passive bg-[#fcfbf8] text-[#1c1c1c] hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed] transition-colors"
        >
          <span>{m.icon}</span>
          {m.name}
        </a>
      ))}
    </nav>
  );
}

export default async function TransportPage({ params }: Props) {
  const { city: cityParam } = await params;
  const citySlug = cityParam.toLowerCase();
  const content = TRANSPORT_CONTENT[citySlug];
  const city = getCityBySlug(citySlug);

  if (!city) notFound();

  if (!content) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="t-h2 text-[#1c1c1c] mb-4">Transport for {city.name} — Coming Soon</h1>
          <p className="t-body text-[#5f5f5d] mb-8">
            We&apos;re currently curating the best budget transport tips for {city.name}. Check back shortly!
          </p>
          <a href={`/${city.slug}`} className="text-[#1c1c1c] font-bold underline">
            Back to {city.name} Map
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-14">
        <header className="flex flex-col gap-5">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
            {content.title} — <span className="text-[#5f5f5d]">{content.heroTagline}</span>
          </h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            {content.heroBody}
          </p>
          <ModeNav modes={content.modes} />
        </header>

        {citySlug === "london" && <FareCalculator />}

        <section className="flex flex-col gap-6">
          {content.modes.map((mode) => (
            <TransportCard key={mode.id} mode={mode} />
          ))}
        </section>

        <TrainlineCTA />

        <footer className="border-t border-passive pt-8 pb-12">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            {content.footerNote}{" "}
            {content.footerLink && (
              <a
                href={content.footerLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
              >
                {content.footerLink.text}
              </a>
            )}
          </p>
        </footer>
      </main>
    </div>
  );
}
