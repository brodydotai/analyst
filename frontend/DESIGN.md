# Brodus — Terminal-Wide Design Directive

Visual reference: Messari.io — dark, data-dense financial terminal.

## Core Principles

1. **Panel-based layouts.** Every content block is a discrete "panel" — a rounded container with a border, panel background, and a header row. Pages are assembled from panels arranged in CSS grid layouts.
2. **Panel chrome.** Each panel has a header row: left-aligned title (text-xs, font-semibold, uppercase tracking-wide) + right-aligned action icons or controls. The header is separated from content by a bottom border.
3. **Pill toggles.** Use small rounded pill buttons for tab switching, filtering, and time ranges. Active pill: `bg-brodus-accent text-white rounded-full px-3 py-1 text-xs`. Inactive pill: `text-brodus-muted hover:text-brodus-text`.
4. **Dense data tables.** Rows use `py-1.5 px-3`. Numbers use the `.font-data` class (JetBrains Mono, tabular-nums). Column headers are `text-2xs uppercase tracking-wider text-brodus-muted`. Row dividers use `border-b border-brodus-border`.
5. **Value coloring.** Positive numbers: `text-brodus-green`. Negative: `text-brodus-red`. Use the `.value-positive` / `.value-negative` CSS classes for tinted backgrounds on key metrics.
6. **Sidebar.** Always expanded by default showing icon + label. Width: 220px. Active nav item uses left accent border or `bg-brodus-surface` fill.
7. **Typography.** Inter for UI text, JetBrains Mono for data/numbers. Base size: `text-sm` (14px). Dense data: `.font-data` (13px). Labels: `text-2xs` or `text-xs` uppercase. No large headings inside panels — the panel header IS the heading.
8. **Icons.** lucide-react, already installed. Nav: 18px. Panel actions: 14-16px. Inline: 12-14px. Color: `text-brodus-muted`, hover to `text-brodus-text`.
9. **Spacing.** Dense. Panel padding: `p-4`. Grid gaps: `gap-4` between panels, `gap-2` within tables. Prefer tight over spacious.
10. **Transitions.** Subtle: `transition-colors` on hover states. No flashy animations.

## Panel Component Pattern

```
<Panel title="Trade Log" actions={<button>...</button>}>
  {children}
</Panel>
```

Structure:
- Outer: `rounded-lg border border-brodus-border bg-brodus-panel`
- Header: `flex items-center justify-between border-b border-brodus-border px-4 py-2.5`
- Title: `text-xs font-semibold uppercase tracking-wide text-brodus-muted`
- Content: `px-4 py-3`

## PillToggle Component Pattern

```
<PillToggle options={[{ key, label }]} active={key} onChange={fn} />
```

Active pill:
```
bg-brodus-accent text-white rounded-full px-3 py-1 text-xs
```

Inactive pill:
```
text-brodus-muted hover:text-brodus-text
```

## Color Palette Reference

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0B0F1A` | Page bg |
| `panel` | `#121826` | Panel bg |
| `surface` | `#1A2035` | Elevated states, active sidebar |
| `border` | `#1F2A44` | All borders |
| `hover` | `#253052` | Hover states |
| `text` | `#E6EAF2` | Primary text |
| `muted` | `#8C96A9` | Secondary text |
| `accent` | `#3B82F6` | Active states, links, focus |
| `green` | `#22C55E` | Positive values |
| `red` | `#EF4444` | Negative values |
| `amber` | `#F59E0B` | Warnings |
