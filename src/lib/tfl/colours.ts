// Official TfL brand colours — keyed by the line name as returned by the API.
// Ref: https://content.tfl.gov.uk/tfl-brand-identity-guidelines.pdf

export const LINE_HEX: Record<string, string> = {
  "Bakerloo":            "#B36305",
  "Central":             "#E32017",
  "Circle":              "#FFD300",
  "District":            "#00782A",
  "Hammersmith & City":  "#F3A9BB",
  "Jubilee":             "#A0A5A9",
  "Metropolitan":        "#9B0056",
  "Northern":            "#000000",
  "Piccadilly":          "#003688",
  "Victoria":            "#0098D4",
  "Waterloo & City":     "#95CDCE",
  "DLR":                 "#00AFAD",
  "London Overground":   "#EF7B10",
  "Elizabeth line":      "#9364CC",
  "Elizabeth Line":      "#9364CC", // API returns both casings
  "Bus":                 "#E1251B",
  "National Rail":       "#0B0B0C",
  "Tram":                "#66A206",
};

export const LINE_TEXT: Record<string, string> = {
  "Circle":              "#1c1c1c",
  "Hammersmith & City":  "#1c1c1c",
  "Waterloo & City":     "#1c1c1c",
};

/** Returns { bg, text } inline-style values for a line pill. */
export function lineStyle(lineName: string): { backgroundColor: string; color: string } {
  return {
    backgroundColor: LINE_HEX[lineName] ?? "#1c1c1c",
    color: LINE_TEXT[lineName] ?? "#ffffff",
  };
}
