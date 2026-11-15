# Design System Specification — PYRO-SI
**Project:** GODEYE // PYRO-SI — Spacecraft Fire Safety Intelligence Platform  
**Standard:** Aerospace Precision UI / Human-System Standard (NASA-STD-3001)  
**Date:** November 15, 2026  
**Document Status:** FORMAL SPECIFICATION & DESIGN TOKENS

---

## 1. Color System & Semantic Tokens

All colors in PYRO-SI are strictly defined as CSS variables at `:root` and mapped directly into utility classes. No arbitrary hex colors or fluorescent neon glows are permitted in component styles.

### 1.1. Neutral Foundation (Deep Slate Palette)
Designed for high visual comfort during prolonged analysis and low-glare operational environments:

```css
:root {
  /* Canvas Backgrounds */
  --canvas-void: #090D16;          /* Primary deep void canvas */
  --canvas-subtle: #0D1322;        /* Secondary canvas background */
  
  /* Surface Layers */
  --surface-base: #131B2E;         /* Standard panel / card background */
  --surface-raised: #1A243D;       /* Hover state / elevated cards */
  --surface-overlay: #222F4F;      /* Modals / dropdowns / popovers */
  --surface-sunken: #0A0E18;       /* Inset input containers / chart backgrounds */

  /* Structural Borders */
  --border-subtle: rgba(255, 255, 255, 0.08); /* Hairline divider */
  --border-medium: rgba(255, 255, 255, 0.16); /* Interactive boundaries */
  --border-focus: #38BDF8;                     /* Active focus boundary */

  /* Typography Colors */
  --text-primary: #F8FAFC;        /* Headings, active values, primary copy */
  --text-secondary: #94A3B8;      /* Labels, metadata, secondary body */
  --text-muted: #64748B;          /* Inactive captions, footers, hints */
  --text-inverse: #090D16;        /* High-contrast text on bright accents */
}
```

### 1.2. Semantic Data Accents
Accents are applied strictly for functional meaning, never for arbitrary decoration:

```css
:root {
  /* Scientific Azure (Flight Dynamics, Telemetry, Primary Actions) */
  --accent-azure: #0284C7;
  --accent-azure-hover: #0369A1;
  --accent-azure-glow: rgba(56, 189, 248, 0.15);
  --accent-azure-text: #38BDF8;

  /* Combustion Amber (Flame Physics, Moderate Hazard, Thermal Tracking) */
  --accent-amber: #D97706;
  --accent-amber-subtle: rgba(245, 158, 11, 0.12);
  --accent-amber-text: #FBBF24;

  /* Hazard Coral (Exploration Atmospheres, Fire Quench Warning, Critical Limits) */
  --accent-hazard: #DC2626;
  --accent-hazard-subtle: rgba(239, 68, 68, 0.12);
  --accent-hazard-text: #F87171;

  /* Verified Emerald (Nominal Systems, NASA Archive Verified Records) */
  --accent-emerald: #059669;
  --accent-emerald-subtle: rgba(16, 185, 129, 0.12);
  --accent-emerald-text: #34D399;
}
```

---

## 2. Typography Scale & Hierarchy

PYRO-SI employs a disciplined two-family typographic hierarchy:
- **Primary Interface Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Data & Numerical Family:** `JetBrains Mono`, `IBM Plex Mono`, `ui-monospace`, `monospace`

```css
/* Type Scale */
.text-display {
  font-family: var(--font-sans);
  font-size: 1.5rem;       /* 24px */
  line-height: 2rem;       /* 32px */
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.text-title {
  font-family: var(--font-sans);
  font-size: 1.125rem;     /* 18px */
  line-height: 1.625rem;   /* 26px */
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.text-body {
  font-family: var(--font-sans);
  font-size: 0.875rem;     /* 14px */
  line-height: 1.375rem;   /* 22px */
  font-weight: 400;
  color: var(--text-secondary);
}

.text-caption {
  font-family: var(--font-sans);
  font-size: 0.75rem;      /* 12px */
  line-height: 1.125rem;   /* 18px */
  font-weight: 500;
  color: var(--text-muted);
}

/* Numerical Data Telemetry (Monospace) */
.text-data-lg {
  font-family: var(--font-mono);
  font-size: 1.5rem;       /* 24px */
  font-weight: 600;
  color: var(--text-primary);
}

.text-data-md {
  font-family: var(--font-mono);
  font-size: 0.875rem;     /* 14px */
  font-weight: 500;
  color: var(--text-secondary);
}

.text-data-sm {
  font-family: var(--font-mono);
  font-size: 0.75rem;      /* 12px */
  font-weight: 500;
  color: var(--text-muted);
}
```

