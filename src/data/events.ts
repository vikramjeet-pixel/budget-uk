export interface RecurringEvent {
  name: string;
  description: string;
  frequency: string;
  url?: string;
}

export interface EventSource {
  id: string;
  platform: string;
  tagline: string;
  description: string;
  url: string;
  events: RecurringEvent[];
}

export interface CommunityPerson {
  name: string;
  role: string;
  xHandle?: string;
  xUrl?: string;
  linkedinUrl?: string;
}

export const EVENT_SOURCES: EventSource[] = [
  {
    id: "luma",
    platform: "Luma",
    tagline: "Where London's tech scene lives online",
    description:
      "Luma has become the default event platform for London's startup and AI community. Follow the London calendar and you'll rarely miss a worthwhile founder dinner, demo night, or side event.",
    url: "https://lu.ma/london",
    events: [
      {
        name: "London AI Founders Dinners",
        description:
          "Intimate sit-down dinners for founders building AI-native products. Typically 20–30 people, hosted across central and east London venues. Applied or invited only — quality stays high.",
        frequency: "Monthly",
        url: "https://lu.ma/london-ai",
      },
      {
        name: "YC Alumni London",
        description:
          "Casual evening for current and former YC companies operating in the UK. Good mix of early-stage and growth-stage founders comparing notes on EU expansion and hiring.",
        frequency: "Quarterly",
      },
      {
        name: "Indie Hackers London",
        description:
          "Bootstrapped and semi-bootstrapped founders sharing revenue milestones, acquisition channels, and the realities of building without VC. Refreshingly honest crowd.",
        frequency: "Monthly",
      },
      {
        name: "Product Hunt London",
        description:
          "Makers showcase their latest launches to a live audience of early adopters and tech enthusiasts. Good for finding collaborators and early users.",
        frequency: "Monthly",
      },
      {
        name: "AI Safety & Alignment London",
        description:
          "Research-oriented meetup drawing from DeepMind, academic labs, and independent researchers. Talks range from technical alignment work to policy and governance.",
        frequency: "Monthly",
      },
    ],
  },
  {
    id: "meetup",
    platform: "Meetup",
    tagline: "London's longest-running tech communities",
    description:
      "Meetup.com hosts some of the most established technical communities in the city — many have been running for a decade. Attendance is free, venues rotate between Shoreditch, the City, and King's Cross.",
    url: "https://www.meetup.com/cities/gb/17/london/",
    events: [
      {
        name: "London Python Meetup",
        description:
          "One of the largest Python communities in Europe. Two or three talks per night — typically one beginner-friendly and one deep-dive. Sponsors include local and international tech companies.",
        frequency: "Monthly",
        url: "https://www.meetup.com/london-python/",
      },
      {
        name: "London Machine Learning Meetup",
        description:
          "Research and applied ML talks from practitioners at London startups, hedge funds, and academia. Often reaches capacity quickly — RSVP early.",
        frequency: "Monthly",
        url: "https://www.meetup.com/london-machine-learning-meetup/",
      },
      {
        name: "Startup Grind London",
        description:
          "Interview-style fireside chats with notable founders and operators. Part of the global Startup Grind network. Good for learning from people who've been through it.",
        frequency: "Monthly",
        url: "https://www.meetup.com/startup-grind-london/",
      },
      {
        name: "FinTech London",
        description:
          "Talks and panels covering open banking, crypto regulation, lending, and payments infrastructure. Draws founders, engineers, and people from the big banks' internal innovation labs.",
        frequency: "Monthly",
      },
      {
        name: "London React",
        description:
          "Talks and code demos from front-end engineers across London's product companies. Good mix of framework internals, DX tooling, and real production war stories.",
        frequency: "Monthly",
        url: "https://www.meetup.com/london-react/",
      },
    ],
  },
  {
    id: "eventbrite",
    platform: "Eventbrite",
    tagline: "Official London Tech Week and major annual events",
    description:
      "Eventbrite is where the larger and more structured London events — accelerator demo days, annual summits, and London Tech Week fringe — organise ticketing. Many are free; some flagship events charge.",
    url: "https://www.eventbrite.co.uk/d/united-kingdom--london/tech/",
    events: [
      {
        name: "London Tech Week Fringe",
        description:
          "June annually. The fringe runs alongside official LTW events and is often better — smaller venues, less polished, more candid. Find hundreds of side events scattered across EC1 and Shoreditch.",
        frequency: "Annual (June)",
        url: "https://londontechweek.com",
      },
      {
        name: "Imperial College & UCL Startup Showcases",
        description:
          "University-run demo days and pitch competitions. Strong for deep-tech, biotech, and climate ventures. Worth attending if you're looking for early co-founders or technical talent.",
        frequency: "Termly",
      },
      {
        name: "Global Entrepreneurship Week London",
        description:
          "November. Dozens of free events across the city — panels, workshops, and office tours. Quality varies, but the volume means you can find genuinely useful sessions.",
        frequency: "Annual (November)",
        url: "https://www.eventbrite.co.uk",
      },
      {
        name: "Sifted Summit",
        description:
          "European tech media Sifted's flagship event, usually held in London. Strong content track on deep tech and sustainability; good for meeting continental VCs.",
        frequency: "Annual",
      },
    ],
  },
  {
    id: "siliconmilkroundabout",
    platform: "Silicon Milkroundabout",
    tagline: "The startup jobs fair at Old Street",
    description:
      "Silicon Milkroundabout is the UK's most important tech jobs fair — twice a year at a venue near Old Street, it brings together London's fastest-growing startups hiring across engineering, product, and operations. Free to attend; companies pay to exhibit.",
    url: "https://www.siliconmilkroundabout.com",
    events: [
      {
        name: "Spring Jobs Fair",
        description:
          "Typically held in May. 80–100 exhibiting companies covering everything from Series A fintechs to pre-IPO growth-stage companies. Bring CVs; most engineers get multiple conversations in a single afternoon.",
        frequency: "Annual (May)",
      },
      {
        name: "Autumn Jobs Fair",
        description:
          "November edition. Slightly smaller than the spring fair but often features newer cohort companies fresh off summer funding rounds. Good for finding roles before they're posted publicly.",
        frequency: "Annual (November)",
      },
    ],
  },
  {
    id: "londonai",
    platform: "London AI",
    tagline: "The city's AI practitioner community",
    description:
      "London AI runs one of the most active applied-AI meetups in Europe. Events blend academic research, startup demos, and open discussion. The community has grown sharply since 2023 and now regularly draws 200+ attendees.",
    url: "https://www.meetup.com/london-ai/",
    events: [
      {
        name: "London AI Monthly Meetup",
        description:
          "The flagship event: two or three talks from practitioners (usually an academic lab, a startup, and a large company), followed by networking. The after-event pub session is often where the real conversations happen.",
        frequency: "Monthly",
        url: "https://www.meetup.com/london-ai/",
      },
      {
        name: "NLP London",
        description:
          "Deep dives into natural language processing, large language models, and retrieval systems. Audience skews towards engineers and researchers; expect dense technical content.",
        frequency: "Monthly",
      },
      {
        name: "AI in Healthcare London",
        description:
          "Focused on clinical applications, regulatory frameworks, and NHS partnerships. Draws from both the medtech startup world and clinical academia at King's and UCL.",
        frequency: "Bi-monthly",
      },
      {
        name: "Responsible AI London",
        description:
          "Governance, bias, and policy-adjacent discussions. Good for understanding the regulatory landscape — especially important if you're building anything consumer-facing or in regulated sectors.",
        frequency: "Quarterly",
      },
    ],
  },
  {
    id: "foundersfactory",
    platform: "Founders Factory",
    tagline: "Venture studio events for early-stage founders",
    description:
      "Founders Factory is a corporate-backed venture studio headquartered in London. They run open events through the year — practical rather than pitchy, with a genuine focus on helping pre-seed and seed founders.",
    url: "https://foundersfactory.com",
    events: [
      {
        name: "Founders Factory Demo Days",
        description:
          "Semi-annual showcase where portfolio companies present to investors, corporates, and press. A good signal for what verticals are getting traction in the studio model.",
        frequency: "Bi-annual",
        url: "https://foundersfactory.com/events",
      },
      {
        name: "Building in Public Evenings",
        description:
          "Informal sessions where early-stage founders share what they're working on and what they're stuck on. No decks, no polish — just honest progress updates and peer feedback.",
        frequency: "Monthly",
      },
      {
        name: "Corporate Innovation Panels",
        description:
          "Panel discussions on how large companies (typically Founders Factory partners) are working with startups. Useful if you're pursuing enterprise or B2B partnerships.",
        frequency: "Quarterly",
      },
    ],
  },
  {
    id: "ef",
    platform: "Entrepreneur First",
    tagline: "Pre-team, pre-idea company building",
    description:
      "Entrepreneur First selects individuals — not teams — and helps them find co-founders and build companies from scratch. Their London cohorts run twice a year. Open office hours and information sessions are the best way in if you're considering applying.",
    url: "https://www.joinef.com",
    events: [
      {
        name: "EF Open Office Hours",
        description:
          "Regular slots where EF partners and associates meet prospective applicants one-on-one. The best preparation for applying — you'll learn exactly what they look for and whether it's the right programme for your stage.",
        frequency: "Monthly",
        url: "https://www.joinef.com/events",
      },
      {
        name: "EF Demo Day",
        description:
          "At the end of each cohort, teams pitch to an audience of top-tier VCs and angels. Some of the UK's most interesting early companies have come out of these pitches.",
        frequency: "Bi-annual",
        url: "https://www.joinef.com/events",
      },
      {
        name: "EF Founder Talks",
        description:
          "Alumni of past cohorts share stories from their time in the programme and beyond. Honest about what works and what doesn't — a refreshing contrast to the usual founder mythology.",
        frequency: "Quarterly",
      },
    ],
  },
  {
    id: "tla",
    platform: "Tech London Advocates",
    tagline: "Policy and industry leadership for London tech",
    description:
      "Tech London Advocates is a network of 10,000+ tech leaders, operators, and investors advocating for the UK's tech sector. Their working groups (FinTech, AI, Cyber, Diversity) run policy-focused events that are unusually substantive.",
    url: "https://techlondonadvocates.org.uk",
    events: [
      {
        name: "TLA Annual Summit",
        description:
          "The flagship event: a full-day programme of policy debates, ministerial appearances, and industry announcements. Attracts senior figures from government, VC, and large-company C-suites.",
        frequency: "Annual",
        url: "https://techlondonadvocates.org.uk/events",
      },
      {
        name: "Working Group Sessions",
        description:
          "Vertical-specific roundtables (AI, FinTech, Climate, Cyber) where practitioners and policymakers work on position papers and industry responses. Apply to join a working group for ongoing access.",
        frequency: "Monthly (per group)",
        url: "https://techlondonadvocates.org.uk/working-groups",
      },
      {
        name: "Women in Tech London",
        description:
          "Events, mentorship programmes, and an annual report tracking progress on gender balance in the UK tech industry. Co-run with TLA's Women in Tech initiative.",
        frequency: "Monthly",
        url: "https://techlondonadvocates.org.uk/womenintech",
      },
      {
        name: "Scale-Up Summit",
        description:
          "Focused on Series B and beyond — talent, international expansion, late-stage fundraising. Less relevant for very early founders but valuable once you're at growth stage.",
        frequency: "Annual",
      },
    ],
  },
];

