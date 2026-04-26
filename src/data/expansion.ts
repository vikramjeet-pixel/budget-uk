export interface ExpansionPhase {
  phase: number;
  name: string;
  status: 'live' | 'coming-soon' | 'planned';
  cities?: string[];
  countries?: string[];
  eta: string;
}

export const EXPANSION_PHASES: ExpansionPhase[] = [
  {
    phase: 1,
    name: "UK Foundation",
    status: "live",
    cities: ["London", "Manchester", "Edinburgh", "Birmingham", "Leeds", "Glasgow", "Bristol", "Liverpool", "Newcastle", "Sheffield"],
    eta: "Q1 2025"
  },
  {
    phase: 2,
    name: "Northern Europe",
    status: "coming-soon",
    countries: ["Ireland", "France", "Germany", "Netherlands"],
    eta: "Q3 2025"
  },
  {
    phase: 3,
    name: "Southern Europe & US",
    status: "planned",
    countries: ["Spain", "Italy", "Portugal", "USA"],
    eta: "Q1 2026"
  },
  {
    phase: 4,
    name: "Asia & Australia",
    status: "planned",
    countries: ["Australia", "Thailand", "Vietnam", "Japan"],
    eta: "Q3 2026"
  }
];