---

## 3. Layout Grid & Spatial Metrics

1. **Fluid Grid:** 12-column responsive layout with max container width capped at $1680\text{px}$ to prevent visual dispersion on ultra-wide screens.
2. **Gutters & Padding:**
   - Desktop ($>1024\text{px}$): $24\text{px}$ column gutters, $32\text{px}$ outer page padding.
   - Tablet ($768\text{px}\text{--}1023\text{px}$): $16\text{px}$ gutters, $20\text{px}$ outer padding.
   - Mobile ($<768\text{px}$): $12\text{px}$ gutters, $16\text{px}$ outer padding.
3. **Card Border Radii:**
   - Small controls / chips / badges: $6\text{px}$ (`rounded-md`).
   - Cards / inputs / tab pills: $8\text{px}$ (`rounded-lg`).
   - Major view panels: $12\text{px}$ (`rounded-xl`).

---

## 4. Component Standards

### 4.1. Navigation Tabs
- Clean horizontal segmented bar with an understated active background (`bg-surface-raised border border-white/10 text-white shadow-sm`).
- Inactive tabs use muted secondary text with hover transition (`text-slate-400 hover:text-white hover:bg-white/5`).
- Never use all-caps with double slashes (e.g. `01 // ORBITAL & FLAME LAB`); use clean title case: `01. Lab Workspace`.

### 4.2. Buttons (All 6 Component States)
- **Primary Action (Azure):** Solid `#0284C7` background, white text, 8px radius, min 44px tap target.
  - Hover: `#0369A1`.
  - Active: `scale(0.98)`.
  - Focus: `outline: 2px solid #38BDF8; outline-offset: 2px`.
  - Disabled: opacity 40%, cursor not-allowed.
  - Loading: inline spinning circle with label preserved.
- **Secondary Action (Subtle Outline):** Surface background with `border border-white/10`, white text on hover.

### 4.3. Habitat Selector Cards
- Interactive selection cards with icon, habitat name, gravitational regime badge, and key atmospheric metric.
- Active card highlighted with clean azure border (`border-sky-500 bg-sky-500/10`) and subtle checkmark.
- Inactive cards styled with neutral hairline border (`border-white/10 bg-surface-base`).

### 4.4. Sliders & Simulation Controls
- Custom high-contrast slider tracks with filled active progress bars.
- Clear numeric indicator displaying exact unit ($p\text{O}_2\ \text{in psia}, v\ \text{in cm/s}$).
- Preset buttons that smoothly transition all sliders simultaneously.

### 4.5. Data Provenance Badges
- **Verified Flight Archive:** Green pill (`bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs`).
- **Empirical Demonstration Model:** Amber pill (`bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs`).
- **Planned Development:** Slate pill (`bg-slate-500/10 border border-slate-500/30 text-slate-400 font-mono text-xs`).

---

## 5. Responsive Design Breakpoints

| Breakpoint | Target Device | Layout Strategy |
| :--- | :--- | :--- |
| **`sm` ($\ge 640\text{px}$)** | Large Phones / Phablets | 2-column metric cards; full-width stacked visualization |
| **`md` ($\ge 768\text{px}$)** | Tablets (Portrait) | Tab navigation wraps gracefully; sliders expand to full width |
| **`lg` ($\ge 1024\text{px}$)**| Desktop / Laptops | 2-Column Split Lab Studio ($58\% / 42\%$); multi-column data matrix |
| **`xl` ($\ge 1280\text{px}$)**| Large Displays / Workstations | Full side-by-side comparison drawer; expanded simulation charts |

---

## 6. Accessibility & Human Factors Compliance (NASA-STD-3001)

1. **Color Contrast:** All body text meets WCAG 2.1 AAA ($>7:1$ contrast ratio). Secondary labels exceed $4.5:1$.
2. **Focus Visibility:** Every interactive button, tab, link, and slider input features an instantaneous, non-delayed `:focus-visible` ring (`2px solid #38BDF8`).
3. **Zero Strobing:** Nominal views contain no rapid blinking, pulsating animations, or vibrating scanline shaders.
4. **Semantic HTML:** Native `<button>`, `<input>`, `<nav>`, `<main>`, `<section>`, and `<header>` tags with correct ARIA labels for screen readers.
