// Opening-hours helpers -------------------------------------------------------

export interface Period {
  /** JS day numbers: 0 = Sunday, 1 = Monday … 6 = Saturday */
  days: number[];
  open: string;  // "HH:MM" 24-h
  close: string; // "HH:MM" 24-h — use "00:00" for midnight
}

export interface Hours {
  periods: Period[];
  note?: string;
}

export const ALWAYS_OPEN: Hours = { periods: [] };

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(hours: Hours): boolean {
  // No periods = always open (parks, outdoor walks)
  if (hours.periods.length === 0) return true;

  const d = new Date();
  const day = d.getDay();
  const mins = d.getHours() * 60 + d.getMinutes();

  return hours.periods.some((p) => {
    if (!p.days.includes(day)) return false;
    const open = toMins(p.open);
    const close = toMins(p.close) || 24 * 60; // "00:00" treated as midnight
    return mins >= open && mins < close;
  });
}

/**
 * Parse a Google Places weekday_text line like
 * "Monday: 10:00 AM – 5:30 PM" or "Monday: Open 24 hours" or "Monday: Closed"
 */
export function isOpenNowFromPlacesText(weekdayText: string[]): boolean | null {
  const DAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const d = new Date();
  const dayName = DAY[d.getDay()];
  const mins = d.getHours() * 60 + d.getMinutes();

  const line = weekdayText.find((t) => t.startsWith(dayName));
  if (!line) return null;

  const rest = line.slice(dayName.length + 2).trim();
  if (rest === "Closed") return false;
  if (rest.includes("24 hours")) return true;

  const parts = rest.split("–").map((s) => s.trim());
  if (parts.length !== 2) return null;

  const parse = (s: string): number => {
    const [time, ampm] = s.split(" ");
    const [h, m] = time.split(":").map(Number);
    let hour = h;
    if (ampm === "PM" && h !== 12) hour += 12;
    if (ampm === "AM" && h === 12) hour = 0;
    return hour * 60 + (m || 0);
  };

  return mins >= parse(parts[0]) && mins < parse(parts[1]);
}

// Section / entry types -------------------------------------------------------

export interface FreeEntry {
  id: string;
  name: string;
  description: string;
  address: string;
  hours: Hours;
  note?: string;
  url: string;
  bookingRequired?: boolean;
}

export interface FreeSection {
  id: string;
  title: string;
  icon: string;
  intro: string;
  entries: FreeEntry[];
}

// ── MON-SUN shorthand ─────────────────────────────────────────────────────────
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

// ── Editorial sections ────────────────────────────────────────────────────────

