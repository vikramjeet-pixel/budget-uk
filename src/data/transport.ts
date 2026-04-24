export interface TransportFact {
  label: string;
  value: string;
}

export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  body: string;
  facts: TransportFact[];
  tips: string[];
  url: string;
}

export const TRANSPORT_MODES: TransportMode[] = [
  {
    id: "tube",
    name: "London Underground",
    icon: "🚇",
    tagline: "Oyster and contactless — never buy a paper ticket",
    body:
      "The Tube runs across 11 lines and 272 stations. Always use Oyster or a contactless bank card — paper single tickets cost nearly double. Daily and weekly caps mean you stop paying once you've hit the ceiling, no matter how many journeys you take.",
    facts: [
      { label: "Zone 1 off-peak single", value: "£2.80" },
      { label: "Zone 1–2 off-peak single", value: "£3.40" },
      { label: "Zone 1 daily cap", value: "£8.10" },
      { label: "Zone 1–2 daily cap", value: "£9.60" },
      { label: "Zone 1–3 daily cap", value: "£12.00" },
      { label: "Zone 1–6 daily cap", value: "£19.60" },
      { label: "Peak hours", value: "Mon–Fri 06:30–09:30 and 16:00–19:00" },
    ],
    tips: [
      "Travel after 09:30 on weekdays and you pay off-peak fares — this single change can save £1–2 per journey.",
      "Tap in and out with the same card every time or the daily cap won't calculate correctly.",
      "If you commute Zone 1–2, a weekly cap (£48.00) beats a monthly Travelcard after 7 trips — do the maths for your pattern.",
      "Night Tube runs Fri–Sat on Jubilee, Victoria, Central, Northern and Piccadilly lines — free with your daily cap already hit.",
      "Avoid the 'maximum fare' (£9.00+) by always tapping out. If you forget, you have 48 hours to resolve it at a station.",
    ],
    url: "https://tfl.gov.uk/fares",
  },
  {
    id: "bus",
    name: "London Buses",
    icon: "🚌",
    tagline: "Hopper fare: two journeys for the price of one",
    body:
      "Every bus journey in London costs a flat £1.75, regardless of distance or zone. The Hopper fare means your second bus within 60 minutes of your first tap is free. Cash is not accepted — Oyster, contactless, or a free Zip card (under-18s) only.",
    facts: [
      { label: "Single fare (any distance)", value: "£1.75" },
      { label: "Daily cap (buses only)", value: "£5.25" },
      { label: "Weekly cap (buses only)", value: "£26.25" },
      { label: "Hopper free transfer window", value: "60 minutes" },
      { label: "Cash accepted?", value: "No — card or Oyster only" },
    ],
    tips: [
      "Chain two bus journeys within 60 minutes and the second one is free — very useful for local trips that need one change.",
      "Buses run 24 hours on most major routes; Night Buses (N prefix) cover the gaps. Much cheaper than a cab at 2 am.",
      "The daily cap of £5.25 means even heavy bus users pay no more than that per day.",
      "Check Citymapper or Google Maps for the fastest bus — some routes skip traffic via backstreets that don't appear obvious.",
      "TfL's iBus announcements work offline on Citymapper — useful for spotting approaching buses without mobile data.",
    ],
    url: "https://tfl.gov.uk/modes/buses/",
  },
  {
    id: "elizabeth",
    name: "Elizabeth Line",
    icon: "🟣",
    tagline: "The fastest east–west route through central London",
    body:
      "The Elizabeth line runs from Reading and Heathrow in the west to Shenfield and Abbey Wood in the east, stopping at Paddington, Bond Street, Tottenham Court Road, Farringdon, Liverpool Street, and Canary Wharf. Within TfL zones it uses standard Oyster/contactless fares and caps.",
    facts: [
      { label: "Zone 1–2 off-peak single", value: "£3.40" },
      { label: "Paddington → Heathrow (Zone 1–6)", value: "£13.50 off-peak" },
      { label: "Daily cap Zone 1–2", value: "£9.60" },
      { label: "Frequency (central section)", value: "Every 5 min (peak)" },
    ],
    tips: [
      "Bond Street to Liverpool Street takes under 8 minutes — faster than any bus or taxi across that stretch.",
      "For Heathrow, the Elizabeth line is far cheaper than the Heathrow Express (£25). Allow 30 extra minutes.",
      "Off-peak Heathrow trips save roughly £3 per journey — useful if your flight allows a later departure from central London.",
      "The trains are significantly wider than the Tube — better for luggage and prams.",
    ],
    url: "https://tfl.gov.uk/modes/elizabeth-line/",
  },
  {
    id: "dlr",
    name: "DLR",
    icon: "🚈",
    tagline: "Driverless, direct to Canary Wharf and Greenwich",
    body:
      "The Docklands Light Railway serves east and south-east London — Canary Wharf, Greenwich, Woolwich, London City Airport, and Stratford. Standard Oyster/contactless fares apply, same as the Tube. No driver on board, so the front seat is always free.",
    facts: [
      { label: "Zone 2–3 off-peak single", value: "£2.80" },
      { label: "London City Airport (Zone 3)", value: "~£3.40 from Zone 1" },
      { label: "Operates", value: "5:30am–12:30am daily" },
    ],
    tips: [
      "Grab the front seat for the best views over Canary Wharf and the Thames.",
      "London City Airport via DLR from Bank is faster and far cheaper than a cab — takes about 22 minutes.",
      "The DLR replaces Sunday Tube service on several east London routes where the Underground doesn't run.",
      "Bank station DLR entrance is separate from the Tube — add 5 minutes if connecting.",
    ],
    url: "https://tfl.gov.uk/modes/dlr/",
  },
  {
    id: "overground",
    name: "London Overground",
    icon: "🟠",
    tagline: "Six orbital lines that skip central London entirely",
    body:
      "The Overground's six routes (now named Lioness, Mildmay, Suffragette, Weaver, Windrush, and Liberty lines) link outer London neighbourhoods without forcing a trip into Zone 1. Fares are the same as the Tube for journeys within London zones.",
    facts: [
      { label: "Fares", value: "Same as Tube within TfL zones" },
      { label: "Zone 2 daily cap", value: "£8.00 (approx)" },
      { label: "Stratford → Clapham Junction", value: "~35 min, no Zone 1" },
    ],
    tips: [
      "Many Overground journeys avoid Zone 1 entirely — useful for keeping fares in the Zone 2–3 cap.",
      "The East London line (Mildmay/Windrush) connects Shoreditch High Street to Peckham and Crystal Palace — genuinely useful for south-east trips.",
      "Overground trains run every 10–15 minutes on most routes, more frequently than people expect.",
      "Hackney Central to Dalston Junction to Canada Water is a useful sequence if you're heading to Bermondsey or Canada Water by bike afterwards.",
    ],
    url: "https://tfl.gov.uk/modes/london-overground/",
  },
  {
    id: "santander",
    name: "Santander Cycles",
    icon: "🚲",
    tagline: "£3 day pass — as many 30-minute rides as you want",
    body:
      "London's public hire bike scheme has 800+ docking stations across central and inner London. Pay £3 for a day's access and every ride under 30 minutes is included. Perfect for journeys between 1 and 3 miles — faster than the bus and cheaper than the Tube.",
    facts: [
      { label: "Day pass", value: "£3.00" },
      { label: "Included ride length", value: "Up to 30 min per trip" },
      { label: "Extra time", value: "£1.65 per additional 30 min" },
      { label: "Annual membership", value: "£90/year" },
      { label: "Annual member rides", value: "Unlimited 45-min rides" },
      { label: "Docking stations", value: "800+ across central London" },
    ],
    tips: [
      "Dock and re-dock at any station to reset the 30-minute clock — useful for longer routes.",
      "The annual membership (£90) pays for itself in about 30 day-pass equivalent uses.",
      "Citymapper and the TfL app both show real-time dock availability — check before walking to a station.",
      "Riding early morning (before 8am) means empty roads and fresh bikes just re-docked overnight.",
      "Helmets are not provided — bring your own or use the scheme as a last-mile tool from a station.",
    ],
    url: "https://tfl.gov.uk/modes/cycling/santander-cycles",
  },
  {
    id: "ebikes",
    name: "E-Bikes — Lime, Forest & Tier",
    icon: "⚡",
    tagline: "Dockless and electric — good for the last mile",
    body:
      "Three operators run dockless electric bikes across London: Lime (green), Forest (orange), and Tier (red). All use app-based unlocking. Pricing is similar across operators — roughly £1 to unlock plus a per-minute rate. Useful for areas not covered by Santander Cycles.",
    facts: [
      { label: "Lime unlock fee", value: "~£1.00" },
      { label: "Lime per-minute rate", value: "~£0.18/min" },
      { label: "Typical 15-min ride", value: "~£3.70" },
      { label: "Forest / Tier", value: "Similar to Lime pricing" },
      { label: "Parking", value: "Must end in designated zones" },
    ],
    tips: [
      "All three apps offer discount bundles (e.g. 10 ride passes) — buy in bulk if you ride regularly.",
      "Lime's Lite plan and Forest's monthly passes can cut per-ride cost significantly.",
      "Check for promo codes before your first ride — referral codes typically give you 1–2 free unlocks.",
      "E-scooters (not bikes) are not legal on public roads in the UK outside of rental scheme zones — stick to the bikes.",
      "Battery level shows in-app before unlocking. Avoid picking up a bike below 20% for anything over 10 minutes.",
    ],
    url: "https://www.li.me/en-gb",
  },
  {
    id: "clippers",
    name: "Thames Clippers (Uber Boat)",
    icon: "⛵",
    tagline: "Commuter boats from Putney to Woolwich",
    body:
      "Thames Clippers operates a commuter river bus service with services roughly every 20–30 minutes. Stops include Putney, Wandsworth, Battersea, Embankment, Blackfriars, Bankside, London Bridge, Tower, Canary Wharf, Greenwich, and Woolwich. Slower than the Tube but scenic and uncrowded.",
    facts: [
      { label: "Embankment → Greenwich single", value: "~£7.50" },
      { label: "With Travelcard", value: "1/3 off all fares" },
      { label: "With Oyster/contactless", value: "10% discount" },
      { label: "Annual Pass", value: "~£1,440/year (commuter)" },
      { label: "Frequency (peak)", value: "Every 20 min" },
    ],
    tips: [
      "If you hold a Travelcard (paper or contactless equivalent), you get 1/3 off every fare.",
      "Combination journeys — Tube to Embankment, then boat to Greenwich — can be faster than all-Tube on a good day.",
      "The upper deck of the boat is open-air — genuinely pleasant in summer and on clear winter mornings.",
      "Book via the Uber app or Thames Clippers app — same pricing, different UX.",
      "Battersea Power Station and Woolwich Arsenal piers are well served but less used — faster boarding.",
    ],
    url: "https://www.thamesclippers.com",
  },
  {
    id: "cabs",
    name: "Black Cabs, Uber & Bolt",
    icon: "🚕",
    tagline: "Use only when everything else is closed",
    body:
      "Black cabs are metered, regulated, and expensive — but the drivers are genuinely knowledgeable and the service is reliable. Uber is typically 30–40% cheaper. Bolt undercuts Uber by a further 10–20% on most routes. All three surge during late-night hours. Night Tube or Night Bus is almost always cheaper.",
    facts: [
      { label: "Black cab flag fall", value: "£3.80 (Mon–Fri 06:00–20:00)" },
      { label: "Black cab per mile", value: "~£2.30–£3.00" },
      { label: "Uber typical short trip", value: "£8–15 (no surge)" },
      { label: "Bolt vs Uber", value: "Typically 10–20% cheaper" },
      { label: "Uber Pool / shared", value: "Suspended in London as of 2024" },
    ],
    tips: [
      "Bolt consistently prices lower than Uber for the same journey — install both and compare.",
      "Black cabs can legally use bus lanes — sometimes faster than Uber in peak hour.",
      "The Night Tube (Fri/Sat) and 24-hour bus network make midnight cabs unnecessary in most of Zone 1–2.",
      "Pre-book via the Gett app for a licensed cab that's often cheaper than a street hail.",
      "Surge pricing on Uber typically ends 10–15 minutes after clubs close — wait it out if you're not in a rush.",
    ],
    url: "https://bolt.eu/en-gb/cities/london/",
  },
  {
    id: "national-rail",
    name: "National Rail & Railcards",
    icon: "🚂",
    tagline: "A railcard pays for itself after 3 return trips",
    body:
      "National Rail covers intercity routes and commuter services beyond TfL zones. Railcards give 1/3 off most fares for £30/year and pay for themselves quickly. Book Advance tickets as early as possible — prices rise sharply closer to travel. Anytime tickets are expensive; always check for Off-Peak and Advance options.",
    facts: [
      { label: "16–25 Railcard", value: "£30/year — 1/3 off most fares" },
      { label: "26–30 Railcard", value: "£30/year — 1/3 off most fares" },
      { label: "Two Together Railcard", value: "£30/year — 2 people, 1/3 off" },
      { label: "Senior Railcard (60+)", value: "£30/year — 1/3 off most fares" },
      { label: "3-year 16–25 Railcard", value: "£70 (saves vs 3 × annual)" },
      { label: "Advance vs Anytime", value: "Advance fares 50–80% cheaper" },
    ],
    tips: [
      "Buy the 3-year 16–25 Railcard (£70) rather than annual (£30 × 3 = £90) — saves £20 immediately.",
      "Advance tickets are non-refundable but can be exchanged for a fee before departure.",
      "Split ticketing can halve the price on some intercity routes — search 'train split' sites before booking.",
      "Railcard minimum fares apply before 10am on weekdays — plan accordingly.",
      "The Two Together Railcard requires both people to travel together but there's no minimum age.",
      "Trainline, Avanti, and LNER all sell the same Advance fares — buy direct to avoid booking fees.",
    ],
    url: "https://www.railcard.co.uk",
  },
  {
    id: "coach",
    name: "Coach — Megabus, National Express & FlixBus",
    icon: "🚍",
    tagline: "As low as £1 for intercity — if you book far enough ahead",
    body:
      "Coach is the cheapest way between UK cities. Megabus and FlixBus run promotional fares as low as £1 + booking fee on popular routes. National Express is slightly pricier but offers more departure times and a better network. All depart from Victoria Coach Station.",
    facts: [
      { label: "Megabus London → Manchester", value: "From £5 (advance)" },
      { label: "National Express London → Edinburgh", value: "From £15 (advance)" },
      { label: "FlixBus London → Birmingham", value: "From £4.99 (advance)" },
      { label: "Victoria Coach Station", value: "Buckingham Palace Rd, SW1W 9TP" },
      { label: "Journey time London → Manchester", value: "~4h 30min" },
    ],
    tips: [
      "£1 Megabus fares are real but limited per coach — set a fare alert and book the moment they release.",
      "Book 4–6 weeks ahead for the best prices. Same-day coach is only marginally cheaper than off-peak rail.",
      "National Express has a 'Young Persons Coachcard' (£12.50/year) giving 1/3 off on their routes.",
      "FlixBus is growing its UK network rapidly — often the cheapest option on routes it covers.",
      "Factor in Victoria Coach Station faff: arrive 20 minutes early for boarding.",
    ],
    url: "https://uk.megabus.com",
  },
];

