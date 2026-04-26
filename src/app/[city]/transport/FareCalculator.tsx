"use client";

import React, { useState } from "react";
import { lookupFare } from "@/data/transport";
import type { Zone } from "@/data/transport";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator } from "lucide-react";

const ZONES: Zone[] = [1, 2, 3, 4, 5, 6];

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

const SelectZone = ({
  value,
  onChange,
  label,
}: {
  value: Zone;
  onChange: (z: Zone) => void;
  label: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-semibold text-[#5f5f5d] uppercase tracking-wider">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as Zone)}
      className="px-3 py-2.5 text-[14px] font-medium text-[#1c1c1c] bg-[#fcfbf8] border border-passive rounded-lg focus:outline-none focus:border-[#1c1c1c] transition-colors"
    >
      {ZONES.map((z) => (
        <option key={z} value={z}>
          Zone {z}
        </option>
      ))}
    </select>
  </div>
);

export function FareCalculator() {
  const [fromZone, setFromZone] = useState<Zone>(1);
  const [toZone, setToZone] = useState<Zone>(2);
  const [peak, setPeak] = useState(false);
  const [result, setResult] = useState<{ single: number; daily: number } | null>(null);

  const calculate = () => {
    const row = lookupFare(fromZone, toZone);
    if (!row) return;
    setResult({
      single: peak ? row.peakSingle : row.offPeakSingle,
      daily: row.dailyCap,
    });
  };

  return (
    <div className="bg-[#f7f4ed] border border-passive rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-passive flex items-center gap-3">
        <Calculator className="w-5 h-5 text-[#1c1c1c] shrink-0" />
        <div>
          <h3 className="text-[16px] font-semibold text-[#1c1c1c]">Fare Calculator</h3>
          <p className="text-[12px] text-[#5f5f5d]">
            Oyster / contactless estimates — real logic coming soon
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="px-6 py-5 flex flex-col gap-5">
        <div className="flex items-end gap-3">
          <SelectZone value={fromZone} onChange={setFromZone} label="From" />
          <ArrowRight className="w-4 h-4 text-[#5f5f5d] mb-2.5 shrink-0" />
          <SelectZone value={toZone} onChange={setToZone} label="To" />
        </div>

        {/* Peak toggle */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={peak}
            onClick={() => setPeak(!peak)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              peak ? "bg-[#1c1c1c]" : "bg-passive"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                peak ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-[14px] text-[#1c1c1c]">
            {peak ? "Peak" : "Off-peak"}
            <span className="ml-1.5 text-[12px] text-[#5f5f5d]">
              {peak ? "(Mon–Fri 06:30–09:30, 16:00–19:00)" : "(weekends, evenings & weekday daytime)"}
            </span>
          </span>
        </div>

        <Button variant="primary" size="md" onClick={calculate} className="w-fit">
          Calculate
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className="mx-6 mb-6 bg-[#fcfbf8] border border-passive rounded-xl p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider">
                Single fare
              </span>
              <span className="text-[28px] font-semibold text-[#1c1c1c] leading-none">
                {fmt(result.single)}
              </span>
              <span className="text-[12px] text-[#5f5f5d]">per journey</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[#5f5f5d] uppercase tracking-wider">
                Daily cap
              </span>
              <span className="text-[28px] font-semibold text-[#1c1c1c] leading-none">
                {fmt(result.daily)}
              </span>
              <span className="text-[12px] text-[#5f5f5d]">max per day</span>
            </div>
          </div>
          <p className="text-[12px] text-[#5f5f5d] border-t border-passive pt-3 leading-relaxed">
            Estimates based on TfL 2024/25 Oyster/contactless fares. Actual fares vary by exact station and journey.{" "}
            <a
              href="https://tfl.gov.uk/fares"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              Check TfL's fare finder
            </a>{" "}
            for a precise quote.
          </p>
        </div>
      )}
    </div>
  );
}
