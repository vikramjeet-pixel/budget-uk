import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  cta?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
}

/**
 * Shared empty-state block.
 * Reserves a 240×180 slot for a future illustration.
 * CTA renders as a Link when ctaHref is provided, otherwise a button.
 */
export function EmptyState({ message, cta, ctaHref, ctaOnClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      {/* 240×180 illustration placeholder */}
      <div
        aria-hidden="true"
        className="w-60 rounded-2xl bg-[var(--hover-tint)] flex items-center justify-center text-[11px] text-[#5f5f5d]/50 tracking-wider uppercase"
        style={{ height: 180 }}
      >
        Illustration
      </div>

      <p className="t-body-lg text-[#5f5f5d] max-w-sm">{message}</p>

      {cta && (
        ctaHref ? (
          <Link href={ctaHref}>
            <Button variant="ghost" size="md">{cta}</Button>
          </Link>
        ) : (
          <Button variant="ghost" size="md" onClick={ctaOnClick}>{cta}</Button>
        )
      )}
    </div>
  );
}
