import React from "react";
import type { Metadata } from "next";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { EVENT_SOURCES, COMMUNITY_PEOPLE } from "@/data/events";
import type { EventSource, CommunityPerson } from "@/data/events";

export const metadata: Metadata = {
  title: "London Tech Events",
  description:
    "A hand-curated guide to recurring tech events, founder meetups, and communities in London.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "London Tech Events",
    description: "A hand-curated guide to recurring tech events, founder meetups, and communities in London.",
    url: "/events",
  },
  twitter: {
    card: "summary_large_image",
    title: "London Tech Events",
    description: "A hand-curated guide to recurring tech events, founder meetups, and communities in London.",
  },
};

function SourceCard({ source }: { source: EventSource }) {
  return (
    <article className="bg-[#fcfbf8] border border-passive rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-passive">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[20px] font-semibold text-[#1c1c1c] leading-tight">
              {source.platform}
            </h2>
            <p className="text-[13px] font-medium text-[#5f5f5d]">{source.tagline}</p>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-[13px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors mt-0.5"
          >
            Visit
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="mt-3 text-[14px] text-[#5f5f5d] leading-relaxed">
          {source.description}
        </p>
      </div>

      {/* Event list */}
      <ul className="divide-y divide-passive">
        {source.events.map((event) => (
          <li key={event.name} className="px-6 py-4 flex gap-4 items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1c] mt-1.75 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                {event.url ? (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-semibold text-[#1c1c1c] hover:underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    {event.name}
                    <ArrowUpRight className="w-3 h-3 text-[#5f5f5d]" />
                  </a>
                ) : (
                  <span className="text-[14px] font-semibold text-[#1c1c1c]">
                    {event.name}
                  </span>
                )}
                <span className="text-[11px] font-medium text-[#5f5f5d] bg-[#f7f4ed] border border-passive px-2 py-0.5 rounded-full">
                  {event.frequency}
                </span>
              </div>
              <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
                {event.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PersonCard({ person }: { person: CommunityPerson }) {
  return (
    <div className="bg-[#fcfbf8] border border-passive rounded-xl p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-[#1c1c1c] leading-snug">
          {person.name}
        </span>
        <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{person.role}</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {person.xUrl && person.xHandle && (
          <a
            href={person.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {person.xHandle}
          </a>
        )}
        {person.linkedinUrl && (
          <a
            href={person.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-16">

        {/* Page header */}
        <header className="flex flex-col gap-4">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">London Tech Events</h1>
          <p className="t-body-lg text-[#5f5f5d] max-w-xl leading-relaxed">
            A hand-curated guide to the recurring meetups, communities, and events worth putting in your calendar. No one-offs, no sponsored lists — just the venues and platforms that consistently deliver.
          </p>
        </header>

        {/* Event sources */}
        <section className="flex flex-col gap-6">
          {EVENT_SOURCES.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </section>

        {/* Divider */}
        <hr className="border-passive" />

        {/* People to follow */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="t-h2 text-[#1c1c1c] tracking-tight">
              People to follow for London tech events
            </h2>
            <p className="t-body text-[#5f5f5d]">
              These are the people who announce things first — upcoming events, new cohorts, policy shifts. Follow them and you'll rarely be the last to know.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMUNITY_PEOPLE.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>
        </section>

        {/* Editorial footer note */}
        <footer className="border-t border-passive pt-8">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            This list is maintained by the BudgetUK team. Know of a recurring event or community we've missed?{" "}
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
