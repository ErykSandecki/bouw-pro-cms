export const PROJECT_TYPES = [
  "Renovations",
  "New constructions",
  "Huge scale",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const SUB_OPTIONS: Record<ProjectType, string[]> = {
  Renovations: ["Bathrooms", "Homes", "Annexes", "Luxury finishes"],
  "New constructions": ["Newly built homes", "Luxury finishes", "Annexes"],
  "Huge scale": ["Offices", "Public facilities"],
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