// ── Fare calculator stub data ─────────────────────────────────────────────────

export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

interface FareRow {
  offPeakSingle: number;
  peakSingle: number;
  dailyCap: number;
}

// Key: `${minZone}-${maxZone}` — zones always stored low-to-high
const FARE_TABLE: Record<string, FareRow> = {
  "1-1": { offPeakSingle: 2.80, peakSingle: 3.70, dailyCap: 8.10 },
  "1-2": { offPeakSingle: 3.40, peakSingle: 3.90, dailyCap: 9.60 },
  "1-3": { offPeakSingle: 4.20, peakSingle: 5.00, dailyCap: 12.00 },
  "1-4": { offPeakSingle: 4.90, peakSingle: 5.50, dailyCap: 14.90 },
  "1-5": { offPeakSingle: 5.60, peakSingle: 6.50, dailyCap: 18.70 },
  "1-6": { offPeakSingle: 5.60, peakSingle: 6.80, dailyCap: 19.60 },
  "2-2": { offPeakSingle: 2.10, peakSingle: 3.40, dailyCap: 7.60 },
  "2-3": { offPeakSingle: 2.80, peakSingle: 3.40, dailyCap: 9.60 },
  "2-4": { offPeakSingle: 3.40, peakSingle: 4.20, dailyCap: 11.00 },
  "2-5": { offPeakSingle: 4.00, peakSingle: 5.00, dailyCap: 14.90 },
  "2-6": { offPeakSingle: 4.20, peakSingle: 5.30, dailyCap: 16.00 },
  "3-3": { offPeakSingle: 2.10, peakSingle: 3.00, dailyCap: 7.60 },
  "3-4": { offPeakSingle: 2.80, peakSingle: 3.40, dailyCap: 9.60 },
  "3-5": { offPeakSingle: 3.40, peakSingle: 4.20, dailyCap: 11.00 },
  "3-6": { offPeakSingle: 3.40, peakSingle: 4.80, dailyCap: 12.00 },
  "4-4": { offPeakSingle: 2.10, peakSingle: 2.90, dailyCap: 7.00 },
  "4-5": { offPeakSingle: 2.80, peakSingle: 3.40, dailyCap: 9.60 },
  "4-6": { offPeakSingle: 3.40, peakSingle: 4.20, dailyCap: 11.00 },
  "5-5": { offPeakSingle: 2.10, peakSingle: 2.90, dailyCap: 7.00 },
  "5-6": { offPeakSingle: 2.80, peakSingle: 3.30, dailyCap: 8.80 },
  "6-6": { offPeakSingle: 2.10, peakSingle: 2.80, dailyCap: 7.00 },
};

export function lookupFare(fromZone: Zone, toZone: Zone): FareRow | null {
  const key = `${Math.min(fromZone, toZone)}-${Math.max(fromZone, toZone)}`;
  return FARE_TABLE[key] ?? null;
}
