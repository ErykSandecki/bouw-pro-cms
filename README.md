# BouwPro CMS

A project management and content administration system built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** – build tool
- **Tailwind CSS v3** – styling
- **Inter** – typography (Google Fonts)
- **Material Symbols** – icons (Google Fonts)

## Project Structure

```
bouwpro/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Icon.tsx          # Material Symbols wrapper
│   │   ├── MilestoneItem.tsx # Deletable milestone row
│   │   ├── Sidebar.tsx       # Left navigation sidebar
│   │   └── TopBar.tsx        # Top header with search
│   ├── pages/
│   │   ├── LoginPage.tsx     # Authentication screen
│   │   └── DashboardPage.tsx # Project creation form
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   ├── theme.ts              # Design tokens (colors)
│   ├── App.tsx               # Root with page routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Tailwind + global styles
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Design System

Colors and tokens are defined in `src/theme.ts` and `tailwind.config.js`, based on the Material Design 3 color system with a warm dark palette (`#733934` brand, `#f6b0a6` primary container).

## Features

- **Login page** – split-panel with branding, email/password fields, SSO button, loading animation
- **Dashboard** – sidebar navigation, top search bar, project creation form with:
  - Core specifications (title, description, rooms, area, date, location)
  - Technologies & milestones (add/delete rows dynamically)
  - Phase gallery upload placeholders (Preparation / Build / Finishing)
  - Master assets panel (cover image + gallery)
  - Site context map placeholder
  - Publish / Save as Draft / Discard actions

# bouw-pro-cms
