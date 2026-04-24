export interface StudentItem {
  id: string;
  name: string;
  tagline: string;
  body: string;
  facts?: { label: string; value: string }[];
  tips: string[];
  url: string;
}

export interface AffiliateCta {
  label: string;
  body: string;
  buttonText: string;
  url: string;
}

export interface StudentSection {
  id: string;
  title: string;
  icon: string;
  intro: string;
  items: StudentItem[];
  cta?: AffiliateCta;
}

export const STUDENT_SECTIONS: StudentSection[] = [
  {
    id: "banking",
    title: "Student Bank Accounts",
    icon: "🏦",
    intro:
      "Open a dedicated student account before freshers' week. The perks are genuine — a free multi-year railcard or an interest-free overdraft that a standard account won't give you. You only qualify while you're a student, so don't miss the window.",
    items: [
      {
        id: "santander-student",
        name: "Santander 123 Student",
        tagline: "Free 4-year Railcard — the headline perk",
        body:
          "Santander's student account comes with a free 4-year Railcard (worth £120 vs £30/year separately), an interest-free overdraft of up to £1,500 in year one rising to £2,000, and 0.5% cashback at selected retailers. The railcard alone justifies opening the account even if you use another bank day-to-day.",
        facts: [
          { label: "Overdraft (year 1)", value: "Up to £1,500 interest-free" },
          { label: "Overdraft (year 3+)", value: "Up to £2,000 interest-free" },
          { label: "Free perk", value: "4-year Railcard (worth £120)" },
          { label: "Cashback", value: "0.5% at selected retailers" },
        ],
        tips: [
          "Apply in August before freshers' week — slots fill up and the railcard takes 7–10 days to arrive.",
          "The railcard covers you until graduation even if you switch accounts mid-degree.",
          "Use it alongside a fee-free daily card (Monzo/Starling) for spending tracking.",
        ],
        url: "https://www.santander.co.uk/personal/current-accounts/student-current-account",
      },
      {
        id: "hsbc-student",
        name: "HSBC Student Account",
        tagline: "Up to £3,000 interest-free by year 3",
        body:
          "HSBC offers one of the largest student overdraft limits available — up to £3,000 by year 3. There are no monthly fees and you get access to HSBC's full banking app. Less eye-catching than the Santander railcard perk, but the overdraft limit is higher and the account is consistently reliable.",
        facts: [
          { label: "Overdraft (year 1)", value: "Up to £1,000 interest-free" },
          { label: "Overdraft (year 3+)", value: "Up to £3,000 interest-free" },
          { label: "Monthly fee", value: "None" },
        ],
        tips: [
          "Only use the overdraft as a buffer, not a spending fund — it needs to be cleared after graduation or interest kicks in immediately.",
          "HSBC's app is solid for budgeting; pair it with a Monzo pot strategy for savings goals.",
          "The graduate account extends the interest-free period for another two years after you finish.",
        ],
        url: "https://www.hsbc.co.uk/current-accounts/products/student/",
      },
      {
        id: "monzo-teen",
        name: "Monzo (16–17)",
        tagline: "The teen account with no hidden fees",
        body:
          "Monzo's 16–17 account is a full debit card account with instant spending notifications, no hidden fees, and the same budgeting features as the adult Monzo account. No overdraft, but excellent for learning to manage money before heading to university. Automatically upgrades to a full account at 18.",
        facts: [
          { label: "Monthly fee", value: "None" },
          { label: "Overdraft", value: "Not available" },
          { label: "Age range", value: "16–17" },
          { label: "International spending", value: "No fees (fair use)" },
        ],
        tips: [
          "Use the Pots feature to separate spending money from savings — visual and effective.",
          "Instant notifications make it easy to spot accidental charges or unauthorised transactions.",
          "Switch to a full student account (Santander/HSBC) when you turn 18 to access overdraft facilities.",
          "Monzo's spending categorisation is useful for building awareness of where your money actually goes.",
        ],
        url: "https://monzo.com/blog/introducing-monzo-for-16-17-year-olds",
      },
    ],
  },
  {
    id: "phones",
    title: "Phone Plans",
    icon: "📱",
    intro:
      "There's no reason for a student to pay more than £15/month for a SIM. The three operators below consistently offer the best value with no long-term contracts — month-to-month means you can switch when a better deal appears.",
    items: [
      {
        id: "giffgaff",
        name: "Giffgaff",
        tagline: "Pay monthly, cancel anytime — the original no-contract SIM",
        body:
          "Giffgaff runs on the O2 network and has been the go-to budget SIM for a decade. Their 'goodybags' (rolling monthly bundles) start from £6 and go up to unlimited data. No contract, no cancellation fee. Customer support is community-run — solid for most issues, slower for complex ones.",
        facts: [
          { label: "Cheapest plan", value: "£6/month (5GB data)" },
          { label: "Unlimited plan", value: "From £25/month" },
          { label: "Network", value: "O2" },
          { label: "Contract", value: "Rolling monthly" },
        ],
        tips: [
          "The £10/month plan (15GB) is the best value sweet spot for most students.",
          "Refer friends for free credit — serious users stack enough to cover months of bills.",
          "Pause your goodybag in summer if you're going home internationally — no contract means no penalty.",
        ],
        url: "https://www.giffgaff.com",
      },
      {
        id: "smarty",
        name: "SMARTY",
        tagline: "Data sharing and cashback on unused data",
        body:
          "SMARTY (owned by Three) is the only UK network that refunds unused data as bill credit. Plans start at £10/month. The data-sharing feature lets you transfer spare data to family members on the same plan. Strong 5G coverage via the Three network.",
        facts: [
          { label: "Cheapest plan", value: "£10/month (5GB data)" },
          { label: "Network", value: "Three (5G included)" },
          { label: "Contract", value: "Monthly rolling" },
          { label: "Unused data", value: "Credited back to your bill" },
        ],
        tips: [
          "The unused-data refund is real — students on the 30GB plan who use 20GB get money back each month.",
          "Three's network is strongest in cities and on key commuter routes; check coverage in your specific area.",
          "SMARTY's international roaming covers 70+ destinations — useful for semester abroad.",
        ],
        url: "https://smarty.co.uk",
      },
      {
        id: "voxi",
        name: "VOXI",
        tagline: "Unlimited social data from £10/month",
        body:
          "VOXI is Vodafone's youth-focused sub-brand with a key differentiator: unlimited social media data (Instagram, TikTok, WhatsApp, Snapchat, Facebook, Twitter/X) on all plans, even the cheapest. Under-30s get this permanently; social media doesn't count towards your data cap.",
        facts: [
          { label: "Cheapest plan", value: "£10/month (6GB + unlimited social)" },
          { label: "Network", value: "Vodafone (5G ready)" },
          { label: "Social data", value: "Unlimited on all plans" },
          { label: "Contract", value: "Rolling monthly" },
        ],
        tips: [
          "If social media is your primary data use, VOXI's cheapest plan goes a very long way.",
          "Vodafone's network has better rural coverage than Three — worth considering if you travel home frequently.",
          "Combine with WiFi calling enabled to use your minutes over broadband — zero dead zones at home.",
        ],
        url: "https://voxi.co.uk",
      },
    ],
  },
  {
    id: "discounts",
    title: "Student Discount Platforms",
    icon: "🎫",
    intro:
      "Register on all three before spending anything significant. Together they cover thousands of retailers — from Apple and Nike to Pizza Express and Vue Cinema. Most are free; TOTUM charges £14.99/year for the physical card but pays for itself on a single purchase.",
    items: [
      {
        id: "unidays",
        name: "UNiDAYS",
        tagline: "Free to join — Apple, Nike, ASOS, Amazon and hundreds more",
        body:
          "UNiDAYS is the largest student discount platform in the UK. Verification requires a .ac.uk email address and takes under a minute. Discounts include 15% off Apple (worth hundreds on a MacBook), 10–30% off Nike, ASOS, and Samsung. The Apple deal alone justifies the 30-second signup.",
        facts: [
          { label: "Cost", value: "Free" },
          { label: "Verification", value: ".ac.uk email or student ID upload" },
          { label: "Apple discount", value: "~15% off hardware" },
          { label: "Amazon Prime", value: "6-month free trial, then £4.99/month" },
        ],
        tips: [
          "Check UNiDAYS before any purchase over £30 — there's almost certainly a discount code.",
          "The Apple education store stacks with UNiDAYS during back-to-school promotions (August).",
          "Amazon Prime Student is £4.99/month vs £8.99 for regular Prime — cancel and re-subscribe each year to keep the free trial.",
          "New deals are added regularly — worth checking monthly rather than only when you need something.",
        ],
        url: "https://www.myunidays.com",
      },
      {
        id: "student-beans",
        name: "Student Beans",
        tagline: "Complementary to UNiDAYS — different merchant partnerships",
        body:
          "Student Beans has different brand partnerships from UNiDAYS so registering on both doubles your coverage. Their interface shows you whether a discount is percentage-off, a specific code, or a cashback deal. Strong for food delivery (Deliveroo, Just Eat) and entertainment (Spotify, Sky).",
        facts: [
          { label: "Cost", value: "Free" },
          { label: "Deliveroo", value: "Up to 25% off (varies)" },
          { label: "Spotify", value: "Discounted Student plan" },
        ],
        tips: [
          "Cross-reference Student Beans and UNiDAYS before buying — one often has a better deal than the other.",
          "Student Beans has better food and entertainment discounts; UNiDAYS is stronger for tech and fashion.",
          "Verification sometimes uses a third-party service (SheerID) — allow 15 minutes if it doesn't work immediately.",
        ],
        url: "https://www.studentbeans.com",
      },
      {
        id: "totum",
        name: "TOTUM (formerly NUS Extra)",
        tagline: "The physical card accepted where apps aren't",
        body:
          "TOTUM is the successor to the NUS Extra card. The digital version is free; the physical card costs £14.99/year. Some venues and retailers will only accept a physical card (independent shops, some cinemas, certain coach services). The ISIC version is internationally recognised.",
        facts: [
          { label: "Digital card", value: "Free" },
          { label: "Physical card", value: "£14.99/year" },
          { label: "ISIC version", value: "Internationally recognised" },
          { label: "Tastecard included", value: "50% off at 6,000+ restaurants" },
        ],
        tips: [
          "The bundled Tastecard (50% off dining at 6,000+ restaurants) pays for the physical card in one dinner out.",
          "Use the physical card at independent businesses that don't accept app screenshots.",
          "The ISIC version is worth getting if you're studying or travelling abroad — recognised at museums worldwide.",
          "TOTUM often has discount codes itself — check before buying the physical card.",
        ],
        url: "https://www.totum.com",
      },
    ],
    cta: {
      label: "Affiliate partner",
      body: "Sign up to UNiDAYS in under a minute and unlock hundreds of student discounts — including up to 15% off Apple hardware. Free to join with a student email.",
      buttonText: "Get student discounts",
      url: "https://www.myunidays.com",
    },
  },
  {
    id: "transport",
    title: "Transport",
    icon: "🚇",
    intro:
      "Two products every UK student should have: a 16–25 Railcard for national rail and a Student Oyster for London travel. Together they can save hundreds per year on getting around.",
    items: [
      {
        id: "railcard-1625",
        name: "16–25 Railcard",
        tagline: "1/3 off all rail fares — £30/year, pays back on a single return",
        body:
          "The 16–25 Railcard gives 1/3 off most National Rail fares. At £30/year (or £70 for three years), it pays for itself on a single London–Manchester return. The minimum fare restriction (roughly £12 base fare before discount, and applies after 10am on weekdays) is rarely a problem for leisure travel.",
        facts: [
          { label: "Annual cost", value: "£30" },
          { label: "3-year cost", value: "£70 (saves £20 vs annual)" },
          { label: "Saving", value: "1/3 off most rail fares" },
          { label: "Minimum fare restriction", value: "Peak weekday trains before 10am" },
        ],
        tips: [
          "Buy the 3-year card at £70 rather than three annuals at £90 — straightforward £20 saving.",
          "Combine with Advance tickets: 1/3 off an already-cheap Advance fare gives extremely low intercity prices.",
          "The railcard is digital (via the Railcard app) — no physical card needed, but download the app before travelling.",
          "Santander 123 Student account gives this free for 4 years — open that account before buying one.",
        ],
        url: "https://www.16-25railcard.co.uk",
      },
      {
        id: "student-oyster",
        name: "Student Oyster — 30% off Travelcards",
        tagline: "Permanent discount on London travel for 18+ students",
        body:
          "18+ Student Oyster photocard gives a permanent 30% discount on weekly, monthly, and annual Travelcards within TfL zones. You must be 18+ and studying full-time. The saving on a Zone 1–2 annual Travelcard is around £400/year. Apply via TfL — requires proof of study and takes up to 10 working days.",
        facts: [
          { label: "Discount", value: "30% off weekly/monthly/annual Travelcards" },
          { label: "Zone 1–2 annual saving", value: "~£380/year" },
          { label: "Eligibility", value: "18+, full-time student in London" },
          { label: "Processing time", value: "Up to 10 working days" },
        ],
        tips: [
          "Apply in September before term starts — processing takes up to 10 days and you want it for the first week.",
          "Monthly Travelcards with the 30% discount beat individual Oyster journeys if you commute more than 5 days/week.",
          "Under-18s get a separate free Zip Oyster card — apply at least 4 weeks before the start of term.",
          "The 30% discount does not apply to individual journey fares (pay-as-you-go) — only to Travelcards.",
        ],
        url: "https://tfl.gov.uk/fares/free-and-discounted-travel/18-student-oyster-photocard",
      },
    ],
    cta: {
      label: "Affiliate partner",
      body: "Book your rail travel through Trainline and apply your 16–25 Railcard at checkout. Their smart search automatically shows the cheapest Advance fares before the railcard is applied.",
      buttonText: "Find cheapest fares",
      url: "https://www.thetrainline.com",
    },
  },
  {
    id: "housing",
    title: "Student Housing",
    icon: "🏠",
    intro:
      "Purpose-built student accommodation is convenient but expensive. After first year, private flatshares via SpareRoom are almost always cheaper per month — and usually in better locations. Start looking in February/March for September.",
    items: [
      {
        id: "unite",
        name: "Unite Students",
        tagline: "The largest PBSA provider in the UK",
        body:
          "Unite Students is the UK's biggest purpose-built student accommodation provider with properties near most major universities. Bills included (WiFi, water, electricity, contents insurance). More expensive than flatshares but useful for first-year students who want simplicity.",
        facts: [
          { label: "Bills included", value: "Yes (all utilities + WiFi)" },
          { label: "Typical room", value: "£140–£250/week (varies by city/room)" },
          { label: "Contract length", value: "44–51 weeks typically" },
        ],
        tips: [
          "Book early — popular rooms near good universities fill by January for the following September.",
          "Ask about the cancellation policy before signing — useful if your firm choice changes.",
          "En-suite rooms cost significantly more than standard; shared bathroom blocks can save £30–40/week.",
        ],
        url: "https://www.unitestudents.com",
      },
      {
        id: "iq",
        name: "iQ Student Accommodation",
        tagline: "Premium PBSA — worth it for central locations",
        body:
          "iQ operates premium student residences in central London and other major cities. Generally more expensive than Unite but often with better in-city locations (Zone 1/2 London). Gyms, rooftop terraces, and study spaces are common features.",
        facts: [
          { label: "London rooms", value: "From £260/week (en-suite)" },
          { label: "Bills included", value: "Yes" },
          { label: "Amenities", value: "Gym, common rooms, study spaces" },
        ],
        tips: [
          "The premium price can make sense for Zone 1 London locations if it saves you a Zone 1–2 Travelcard.",
          "iQ runs promotional rates in August for unfilled rooms — worth checking if you've left it late.",
          "Ask specifically about what 'bills included' covers — some exclude weekly cleaning or premium TV.",
        ],
        url: "https://www.iqstudentaccommodation.com",
      },
      {
        id: "chapter",
        name: "Chapter Living",
        tagline: "Boutique student living in London",
        body:
          "Chapter operates boutique student residences in London — smaller, design-conscious buildings compared to the large Unite/iQ blocks. Good community feel. Mainly London-focused. Often sells out early for premium rooms.",
        facts: [
          { label: "Cities", value: "London primarily" },
          { label: "Style", value: "Boutique, smaller buildings" },
          { label: "Bills included", value: "Yes" },
        ],
        tips: [
          "Chapter's community events (cinema nights, social dinners) are a genuine differentiator for students who want to meet people.",
          "Room availability drops fast — sign up to the waitlist as early as January for September.",
        ],
        url: "https://chapter-living.com",
      },
      {
        id: "spareroom",
        name: "SpareRoom",
        tagline: "Private flatshares — usually 30–40% cheaper than PBSA",
        body:
          "SpareRoom is the UK's most-used flatshare platform. After first year, most students move to private flatshares here — you get more space, better locations, and lower rent than PBSA. Search by tube zone, commute time, and room type. Speed is critical: good rooms go within hours.",
        facts: [
          { label: "Cost to browse", value: "Free" },
          { label: "Premium listing access", value: "£9.99/month" },
          { label: "Typical Zone 2 room", value: "£700–£950/month (all-in)" },
          { label: "vs PBSA", value: "Usually 25–40% cheaper" },
        ],
        tips: [
          "Set up instant email alerts for your exact search criteria — the best rooms are often gone same-day.",
          "The free SpareRoom app has live chat — message landlords quickly from your phone.",
          "View at least 3–5 rooms before committing; the first one is rarely the best one.",
          "Ask existing flatmates directly about bills, heating, and landlord responsiveness — more honest than the listing.",
          "Start looking in February/March for September — the best zones fill by April.",
        ],
        url: "https://www.spareroom.co.uk",
      },
    ],
    cta: {
      label: "Affiliate partner",
      body: "SpareRoom is the UK's most-used flatshare site. Set up an alert for your area and price range — good rooms move fast, and instant notifications give you a head start.",
      buttonText: "Find a room",
      url: "https://www.spareroom.co.uk",
    },
  },
  {
    id: "food",
    title: "Food Tips",
    icon: "🥪",
    intro:
      "Food is one of the easiest areas to cut without affecting quality of life. The combination of app-based surplus food, community sharing, and smart supermarket choices can cut your weekly food spend by 40–60%.",
    items: [
      {
        id: "tgtg",
        name: "Too Good To Go",
        tagline: "Surplus food from restaurants and cafes — £3–5 a bag",
        body:
          "Too Good To Go connects you with restaurants, cafes, bakeries, and supermarkets selling surplus food at the end of the day. Magic Bags typically cost £3–5 and contain food worth 2–3× that. Pret, Itsu, Wasabi, and independent bakeries all use it. The contents are a surprise — great for lunch, less suitable if you need specific ingredients.",
        facts: [
          { label: "Typical bag cost", value: "£3–5" },
          { label: "Food value inside", value: "~3× the price" },
          { label: "Best times to check", value: "Afternoon (closing soon items)" },
        ],
        tips: [
          "Check the app in the early afternoon — new bags often appear 2–3 hours before restaurant closing.",
          "Pret Magic Bags (£3.99) often include 4–5 items from their hot food range — excellent value.",
          "Itsu Magic Bags are mostly sushi from earlier that day — very good quality for the price.",
          "Set favourite stores in the app so you get notified as soon as new bags appear.",
        ],
        url: "https://toogoodtogo.com/en-gb",
      },
      {
        id: "olio",
        name: "Olio",
        tagline: "Free food sharing — genuinely free",
        body:
          "Olio is a community sharing app where neighbours and local businesses post surplus food for free collection. Less predictable than Too Good To Go but at zero cost. Particularly active in student areas and around supermarket closing times. Also good for household items when moving in/out.",
        facts: [
          { label: "Cost", value: "Free" },
          { label: "Type", value: "Community food sharing" },
          { label: "Also lists", value: "Household items, plants, clothes" },
        ],
        tips: [
          "Check Olio the evening before your local supermarket closes — staff often post end-of-day surplus.",
          "Introduce yourself to food-sharing neighbours via the in-app chat — repeat sharing is common.",
          "Moving halls or a flat? Olio is the fastest way to offload unopened food before term ends.",
        ],
        url: "https://olioapp.com",
      },
      {
        id: "meal-deals",
        name: "Supermarket Meal Deals — Ranked",
        tagline: "The real hierarchy, honestly assessed",
        body:
          "A good meal deal (main + snack + drink) remains one of the best-value lunches in the UK. Here's the honest ranking: (1) Tesco — £3.90, largest selection, most locations; (2) Co-op — £3.50, often the cheapest option; (3) Sainsbury's — £4.00, best main options; (4) Boots — £4.75, premium quality but pricier; (5) Greggs — not technically a meal deal but meal combo at £4.25 is outstanding; (6) Pret — £7.99 Club membership gives unlimited hot drinks + monthly food item, excellent if you're near one daily.",
        facts: [
          { label: "Tesco", value: "£3.90 (sandwich/hot food + snack + drink)" },
          { label: "Co-op", value: "£3.50 — cheapest standard deal" },
          { label: "Sainsbury's", value: "£4.00" },
          { label: "Boots", value: "£4.75 — premium quality" },
          { label: "Pret Club", value: "£7.99/month — unlimited hot drinks" },
        ],
        tips: [
          "Lidl and Aldi have no formal meal deal but their individual prices beat all of the above — pasta salad + drink + snack under £2.50.",
          "Tesco Clubcard is free and occasionally runs 'double points' weeks that cut the effective deal price further.",
          "Pret Club (£7.99/month) covers up to 5 hot drinks per day — if you drink 1 coffee daily it pays for itself in 8 days.",
          "Wasabi, Itsu, and Pret all have quieter 30-minute windows before closing where remaining food drops in price.",
          "Cook a batch of rice, lentils, or pasta once a week — £1–2 buys 4–5 meals and beats any meal deal on cost.",
        ],
        url: "https://www.toogoodtogo.com",
      },
    ],
    cta: {
      label: "Affiliate partner",
      body: "Download Too Good To Go and set favourite stores near your campus. New bags appear throughout the day — a £3 Pret Magic Bag often includes hot food, pastries, and sandwiches worth over £10.",
      buttonText: "Get the app",
      url: "https://toogoodtogo.com/en-gb",
    },
  },
];
