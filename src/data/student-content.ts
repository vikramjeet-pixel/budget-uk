import { StudentSection } from "./student";

export const STUDENT_CONTENT: Record<string, { title: string; description: string; sections: StudentSection[] }> = {
  london: {
    title: "Student London",
    description: "Banking, phone plans, discounts, transport, housing, and food tips for students in London.",
    sections: [
      {
        id: "essentials",
        title: "The Essentials",
        icon: "🏦",
        intro: "The boring but necessary stuff that saves you hundreds over three years.",
        items: [
          {
            id: "railcard",
            name: "16-25 Railcard",
            tagline: "1/3 off all rail travel in the UK",
            url: "https://www.16-25railcard.co.uk",
            body: "The absolute first thing you should buy. In London, you can link this to your Oyster card at any Tube station to get 1/3 off off-peak pay-as-you-go travel.",
            tips: ["Ask a staff member at the station to 'link my railcard' to your Oyster."],
            facts: [{ label: "Cost", value: "£30/year" }, { label: "Savings", value: "33% off" }]
          }
        ]
      }
    ]
  },
  manchester: {
    title: "Student Manchester",
    description: "The ultimate survival guide for students in Manchester — from Metrolink hacks to the best curry mile deals.",
    sections: [
      {
        id: "transport",
        title: "Getting Around",
        icon: "🚋",
        intro: "Manchester's transport is affordable if you know the tricks.",
        items: [
          {
            id: "system-one",
            name: "System One Travelcard",
            tagline: "Unlimited bus and tram travel",
            url: "https://www.systemone.uk",
            body: "The easiest way to move between Fallowfield, the city centre, and the various campuses.",
            tips: ["Weekly and monthly passes offer the best value for daily commuters."],
            facts: [{ label: "Network", value: "Greater Manchester" }]
          }
        ]
      }
    ]
  },
  birmingham: {
    title: "Student Birmingham",
    description: "Navigate the UK's second city on a student budget. Focus on Selly Oak and city centre gems.",
    sections: [
      {
        id: "food",
        title: "Cheap Eats",
        icon: "🍔",
        intro: "Birmingham's food scene is incredible, even on a budget.",
        items: [
          {
            id: "digbeth-dining",
            name: "Digbeth Dining Club",
            tagline: "The best street food in the Midlands",
            url: "https://digbethdiningclub.com",
            body: "A rotation of the UK's best street food vendors. Not always the cheapest, but the quality is unbeatable.",
            tips: ["Look out for student discount nights or early bird entry."],
            facts: [{ label: "Location", value: "Digbeth/Various" }]
          }
        ]
      }
    ]
  }
};
