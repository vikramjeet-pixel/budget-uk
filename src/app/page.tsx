"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES, City } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Search, MapPin, X, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

// ─── Coming Soon Modal ───────────────────────────────────────────────────────

function ComingSoonModal({ 
  city, 
  open, 
  onOpenChange 
}: { 
  city: City | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  if (!city) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#1c1c1c]/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-passive bg-[#fcfbf8] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#f7f4ed] border border-passive flex items-center justify-center text-3xl">
              📍
            </div>
            <div className="flex flex-col gap-2">
              <Dialog.Title className="t-h2 text-[#1c1c1c]">
                {city.name} is coming soon
              </Dialog.Title>
              <p className="t-body text-[#5f5f5d]">
                We&apos;re currently mapping the best value food, coffee, and workspaces in {city.name}. 
                Join 5,000+ members to get notified when we launch.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <Input placeholder="your@email.com" className="text-center" />
              <Button variant="primary" className="w-full" onClick={() => onOpenChange(false)}>
                Notify me
              </Button>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Global Search ────────────────────────────────────────────────────────────

function GlobalSearchBar() {
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

// ─── Main Directory Page ──────────────────────────────────────────────────────

export default function DirectoryPage() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCityClick = (city: City) => {
    if (city.comingSoon) {
      setSelectedCity(city);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 px-4 bg-gradient-to-b from-[#f7f4ed] to-[#fcfbf8]">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 py-1 px-4 border-[#1c1c1c]/10 text-[#5f5f5d] bg-white/50 backdrop-blur-sm">
            Now expanding across the UK
          </Badge>
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter mb-6">
            BudgetUK — Cheap Spots<br />
            <span className="text-[#5f5f5d]">Across the UK</span>
          </h1>
          <p className="t-body text-[#5f5f5d] max-w-2xl mx-auto text-lg mb-12">
            For students, founders, and budget explorers. Explore the best value food, coffee, workspaces, and more, curated by locals.
          </p>

          <GlobalSearchBar />
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-pink-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-10 border-b border-passive pb-4">
          <h2 className="text-[20px] font-bold text-[#1c1c1c]">Select a City</h2>
          <span className="text-[14px] text-[#5f5f5d]">{CITIES.length} cities available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CITIES.map((city) => (
            <div 
              key={city.slug} 
              className="group"
              onClick={() => handleCityClick(city)}
            >
              <Card className={`h-full overflow-hidden transition-all duration-300 border-passive bg-white flex flex-col ${!city.comingSoon ? "hover:border-[#1c1c1c] hover:shadow-xl cursor-pointer" : "opacity-75 cursor-pointer"}`}>
                {/* City Image Placeholder */}
                <div className="aspect-[4/3] bg-[#ede9e1] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-500">
                    🏛️
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {!city.comingSoon && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#1c1c1c] text-[#f7f4ed] rounded-[8px] px-2 py-0.5 text-[10px] font-bold tracking-widest border-none">
                        LIVE
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-bold text-[#1c1c1c] group-hover:translate-x-1 transition-transform">{city.name}</h3>
                    {!city.comingSoon && <ArrowRight className="w-4 h-4 text-[#1c1c1c] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
                  </div>
                  
                  {city.comingSoon ? (
                    <span className="text-[13px] text-[#5f5f5d]/60 font-medium">Coming soon</span>
                  ) : (
                    <span className="text-[13px] text-[#5f5f5d]">
                      {city.neighbourhoods.length} neighbourhoods
                    </span>
                  )}
                </div>

                {!city.comingSoon && (
                  <Link href={`/${city.slug}/spots`} className="absolute inset-0 z-10" />
                )}
              </Card>
            </div>
          ))}
        </div>
      </main>

      <ComingSoonModal 
        city={selectedCity} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}