export const FREE_SECTIONS: FreeSection[] = [
  {
    id: "museums",
    title: "Free Museums",
    icon: "🏛️",
    intro:
      "London's national museums are permanently free — an extraordinary privilege. Most have a suggested donation; none require it. All are in Zone 1.",
    entries: [
      {
        id: "british-museum",
        name: "British Museum",
        description:
          "Eight million objects spanning two million years. The Rosetta Stone, Elgin Marbles, Lewis Chessmen — no single visit covers it. Plan by gallery and come back.",
        address: "Great Russell St, London WC1B 3DG",
        hours: {
          periods: [
            { days: EVERY_DAY, open: "10:00", close: "17:00" },
            { days: [5], open: "10:00", close: "20:30" }, // Friday late
          ],
        },
        url: "https://www.britishmuseum.org",
      },
      {
        id: "va",
        name: "Victoria & Albert Museum",
        description:
          "The world's largest museum of applied arts — furniture, fashion, ceramics, photography, and architecture across 145 galleries. Friday evenings are quieter and atmospheric.",
        address: "Cromwell Rd, London SW7 2RL",
        hours: {
          periods: [
            { days: [0, 1, 2, 3, 6], open: "10:00", close: "17:45" },
            { days: [5], open: "10:00", close: "22:00" }, // Friday late
          ],
        },
        url: "https://www.vam.ac.uk",
      },
      {
        id: "tate-modern",
        name: "Tate Modern",
        description:
          "Free permanent collection across two buildings on the South Bank. Warhol, Picasso, Beuys, Rothko. The Turbine Hall commissions are unmissable and always surprising.",
        address: "Bankside, London SE1 9TG",
        hours: {
          periods: [
            { days: [0, 1, 2, 3, 4], open: "10:00", close: "18:00" },
            { days: [5, 6], open: "10:00", close: "22:00" },
          ],
        },
        url: "https://www.tate.org.uk/visit/tate-modern",
      },
      {
        id: "tate-britain",
        name: "Tate Britain",
        description:
          "The home of British art from 1500 to now — Turner, Constable, Hockney, and the Turner Prize. Less crowded than Tate Modern; the pre-Raphaelite room alone is worth the trip.",
        address: "Millbank, London SW1P 4RG",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "18:00" }],
        },
        url: "https://www.tate.org.uk/visit/tate-britain",
      },
      {
        id: "national-gallery",
        name: "National Gallery",
        description:
          "2,300 paintings from 1250 to 1900 on Trafalgar Square. Van Eyck, Vermeer, Rembrandt, Monet, Seurat — all in a building you can walk into for free at any time.",
        address: "Trafalgar Square, London WC2N 5DN",
        hours: {
          periods: [
            { days: [0, 1, 2, 3, 4, 6], open: "10:00", close: "18:00" },
            { days: [5], open: "10:00", close: "21:00" },
          ],
        },
        url: "https://www.nationalgallery.org.uk",
      },
      {
        id: "science-museum",
        name: "Science Museum",
        description:
          "Space, technology, medicine, and industry across seven floors. The Spaceport flight simulator costs extra but the permanent collection — including the Apollo 10 command module — is free.",
        address: "Exhibition Rd, London SW7 2DD",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "18:00" }],
          note: "Last entry 17:15",
        },
        url: "https://www.sciencemuseum.org.uk",
      },
      {
        id: "nhm",
        name: "Natural History Museum",
        description:
          "Eighty million specimens, a full-size blue whale, and the famous Hope the whale in the Hintze Hall. Book a timed-entry slot online for weekends to avoid the queue.",
        address: "Cromwell Rd, London SW7 5BD",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "18:00" }],
          note: "Last entry 17:30",
        },
        url: "https://www.nhm.ac.uk",
      },
      {
        id: "iwm",
        name: "Imperial War Museum",
        description:
          "War through human stories: two world wars, Holocaust, post-1945 conflicts, and a Spitfire suspended above you when you walk in. Moving and genuinely well-curated.",
        address: "Lambeth Rd, London SE1 6HZ",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "18:00" }],
        },
        url: "https://www.iwm.org.uk/visits/iwm-london",
      },
      {
        id: "wallace",
        name: "Wallace Collection",
        description:
          "Exceptional European art in a Manchester Square townhouse — Vermeer, Hals' Laughing Cavalier, French 18th-century furniture. Feels undiscovered despite being extraordinary.",
        address: "Hertford House, Manchester Square, London W1U 3BN",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "17:00" }],
        },
        url: "https://www.wallacecollection.org",
      },
      {
        id: "horniman",
        name: "Horniman Museum",
        description:
          "Wonderfully eclectic South London museum: natural history, musical instruments, world cultures, and a beloved aquarium. The gardens are free and have great city views.",
        address: "100 London Rd, London SE23 3PQ",
        hours: {
          periods: [
            { days: WEEKDAYS, open: "10:00", close: "17:30" },
            { days: WEEKEND, open: "11:00", close: "17:30" },
          ],
          note: "Aquarium charges entry; museum free",
        },
        url: "https://www.horniman.ac.uk",
      },
    ],
  },
  {
    id: "parks",
    title: "Free Parks & Viewpoints",
    icon: "🌳",
    intro:
      "London's Royal Parks are among the best free spaces in any world city. Several hilltop viewpoints give skyline views that rival any paid attraction.",
    entries: [
      {
        id: "sky-garden",
        name: "Sky Garden",
        description:
          "A free public garden at the top of the 20 Fenchurch Street 'Walkie-Talkie' building, with 360° views across the city. The bar charges for drinks but entry is always free.",
        address: "1 Sky Garden Walk, London EC3M 8AF",
        hours: {
          periods: [
            { days: WEEKDAYS, open: "10:00", close: "18:00" },
            { days: WEEKEND, open: "11:00", close: "21:00" },
          ],
          note: "Pre-booking essential — slots fill weeks ahead",
        },
        bookingRequired: true,
        url: "https://skygarden.london",
      },
      {
        id: "primrose-hill",
        name: "Primrose Hill",
        description:
          "The most cinematic skyline view in London — north London hills, the City towers, the BT Tower, and Canary Wharf all in one frame. Sunrise and sunset are peak times.",
        address: "Primrose Hill, London NW1 4NR",
        hours: ALWAYS_OPEN,
        url: "https://www.royalparks.org.uk/parks/the-regents-park/things-to-see-and-do/primrose-hill",
      },
      {
        id: "parliament-hill",
        name: "Parliament Hill, Hampstead Heath",
        description:
          "Higher than Primrose Hill, with a broader, wilder feel. The Heath extends for miles behind you — ponds, woodland, and the Kenwood estate are all free.",
        address: "Parliament Hill, London NW5 1QR",
        hours: ALWAYS_OPEN,
        url: "https://www.cityoflondon.gov.uk/things-to-do/green-spaces/hampstead-heath",
      },
      {
        id: "greenwich-park",
        name: "Greenwich Park",
        description:
          "Stand on the meridian line for free at the Royal Observatory. Views across Canary Wharf and the Thames from the hill are some of the best in the city. The deer park closes at dusk.",
        address: "Greenwich Park, London SE10 8QY",
        hours: {
          periods: [{ days: EVERY_DAY, open: "06:00", close: "21:00" }],
          note: "Closing time varies seasonally with sunset",
        },
        url: "https://www.royalparks.org.uk/parks/greenwich-park",
      },
    ],
  },
  {
    id: "walks",
    title: "Free Walks & Markets",
    icon: "🚶",
    intro:
      "Some of the best free experiences in London happen outdoors — food samples, street life, and riverside paths that cost nothing to walk.",
    entries: [
      {
        id: "borough-market",
        name: "Borough Market",
        description:
          "Europe's most famous food market. Browse for free and graze on samples — fresh pasta, charcuterie, cheese, bread, and fruit. Best experience on a weekday when it's calmer. The samples alone make for a free lunch if you work at it.",
        address: "8 Southwark St, London SE1 1TL",
        hours: {
          periods: [
            { days: [1, 2, 3], open: "10:00", close: "17:00" },
            { days: [4], open: "10:00", close: "18:00" },
            { days: [5], open: "10:00", close: "18:00" },
            { days: [6], open: "08:00", close: "17:00" },
          ],
          note: "Closed Sunday and Monday",
        },
        url: "https://boroughmarket.org.uk",
      },
      {
        id: "south-bank",
        name: "South Bank Walk",
        description:
          "The full South Bank walk from Battersea to Tower Bridge is one of the great free walks in Europe — a continuous public riverside path with buskers, street food, the National Theatre, Tate Modern, and the Shard. Walk it east to west as the sun sets behind you.",
        address: "South Bank, London SE1",
        hours: ALWAYS_OPEN,
        url: "https://www.southbank.london",
      },
      {
        id: "camden-lock",
        name: "Camden Lock & Markets",
        description:
          "Camden Market, Lock Market, and Stables Market are free to browse. The canal walk to Little Venice (about 3 miles west) costs nothing beyond the bus fare there. Street food stalls are a budget alternative to the restaurants.",
        address: "Camden Lock, Chalk Farm Rd, London NW1 8AF",
        hours: {
          periods: [{ days: EVERY_DAY, open: "10:00", close: "18:00" }],
        },
        url: "https://www.camdenmarket.com",
      },
    ],
  },
  {
    id: "events",
    title: "Free Cultural Events",
    icon: "🎭",
    intro:
      "Free tickets to BBC recordings, library talks, and annual open days — you just have to know where to look.",
    entries: [
      {
        id: "bbc-shows",
        name: "BBC Show Recordings",
        description:
          "The BBC gives away free tickets to studio recordings of TV and radio shows — QI, Mock the Week era shows, Radio 4 panel shows, and more. Tickets are genuinely free; apply weeks in advance. Tapings happen at studios across London.",
        address: "Various BBC venues, London",
        hours: ALWAYS_OPEN,
        url: "https://www.bbc.co.uk/showsandtours/tickets",
      },
      {
        id: "library-talks",
        name: "Library Talks & Festivals",
        description:
          "The British Library runs free talks and exhibitions throughout the year. Waterstones often hosts free author events. The London Literature Festival (Southbank Centre, autumn) has a free programme alongside paid events.",
        address: "96 Euston Rd, London NW1 2DB (British Library)",
        hours: ALWAYS_OPEN,
        url: "https://www.bl.uk/whats-on",
      },
      {
        id: "open-house",
        name: "Open House London",
        description:
          "One weekend every September (usually mid-September), over 800 buildings normally closed to the public open their doors for free — government buildings, private houses, corporate headquarters, brutalist blocks, and historic estates. One of the best free days out in Europe.",
        address: "Citywide, London",
        hours: { periods: [], note: "Annual, typically 3rd weekend of September" },
        url: "https://open-city.org.uk/open-house-london",
      },
      {
        id: "lunchtime-concerts",
        name: "Free Lunchtime Concerts",
        description:
          "St Martin-in-the-Fields on Trafalgar Square runs free lunchtime concerts (Monday, Tuesday, and Friday at 1pm). St James's Piccadilly and St Bride's Fleet Street also host regular free recitals. Classical music for the price of a bus journey.",
        address: "Trafalgar Square, London WC2N 4JJ (St Martin-in-the-Fields)",
        hours: {
          periods: [
            { days: [1, 2, 5], open: "13:00", close: "14:00" }, // Mon/Tue/Fri lunchtime
          ],
          note: "St Martin-in-the-Fields; other venues vary",
        },
        url: "https://www.stmartin-in-the-fields.org/music/lunchtime-concerts/",
      },
    ],
  },
];
