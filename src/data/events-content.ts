import { EventSource, CommunityPerson } from "./events";

export interface CityEventsContent {
  title: string;
  description: string;
  sources: EventSource[];
  people: CommunityPerson[];
}

export const EVENTS_CONTENT: Record<string, CityEventsContent> = {
  london: {
    title: "London Tech Events",
    description: "A hand-curated guide to recurring tech events, founder meetups, and communities in London.",
    sources: [
      {
        id: "luma",
        platform: "Luma",
        tagline: "Where London's tech scene lives online",
        description: "Luma has become the default event platform for London's startup and AI community.",
        url: "https://lu.ma/london",
        events: [
          {
            name: "London AI Founders Dinners",
            description: "Intimate sit-down dinners for founders building AI-native products.",
            frequency: "Monthly",
            url: "https://lu.ma/london-ai",
          },
          {
            name: "YC Alumni London",
            description: "Casual evening for current and former YC companies operating in the UK.",
            frequency: "Quarterly",
          }
        ]
      },
      {
        id: "ef",
        platform: "Entrepreneur First",
        tagline: "Pre-team, pre-idea company building",
        description: "EF selects individuals and helps them find co-founders and build companies from scratch.",
        url: "https://www.joinef.com",
        events: [
          {
            name: "EF Open Office Hours",
            description: "Regular slots where EF partners meet prospective applicants.",
            frequency: "Monthly",
            url: "https://www.joinef.com/events",
          }
        ]
      },
      {
        id: "tla",
        platform: "Tech London Advocates",
        tagline: "Policy and industry leadership",
        description: "A network of 10,000+ tech leaders advocating for the UK's tech sector.",
        url: "https://techlondonadvocates.org.uk",
        events: [
          {
            name: "TLA Annual Summit",
            description: "Flagship event of policy debates and industry announcements.",
            frequency: "Annual",
          }
        ]
      }
    ],
    people: [
      {
        name: "Matt Clifford",
        role: "CEO & co-founder of Entrepreneur First; UK Government AI Adviser",
        xHandle: "@matthewclifford",
        xUrl: "https://x.com/matthewclifford",
        linkedinUrl: "https://www.linkedin.com/in/matthewclifford/",
      }
    ]
  },
  manchester: {
    title: "Manchester Tech Events",
    description: "The best tech meetups, founder communities, and networking events in Manchester.",
    sources: [
      {
        id: "manchester-tech-hub",
        platform: "Manchester Tech Hub",
        tagline: "The heart of the North's tech scene",
        description: "Manchester's central platform for digital and tech community events.",
        url: "https://manchestertechhub.co.uk",
        events: [
          {
            name: "Digital City Festival",
            description: "A week-long celebration of the North's digital economy.",
            frequency: "Annual",
          },
          {
            name: "Manchester Tech Nights",
            description: "Evening meetups at Manchester Technology Centre featuring local startup demos.",
            frequency: "Monthly",
          }
        ]
      },
      {
        id: "tech-manchester",
        platform: "Tech Manchester",
        tagline: "Supporting the city's tech ecosystem",
        description: "Providing mentoring, workshops, and support for tech businesses in Greater Manchester.",
        url: "https://techmanchester.co.uk",
        events: [
          {
            name: "Mentor Matching Nights",
            description: "Connect with experienced tech leaders for structured mentorship.",
            frequency: "Quarterly",
          }
        ]
      }
    ],
    people: [
      {
        name: "Mo Isap",
        role: "CEO of IN4 Group; major advocate for Manchester's digital skills.",
        linkedinUrl: "https://www.linkedin.com/in/mo-isap/",
      }
    ]
  },
  birmingham: {
    title: "Birmingham Tech Events",
    description: "Curated guide to Birmingham's tech meetups and founder networks.",
    sources: [
      {
        id: "innovation-bham",
        platform: "Innovation Birmingham",
        tagline: "The Midlands' leading digital campus",
        description: "Part of Bruntwood SciTech, hosting the city's most active tech clusters.",
        url: "https://bruntwood.co.uk/scitech/innovation-birmingham/",
        events: [
          {
            name: "Campus Catch-ups",
            description: "Informal networking for the 150+ startups based at the campus.",
            frequency: "Weekly",
          }
        ]
      },
      {
        id: "voscur",
        platform: "Voscur (Tech Focus)",
        tagline: "Tech for good and social impact",
        description: "While primarily Bristol-based, their Birmingham tech-for-good events are legendary.",
        url: "https://www.voscur.org",
        events: [
          {
            name: "Social Impact Tech Nights",
            description: "Showcasing tech solutions for local community challenges.",
            frequency: "Monthly",
          }
        ]
      }
    ],
    people: [
      {
        name: "Yiannis Maos",
        role: "CEO of Birmingham Tech; advocate for the West Midlands ecosystem.",
        linkedinUrl: "https://www.linkedin.com/in/yiannismaos/",
      }
    ]
  },
  edinburgh: {
    title: "Edinburgh Tech Events",
    description: "Guide to the Scottish capital's tech meetups and innovation hubs.",
    sources: [
      {
        id: "techedinburgh",
        platform: "TechEdinburgh",
        tagline: "Scotland's tech gateway",
        description: "The primary community for Edinburgh's high-growth tech sector.",
        url: "https://techedinburgh.com",
        events: [
          {
            name: "CodeBase Open Mornings",
            description: "Tour the UK's largest tech incubator and meet local founders.",
            frequency: "Monthly",
          }
        ]
      },
      {
        id: "scvo",
        platform: "SCVO Tech",
        tagline: "Digital transformation in the third sector",
        description: "Leading events on how tech is changing Scotland's non-profit landscape.",
        url: "https://scvo.scot",
        events: [
          {
            name: "DigiShift",
            description: "Collaborative calls on digital evolution in the Scottish voluntary sector.",
            frequency: "Fortnightly",
          }
        ]
      }
    ],
    people: [
      {
        name: "Gareth Williams",
        role: "Founder of Skyscanner; active angel and mentor in the Scottish scene.",
        linkedinUrl: "https://www.linkedin.com/in/garethwilliams/",
      }
    ]
  },
  glasgow: {
    title: "Glasgow Tech Events",
    description: "Discover Glasgow's thriving tech and startup community.",
    sources: [
      {
        id: "g2-network",
        platform: "G2 Network",
        tagline: "Connecting Glasgow's innovators",
        description: "Peer-to-peer network for Glasgow's entrepreneurs and tech leaders.",
        url: "https://g2-network.com",
        events: [
          {
            name: "G2 Coffee Mornings",
            description: "Casual networking at the Tontine for Glasgow's high-growth teams.",
            frequency: "Monthly",
          }
        ]
      },
      {
        id: "scottie-tech",
        platform: "Scottie Tech",
        tagline: "Scotland's digital pulse",
        description: "Deep-dives into Glasgow's engineering and product scene.",
        url: "https://scottie.tech",
        events: [
          {
            name: "Glasgow Product Nights",
            description: "Demos and talks from Glasgow's leading product companies.",
            frequency: "Bi-monthly",
          }
        ]
      }
    ],
    people: [
      {
        name: "Vicky Brock",
        role: "CEO of Vistalworks; prominent figure in Glasgow's tech-for-good space.",
        linkedinUrl: "https://www.linkedin.com/in/vickybrock/",
      }
    ]
  }
};
