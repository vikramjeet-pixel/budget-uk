import * as React from "react";
import { Header } from "@/components/features/Header";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <main className="max-w-[720px] mx-auto px-6 py-24 md:py-32">
        <h1 className="t-h1 text-[#1c1c1c] tracking-tight mb-12 font-serif">Privacy Policy</h1>
        
        <div className="space-y-8 t-body text-[#1c1c1c] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold font-serif mb-4">1. Data Collection</h2>
            <p>
              BudgetUK uses Firebase (by Google) to manage authentication and data storage. We collect your email address and display name only when you choose to create an account. This information is used strictly for authentication and to attribute your community contributions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">2. Usage of Location Data</h2>
            <p>
              We request access to your device's location to show nearby budget spots. This data is processed locally on your device and is not stored on our servers unless you explicitly submit a new spot with location details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">3. Community Contributions</h2>
            <p>
              When you submit a budget spot, the information you provide (name, description, tips) becomes public. We associate these contributions with your user account to maintain the integrity of our voting and verification system.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">4. Cookies and Tracking</h2>
            <p>
              We use fundamental cookies required for Firebase Authentication to keep you logged in. We do not use third-party tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif mb-4">5. Your Rights</h2>
            <p>
              You can request to delete your account and all associated personal data at any time by contacting our support team or using the profile settings (coming soon).
            </p>
          </section>

          <section className="pt-8 border-t border-[var(--border-passive)]">
            <p className="text-[14px] text-[#5f5f5d]">
              Last updated: April 21, 2026. For questions, contact privacy@budgetuk.io
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
