# Brodus — Design System

Reference document for all UI decisions. Bloomberg terminal aesthetic: dense, data-heavy, dark, minimal chrome.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brodus-background` | `#0B0F1A` | Page background, deepest layer |
| `brodus-panel` | `#121826` | Card/panel backgrounds |
| `brodus-surface` | `#1A2035` | Elevated surfaces, active sidebar items |
| `brodus-border` | `#1F2A44` | Borders, dividers, separators |
| `brodus-hover` | `#253052` | Hover states on interactive elements |
| `brodus-text` | `#E6EAF2` | Primary text |
| `brodus-muted` | `#8C96A9` | Secondary text, labels, placeholders |
| `brodus-accent` | `#3B82F6` | Active states, links, focused inputs, selected items |
| `brodus-green` | `#22C55E` | Positive values, success states |
| `brodus-red` | `#EF4444` | Negative values, danger states, errors |
| `brodus-amber` | `#F59E0B` | Warnings, neutral alerts |

## Typography

- **UI text:** Inter (400, 500, 600, 700)
- **Data/numbers:** JetBrains Mono (400, 500) — tabular numerals for alignment
- **Base size:** 14px (text-sm) for most content
- **Dense data:** 13px (.font-data class) for table cells and numeric values
- **Labels:** 11px (text-xs) uppercase tracking-wide for section headers

## Spacing

Dense spacing throughout. Prefer tight padding:
- Row padding: `py-1.5 px-3` (not py-2+)
- Section gaps: `gap-4` between major sections
- Card padding: `p-4` (not p-6)
- Grid gaps: `gap-2` for dense data, `gap-3` for forms

## Component Patterns

### Panels
```
rounded-lg border border-brodus-border bg-brodus-panel
```

### Interactive rows
```
border-b border-brodus-border px-3 py-1.5 hover:bg-brodus-hover transition-colors
```

### Action buttons (primary)
```
rounded border border-brodus-border bg-brodus-surface px-3 py-1.5 text-xs uppercase tracking-wide text-brodus-text hover:bg-brodus-hover transition-colors
```

### Action buttons (ghost)
```
rounded px-2 py-1 text-xs text-brodus-muted hover:text-brodus-text hover:bg-brodus-hover transition-colors
```

### Inputs
```
rounded border border-brodus-border bg-brodus-background px-3 py-1.5 text-sm text-brodus-text placeholder:text-brodus-muted focus:border-brodus-accent
```

### Section headers
```
text-xs font-semibold uppercase tracking-wide text-brodus-muted
```

## Value Coloring

- Positive numbers: `text-brodus-green` with `.value-positive` class (adds subtle green tint background)
- Negative numbers: `text-brodus-red` with `.value-negative` class (adds subtle red tint background)
- Neutral/missing: `text-brodus-muted` with em-dash (—)

## Icons

Using lucide-react. Standard sizes:
- Navigation: 18px (`size={18}`)
- Inline actions: 14px (`size={14}`)
- Empty states: 32px (`size={32}`)

## Layout

- Collapsible sidebar: 220px expanded, 56px collapsed
- Main content: max-width unconstrained (fills available space)
- Page padding: `px-6 py-5`
- Dense information layout — no wasted whitespace
