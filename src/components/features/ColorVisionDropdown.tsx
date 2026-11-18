"use client";

import * as React from "react";
import { Check, ChevronDown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COLOR_VISION_OPTIONS,
  VISION_GROUP_SWATCHES,
  setColorVisionMode,
  type ColorVisionMode,
} from "@/lib/colorVision";
import { useColorVision } from "@/hooks/useColorVision";

interface ColorVisionDropdownProps {
  className?: string;
  /** Popup alignment relative to the trigger. */
  align?: "start" | "end";
  /** Hide the text label on the trigger (icon-only). */
  compact?: boolean;
}

export function ColorVisionDropdown({ className, align = "end", compact = false }: ColorVisionDropdownProps) {
  const mode = useColorVision();
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const optionRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const id = React.useId();
  const listboxId = `${id}-listbox`;
  const current = COLOR_VISION_OPTIONS.find((o) => o.value === mode) ?? COLOR_VISION_OPTIONS[0];

  const openMenu = (index?: number) => {
    const selected = COLOR_VISION_OPTIONS.findIndex((o) => o.value === mode);
    setActiveIndex(index ?? Math.max(selected, 0));
    setOpen(true);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (value: ColorVisionMode) => {
    setColorVisionMode(value);
    close();
  };

  // Move DOM focus to the active option while open.
  React.useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu(e.key === "ArrowUp" ? COLOR_VISION_OPTIONS.length - 1 : undefined);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const last = COLOR_VISION_OPTIONS.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i >= last ? 0 : i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? last : i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(COLOR_VISION_OPTIONS[activeIndex].value);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Colour vision mode: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex items-center gap-2 h-9 rounded-pill border border-[var(--border-passive)] bg-[#ede9e1] text-[#1c1c1c] text-[13px] font-medium",
          "hover:bg-[#f0ede6] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c1c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ed]",
          compact ? "w-9 justify-center" : "px-3"
        )}
      >
        <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
        {!compact && (
          <>
            <span className="max-w-[120px] truncate">{current.label}</span>
            <ChevronDown
              className={cn("w-3.5 h-3.5 shrink-0 transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Colour vision mode"
          onKeyDown={onListKeyDown}
          className={cn(
            "absolute z-[70] mt-2 w-72 max-h-[70vh] overflow-y-auto rounded-lg border border-[var(--border-passive)] bg-[#f7f4ed] p-1.5 shadow-xl",
            "animate-in fade-in zoom-in-95 duration-150",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          <li role="presentation" className="px-2.5 pt-1.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#5f5f5d]">
            Colour vision
          </li>
          {COLOR_VISION_OPTIONS.map((opt, index) => {
            const selected = opt.value === mode;
            const swatches = VISION_GROUP_SWATCHES[opt.group];
            return (
              <li
                key={opt.value}
                id={`${id}-opt-${index}`}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                role="option"
                aria-selected={selected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => select(opt.value)}
                onMouseMove={() => activeIndex !== index && setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 cursor-pointer outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-[#1c1c1c] focus-visible:ring-inset",
                  selected ? "bg-[#1c1c1c] text-[#fcfbf8]" : "text-[#1c1c1c] hover:bg-[#ede9e1] focus:bg-[#ede9e1]"
                )}
              >
                {/* Palette preview: accent · danger · success */}
                <span className="flex shrink-0 -space-x-1" aria-hidden="true">
                  {swatches.map((c, i) => (
                    <span
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5 rounded-full border",
                        selected ? "border-[#fcfbf8]" : "border-[#1c1c1c]/30"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">{opt.label}</span>
                  <span className={cn("block text-[11px] leading-tight mt-0.5", selected ? "text-[#fcfbf8]/80" : "text-[#5f5f5d]")}>
                    {opt.description}
                  </span>
                </span>
                {selected && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ColorVisionDropdown;
