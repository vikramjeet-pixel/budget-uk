import React from "react";
import type { Metadata } from "next";
import { ExternalLink, CheckCircle } from "lucide-react";
import { TRANSPORT_MODES } from "@/data/transport";
import type { TransportMode } from "@/data/transport";
import { FareCalculator } from "./FareCalculator";

export const metadata: Metadata = {
  title: "Getting Around London | BudgetUK",
  description:
    "A complete guide to London transport — Tube, buses, bikes, rail, coaches — with fares, caps, and money-saving tips.",
};

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
        {/* Key facts */}
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

        {/* Budget tips */}
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
      {/* Sponsored tag */}
      <span className="absolute top-4 right-4 text-[10px] font-semibold text-white/40 uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full">
        Sponsored
      </span>

      <div className="flex-1 flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Affiliate partner
        </p>
        <h3 className="text-[20px] font-semibold text-[#fcfbf8] leading-snug">
          Book National Rail tickets on Trainline
        </h3>
        <p className="text-[14px] text-white/60 leading-relaxed max-w-md">
          Trainline's smart fare finder splits tickets automatically and shows the cheapest advance fares across all operators. Particularly good for routes out of London.
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

// Quick-jump anchor nav
function ModeNav() {
  return (
    <nav aria-label="Jump to section" className="flex flex-wrap gap-2">
      {TRANSPORT_MODES.map((m) => (
        <a
          key={m.id}
          href={`#${m.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-passive bg-[#fcfbf8] text-[#1c1c1c] hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed] transition-colors"
        >
          <span>{m.icon}</span>
          {m.name.split(" ")[0] === "London"
            ? m.name.replace("London ", "")
            : m.name.split(" ")[0] === "E-Bikes"
            ? "E-Bikes"
            : m.name.split(",")[0]}
        </a>
      ))}
    </nav>
  );
}

export default function TransportPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-14">

        {/* Hero */}
        <header className="flex flex-col gap-5">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
            Getting Around London —{" "}
            <span className="text-[#5f5f5d]">skip the car, save thousands</span>
          </h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            London has one of the most comprehensive public transport networks in the world. Used correctly, it's also one of the cheapest ways to move around a major city. This is everything you need to know.
          </p>
          <ModeNav />
        </header>

        {/* Fare calculator */}
        <FareCalculator />

        {/* Transport cards */}
        <section className="flex flex-col gap-6">
          {TRANSPORT_MODES.map((mode) => (
            <TransportCard key={mode.id} mode={mode} />
          ))}
        </section>

        {/* Trainline CTA */}
        <TrainlineCTA />

        {/* Editorial footer */}
        <footer className="border-t border-passive pt-8">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            Fares correct as of January 2025. TfL adjusts fares annually in January. Always{" "}
            <a
              href="https://tfl.gov.uk/fares"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              verify on TfL's fare finder
            </a>{" "}
            for exact figures. Spotted an error?{" "}
            <a
              href="mailto:hello@budgetuk.io"
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              Let us know
            </a>
            .
          </p>
        </footer>

      </main>
    </div>
  );
}
