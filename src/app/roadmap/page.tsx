"use client";

import React, { useState } from "react";
import { RoadmapMap } from "./RoadmapMap";
import { EXPANSION_PHASES } from "@/data/expansion";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Globe, MapPin } from "lucide-react";

export default function RoadmapPage() {
  const [activePhase, setActivePhase] = useState<number>(1);

  const currentPhase = EXPANSION_PHASES.find(p => p.phase === activePhase)!;

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col">
      {/* Hero Section */}
      <header className="pt-24 pb-12 px-4 border-b border-passive bg-[#f7f4ed]">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">Global Expansion</Badge>
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter mb-4">
            BudgetUK Roadmap — <span className="text-[#5f5f5d]">Mapping the World</span>
          </h1>
          <p className="t-body text-[#5f5f5d] text-lg max-w-2xl mx-auto">
            From our London roots to a global network. We&apos;re on a mission to map the world&apos;s best value spots for the next generation of founders and students.
          </p>
        </div>
      </header>

      <main className="grow flex flex-col lg:flex-row">
        {/* Sidebar Timeline */}
        <aside className="w-full lg:w-[450px] bg-white border-b lg:border-b-0 lg:border-r border-passive p-8 overflow-y-auto">
          <h2 className="text-[18px] font-bold text-[#1c1c1c] mb-8 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Expansion Phases
          </h2>

          <div className="flex flex-col gap-10 relative">
            {/* Timeline Line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-passive z-0" />

            {EXPANSION_PHASES.map((phase) => (
              <button
                key={phase.phase}
                onClick={() => setActivePhase(phase.phase)}
                className={cn(
                  "relative z-10 flex flex-col gap-3 text-left group transition-all",
                  activePhase === phase.phase ? "scale-105" : "opacity-60 hover:opacity-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors",
                    phase.status === 'live' ? "border-[#1c1c1c] bg-[#1c1c1c] text-white" : "border-passive text-[#5f5f5d]"
                  )}>
                    {phase.status === 'live' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-[#5f5f5d]">{phase.eta}</span>
                    <h3 className="text-[18px] font-bold text-[#1c1c1c]">{phase.name}</h3>
                  </div>
                </div>

                <div className={cn(
                  "ml-12 p-4 rounded-2xl border border-passive transition-all",
                  activePhase === phase.phase ? "bg-[#f7f4ed] border-[#1c1c1c]/20 shadow-lg" : "bg-white"
                )}>
                  <div className="flex flex-wrap gap-2">
                    {(phase.cities || phase.countries || []).map(item => (
                      <span key={item} className="text-[13px] font-medium text-[#1c1c1c] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5f5f5d]" />
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] text-[#5f5f5d] italic">
                    {phase.status === 'live' ? '✓ Currently expanding' : phase.status === 'coming-soon' ? 'Building local databases' : 'Evaluating market potential'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Interactive Map View */}
        <div className="grow relative h-[500px] lg:h-auto min-h-[400px]">
          <RoadmapMap activePhase={activePhase} className="h-full w-full" />
          
          {/* Phase Overlay Info */}
          <div className="absolute bottom-8 left-8 right-8 lg:right-auto lg:w-96 p-6 bg-[#1c1c1c] text-[#fcfbf8] rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Badge variant="outline" className="text-white border-white/20 mb-3 uppercase tracking-tighter">Phase {activePhase}</Badge>
            <h4 className="text-[20px] font-bold mb-2">{currentPhase.name}</h4>
            <p className="text-[14px] text-white/60 leading-relaxed mb-4">
              {activePhase === 1 
                ? "Our primary focus is saturating the UK market with verified budget data across all major student and tech hubs."
                : `We are scaling our community model to ${currentPhase.name}, targeting high-density European tech capitals.`}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[12px] font-bold uppercase tracking-widest text-white/40">Expected Launch</span>
              <span className="text-[14px] font-bold">{currentPhase.eta}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
