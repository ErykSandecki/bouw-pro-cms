---
name: Project CMS System
colors:
  surface: "#171211"
  surface-dim: "#171211"
  surface-bright: "#3e3837"
  surface-container-lowest: "#120d0c"
  surface-container-low: "#201a19"
  surface-container: "#241e1d"
  surface-container-high: "#2f2928"
  surface-container-highest: "#3a3332"
  on-surface: "#ece0de"
  on-surface-variant: "#d7c2bf"
  inverse-surface: "#ece0de"
  inverse-on-surface: "#352f2e"
  outline: "#9f8d8a"
  outline-variant: "#524341"
  surface-tint: "#fcb5ab"
  primary: "#ffd3cd"
  on-primary: "#4f231d"
  primary-container: "#f6b0a6"
  on-primary-container: "#74413a"
  inverse-primary: "#865048"
  secondary: "#c6c6c7"
  on-secondary: "#2f3131"
  secondary-container: "#454747"
  on-secondary-container: "#b4b5b5"
  tertiary: "#b0e8d7"
  on-tertiary: "#00382d"
  tertiary-container: "#95ccbb"
  on-tertiary-container: "#21584a"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#ffdad5"
  primary-fixed-dim: "#fcb5ab"
  on-primary-fixed: "#350f0b"
  on-primary-fixed-variant: "#6a3932"
  secondary-fixed: "#e2e2e2"
  secondary-fixed-dim: "#c6c6c7"
  on-secondary-fixed: "#1a1c1c"
  on-secondary-fixed-variant: "#454747"
  tertiary-fixed: "#b6eedc"
  tertiary-fixed-dim: "#9ad2c1"
  on-tertiary-fixed: "#002019"
  on-tertiary-fixed-variant: "#174f43"
  background: "#171211"
  on-background: "#ece0de"
  surface-variant: "#3a3332"
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.04em
  code:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 40px
  gutter: 20px
---

## Brand & Style

This design system is engineered for high-performance project management and content administration. The brand personality is authoritative, sophisticated, and utilitarian. It balances a deep, warm background palette with sharp, high-contrast functional elements to ensure clarity during long work sessions.

The aesthetic follows a **Corporate Modern** approach with **Minimalist** influences. It prioritizes information density and legibility, using clear hierarchy and structural rigidity to manage complex data sets. The emotional response is one of stability and "quiet power," moving away from the cold grays of typical SaaS applications toward a more distinguished, editorial-toned environment.

## Colors

The palette is anchored by a deep, earthy neutral (#733934) which serves as the primary canvas. High-contrast legibility is achieved through the use of Neutral 8 (#f6b0a6) for secondary text and UI elements, and Neutral 10 (#ffffff) for primary headings and critical information.

Functionality is driven by a diverse accent palette:

- **Primary Action & Branding:** Neutral 8 (#f6b0a6) provides a soft but clear focal point.
- **Navigation & Links:** A bright periwinkle (#b6baff) ensures interactive elements are never confused with static content.
- **Semantic Feedback:** Standardized Green, Orange, and Red are utilized for status indicators, while Blue and Gold are reserved for metadata tagging and featured project highlights.

## Typography

The design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic weight distribution. As a CMS, the typography must handle dense tables and nested navigation menus without losing clarity.

- **Headlines:** Use Bold and Semi-Bold weights with slight negative letter-spacing for a modern, compact feel.
- **Body:** Standardized at 16px for optimal reading on desktop displays.
- **Labels:** Used for buttons, table headers, and tags. These utilize higher weights and increased letter-spacing to distinguish them from editable content.
- **Contrast:** Maintain a minimum 4.5:1 contrast ratio for body text against the deep background.

## Layout & Spacing

This design system employs a **12-column fluid grid** for main content areas, allowing the CMS to adapt from laptop screens to ultra-wide monitors.

- **Grid System:** A 20px gutter ensures clear separation between data columns.
- **Rhythm:** A 4px baseline grid governs all vertical spacing, ensuring that components like input fields and buttons align perfectly with text rows.
- **Density:** The system supports a "Compact" mode for data-heavy views (8px padding) and a "Default" mode for general administrative tasks (16px padding).

## Elevation & Depth

In this design system, depth is conveyed through **Tonal Layers** and **Subtle Inner Glows** rather than heavy drop shadows, which can appear muddy on deep backgrounds.

- **Level 0 (Base):** The #733934 background.
- **Level 1 (Cards/Panels):** A slightly lightened or darkened version of the base color with a 1px stroke (10% White) to define edges.
- **Level 2 (Modals/Popovers):** Elevated surfaces use a subtle ambient shadow (Black, 40% opacity, 20px blur) and a more pronounced border to separate them from the primary interface.
- **Interactivity:** Hover states are indicated by a 5% lightening of the element's surface color, creating a "lift" effect.

## Shapes

The shape language is **Soft**, utilizing a 4px (0.25rem) base radius. This creates a professional and precise appearance that feels more modern than sharp 90-degree angles, without the playfulness of overly rounded corners.

- **Buttons & Inputs:** 4px radius.
- **Cards & Containers:** 8px (rounded-lg) for clear containment.
- **Tags/Chips:** 12px (rounded-xl) to provide a visual distinction from actionable buttons.

## Components

### Buttons

Primary buttons use Neutral 8 (#f6b0a6) with dark text for maximum visibility. Secondary buttons are outlined in white with transparent backgrounds. Ghost buttons use the Link color (#b6baff) for low-priority actions.

### Input Fields

Inputs feature a dark-filled background (slightly darker than the base #733934) with a 1px border. The border glows in the Link color (#b6baff) when focused.

### Chips & Tags

Used for project status. They utilize the accent colors (Green, Gold, etc.) at 20% opacity for the background, with 100% opacity for the text to ensure legibility without being visually overwhelming.

### Cards

Cards are the primary container for project modules. They should have a subtle top-border in Neutral 8 to create a sense of alignment and "active" presence.

### Data Tables

Tables are the heart of this design system. Use alternating row highlights (2% white overlay) and sticky headers. Borders should be minimal, prioritizing whitespace for row separation.

### Navigation Sidebar

A vertical sidebar using a slightly darker shade of the background color. Active states are indicated by a vertical "pill" marker using the Gold accent (#b99c7c).
