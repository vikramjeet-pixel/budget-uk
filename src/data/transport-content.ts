import { TransportMode } from "./transport";

export interface CityTransportContent {
  title: string;
  description: string;
  heroTagline: string;
  heroBody: string;
  modes: TransportMode[];
  footerNote: string;
  footerLink?: {
    text: string;
    url: string;
  };
}

export const TRANSPORT_CONTENT: Record<string, CityTransportContent> = {
  london: {
    title: "Getting Around London",
    description: "A complete guide to London transport — Tube, buses, bikes, rail, coaches — with fares, caps, and money-saving tips.",
    heroTagline: "skip the car, save thousands",
    heroBody: "London has one of the most comprehensive public transport networks in the world. Used correctly, it's also one of the cheapest ways to move around a major city. This is everything you need to know.",
    modes: [
      {
        id: "tube",
        name: "London Underground",
        icon: "🚇",
        tagline: "Oyster and contactless — never buy a paper ticket",
        body: "The Tube runs across 11 lines and 272 stations. Always use Oyster or a contactless bank card — paper single tickets cost nearly double. Daily and weekly caps mean you stop paying once you've hit the ceiling, no matter how many journeys you take.",
        facts: [
          { label: "Zone 1 off-peak single", value: "£2.80" },
          { label: "Zone 1 daily cap", value: "£8.10" },
          { label: "Peak hours", value: "Mon–Fri 06:30–09:30 & 16:00–19:00" },
        ],
        tips: [
          "Travel after 09:30 on weekdays to pay off-peak fares.",
          "Tap in and out with the same card to ensure caps calculate correctly.",
          "Night Tube runs Fri–Sat on major lines.",
        ],
        url: "https://tfl.gov.uk/fares",
      },
      {
        id: "bus",
        name: "London Buses",
        icon: "🚌",
        tagline: "Hopper fare: two journeys for the price of one",
        body: "Every bus journey in London costs a flat £1.75. The Hopper fare means your second bus within 60 minutes of your first tap is free. Cash is not accepted.",
        facts: [
          { label: "Single fare", value: "£1.75" },
          { label: "Daily cap (bus only)", value: "£5.25" },
          { label: "Hopper window", value: "60 minutes" },
        ],
        tips: [
          "Chain two bus journeys within an hour to save £1.75.",
          "Buses run 24 hours on most major routes.",
          "Check Citymapper for the fastest bus — traffic can be unpredictable.",
        ],
        url: "https://tfl.gov.uk/modes/buses/",
      },
      {
        id: "elizabeth",
        name: "Elizabeth Line",
        icon: "🟣",
        tagline: "The fastest east–west route through central London",
        body: "The Elizabeth line runs from Reading/Heathrow to Shenfield/Abbey Wood. Within TfL zones it uses standard Oyster/contactless fares and caps. Faster and wider than standard Tube trains.",
        facts: [
          { label: "Zone 1–2 off-peak single", value: "£3.40" },
          { label: "Paddington → Heathrow", value: "£13.50 off-peak" },
        ],
        tips: [
          "Bond Street to Liverpool Street takes under 8 minutes.",
          "Far cheaper than Heathrow Express — allow 30 extra minutes.",
        ],
        url: "https://tfl.gov.uk/modes/elizabeth-line/",
      },
      {
        id: "santander",
        name: "Santander Cycles",
        icon: "🚲",
        tagline: "£3 day pass — as many 30-minute rides as you want",
        body: "800+ docking stations. Pay £3 for a day's access and every ride under 30 minutes is included. Faster than the bus for short trips.",
        facts: [
          { label: "Day pass", value: "£3.00" },
          { label: "Included ride", value: "First 30 min" },
        ],
        tips: [
          "Dock and re-dock every 30 mins to avoid extra charges.",
          "Annual membership is £90/year for frequent riders.",
        ],
        url: "https://tfl.gov.uk/modes/cycling/santander-cycles",
      },
      {
        id: "railcards",
        name: "Railcards",
        icon: "🚂",
        tagline: "A railcard pays for itself after 3 return trips",
        body: "Railcards give 1/3 off most fares for £30/year. Essential for any intercity travel and can be linked to your Oyster for 1/3 off off-peak Tube fares.",
        facts: [
          { label: "Annual cost", value: "£30" },
          { label: "Discount", value: "1/3 off" },
        ],
        tips: [
          "Link your Railcard to your Oyster at a Tube station for off-peak savings.",
          "Buy a 3-year card to save £20 vs three annual ones.",
        ],
        url: "https://www.railcard.co.uk",
      },
    ],
    footerNote: "Fares correct as of January 2025. TfL adjusts fares annually.",
    footerLink: {
      text: "verify on TfL's fare finder",
      url: "https://tfl.gov.uk/fares",
    },
  },
  manchester: {
    title: "Getting Around Manchester",
    description: "Guide to Manchester transport — Metrolink, Bee Network buses, and local rail.",
    heroTagline: "The Bee Network is changing the game",
    heroBody: "Manchester's transport is currently undergoing a massive transformation into the 'Bee Network', integrating buses and trams under one banner with simpler, cheaper fares.",
    modes: [
      {
        id: "metrolink",
        name: "Metrolink Trams",
        icon: "🚋",
        tagline: "Tap in, tap out across the city",
        body: "The UK's largest tram network. Use contactless (tap in/out) for the best value. It covers the city centre and reaches out to Altrincham, Bury, Ashton, and the Airport.",
        facts: [
          { label: "Zone 1 off-peak", value: "£1.40" },
          { label: "Any-zone daily cap", value: "£7.10" },
          { label: "Off-peak hours", value: "After 09:30 Mon-Fri" },
        ],
        tips: [
          "Contactless is almost always cheaper than buying a paper ticket.",
          "Trams run until midnight (1am on Fri/Sat).",
          "There is no 'Hopper' between tram and bus yet, unless you buy a specific multi-mode ticket.",
        ],
        url: "https://tfgm.com/public-transport/tram",
      },
      {
        id: "bee-bus",
        name: "Bee Network Buses",
        icon: "🚌",
        tagline: "£2 flat fare for any journey",
        body: "Manchester buses have moved to a franchised system. A single trip is capped at £2, making it one of the most affordable ways to move through the boroughs.",
        facts: [
          { label: "Single fare", value: "£2.00" },
          { label: "Any-bus daily cap", value: "£5.00" },
          { label: "Any-bus weekly cap", value: "£21.00" },
        ],
        tips: [
          "The £2 fare applies regardless of distance within Greater Manchester.",
          "Night buses exist on major routes like the 42 and 43 (Airport).",
          "Use the Bee Network app for live tracking and tickets.",
        ],
        url: "https://tfgm.com/bee-network",
      },
      {
        id: "free-bus",
        name: "Free Bus",
        icon: "🆓",
        tagline: "Free travel around the city centre",
        body: "Manchester runs two free bus routes (Route 1 and 2) that link the major rail stations, shopping districts, and business areas. Genuinely free for everyone.",
        facts: [
          { label: "Fare", value: "Free" },
          { label: "Frequency", value: "Every 10-15 mins" },
        ],
        tips: [
          "Route 1 links Piccadilly, Deansgate, and Spinningfields.",
          "Route 2 links Piccadilly, Victoria, and Shudehill.",
        ],
        url: "https://tfgm.com/public-transport/bus/free-bus",
      },
      {
        id: "rail",
        name: "Local Rail",
        icon: "🚂",
        tagline: "Fastest way between Piccadilly and Victoria",
        body: "Rail is useful for reaching outer suburbs like Stockport or Bolton quickly. Piccadilly, Victoria, and Oxford Road are the main hubs.",
        facts: [
          { label: "Piccadilly to Victoria", value: "~10 mins" },
          { label: "Railcard discount", value: "1/3 off" },
        ],
        tips: [
          "Check if your Metrolink ticket covers rail travel in certain zones (usually doesn't).",
          "Advance tickets for local rail are rare; just buy on the day via app.",
        ],
        url: "https://www.northernrailway.co.uk",
      },
    ],
    footerNote: "Fares based on Bee Network 2024 launch pricing.",
    footerLink: {
      text: "check TfGM for updates",
      url: "https://tfgm.com",
    },
  },
  birmingham: {
    title: "Getting Around Birmingham",
    description: "Guide to Birmingham transport — West Midlands Metro, buses, and trains.",
    heroTagline: "The heart of the UK's rail network",
    heroBody: "Birmingham is a major hub. While the city is very walkable, the bus and tram network is essential for reaching Digbeth, the Jewellery Quarter, and the outer suburbs.",
    modes: [
      {
        id: "metro",
        name: "West Midlands Metro",
        icon: "🚋",
        tagline: "The pink tram through the city centre",
        body: "A single line linking Wolverhampton to Birmingham city centre (Edgbaston). It's frequent and uses a zone-based fare system.",
        facts: [
          { label: "Short hop fare", value: "£1.50" },
          { label: "Daily cap", value: "~£4.50 (Zone 1)" },
        ],
        tips: [
          "The 'Short Hop' is great for moving between New Street and the Jewellery Quarter.",
          "Tap on, tap off is coming soon, but currently buy on the app or on-board.",
        ],
        url: "https://westmidlandsmetro.com",
      },
      {
        id: "bus",
        name: "National Express West Midlands",
        icon: "🚌",
        tagline: "Contactless capping makes it simple",
        body: "The dominant bus operator. They offer 'Tap and Go' capping, so you'll never pay more than the daily or weekly limit.",
        facts: [
          { label: "Single fare", value: "£2.00" },
          { label: "Daily cap", value: "£4.50" },
          { label: "Weekly cap", value: "£15.00" },
        ],
        tips: [
          "You must use the same card/device for capping to work.",
          "The 11A/11C 'Outer Circle' is one of Europe's longest bus routes — a cheap tour of the city suburbs.",
        ],
        url: "https://nxbus.co.uk",
      },
      {
        id: "rail",
        name: "West Midlands Railway",
        icon: "🚂",
        tagline: "Cross-city line is a budget lifesaver",
        body: "The Cross-City line links Redditch/Bromsgrove to Lichfield via New Street and University. Extremely frequent and affordable for local hops.",
        facts: [
          { label: "Frequent service", value: "Every 10-20 mins" },
          { label: "Railcard valid?", value: "Yes" },
        ],
        tips: [
          "New Street is the main hub, but Snow Hill and Moor Street are often quieter for certain routes.",
          "Use a Swift card for integrated travel across bus, tram, and rail.",
        ],
        url: "https://www.westmidlandsrailway.co.uk",
      },
    ],
    footerNote: "Fares checked against 2024 West Midlands guidelines.",
    footerLink: {
      text: "visit Transport for West Midlands",
      url: "https://www.tfwm.org.uk",
    },
  },
  edinburgh: {
    title: "Getting Around Edinburgh",
    description: "Guide to Edinburgh transport — Lothian Buses, Edinburgh Trams, and rail.",
    heroTagline: "One of the best bus networks in the UK",
    heroBody: "Edinburgh is compact and hilly. While walking is beautiful, the Lothian Bus network is legendary for its frequency, reliability, and flat fares.",
    modes: [
      {
        id: "bus",
        name: "Lothian Buses",
        icon: "🚌",
        tagline: "Flat fares and contactless capping",
        body: "The iconic madder-and-white buses. It's a flat £2.00 per journey. Contactless 'Tap & Tap' capping means you automatically get the best daily rate.",
        facts: [
          { label: "Single adult fare", value: "£2.00" },
          { label: "Daily cap (City)", value: "£4.80" },
          { label: "Weekly cap", value: "£22.00" },
        ],
        tips: [
          "The 'Airlink 100' is the fastest budget way to the airport (£5.50 single).",
          "Contactless works for everyone — no need to buy tickets in advance.",
          "Buses run 24 hours (Nightbuses use an 'N' prefix).",
        ],
        url: "https://www.lothianbuses.com",
      },
      {
        id: "tram",
        name: "Edinburgh Trams",
        icon: "🚋",
        tagline: "From Newhaven to the Airport",
        body: "A single line that was recently extended to Newhaven. It's fast and uses the same flat fare as buses, EXCEPT for the airport section.",
        facts: [
          { label: "Single (non-airport)", value: "£2.00" },
          { label: "Single (to Airport)", value: "£7.50" },
          { label: "Day ticket (inc. Tram)", value: "£5.00" },
        ],
        tips: [
          "Buy your ticket BEFORE boarding at the platform machines.",
          "If you're heading to the airport on a budget, take the bus instead of the tram to save a couple of pounds.",
        ],
        url: "https://edinburghtrams.com",
      },
    ],
    footerNote: "Fares updated for 2024 Lothian fare changes.",
    footerLink: {
      text: "Lothian Buses official site",
      url: "https://www.lothianbuses.com",
    },
  },
  glasgow: {
    title: "Getting Around Glasgow",
    description: "Guide to Glasgow transport — Subway, buses, and the largest rail network outside London.",
    heroTagline: "The Clockwork Orange and beyond",
    heroBody: "Glasgow has a unique subway system and a massive suburban rail network. It's a city built for movement, though it lacks the integrated capping of London.",
    modes: [
      {
        id: "subway",
        name: "Glasgow Subway",
        icon: "🚇",
        tagline: "The Clockwork Orange",
        body: "The world's third oldest subway. It's a simple circle linking the West End to the City Centre. Fast, frequent, and impossible to get lost on.",
        facts: [
          { label: "Smartcard single", value: "£1.55" },
          { label: "Daily cap (Smartcard)", value: "£3.00" },
          { label: "Full loop time", value: "24 minutes" },
        ],
        tips: [
          "Register for a free Smartcard to get significantly cheaper fares than paper tickets.",
          "Outer Circle is clockwise, Inner Circle is anti-clockwise.",
          "Last trains on Sundays are early (around 6pm) — don't get caught out!",
        ],
        url: "https://www.spt.co.uk/subway",
      },
      {
        id: "bus",
        name: "First Bus Glasgow",
        icon: "🚌",
        tagline: "Extensive but fragmented",
        body: "The main operator is First Bus. They offer contactless capping, but only on their own services. Fares vary by distance unless you buy a day pass.",
        facts: [
          { label: "Single fare", value: "Varies (~£2.65)" },
          { label: "FirstDay ticket", value: "£5.40" },
        ],
        tips: [
          "Use the First Bus app for mTickets, which are often cheaper than paying the driver.",
          "McGill's and Stagecoach also run routes; check which operator you need before tapping.",
        ],
        url: "https://www.firstbus.co.uk/greater-glasgow",
      },
      {
        id: "rail",
        name: "Suburban Rail",
        icon: "🚂",
        tagline: "Largest network outside London",
        body: "Essential for reaching places like the SEC, Finnieston, or the South Side. Central and Queen Street are the two main hubs.",
        facts: [
          { label: "Central to SECC", value: "~5 mins" },
          { label: "Railcard valid?", value: "Yes" },
        ],
        tips: [
          "Central Station is for south/west lines; Queen Street is for north/east and Edinburgh.",
          "A Roundabout ticket gives unlimited rail and subway for a day (£7.40).",
        ],
        url: "https://www.scotrail.co.uk",
      },
    ],
    footerNote: "Fares subject to SPT and ScotRail annual reviews.",
    footerLink: {
      text: "SPT Travel Centre",
      url: "https://www.spt.co.uk",
    },
  },
  cardiff: {
    title: "Getting Around Cardiff",
    description: "Guide to Cardiff transport — Cardiff Bus and Transport for Wales rail.",
    heroTagline: "A compact city with big ambition",
    heroBody: "Cardiff is extremely flat and walkable, but its bus and local rail network is vital for reaching the Bay and the northern suburbs.",
    modes: [
      {
        id: "bus",
        name: "Cardiff Bus",
        icon: "🚌",
        tagline: "The green buses of the capital",
        body: "The primary operator. They offer flat fares within the city and contactless 'Tap on Tap off' capping.",
        facts: [
          { label: "Single adult", value: "£2.20" },
          { label: "Day to Go (app)", value: "£4.40" },
          { label: "Weekly cap", value: "£17.00" },
        ],
        tips: [
          "The 'Baycar' (Route 6) is a high-frequency link between the City Centre and Cardiff Bay.",
          "Use the Cardiff Bus app for cheaper day tickets than buying on-board.",
        ],
        url: "https://www.cardiffbus.com",
      },
      {
        id: "rail",
        name: "Valley Lines Rail",
        icon: "🚂",
        tagline: "Transport for Wales (TfW)",
        body: "Cardiff has a fantastic 'metro-style' local rail network. Queen Street and Central are the main city hubs.",
        facts: [
          { label: "Central to Bay", value: "~4 mins" },
          { label: "Railcard valid?", value: "Yes" },
        ],
        tips: [
          "Queen Street is often more convenient for the shopping district than Central.",
          "GroupSave tickets give 1/3 off for groups of 3-9 people.",
        ],
        url: "https://tfw.wales",
      },
    ],
    footerNote: "Fares based on Cardiff Bus 2024 fare tables.",
    footerLink: {
      text: "Transport for Wales",
      url: "https://tfw.wales",
    },
  },
  belfast: {
    title: "Getting Around Belfast",
    description: "Guide to Belfast transport — Glider, Metro buses, and Translink rail.",
    heroTagline: "Gliding through the city",
    heroBody: "Belfast has seen a transport revolution with the Glider. The city is manageable and budget-friendly if you stick to Translink's network.",
    modes: [
      {
        id: "glider",
        name: "Glider (BRT)",
        icon: "🚋",
        tagline: "Rapid transit across the city",
        body: "The Glider (purple buses) runs on two main lines: G1 (East to West) and G2 (City to Titanic Quarter). It's frequent and feels like a tram on wheels.",
        facts: [
          { label: "Single fare", value: "£2.10" },
          { label: "Day ticket", value: "£3.50 (after 9:30am)" },
        ],
        tips: [
          "You MUST buy your ticket or tap your card at the platform machine BEFORE boarding.",
          "The G2 is the best budget way to reach the Titanic Museum.",
        ],
        url: "https://www.translink.co.uk/usingtranslink/glider",
      },
      {
        id: "bus",
        name: "Metro Buses",
        icon: "🚌",
        tagline: "Connecting the four corners of Belfast",
        body: "The standard pink buses that cover the rest of the city. Integrated with the Glider ticketing system.",
        facts: [
          { label: "Day ticket", value: "£4.70 (standard)" },
          { label: "mLink tickets", value: "Cheaper via app" },
        ],
        tips: [
          "The Translink mLink app is essential for the best fares.",
          "After 9:30am, a day ticket is significantly cheaper.",
        ],
        url: "https://www.translink.co.uk",
      },
      {
        id: "rail",
        name: "NI Railways",
        icon: "🚂",
        tagline: "Belfast to Dublin and beyond",
        body: "Useful for local trips to Lisburn or Holywood, and for the 'Enterprise' service to Dublin.",
        facts: [
          { label: "Belfast to Dublin", value: "~2h 10m" },
          { label: "Lanyon Place", value: "Main hub for Dublin" },
        ],
        tips: [
          "Grand Central Station (opening 2024/25) will be the new main hub for all transport.",
          "Sunday Day Tracker allows unlimited rail travel on Sundays for ~£9.",
        ],
        url: "https://www.translink.co.uk/nirailways",
      },
    ],
    footerNote: "Fares updated for 2024 Translink reviews.",
    footerLink: {
      text: "Translink official site",
      url: "https://www.translink.co.uk",
    },
  },
};
