import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About · BudgetUK",
  description:
    "BudgetUK is a community-powered map of the best budget spots across London — food, coffee, workspaces, and more.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 mt-16">
      <h1 className="t-h1 text-[#1c1c1c] mb-6">About BudgetUK</h1>

      <div className="flex flex-col gap-6 t-body text-[#1c1c1c]">
        <p>
          BudgetUK is a community-powered map of the best budget spots across
          London. We surface affordable food, coffee, workspaces, gyms,
          grocery stores, and more — all reviewed and voted on by people who
          actually live here.
        </p>

        <p>
          Every spot on the map has been submitted by a community member and
          promoted once it reaches 25 upvotes. Nothing is paid for or
          sponsored. If it&apos;s on the map, it earned its place.
        </p>

        <p>
          Know a hidden gem? Head to{" "}
          <Link href="/community/add" className="underline underline-offset-4 hover:text-[#5f5f5d]">
            Submit a Spot
          </Link>{" "}
          and help others find it.
        </p>

        <p className="t-caption text-[#5f5f5d]">
          Questions or feedback?{" "}
          <a
            href="mailto:hello@budgetuk.io"
            className="underline underline-offset-4 hover:text-[#1c1c1c]"
          >
            hello@budgetuk.io
          </a>
        </p>
      </div>
    </main>
  );
}
