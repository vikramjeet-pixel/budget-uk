import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#f7f4ed] border border-passive flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#1c1c1c]" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="t-h2 text-[#1c1c1c] tracking-tight">Thanks for your submission!</h1>
          <p className="t-body text-[#5f5f5d] leading-relaxed">
            Your spot needs <span className="font-semibold text-[#1c1c1c]">25 community votes</span> to go
            live on the map. Share it with friends to speed things up.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/community" className="flex-1">
            <Button variant="primary" className="w-full">
              See community queue
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="ghost" className="w-full">
              Back to map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
