"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(`/api/search/global?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setIsOpen(true);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (spot: any) => {
    const nbhSlug = spot.neighbourhood.toLowerCase().replace(/\s+/g, "-");
    router.push(`/${spot.city}/${nbhSlug}/${spot.slug}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-40">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5f5f5d] group-focus-within:text-[#1c1c1c] transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for 'Franco Manca' or 'Dalston'..."
          className="w-full bg-white border border-passive rounded-2xl pl-12 pr-4 py-4 text-[16px] outline-none focus:border-[#1c1c1c] focus:shadow-xl transition-all shadow-lg placeholder:text-[#5f5f5d]/60"
        />
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-passive rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="p-4 text-center text-[#5f5f5d] text-sm italic">Searching...</div>
          ) : (
            <div className="flex flex-col py-2">
              {results.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSelect(spot)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f4ed] text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#ede9e1] flex items-center justify-center text-sm">
                    📍
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#1c1c1c]">{spot.name}</span>
                    <span className="text-[12px] text-[#5f5f5d]">
                      {spot.neighbourhood} · {spot.city.charAt(0).toUpperCase() + spot.city.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
