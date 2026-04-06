---
name: front-compact-ui
description: 'Use when designing or refactoring react-revjs frontend pages that should feel compact, refined, content-dense, tool-like, doc-like, or suitable for search/detail/BBS style content pages instead of marketing landing pages.'
---

# Front Compact UI

Use this skill when working on revjs frontend pages that should feel small, precise, and efficient.

## Primary Goal

Build frontend pages that read like capable product surfaces, not promotional hero pages.

## Baseline

- Default body copy and labels should usually stay within 12px to 16px.
- Spacing, card padding, and control sizes should stay compact before they become airy.
- Visual polish should come from hierarchy, border rhythm, muted surfaces, and restrained emphasis.
- Search pages, detail pages, tool workbenches, and community-style content pages should optimize scanning efficiency.
- Do not introduce poster-like hero sections, oversized type, or decorative empty space unless explicitly required.

## Interaction Rules

- Prefer native-feeling button feedback and simple state changes over hover lift, glow sweeps, or dramatic shadows.
- Keep action groups dense but readable.
- Use light surface separation, subtle status pills, and compact metadata rows.
- Favor persistent utility controls in shared header/footer areas when they help navigation or theme control.

## Layout Rules

- Reuse shared header, footer, and page container patterns when multiple front pages exist.
- Start from shared tokens in `src/styles/_tokens.scss`.
- Prefer compact cards, split panels, and two-column utility layouts over full-bleed marketing compositions.
- Keep explanatory copy short; tool pages should show state, controls, and output early.

## Avoid

- Large hero banners with broad decorative gradients as the main UI structure
- Oversized headings or labels by default
- Heavy drop shadows, floating hover animations, or brand-first embellishment
- Long blocks of onboarding copy when the page can communicate with metadata, labels, and action placement
