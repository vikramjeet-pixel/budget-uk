import React from "react";
import type { Metadata } from "next";
import { CheckCircle, ExternalLink } from "lucide-react";
import { STUDENT_SECTIONS } from "@/data/student";
import type { StudentSection, StudentItem, AffiliateCta } from "@/data/student";
import { AffiliateLink } from "@/components/features/AffiliateLink";

export const metadata: Metadata = {
  title: "Student London",
  description:
    "Banking, phone plans, discounts, transport, housing, and food tips for students in London.",
  alternates: { canonical: "/student" },
  openGraph: {
    title: "Student London",
    description: "Banking, phone plans, discounts, transport, housing, and food tips for students in London.",
    url: "/student",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student London",
    description: "Banking, phone plans, discounts, transport, housing, and food tips for students in London.",
  },
};

// ── Affiliate CTA block ───────────────────────────────────────────────────────

function AffiliateCTABlock({ cta }: { cta: AffiliateCta }) {
  return (
    <aside
      aria-label="Sponsored"
      className="relative bg-[#1c1c1c] rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <span className="absolute top-3 right-3 text-[9px] font-semibold text-white/40 uppercase tracking-widest border border-white/20 px-1.5 py-0.5 rounded-full">
        Sponsored
      </span>
      <div className="flex-1 flex flex-col gap-1 pr-10 sm:pr-0">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
          {cta.label}
        </p>
        <p className="text-[13px] text-white/70 leading-relaxed">{cta.body}</p>
      </div>
      <AffiliateLink
        href={cta.url}
        destination={cta.label}
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#fcfbf8] text-[#1c1c1c] text-[13px] font-semibold rounded-full hover:bg-white transition-colors whitespace-nowrap"
      >
        {cta.buttonText}
        <ExternalLink className="w-3 h-3" />
      </AffiliateLink>
    </aside>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: StudentItem }) {
  return (
    <div className="flex flex-col gap-4 py-5 border-b border-passive last:border-0 last:pb-0 first:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-[#1c1c1c]">{item.name}</span>
          <span className="text-[12px] text-[#5f5f5d]">{item.tagline}</span>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors mt-0.5"
        >
          <ExternalLink className="w-3 h-3" />
          Visit
        </a>
      </div>

      <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{item.body}</p>

      {/* Key facts table */}
      {item.facts && item.facts.length > 0 && (
        <dl className="bg-[#f7f4ed] rounded-lg px-4 py-3 flex flex-col gap-1.5">
          {item.facts.map((f) => (
            <div key={f.label} className="flex justify-between items-baseline gap-4">
              <dt className="text-[12px] text-[#5f5f5d] shrink-0">{f.label}</dt>
              <dd className="text-[12px] font-semibold text-[#1c1c1c] text-right">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Tips */}
      <ul className="flex flex-col gap-2">
        {item.tips.map((tip) => (
          <li key={tip} className="flex gap-2.5 items-start">
            <CheckCircle className="w-3.5 h-3.5 text-[#1c1c1c] mt-0.5 shrink-0" />
            <span className="text-[13px] text-[#5f5f5d] leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: StudentSection }) {
  return (
    <article id={section.id} className="flex flex-col gap-0 bg-[#fcfbf8] border border-passive rounded-2xl overflow-hidden scroll-mt-24">
      {/* Section header */}
      <div className="px-6 pt-6 pb-4 border-b border-passive">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-[22px] leading-none">{section.icon}</span>
          <h2 className="text-[18px] font-semibold text-[#1c1c1c]">{section.title}</h2>
        </div>
        <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{section.intro}</p>
      </div>

      {/* Items */}
      <div className="px-6 py-2">
        {section.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Affiliate CTA */}
      {section.cta && (
        <div className="px-6 pb-6 pt-2">
          <AffiliateCTABlock cta={section.cta} />
        </div>
      )}
    </article>
  );
}

// ── Quick-jump nav ────────────────────────────────────────────────────────────

function SectionNav() {
  return (
    <nav aria-label="Jump to section" className="flex flex-wrap gap-2">
      {STUDENT_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-passive bg-[#fcfbf8] text-[#1c1c1c] hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed] transition-colors"
        >
          <span>{s.icon}</span>
          {s.title}
        </a>
      ))}
    </nav>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-10">

        {/* Hero */}
        <header className="flex flex-col gap-5">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
            Student London —{" "}
            <span className="text-[#5f5f5d]">make your money go further</span>
          </h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            The accounts, apps, cards, and habits that separate students who struggle with money from those who don't. Most of this takes under ten minutes to set up.
          </p>
          <SectionNav />
        </header>

        {/* Sections */}
        {STUDENT_SECTIONS.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}

        {/* Footer */}
        <footer className="border-t border-passive pt-8">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            Prices and offers correct as of early 2025. Always verify directly with the provider — student deals change frequently. Spotted something out of date?{" "}
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
