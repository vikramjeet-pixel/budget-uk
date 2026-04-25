"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackFilterApplied } from "@/lib/analytics";

const PRICE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "£",    label: "£" },
  { value: "££",   label: "££" },
  { value: "£££",  label: "£££" },
  { value: "££££", label: "££££" },
];

const DIETARY_OPTIONS = [
  { value: "halal",        label: "Halal" },
  { value: "vegetarian",   label: "Vegetarian" },
  { value: "vegan",        label: "Vegan" },
  { value: "gluten-free",  label: "Gluten-free" },
  { value: "kosher",       label: "Kosher" },
];

const STUDENT_OPTIONS = [
  { value: "student-discount", label: "Student discount" },
  { value: "uniddays",         label: "UNiDAYS" },
  { value: "student-beans",    label: "Student Beans" },
];

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full text-left group"
    >
      <div
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
          checked
            ? "bg-[#1c1c1c] border-[#1c1c1c]"
            : "border-passive bg-white group-hover:border-[#1c1c1c]"
        )}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span
        className={cn(
          "text-[13px] transition-colors",
          checked ? "text-[#1c1c1c] font-medium" : "text-[#5f5f5d] group-hover:text-[#1c1c1c]"
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function PriceDietaryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const selectedPrices = React.useMemo(() => {
    const p = searchParams.get("price");
    return p ? p.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const selectedTags = React.useMemo(() => {
    const t = searchParams.get("tags");
    return t ? t.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const hasActiveFilters = selectedPrices.length > 0 || selectedTags.length > 0;

  const updateParams = (prices: string[], tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (prices.length > 0) {
      params.set("price", prices.join(","));
    } else {
      params.delete("price");
    }
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    } else {
      params.delete("tags");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const togglePrice = (value: string) => {
    const next = selectedPrices.includes(value)
      ? selectedPrices.filter(p => p !== value)
      : [...selectedPrices, value];
    updateParams(next, selectedTags);
    trackFilterApplied({ type: "price", value });
  };

  const toggleTag = (value: string) => {
    const next = selectedTags.includes(value)
      ? selectedTags.filter(t => t !== value)
      : [...selectedTags, value];
    updateParams(selectedPrices, next);
    trackFilterApplied({ type: "tag", value });
  };

  const clearAll = () => updateParams([], []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f7f4ed] border border-passive rounded-pill text-[14px] text-[#1c1c1c] shadow-inset-dark hover:bg-passive transition-colors">
          <span>Price & dietary</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1c] flex-shrink-0" />
          )}
          <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 w-[280px] bg-[#f7f4ed] border border-passive rounded-lg p-4 shadow-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1c1c1c] text-[14px]">Price & dietary</span>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="text-[12px] text-[#5f5f5d] underline hover:text-[#1c1c1c]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">Price</span>
              <div className="flex flex-col gap-2">
                {PRICE_OPTIONS.map(opt => (
                  <CheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={selectedPrices.includes(opt.value)}
                    onToggle={() => togglePrice(opt.value)}
                  />
                ))}
              </div>
            </div>

            <hr className="border-passive" />

            {/* Dietary */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">Dietary</span>
              <div className="flex flex-col gap-2">
                {DIETARY_OPTIONS.map(opt => (
                  <CheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={selectedTags.includes(opt.value)}
                    onToggle={() => toggleTag(opt.value)}
                  />
                ))}
              </div>
            </div>

            <hr className="border-passive" />

            {/* Student */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">Student</span>
              <div className="flex flex-col gap-2">
                {STUDENT_OPTIONS.map(opt => (
                  <CheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={selectedTags.includes(opt.value)}
                    onToggle={() => toggleTag(opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