export const COMMUNITY_PEOPLE: CommunityPerson[] = [
  {
    name: "Matt Clifford",
    role: "CEO & co-founder of Entrepreneur First; UK Government AI Adviser",
    xHandle: "@matthewclifford",
    xUrl: "https://x.com/matthewclifford",
    linkedinUrl: "https://www.linkedin.com/in/matthewclifford/",
  },
  {
    name: "Alice Bentinck",
    role: "Co-founder of Entrepreneur First; one of the most connected people in London early-stage",
    xHandle: "@alicebentinck",
    xUrl: "https://x.com/alicebentinck",
    linkedinUrl: "https://www.linkedin.com/in/alicebentinck/",
  },
  {
    name: "Eileen Burbidge",
    role: "Partner at Passion Capital; former HM Treasury Special Envoy for FinTech",
    xHandle: "@eileentso",
    xUrl: "https://x.com/eileentso",
    linkedinUrl: "https://www.linkedin.com/in/eileenburbidge/",
  },
  {
    name: "Reshma Sohoni",
    role: "CEO & co-founder of Seedcamp, Europe's leading pre-seed fund",
    xHandle: "@ReshmaSohoni",
    xUrl: "https://x.com/ReshmaSohoni",
    linkedinUrl: "https://www.linkedin.com/in/resohoni/",
  },
  {
    name: "Azeem Azhar",
    role: "Founder of Exponential View; investor; the best newsletter in tech",
    xHandle: "@azeem",
    xUrl: "https://x.com/azeem",
    linkedinUrl: "https://www.linkedin.com/in/azhar/",
  },
  {
    name: "Brent Hoberman",
    role: "Co-founder of Founders Factory and lastminute.com; prolific early-stage angel",
    xHandle: "@brenthoberman",
    xUrl: "https://x.com/brenthoberman",
    linkedinUrl: "https://www.linkedin.com/in/brenthoberman/",
  },
  {
    name: "Eze Vidra",
    role: "General Partner at Remagine Ventures; former head of Google for Startups Europe",
    xHandle: "@ezevidra",
    xUrl: "https://x.com/ezevidra",
    linkedinUrl: "https://www.linkedin.com/in/ezevidra/",
  },
  {
    name: "Tom Blomfield",
    role: "Co-founder of Monzo; Group Partner at Y Combinator",
    xHandle: "@t_blom",
    xUrl: "https://x.com/t_blom",
    linkedinUrl: "https://www.linkedin.com/in/tomblomfield/",
  },
];
