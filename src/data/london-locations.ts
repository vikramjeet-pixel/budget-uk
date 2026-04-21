export interface Borough {
  name: string;
  neighbourhoods: string[];
}

export const LONDON_LOCATIONS: Borough[] = [
  {
    name: "Camden",
    neighbourhoods: ["Kentish Town", "Camden", "Hampstead", "Kings Cross", "Euston", "Bloomsbury", "Holborn", "Fitzrovia"],
  },
  {
    name: "Hackney",
    neighbourhoods: ["Shoreditch", "Hackney", "Dalston", "London Fields", "Finsbury Park"],
  },
  {
    name: "Southwark",
    neighbourhoods: ["London Bridge", "Bermondsey", "Borough", "Camberwell", "Bankside", "Peckham", "Borough Market"],
  },
  {
    name: "Lambeth",
    neighbourhoods: ["Brixton", "Vauxhall"],
  },
  {
    name: "Tower Hamlets",
    neighbourhoods: ["Whitechapel", "Spitalfields", "Bethnal Green"],
  },
  {
    name: "Westminster",
    neighbourhoods: ["Covent Garden", "Soho", "Fitzrovia", "Maida Vale", "Embankment"],
  },
  {
    name: "Islington",
    neighbourhoods: ["Holloway", "Finsbury Park", "Kings Cross", "Old Street", "Clerkenwell", "Farringdon"],
  },
  {
    name: "Kensington and Chelsea",
    neighbourhoods: ["South Kensington", "Kensington"],
  },
  {
    name: "Wandsworth",
    neighbourhoods: ["Battersea"],
  },
  {
    name: "Brent",
    neighbourhoods: ["Cricklewood"],
  },
  {
    name: "City of London",
    neighbourhoods: ["City of London", "Farringdon", "Bank"],
  },
];

export function getBoroughForNeighbourhood(neighbourhood: string): string {
  const borough = LONDON_LOCATIONS.find((b) =>
    b.neighbourhoods.includes(neighbourhood)
  );
  return borough ? borough.name : "Other";
}
