import * as React from "react";
import { Header } from "@/components/features/Header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <main className="max-w-[720px] mx-auto px-6 py-24 md:py-32">
        <h1 className="t-h1 text-[#1c1c1c] tracking-tight mb-12 font-serif">Terms of Service</h1>
        
        <div className="space-y-8 t-body text-[#1c1c1c] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-serif mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing BudgetUK, you agree to comply with these community guidelines and terms. Our platform is designed to crowdsource the best value-for-money locations in London.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">2. Community Guidelines</h2>
            <p>
              Users are encouraged to submit real, verified budget spots. Any submissions found to be spam, fake, or intentionally misleading will be removed, and the associated user account may be suspended.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">3. Voting System</h2>
            <p>
              The community voting system is the heart of BudgetUK. Each user is entitled to one vote per submission. Attempts to manipulate vote counts via multiple accounts or automated scripts are strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">4. Content Ownership</h2>
            <p>
              By submitting content (descriptions, tips, photos) to BudgetUK, you grant us a non-exclusive, royalty-free license to display and distribute that content on our platform and marketing materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">5. Disclaimer</h2>
            <p>
              BudgetUK is a community-driven platform. While we strive for accuracy, we cannot guarantee the pricing or availability of services at the listed locations. Users should verify details independently.
            </p>
          </section>

          <section className="pt-8 border-t border-[var(--border-passive)]">
            <p className="text-[14px] text-[#5f5f5d]">
              Last updated: April 21, 2026. Happy mapping!
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
