"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, X, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LONDON_LOCATIONS } from "@/data/london-locations";

export function NeighbourhoodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const selectedNbhs = React.useMemo(() => {
    const nbh = searchParams.get("nbh");
    return nbh ? nbh.split(",") : [];
  }, [searchParams]);

  const selectedBoroughs = React.useMemo(() => {
    const bor = searchParams.get("bor");
    return bor ? bor.split(",") : [];
  }, [searchParams]);

  const updateFilters = (newNbhs: string[], newBors: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newNbhs.length > 0) {
      params.set("nbh", newNbhs.join(","));
    } else {
      params.delete("nbh");
    }

    if (newBors.length > 0) {
      params.set("bor", newBors.join(","));
    } else {
      params.delete("bor");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleNbh = (nbh: string) => {
    const next = selectedNbhs.includes(nbh)
      ? selectedNbhs.filter((n) => n !== nbh)
      : [...selectedNbhs, nbh];
    updateFilters(next, selectedBoroughs);
  };

  const toggleBorough = (boroughName: string) => {
    const next = selectedBoroughs.includes(boroughName)
      ? selectedBoroughs.filter((b) => b !== boroughName)
      : [...selectedBoroughs, boroughName];
    updateFilters(selectedNbhs, next);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("nbh");
    params.delete("bor");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#f7f4ed] border border-[var(--border-passive)] rounded-[9999px] text-[14px] text-[#1c1c1c] shadow-[var(--inset-dark)] hover:bg-[var(--border-passive)] transition-colors">
            <span>Neighbourhoods</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="z-50 w-[320px] max-h-[480px] overflow-y-auto bg-[#f7f4ed] border border-[var(--border-passive)] rounded-[12px] p-4 shadow-xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1c1c1c]">Filter by area</span>
                {(selectedNbhs.length > 0 || selectedBoroughs.length > 0) && (
                  <button 
                    onClick={clearAll}
                    className="text-[12px] text-[#5f5f5d] underline hover:text-[#1c1c1c]"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {LONDON_LOCATIONS.map((borough) => (
                  <div key={borough.name} className="space-y-3">
                    <button
                      onClick={() => toggleBorough(borough.name)}
                      className="flex items-center gap-2 w-full text-left group"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        selectedBoroughs.includes(borough.name) 
                          ? "bg-[#1c1c1c] border-[#1c1c1c]" 
                          : "border-[var(--border-passive)] bg-white group-hover:border-[#1c1c1c]"
                      )}>
                        {selectedBoroughs.includes(borough.name) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-[14px] font-bold text-[#1c1c1c]">{borough.name}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-6">
                      {borough.neighbourhoods.map((nbh) => (
                        <button
                          key={nbh}
                          onClick={() => toggleNbh(nbh)}
                          className="flex items-center gap-2 group text-left"
                        >
                          <div className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                            selectedNbhs.includes(nbh) 
                              ? "bg-[#1c1c1c] border-[#1c1c1c]" 
                              : "border-[var(--border-passive)] bg-white group-hover:border-[#1c1c1c]"
                          )}>
                            {selectedNbhs.includes(nbh) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={cn(
                            "text-[13px] transition-colors",
                            selectedNbhs.includes(nbh) ? "text-[#1c1c1c] font-medium" : "text-[#5f5f5d] group-hover:text-[#1c1c1c]"
                          )}>
                            {nbh}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Selected Pills */}
      <div className="flex flex-wrap gap-2">
        {selectedBoroughs.map((bor) => (
          <div 
            key={`bor-${bor}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1c] text-[#f7f4ed] rounded-[9999px] text-[12px] font-medium animate-in fade-in slide-in-from-left-2"
          >
            <span>{bor}</span>
            <button onClick={() => toggleBorough(bor)} className="hover:text-white/80 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {selectedNbhs.map((nbh) => (
          <div 
            key={`nbh-${nbh}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f4ed] border border-[var(--border-passive)] text-[#1c1c1c] rounded-[9999px] text-[12px] font-medium shadow-sm animate-in fade-in slide-in-from-left-2"
          >
            <span>{nbh}</span>
            <button onClick={() => toggleNbh(nbh)} className="hover:text-[#5f5f5d] transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
