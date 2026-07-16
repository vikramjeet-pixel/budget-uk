import type { Metadata } from "next";
import { ExternalLink, Code2, UserCircle, MessageCircle, Mail, Globe, MapPin, Briefcase, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Me · BudgetUK",
  description:
    "Meet the person behind BudgetUK — learn about who I am, what I'm building, and how to connect.",
  alternates: { canonical: "/about-me" },
};

/* ─── placeholder data — swap these out with your real info ─── */

const PROFILE = {
  name: "Vikramjeet Singh",
  tagline: "Builder · Explorer · Budget Living Advocate",
  location: "United Kingdom",
  bio: [
    "I'm passionate about helping people live well on a budget. BudgetUK started as a personal project to map out the best affordable spots across UK cities — and it's grown into something much bigger.",
    "By day I'm a developer and entrepreneur. By night I'm exploring the next hidden gem café, free museum, or scenic walk that deserves to be on the map.",
    "I believe everyone deserves access to great experiences, regardless of their budget. That's the mission behind everything I build.",
  ],
};

const WHAT_IM_DOING = [
  {
    icon: "🗺️",
    title: "BudgetUK",
    description: "A community-powered map of the best budget-friendly spots across UK cities.",
  },
  {
    icon: "✍️",
    title: "Writing & Sharing",
    description: "Transport guides, neighbourhood reviews, and budget tips for students and founders.",
  },
  {
    icon: "🤝",
    title: "Community Building",
    description: "Growing a network of people who believe in living smarter, not just cheaper.",
  },
];

const LINKS: { label: string; url: string; icon: React.ReactNode; description: string }[] = [
  {
    label: "GitHub",
    url: "https://github.com/yourusername",
    icon: <Code2 className="w-4 h-4" />,
    description: "Check out my open-source projects and contributions.",
  },
  {
    label: "LinkedIn",
    url: "https://linkedin.com/in/yourusername",
    icon: <UserCircle className="w-4 h-4" />,
    description: "Connect with me professionally.",
  },
  {
    label: "Twitter / X",
    url: "https://x.com/yourusername",
    icon: <MessageCircle className="w-4 h-4" />,
    description: "Follow for updates, budget tips, and behind-the-scenes.",
  },
  {
    label: "Personal Website",
    url: "https://yourwebsite.com",
    icon: <Globe className="w-4 h-4" />,
    description: "My personal site with portfolio and blog.",
  },
  {
    label: "Email",
    url: "mailto:hello@budgetuk.io",
    icon: <Mail className="w-4 h-4" />,
    description: "Drop me a message — I read every email.",
  },
];

/* ─── page ─── */

export default function AboutMePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <main className="max-w-3xl mx-auto px-4 py-16 md:py-24 mt-4 flex flex-col gap-16">

        {/* ── Hero / Intro ── */}
        <header className="flex flex-col gap-6">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-[#2d5a4c] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            VS
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="t-h1 text-[#1c1c1c] tracking-tighter leading-tight">
              {PROFILE.name}
            </h1>
            <p className="text-[16px] text-[#5f5f5d] font-medium">
              {PROFILE.tagline}
            </p>
            <div className="flex items-center gap-1.5 text-[13px] text-[#5f5f5d]">
              <MapPin className="w-3.5 h-3.5" />
              {PROFILE.location}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {PROFILE.bio.map((paragraph, i) => (
              <p key={i} className="text-[15px] text-[#5f5f5d] leading-relaxed max-w-xl">
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        {/* ── What I'm Doing ── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-[#1c1c1c]" />
            <h2 className="text-[18px] font-semibold text-[#1c1c1c]">What I&apos;m Working On</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WHAT_IM_DOING.map((item) => (
              <article
                key={item.title}
                className="bg-[#fcfbf8] border border-[var(--border-passive)] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#1c1c1c]/20 transition-colors"
              >
                <span className="text-[24px] leading-none">{item.icon}</span>
                <h3 className="text-[15px] font-semibold text-[#1c1c1c]">{item.title}</h3>
                <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Values ── */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-[#1c1c1c]" />
            <h2 className="text-[18px] font-semibold text-[#1c1c1c]">What I Believe In</h2>
          </div>

          <div className="bg-[#fcfbf8] border border-[var(--border-passive)] rounded-2xl p-6">
            <ul className="flex flex-col gap-4">
              {[
                "Great experiences shouldn't be locked behind a premium price tag.",
                "Community knowledge beats any algorithm — real people know the real gems.",
                "Build in public, share openly, and help others along the way.",
                "The best tools are the ones that get out of your way and just work.",
              ].map((value) => (
                <li key={value} className="flex gap-3 items-start">
                  <span className="text-[#2d5a4c] mt-0.5 text-[14px]">✦</span>
                  <span className="text-[14px] text-[#5f5f5d] leading-relaxed">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Useful Links ── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-[#1c1c1c]" />
            <h2 className="text-[18px] font-semibold text-[#1c1c1c]">Links</h2>
          </div>

          <div className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="group flex items-center gap-4 bg-[#fcfbf8] border border-[var(--border-passive)] rounded-xl px-5 py-4 hover:border-[#1c1c1c]/30 hover:bg-[#f7f4ed] transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#ede9e1] flex items-center justify-center text-[#1c1c1c] shrink-0 group-hover:bg-[#1c1c1c] group-hover:text-[#fcfbf8] transition-colors">
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1c1c1c]">{link.label}</p>
                  <p className="text-[12px] text-[#5f5f5d] leading-relaxed">{link.description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#5f5f5d] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>

        {/* ── Footer note ── */}
        <footer className="border-t border-[var(--border-passive)] pt-8 pb-12">
          <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
            Thanks for stopping by. If you want to chat, collaborate, or just say hello — my inbox is always open.{" "}
            <a
              href="mailto:hello@budgetuk.io"
              className="underline underline-offset-4 hover:text-[#1c1c1c] transition-colors"
            >
              Get in touch →
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
