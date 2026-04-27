import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div
        aria-hidden="true"
        className="w-60 rounded-2xl bg-[var(--hover-tint)]"
        style={{ height: 180 }}
      />

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="t-body-lg font-semibold text-[#1c1c1c]">
          Page not found
        </h1>
        <p className="t-caption text-[#5f5f5d]">
          This page doesn&apos;t exist. It may have moved or been removed.
        </p>
      </div>

      <Link href="/">
        <Button variant="ghost">Back to home</Button>
      </Link>
    </div>
  );
}
