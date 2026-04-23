export const PROJECT_TYPES: { label: string; value: string }[] = [
  { label: "Renovations", value: "renovations" },
  { label: "New constructions", value: "newConstructions" },
  { label: "Huge scale", value: "hugeScale" },
];

export type ProjectType = "renovations" | "newConstructions" | "hugeScale";

export const SUB_OPTIONS: Record<ProjectType, { label: string; value: string }[]> = {
  renovations: [
    { label: "Bathrooms", value: "bathrooms" },
    { label: "Homes", value: "homes" },
    { label: "Annexes", value: "annexes" },
    { label: "Luxury finishes", value: "luxuryFinishes" },
  ],
  newConstructions: [
    { label: "Newly built homes", value: "newlyBuiltHomes" },
    { label: "Luxury finishes", value: "luxuryFinishes" },
    { label: "Annexes", value: "annexes" },
  ],
  hugeScale: [
    { label: "Offices", value: "offices" },
    { label: "Public facilities", value: "publicFacilities" },
  ],
};

export const LOCALE_TO_LANG: Record<string, string> = {
  "en-AU": "en", "de-AT": "de", "nl-BE": "nl", "pt-BR": "pt",
  bg: "bg", "en-CA": "en", hr: "hr", el: "el",
  cs: "cs", da: "da", et: "et", fi: "fi",
  fr: "fr", de: "de", "en-GI": "en", "en-HK": "en",
  hu: "hu", "en-IN": "en", "en-IE": "en", it: "it",
  ja: "ja", lv: "lv", "de-LI": "de", lt: "lt",
  "fr-LU": "fr", ms: "ms", mt: "mt", "es-MX": "es",
  nl: "nl", "en-NZ": "en", nb: "no", pl: "pl",
  pt: "pt", ro: "ro", "en-SG": "en", sk: "sk",
  sl: "sl", es: "es", sv: "sv", "de-CH": "de",
  th: "th", "en-AE": "en", "en-GB": "en", en: "en",
  "en-CY": "en",
};
