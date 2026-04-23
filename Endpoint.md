# Firestore — Projects Collection

Collection path: `projects/{projectId}`

---

## Document Structure

```json
{
  "id": "string",
  "projectType": "string",
  "projectSubtype": "string",
  "title": { "<locale>": "string" },
  "description": { "<locale>": "string" },
  "projectOverview": { "<locale>": "string" },
  "location": { "<locale>": "string" },
  "milestones": [{ "<locale>": "string" }],
  "rooms": "string",
  "squareMeters": "string",
  "scheduledCompletion": "string",
  "mainPicture": "string",
  "gallery": ["string"],
  "phases": {
    "preparation": ["string"],
    "buildPhase": ["string"],
    "finishing": ["string"]
  },
  "published": "boolean",
  "favourite": "boolean",
  "createdAt": "string"
}
```

---

## Field Reference

| Field | Type | Translated | Description |
|---|---|:---:|---|
| `id` | `string` | — | UUID generated with `crypto.randomUUID()` |
| `projectType` | `string` | — | One of: `Renovations`, `New constructions`, `Huge scale` |
| `projectSubtype` | `string` | — | Depends on `projectType` (see subtypes below) |
| `title` | `TranslatedString` | **Yes** | Project title |
| `description` | `TranslatedString` | **Yes** | Long-form project description |
| `projectOverview` | `TranslatedString` | **Yes** | Short summary of materials / techniques used |
| `location` | `TranslatedString` | **Yes** | City or country, e.g. `"Nederland"` |
| `milestones` | `TranslatedString[]` | **Yes** | Ordered list of milestone labels; each element is a `TranslatedString` |
| `rooms` | `string` | — | Number of rooms (stored as numeric string) |
| `squareMeters` | `string` | — | Floor area in m² (stored as numeric string) |
| `scheduledCompletion` | `string` | — | Target completion date — ISO 8601 (`yyyy-mm-dd`) |
| `mainPicture` | `string` | — | Firebase Storage download URL for the cover image |
| `gallery` | `string[]` | — | Firebase Storage download URLs for gallery images |
| `phases.preparation` | `string[]` | — | Storage URLs for Preparation-phase images |
| `phases.buildPhase` | `string[]` | — | Storage URLs for Build-phase images |
| `phases.finishing` | `string[]` | — | Storage URLs for Finishing-phase images |
| `published` | `boolean` | — | `true` = live, `false` = draft |
| `favourite` | `boolean` | — | Optional; marks the project as featured |
| `createdAt` | `string` | — | ISO 8601 timestamp set on creation |

---

## Translated Fields

Fields marked **Translated** are stored as a flat object keyed by **locale code**. The source language is always Dutch (`nl`). All other locales are machine-translated via the Google Translate API at save time.

### Type alias

```ts
type TranslatedString = Record<string, string>;
// e.g. { "nl": "...", "en-GB": "...", "de": "...", "de-AT": "...", ... }
```

### Supported locales

All locale keys used across translated fields:

```
nl, en-GB, en-AU, en-US, en-CA, en-ZA,
de, de-AT, de-CH,
fr, fr-BE, fr-CA, fr-CH,
it, it-CH,
es, es-419,
pt, pt-BR,
bg, hr, cs, da, et, fi, el,
hu, ja, lv, lt, ms, mt, nb,
pl, ro, sk, sl, sv, th
```

### Example — `title`

```json
"title": {
  "nl": "Renovatie Villa Amsterdam",
  "en-GB": "Villa Amsterdam Renovation",
  "en-AU": "Villa Amsterdam Renovation",
  "de": "Renovierung Villa Amsterdam",
  "de-AT": "Renovierung Villa Amsterdam",
  "fr": "Rénovation Villa Amsterdam",
  ...
}
```

### Example — `milestones`

```json
"milestones": [
  { "nl": "Sloopwerkzaamheden", "en-GB": "Demolition works", "de": "Abrissarbeiten", ... },
  { "nl": "Ruwbouw",            "en-GB": "Shell construction", "de": "Rohbau",         ... },
  { "nl": "Afwerking",          "en-GB": "Finishing",          "de": "Fertigstellung", ... }
]
```

---

## Project Types & Subtypes

| `projectType` | `projectSubtype` options |
|---|---|
| `Renovations` | `Bathrooms`, `Homes`, `Annexes`, `Luxury finishes` |
| `New constructions` | `Newly built homes`, `Luxury finishes`, `Annexes` |
| `Huge scale` | `Offices`, `Public facilities` |

---

## Firebase Storage Paths

Images are stored in Firebase Storage. The URLs stored in Firestore are public download URLs.

```
projects/{projectId}/cover/{filename}          → mainPicture
projects/{projectId}/gallery/{filename}        → gallery[]
projects/{projectId}/phases/preparation/{f}   → phases.preparation[]
projects/{projectId}/phases/buildPhase/{f}    → phases.buildPhase[]
projects/{projectId}/phases/finishing/{f}     → phases.finishing[]
```
