"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { generateErrorId, reportError } from "@/lib/firebase/crashlytics";

// Next.js augments Error with a digest that links back to the server log entry
interface NextError extends Error {
  digest?: string;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: NextError;
  reset: () => void;
}) {
  const [errorId] = useState(() => generateErrorId(error.digest));

  useEffect(() => {
    reportError(error, errorId, {
      path: typeof window !== "undefined" ? window.location.pathname : "",
    });
  }, [error, errorId]);

  const mailtoHref = `mailto:hello@budgetuk.io?subject=${encodeURIComponent(
    "Error report"
  )}&body=${encodeURIComponent(`Error ID: ${errorId}\nPage: ${typeof window !== "undefined" ? window.location.href : ""}`)}`;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      {/* 240×180 illustration placeholder */}
      <div
        aria-hidden="true"
        className="w-60 rounded-2xl bg-[var(--hover-tint)]"
        style={{ height: 180 }}
      />

      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="t-body-lg font-semibold text-[#1c1c1c]">
          Something&apos;s off — we&apos;ve been notified
        </h2>
        <p className="t-caption text-[#5f5f5d]">
          If this keeps happening, please let us know and we&apos;ll take a look.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="md" onClick={reset}>
          Try again
        </Button>
        <a
          href={mailtoHref}
          className="t-caption text-[#5f5f5d] underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
        >
          report this
        </a>
      </div>

      <p className="t-caption text-[#5f5f5d]/50 select-all">
        Error ID: {errorId}
      </p>
    </div>
  );
}
