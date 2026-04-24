"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ArrowUpDown, Check, LocateFixed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type SortKey = "popular" | "nearest" | "cheapest" | "newest";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular",  label: "Most popular" },
  { value: "nearest",  label: "Nearest" },
  { value: "cheapest", label: "Cheapest" },
  { value: "newest",   label: "Newest" },
];

interface SortDropdownProps {
  isNearestAvailable: boolean;
  onNearestRequest: () => void;
}

export function SortDropdown({ isNearestAvailable, onNearestRequest }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const currentSort = (searchParams.get("sort") as SortKey) || "popular";
  const currentLabel = OPTIONS.find(o => o.value === currentSort)?.label ?? "Most popular";

  const setSort = (value: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  const handleSelect = (value: SortKey) => {
    if (value === "nearest" && !isNearestAvailable) {
      onNearestRequest();
    }
    setSort(value);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f7f4ed] border border-passive rounded-pill text-[14px] text-[#1c1c1c] shadow-inset-dark hover:bg-passive transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
          <span>{currentLabel}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-52 bg-[#f7f4ed] border border-passive rounded-lg p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col gap-0.5">
            {OPTIONS.map(opt => {
              const isSelected = opt.value === currentSort;
              const needsLocation = opt.value === "nearest" && !isNearestAvailable;

              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-sm text-[13px] text-left transition-colors",
                    isSelected
                      ? "bg-[#1c1c1c] text-[#fcfbf8]"
                      : "text-[#1c1c1c] hover:bg-passive"
                  )}
                >
                  <span>{opt.label}</span>
                  <span className="flex items-center gap-1.5">
                    {needsLocation && (
                      <LocateFixed className="w-3 h-3 text-[#5f5f5d]" />
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
