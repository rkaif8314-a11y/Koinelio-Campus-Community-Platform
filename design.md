# Koinelio Design System

> Living visual and interaction guide. Updated: 7 November 2026.

## 1. Design intent

Koinelio should feel like a credible campus product: calm, useful, editorial, and carefully structured. It must not look like a generic AI dashboard template.

Design principles:

- Clear hierarchy before decoration.
- Warm neutral light surfaces and layered graphite dark surfaces.
- Restrained sage accent; avoid the old indigo/purple-heavy palette.
- Strong readable text, purposeful whitespace, subtle borders.
- Consistent controls and component behavior across routes.
- Show real product states; never invent campus metrics, members, posts, or events to fill empty space.

## 2. Typography

- Primary family: Inter via `next/font/google` in `app/layout.tsx` (`--font-inter`).
- Fallback: system sans-serif stack.
- Use a small, consistent type scale. Page title first; section titles second; supporting labels and metadata clearly subordinate.
- Body copy should use short sentences and plain language.
- Use tabular numerals for dates, counts, and statuses where alignment matters.

## 3. Color tokens

Define colors in `app/globals.css`. New components should consume tokens, not introduce one-off hex values.

### Light theme

| Token | Value | Use |
|---|---|---|
| `--k-bg` | `#fbfaf7` | App/page background |
| `--k-surface` | `#ffffff` | Cards, menus, forms |
| `--k-surface-muted` | `#f2efe9` | Secondary surface |
| `--k-surface-hover` | `#eae6de` | Hover/selected neutral surface |
| `--k-ink` | `#1c1c1b` | Main text |
| `--k-ink-soft` | `#4a4a47` | Secondary text |
| `--k-muted` | `#6d6d67` (or the currently verified contrast-adjusted value) | Muted labels |
| `--k-accent` | `#5c7a6f` | Sage accent |
| `--k-accent-hover` | `#4e695f` | Accent hover |
| `--k-on-accent` | `#ffffff` | Text on light-theme accent |
| `--k-border` | `#dcd4c7` | Main border |
| `--k-border-soft` | `#e7e2d9` | Quiet divider |
| `--k-danger` | `#a94c42` | Destructive/error state |
| `--k-warning` | `#8a5a1e` | Warning state |
| `--k-success` | `#4d6b60` | Success state |

### Dark theme

Dark mode uses `:root[data-theme="dark"]`; it is not a separate brand. Keep clear luminance separation between the page, cards, nested surfaces, and hover state.

| Token | Value | Use |
|---|---|---|
| `--k-bg` | `#111518` | Page background |
| `--k-surface` | `#191f24` | Cards and main panels |
| `--k-surface-muted` | `#222a30` | Secondary panels |
| `--k-surface-hover` | `#2b353c` | Hover/selected surface |
| `--k-ink` | `#f2f5f3` | Main text |
| `--k-ink-soft` | `#c4cdc8` | Secondary text |
| `--k-muted` | `#98a49e` | Muted labels |
| `--k-accent` | `#9fbeaf` | Sage accent on graphite |
| `--k-accent-hover` | `#b3cebf` | Accent hover |
| `--k-on-accent` | `#101814` | Text on light sage accent |
| `--k-border` | `#38434a` | Main border |
| `--k-border-soft` | `#2c363d` | Quiet divider |
| `--k-danger` | `#e58e86` | Error/destructive |
| `--k-warning` | `#e5bf80` | Warning |
| `--k-success` | `#a5cfb7` | Success |

If token values are changed, update this table and check text contrast again. Do not trust a contrast ratio copied from a previous preview after changing colors.

## 4. Semantic tokens

Use the tokens consistently:

- `--k-accent-light`: soft accent container/background.
- `--k-danger-light`, `--k-warning-light`, `--k-success-light`: semantic containers.
- `--k-focus-ring`: visible keyboard focus ring.
- `--k-on-danger`: readable foreground for danger buttons.

Never communicate status by color alone. Pair color with text/icon/label.

## 5. Shared components

Existing reusable primitives live in `components/ui/`:

- `Button`: primary, secondary, danger, ghost; disabled/loading states.
- `Input`: visible label, helper/error message, `aria-invalid`, `aria-describedby`.
- `Card`, `CardHeader`, `CardSection`: consistent surface/border/padding.
- `Badge`: neutral and semantic status badges.
- `Alert`: error/success feedback.
- `StatePill`: workflow status labels (pending, approved, rejected, active, etc.).
- `EmptyState`: useful empty state with optional action.

Prefer these primitives instead of duplicating button/input/card styles. Extend them only when the variation is reusable and does not break existing call sites.

## 6. Layout patterns

- Dashboard desktop: fixed/consistent sidebar, clear top header, centered content column with readable max width.
- Dashboard mobile: compact header and accessible mobile navigation; no hover-only controls.
- Forms: labels above inputs, clear validation feedback, logical field order, explicit submit/cancel controls.
- Feed: content-first cards; action controls are visually secondary to the post.
- Directory: search and filter tools grouped before results; clear empty/loading/error states.
- Club governance: surface pending/approved states and role boundaries explicitly.
- Messaging: visually distinguish rooms and sender messages without relying on color alone.

## 7. Interaction and accessibility baseline

Target WCAG 2.2 AA for normal product UI:

- Text contrast at least 4.5:1 for normal text; 3:1 for large text and essential non-text UI indicators.
- Visible keyboard focus on buttons, links, tabs, menus, inputs, and file selectors.
- Every input has a programmatic label; errors connect through `aria-describedby` and `aria-invalid`.
- Icon-only buttons have an accessible name.
- Tabs and toggles expose keyboard-operable state (`aria-selected`, `aria-pressed`, etc. as appropriate).
- Dynamic status/messages use appropriate live regions, without excessive announcements.
- Target size: aim for 44×44 CSS px; never fall below applicable WCAG 2.2 minimums without a documented exception.
- Respect `prefers-reduced-motion` and avoid unnecessary animation.
- Layout must remain usable at 200% zoom and on narrow mobile screens.

A static mockup or CSS calculation is not a full accessibility audit. Test keyboard navigation and real browser behavior.

## 8. Theme behavior

- `ThemeProvider` stores the user preference under `koinelio-theme` and sets `data-theme` on the root `<html>` element.
- The CSS token layer in `app/globals.css` reacts to `:root[data-theme="dark"]`.
- A page that hardcodes light hex values bypasses the theme; use semantic CSS variables instead.
- Test at least dashboard, feed, profile, forms, club management, messaging, events, and notifications in both modes.

## 9. Imagery and content

- Use imagery only when it provides product meaning (club logo, avatar, event banner, attached post media).
- Do not generate fake users, fabricated engagement counts, fake testimonials, or fake official notices.
- Preserve private-media URL/signing behavior.
- Provide meaningful alt text for informative images; decorative images should use empty alt text.

## 10. Visual acceptance checklist

- [ ] Light theme has warm neutral page/card separation.
- [ ] Dark theme has distinct graphite surface layers, not one flat near-black block.
- [ ] Sage remains an accent, not a large decorative wash.
- [ ] Text contrast is checked after token changes.
- [ ] Focus is visible with keyboard navigation.
- [ ] Empty/error/loading states are intentional and understandable.
- [ ] Mobile navigation and touch controls work.
- [ ] No legacy indigo/purple styling leaks through.
- [ ] No feature/data behavior was replaced with a visual mock.
