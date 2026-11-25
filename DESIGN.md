---
name: Jibble Web App (Draft)
description: Product-wide design system for the logged-in Jibble web app. Starts from the Figma UI Concept and grows in code as screens need it.
colors:
  primary: "#FC6300"
  primary-350: "#FDA66D"
  primary-100: "#FEE8D9"
  primary-25: "#FFF9F6"
  ink: "#070717"
  ink-825: "#161628"
  ink-750: "#2C2C39"
  ink-650: "#4B4B53"
  ink-muted: "#707074"
  ink-subtle: "#949495"
  ink-hover: "#1D1D2E"
  surface: "#FFFFFF"
  surface-100: "#FAFAFA"
  surface-150: "#F7F7F6"
  surface-200: "#F2F2F1"
  surface-250: "#EDEDEB"
  border-450: "#CBCBC7"
  hover-key: "#B0B0B0"
  hover-support: "#DADAD8"
  disabled: "#E5E5E5"
  status-green: "#16A713"
  status-green-tint: "#EBF7EB"
  status-red: "#E50041"
  status-red-tint: "#FDEEF2"
  status-yellow: "#FDA300"
  status-yellow-tint: "#FFF8EB"
  ap-violet: "#C102D2"
  ap-pink: "#CD2978"
  ap-red: "#CE3726"
  ap-orange: "#B55306"
  ap-green: "#068203"
  ap-turquoise: "#077E67"
  ap-blue: "#266DD0"
  ap-purple: "#9143EA"
  ultimate: "#A2218A"
  ultimate-100: "#FFEFFF"
  ultimate-200: "#FFD8FE"
typography:
  headline-1:
    fontFamily: "PolySans Neutral"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "38px"
    letterSpacing: "-0.01em"
  numbers-1:
    fontFamily: "PolySans Neutral"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  numbers-2:
    fontFamily: "PolySans Neutral"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "-0.01em"
  title-1:
    fontFamily: "PolySans Neutral"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "-0.01em"
  title-2:
    fontFamily: "PolySans Neutral"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "-0.01em"
  title-3:
    fontFamily: "PolySans Median"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0em"
  body-1:
    fontFamily: "PolySans Neutral"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "-0.01em"
  body-1-slim:
    fontFamily: "PolySans Slim"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: "20px"
    letterSpacing: "-0.01em"
  body-2:
    fontFamily: "PolySans Neutral"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "-0.01em"
  body-2-slim:
    fontFamily: "PolySans Slim"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: "16px"
    letterSpacing: "-0.01em"
  label-1:
    fontFamily: "PolySans Neutral"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "-0.01em"
  label-1-slim:
    fontFamily: "PolySans Slim"
    fontSize: "14px"
    fontWeight: 300
    lineHeight: "18px"
    letterSpacing: "-0.01em"
  label-2:
    fontFamily: "PolySans Neutral"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "12px"
    letterSpacing: "-0.01em"
  label-2-slim:
    fontFamily: "PolySans Slim"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: "12px"
    letterSpacing: "-0.01em"
  label-3-slim:
    fontFamily: "PolySans Slim"
    fontSize: "10px"
    fontWeight: 300
    lineHeight: "16px"
    letterSpacing: "0em"
  button-1:
    fontFamily: "PolySans Neutral"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "-0.01em"
rounded:
  base: "4px"
spacing:
  sm: "8px"
---

<!-- DRAFT for review (2026-11-16). Product-wide design system for the Jibble web app. Screen-specific material lives in .impeccable/surfaces/. Figma was only read; no component has been implemented yet. -->

# Design System: Jibble Web App (Draft)

## How to read this draft

This file holds what is **reusable across the whole product**: foundations, components, interaction states and rules. Screen layouts, scenarios and screen-level UX questions live in the surface briefs (`.impeccable/surfaces/`). The workflow and the document map are in PRODUCT.md, Design Workflow.

Every statement carries one of three tags.

| Tag | Meaning |
|---|---|
| ✅ **Confirmed** | Read directly from PRODUCT.md or the Figma concept (variables, text styles, layers, screenshots), or decided by you. Safe to build on. |
| 🧪 **Hypothesis** | My inference or a proposal. Plausible, but not yet validated with you or with users. |
| ❓ **Missing** | Context I could not find. Needs input before it can be decided. |

**Where values come from.** The Figma UI Concept (`IxEzpqNPY2D655pIJ8N1qc`) is the initial reference. The tokens in the frontmatter are the variables and text styles that the first candidate surfaces actually use. They are a starting set, not a complete or closed list. ✅ When a component is implemented in code and approved, its code becomes the maintained implementation and this file is updated to match the code. ✅ (PRODUCT.md, Design Workflow)

**Component status.** Every component carries one of three statuses:

| Status | Meaning |
|---|---|
| **Reference** | Exists only in the Figma concept. |
| **In code** | Implemented in HTML/CSS and under review in the browser. |
| **Approved in code** | Its code is the maintained implementation, with decision notes alongside it. |

✅ Today every component is **Reference**; nothing is implemented yet. A component missing from Figma can go straight to **In code**.

**How the system grows.** New tokens, components and states are added when a screen needs them, never by migrating the Figma library upfront. ✅ The initial migration decisions for the first candidate surfaces (Dashboard, Timesheets) are recorded in SECTION-C-PROPOSALS.md. That file is a historical record, not a whitelist. ✅

**Placeholder data.** The concept's sample names, organization and hours are illustrative only and are never carried into the system as facts. Real Jibble terminology is kept. ✅

## Overview

**Visual direction: decided.** ✅ Develop and extend the existing Figma concept. Preserve its visual language, and use it consistently whenever additional components or states are needed. (PRODUCT.md, Decision 1.) No separate Creative North Star or new visual identity is being chosen; the concept is the direction.

**How to extend it.** 🧪 When a screen needs a component or state the concept lacks, derive it from what the concept already defines before inventing anything: its colors, type styles, radius, borders, spacing values, shadow and state vocabulary. Record anything genuinely new as a gap, with the reason, so it can be reviewed.

What the existing concept says about its own visual language ✅:

- A light, airy workspace: white and warm-grey surfaces, one near-black ink, one orange accent from the Jibble mark. Dense data (tables, charts, timelines) sits in generous white space.
- Dark panels are rare. The only one seen is a single widget in Deep Ink.
- Promotional and gamified moments (plan upsell banner, leaderboard, mobile-app promo) use their own palette and illustration, separate from task UI.

Two audiences share the product: the owner or manager who reviews and approves, and staff who clock in. ✅ (PRODUCT.md)

**Key Characteristics:**
- ✅ One typeface family (PolySans) in three widths (Neutral, Slim, Median).
- ✅ Neutral surfaces, orange used sparingly, status shown with green / red / yellow plus tints.
- ✅ Real task states shown in-line (ongoing, Rest day, Vacation Leave, Deleted), in line with the PRODUCT.md principle "show real task states, not decoration".
- 🧪 Task UI and promotional UI should stay visually distinct wherever they share a screen.

## Colors

The palette is neutral-led with one orange accent and a functional status set. ✅

### Primary
- **Jibble Orange** (#FC6300): ✅ brand accent. Seen on the onboarding progress card, active sort controls, the Jibble mark, and the current page number. Tints: 350 `#FDA66D`, 100 `#FEE8D9`, 25 `#FFF9F6`.
- 🧪 By my calculation orange on white is about 3:1, below the 4.5:1 normally needed for small text. Treat orange as a fill or large-element color until contrast is verified. ❓ Not yet verified in a tool.

### Neutral
- **Deep Ink** (#070717): ✅ primary text, filled dark buttons, the rare dark panel.
- **Ink steps** (#161628, #2C2C39, #4B4B53, #707074, #949495): ✅ text hierarchy, from strong to muted and subtle.
- **Ink hover** (#1D1D2E): ✅ the Figma variable "Key Hovered 900"; icon color on hovered ghost buttons. Pressed uses "Key Pressed 900", which has the same value as Ink 750.
- **Surfaces** (#FFFFFF, #FAFAFA, #F7F7F6, #F2F2F1, #EDEDEB): ✅ page, card, hover, track and tab-background steps. Support 250 (`#EDEDEB`) is the standard hairline border.
- **Borders and states** (#CBCBC7 border; #B0B0B0 and #DADAD8 hover; #E5E5E5 disabled): ✅ named as interaction variables in Figma. #CBCBC7 also marks breaks in time visualizations.

### Status
- **Green** (#16A713, tint #EBF7EB): ✅ Clock in, ongoing, Approved.
- **Red** (#E50041, tint #FDEEF2): ✅ Deleted, Meetings chip, errors.
- **Yellow** (#FDA300, tint #FFF8EB): ✅ Break. 🧪 Probably also "Pending", but not confirmed.

### Activities & Projects palette
Eight user-assignable colors (violet `#C102D2`, pink `#CD2978`, red `#CE3726`, orange `#B55306`, green `#068203`, turquoise `#077E67`, blue `#266DD0`, purple `#9143EA`), each tuned in OKLCH to the same 5.0:1 contrast on white, with 75 and 25 tints. ✅ They color anything tied to a user's activity or project: chips, breakdown bars, timeline segments. ✅ They also color initials avatars, assigned by a hash of the initials (see Decisions recorded). They are bound as variables in Figma. ❓ Whether to carry the full set is undecided.

### Ultimate plan
Magenta set (`#A2218A`, tints `#FFEFFF`, `#FFD8FE`). ✅ Used only for plan upsell. 🧪 A promotional-only palette, never used in task UI.

### Named Rules
**The Quiet Accent Rule.** 🧪 Orange stays rare on any screen. Status and activity colors carry meaning; orange carries brand.

**The Status Is Never Color Alone Rule.** 🧪 Status always pairs color with a text label, as the concept already does ("ongoing", "Rest day", "Deleted").

**The Bound Value Rule.** 🧪 Colors come from tokens, never typed in. The concept breaks this in places, for example a hard-coded current-page orange and an unbound hover fill (`#F8F0E8`, now dropped). Code binds them.

❓ **Missing:** dark mode (none in the concept), a contrast audit, and whether the concept's tokens match the production Jibble app.

## Typography

**Family:** ✅ PolySans (Neutral, Slim, Median).

❓ **Missing:** webfont files, licensing for the HTML/CSS prototype build, and an approved fallback stack. Until resolved, browser designs render in a fallback and look different from the Figma.

❓ **CSS family names are not verified.** In Figma the family is `PolySans` and Neutral, Slim and Median are *style* names. The frontmatter writes them as `"PolySans Neutral"`, `"PolySans Slim"` and `"PolySans Median"`. Whether the real webfont exposes them as separate families or as weights of one family can't be confirmed until the font files exist (PolySans isn't installed in the inspected Figma session). The weights below (400, 300, 600) are read from Figma. The family string is a placeholder.

✅ **Letter spacing.** The Figma text styles store it in percent: `-1%` on almost every style, `0%` on Title/T3 and Label/L3 Slim. In CSS that is `-0.01em` and `0em`, as written in the frontmatter.

✅ **Not carried into the system:**
- ad-hoc tracking overrides (`+1%`, `-2%`);
- a 7px file-type badge;
- the Tobias display face on the plan banner;
- Headlines/H1 Slim (28/38, 300), used once, on one word of the Dashboard greeting;
- unused or test styles (Headlines/H2 Neutral, "Special style", "f", "Link", Presentation/*).

Any of these can be added later if a screen needs it.

✅ **Token coverage.** Every style listed under Hierarchy below has a frontmatter definition, including the three Slim styles `body-2-slim`, `label-1-slim` and `label-2-slim`. Each was checked against its Figma text style, and its weight against a text layer using it.

| Token | Figma style | Size / line | Tracking | Weight | Where it is used (checked) |
|---|---|---|---|---|---|
| `body-2-slim` | Body/P2 Slim | 12 / 16 | -1% | 300 | secondary text on all three concept surfaces |
| `label-1-slim` | Label/L1 Slim | 14 / 18 | -1% | 300 | label/value rows in the summary card; very widely used elsewhere |
| `label-2-slim` | Label/L2 Slim | 12 / 12 | -1% | 300 | small labels in the summary card |

❓ Line height 12 on 12px text (Label 2) leaves no leading. It is the Figma value and is recorded as is, but wrapping or multi-line use needs checking in code.

### Hierarchy ✅
- **Headline 1** (400, 28/38): page-level greeting or heading.
- **Numbers 1** (400, 28/28): large stat figures.
- **Numbers 2** (400, 16/16): secondary figures.
- **Title 1 / 2** (400, 16/20 and 14/20): card and section titles.
- **Title 3** (Median 600, 12/16): small emphasized titles.
- **Body 1** (400, 14/20; `body-1-slim` 300): table and list text.
- **Body 2** (400, 12/16; `body-2-slim` 300): secondary text.
- **Label 1 / 2** (400, 14/18 and 12/12; `label-1-slim` and `label-2-slim` 300): controls, chips, table headers, label/value rows.
- **Label 3 Slim** (`label-3-slim`, 300, 10/16, tracking 0): smallest annotation, such as time-axis labels.
- **Button 1** (400, 14/18): all buttons.

✅ Slim is not a rare, low-emphasis style. Across the three concept surfaces it appears on 192 text layers at 14px (against 149 in Neutral) and on 53 at 12px (against 143 in Neutral).

❓ The rule for choosing Slim over Neutral isn't written down in the concept, so no role split is recorded. 🧪 Whether Slim at 10-12px passes legibility checks is unverified.

## Layout

✅ Desktop web, supported from **1040 to 1920 CSS pixels** (PRODUCT.md, Decision 4). Figma draws every web frame at **1440**, so 1440 is the reference width and other widths are derived from it. Behavior below 1040 is outside this first phase. Mobile is a separate, later phase.

### App shell (every logged-in screen) ✅
**Decided:** the sidebar and top bar stay as designed in Figma: appearance, structure and navigation arrangement. Only their layout adapts, and only as needed for the supported widths. (PRODUCT.md, Decision 2.) Measured from layers; content padding from screenshots.

- **Left sidebar, 232px wide:**
  - logo and collapse control;
  - onboarding progress card;
  - main navigation (Dashboard, Timesheets, Live locations, Time off, Reports);
  - a collapsible **Settings** group (People, Time tracking, Schedule & Calendar, Shifts, Time off, Locations, Activities & Projects, Integrations);
  - a mobile-app promo at the bottom.
- **Top bar, 60px tall, 24px side padding, 24px gap between its two groups:**
  - left group: page tabs (on a detail view, a back button then tabs);
  - right group, 542px: the time clock (last-clock-out text, then the activity/project clock control, then a play/stop button), a Members Board button, and the profile menu, with 16px gaps.
- **Content area:** about 24px side padding.
- **Page background:** ✅ `body` uses `--surface-150` (`#F7F7F6`, `shared/tokens.css`). Cards and panels sit on white (`--surface`).

**Sidebar across widths.** The sidebar stays at 232px across the whole supported range. The concept has a collapse control but draws no collapsed state: the sidebar component has only Default and Hover variants, both 232px. ❓ How collapsing behaves in the live app is not yet verified (PRODUCT.md, Functional Fidelity). If the live app collapses, that behavior is reproduced and its look is designed from the concept's language, as a recorded gap. 🧪 It is not used to buy width automatically.

### Responsive foundations (product-wide)

**Content width.** Let `C` be the width of the area right of the sidebar: viewport minus 232, and minus a classic vertical scrollbar (up to about 17px) when one is present. `C` is 808 at 1040, 1208 at 1440 and 1688 at 1920. ✅ arithmetic from the measured shell.

**Rules.** ✅ from the decision; the mechanics are 🧪 starting points to confirm in the browser.
1. **No accidental page overflow.** The page never scrolls horizontally at any width in the range. Where content is wider than its container, the overflow is contained in a deliberate scroll region (rule 6).
2. **Nothing is hidden to fit.** Every control, column, field, action and piece of information in the 1440 design stays reachable at every supported width. Allowed: fluid sizing, tighter spacing, wrapping, stacking, truncation with the full text available on hover, on focus and to assistive technology, and scrolling inside a container. Not allowed: dropping a column or control, or moving something where keyboard users can't reach it.
3. **Order of adaptation.** Apply the gentlest change that fits, and only when needed: (a) fluid sizing; (b) tighter spacing, down to documented floors; (c) wrap rows; (d) stack columns; (e) contain overflow in a scroll region with pinned key columns. Prefer an earlier step over a later one.
4. **Continuous, not stepped.** Layouts respond across every intermediate width, using fluid sizing and content-driven thresholds, not just at a few named breakpoints.
5. **Floors, not fixed widths.** Each component states a minimum size. Nothing has a fixed width larger than its container. Flex and grid children can shrink (`min-width: 0`), so ellipsis and wrapping work.
6. **Scroll regions are accessible.** A scroll region is keyboard-focusable, has a label and a visible focus style, and shows a cue that more content exists (a partly visible column or an edge shadow).
7. **Floating layers stay on screen.** Dropdowns, menus and tooltips (the organization and account menus are 272px wide) flip or clamp so they never extend past the viewport.
8. **Wider is not just stretched.** Extra width goes first to the flexible parts of a layout (table day columns, the main column of a detail view), not to empty margins. ❓ Whether content gets a maximum width at 1920 is checked at review.

**Top bar across widths.** ✅ measured at 1440. Width it needs, left group plus 24px gap plus right group (542px) plus 48px padding:
- list view with two tabs (214px): 828px;
- detail view with a back button and three tabs (380px): 994px.

At 1040 the available `C` is 808, or about 791 with a scrollbar, so both overflow without help: by roughly 20 to 37px for the list view and 186 to 203px for the detail view. 🧪 Starting ladder, applied only as far as the width requires:
1. side padding and group gap 24px to 16px (saves 24px);
2. tab inner padding 16px to 12px (saves 16px for two tabs, 24px for three);
3. the "Last out …" text leaves the bar (saves 165px). It stays available in the clock control's tooltip and accessible name, and nothing else in the shell changes.

The list view fits after steps 1 and 2. The detail view needs all three, with only about 10px to spare at 1040 and a scrollbar. ❓ Step 3 moves visible information into a tooltip. It is the one shell adaptation that does, and is up for review.

**Testing the range.** 🧪 Check at 1040, 1100, 1152, 1280, 1366, 1440, 1536, 1680 and 1920, plus a continuous sweep between them, with and without a classic scrollbar. At each width confirm there is no horizontal page scroll, no clipped control, and that every control is reachable.

How a given screen applies these rules (its columns, floors and stacking points) is in its surface brief. The Timesheets list and Time entries view are in `timesheets.md`.

### Spacing
✅ Only one spacing variable (`space-sm`, 8px) is bound in the concept. Common fixed values: 16px card padding, 40px between card sections, 24px content padding. ❓ No full spacing scale exists. 🧪 Build one in code from these values when the first components are implemented; don't invent it upfront.

## Elevation & Depth

Mostly flat: tonal layering and hairline borders. ✅ The one defined shadow is **Dropdown shadow**: `0 0 3px #0000000D, 0 8px 24px #0000000A`, used on menus and popovers.

**The Flat-By-Default Rule.** 🧪 Surfaces are flat at rest; shadow appears only on floating layers.

## Shapes

- ✅ One radius variable: `generic-border-radius` = 4px. Used on cards, tracks and bars.
- ✅ Fully round icon buttons: radius 20 on 20px and 28px ghost icon buttons.
- 🧪 From screenshots: pill-shaped tabs and filters, circular pagination buttons, and some cards rounder than 4px. ❓ These radii were not read per component.
- ✅ Avatars are circular. Sizes: 32, 40, 48, 72.

## Components

Reusable components, independent of the screen they first appeared on. **Status is Reference for all of them** until implemented. ✅ Figma node IDs and the migration decisions for the first surfaces are in SECTION-C-PROPOSALS.md. The frontmatter has no `components` block yet: sub-tokens get recorded from code once each component is implemented, not guessed from Figma. ❓

### Interaction states (product-wide)

✅ **State vocabulary in the concept:**
- buttons: Enabled, Hovered, Pressed, Disabled;
- form fields (Dropdown field): Enabled, Hovered, Focused, Filled, Filled & Focused.

✅ **State tokens:**
- hover: `hover-key`, `hover-support`, and `ink-hover` for ghost icons;
- pressed: Ink 750;
- disabled: `disabled`.

✅ **Ghost buttons** show hover and press through icon color only, with no background. Decided by you for the add-entry action as well.

✅ **Focus is missing.** None of the 121 button variants has a focus state. Form fields have one.

🧪 **Selected and current** have no shared pattern. For example, Pagination marks the current page only with an orange text override. Define one in code.

**The Visible Focus Rule.** 🧪 Every interactive element gets one shared, visible focus style, designed in code because Figma has none. PRODUCT.md requires keyboard operability.

**The Reveal-On-Focus Rule.** 🧪 A control that appears only on hover must also appear when it, or its row or cell, has keyboard focus. Otherwise keyboard users can't reach it. It applies today to the hover-only add-entry action, which you decided.

❓ Hover-only controls have no equivalent on touch screens. Mobile is a later phase, but tablet use of the web app is unaddressed.

### Buttons
- ✅ Types: Outlined (text, icon, left-icon), Ghost (text, icon), Filled (text, icon), plus the Tracker Button (Clock in, Resume, Members Board).
- ✅ Sizes: Default and Small. Small ghost icon is 20px; Default is 28px.
- ✅ "Filled / Outlined Ultimate" exist for upsell only.

### Chips
✅ Default, count, activity, project, ongoing, filter-list count, and time-entry chips (clock in, break, clock out).

### Tables
✅ Weekly member table:
- member cell (avatar, name, role);
- sortable day headers (with today and rest-day markers);
- a total column;
- cell types: text, chip, avatar, ongoing, empty, text and chip.

🧪 The table should generalize beyond Timesheets.

### Pagination
✅ Outlined 36px buttons (white fill, Support 250 border), arrow buttons at both ends, numbers with "...", and a "Show [n] … on page" size select (Dropdown field, Default type). The current page has no proper selected state; see Interaction states.

### Navigation
✅ Sidebar menu tabs and a collapsible settings group, top-bar page tabs, segmented tabs (light and dark), and calendar day tabs.

### Filters and dropdowns
✅ A filter family (multi-select, single select, date with date picker, schedules, tracked hours, add filter) built on one Dropdown family: selector, list item, search, multi-select list, field. The parts are specified in Selects, Inputs and Search below.

### Selects
Read from Figma on 2026-11-18. ✅ unless tagged otherwise. All text is **Label/L1 Slim** (14/18, `label-1-slim`) in Ink (`#070717`), radius 4, borders 1px.

**Dropdown Selector** (`615:499037`), the filter-bar trigger:
- Hugs its label, 36px tall. Padding 8 / 12 / 10 / 12, gap 4. White fill.
- Content: label, an optional count chip (orange `#FC6300`, hidden by default, prop `Show chip`), then a 16px chevron.
- States, shown by the border:

| State | Border | Label and chevron |
|---|---|---|
| Enabled | Support 250 `#EDEDEB` | Ink, chevron down |
| Hovered | Support Hovered 250 `#DADAD8` | Ink, chevron down |
| Pressed | Support Pressed 250 `#BEBEBB` | Ink, chevron down |
| Activated (open) | Primary 100 `#FEE8D9` | Orange `#FC6300`, chevron up |
| Selected (has a value) | Primary 100 `#FEE8D9` | Orange `#FC6300`, chevron up |

- Activated and Selected look the same in Figma. 🧪 They need to differ in code: open versus holding a value.
- The orange label is a raw `#FC6300`, not bound to a variable, and fails 4.5:1 on white. ✅ Code uses `#C24C00` (`--primary-text`).
- `#BEBEBB` (Support Pressed 250) is now `--pressed-support` in `shared/tokens.css`. ❓ Not yet in the frontmatter.

**Dropdown** (`673:511845`), the open panel:
- White, Support 250 border, radius 4, **Dropdown shadow** (`0 0 3px #0000000D, 0 8px 24px #0000000A`).
- **Multi-Select:** 200px wide. From top to bottom: a Dropdown / Search row, a list (4px padding), then a footer row ("Clear selection"). With more than 5 items the list scrolls: max list height 184px, with a 10px Scroll Bar.
- **Single-Select:** narrower (140px in the sample). A list only, with 4px padding, no search and no footer. Its shadow is the first layer only (`0 0 3px #0000000D`), not bound to the style. 🧪 Use the full Dropdown shadow for both.

**Dropdown / List Item** (`609:498725`):
- Rows are 36px; avatar rows are 48px. Padding 8 / 12 / 10 / 12 (chip and avatar rows 8 / 12 / 8 / 12), gap 8, radius 4.
- Props:
  - Usage: Single-Select, Multi-Select, Footer;
  - Type: Text only, Chip, Avatar & Text, Avatar & Text with description;
  - Selected; State; optional leading icon, trailing icon and count chip.
- **Single-Select:** label, then a 16px check (`icon / check-small`) at the end. Selected rows get Support 100 `#FAFAFA`.
- **Multi-Select:** a 16px checkbox first, then the label and an optional count chip (Support 200). Selected rows keep a white fill; only the checkbox changes.
- **Footer:** full width, padding 8 / 16 / 10 / 16, top border Support 250, no radius.
- **Hovered:** Support 150 `#F7F7F6`, for every usage.
- **Description** (in avatar rows): Label/L2 Slim (12/12) in Ink 400 `#949495`. Avatars are 32px.
- No keyboard-highlighted (active-descendant) state, and no disabled item. 🧪 In code, the keyboard highlight uses the hover fill.

**Dropdown field** (`588:497085`), a form select:
- 240px wide. The field is 36px tall: padding 8 all round, gap 8, white fill, radius 4.
- Optional title above it (Atom / Input title, 8px gap), which makes it 56px.
- Types: **Default**, with a chevron; **Date Selector**, with a calendar icon instead; **Chip**, where the value shows as a chip.
- Optional leading and trailing icons.
- States: Enabled, Hovered, Focused, Filled, Filled & Focused. Their borders follow the Input states below; there is no Disabled or Error state.
- The Chip type is used by no concept screen (see SECTION-C-PROPOSALS.md).
- The Pagination page-size select uses `Label=No, State=Filled, Type=Default`.
- **Use it for pick-one-from-a-list fields (rule, 2026-11-18).** ✅ Never use a native `<select>` in a form or side panel. Build it with `createDropdownField` (`shared/dropdown.js`, styles `.dd` in `shared/shell.css`): it opens the single-select Dropdown list, supports keyboard (arrows, Home/End, Esc, Tab), flips up when short of room, and exposes `.value` and a replaceable `.items`.

**Dropdown field, shared component. Status: In code.** ✅ `createDropdownField(root, items, { onChange })` in `shared/dropdown.js`, styles `.dd` in `shared/shell.css`. Required variant: `data-required` on the root (set by `enhanceDropdownSelect` from the native `required` attribute on the `<select>`) hides the clear (×) button and the menu's "Clear selection" footer, so the field always holds a value. Fields without it are unchanged. Used by the clock-in panel (location, activity, project), the Add manual time form, the Timesheets Export drawer (Time format and Duration format, both required), and the Time off add and edit drawer (Member and Policy, both required).
- Opens a single-select menu with an in-menu search (`.field-search--menu`), a "No … found" line, and a "Clear selection" footer. A clear (circled ×) button also shows beside a filled value.
- Chip mode: set `data-chip="color"` or `data-chip="grey"` on the root and values show as chips.
- `.value` getter and setter; `.items`, `.disabled` and `.invalid` setters.
- `enhanceDropdownSelect(select)` swaps the UI of a native `<select>` that stays as the hidden form value.

**In code (2026-11-18).** ✅ You decided to align the code with Figma. `.filter__btn` and `.menu` in `shared/shell.css` now follow these specs.
- **Trigger:** radius 4, padding 8 / 12 / 10 / 12, Slim label. Borders: Hovered `#DADAD8`, Pressed `#BEBEBB` (new token `--pressed-support`).
- **Open and has a value:** Primary 100 border, label and chevron in `--primary-text` (`#C24C00`, new token). Open also flips the chevron up; that's the only difference between the two states.
- **Count chip:** a `--primary-text` fill.
- **Menu:** radius 4, padding 4, Dropdown shadow. Rows follow the List Item specs. A selected single-select row gets Support 100 and an Ink check.
- **Footer:** a full-width row with a top border. Multi-Select filter menus have "Clear selection" only, as in Figma; choices apply as you tick them, and the menu closes on Escape or a click outside. The hours filter keeps "Apply" on the right, because its values apply only on Apply.
- **In-menu search:** follows Dropdown / Search exactly (see Search below). The 2px orange focus underline used earlier is gone: focus shows only the orange caret, as in Figma.
- **Unchanged:** the account menu keeps its 8px radius, and the pagination size select keeps an Ink value when open.
- **Dashboard filters (2026-11-18).** ✅ The Locations, Groups and Schedules menus now follow **Dropdown, Multi-Select** (`673:511845`):
  - a Dropdown / Search row on top, filtering the list as you type, with a "No … found" line when nothing matches;
  - Multi-Select list items: checkbox, label, then the member count as a count chip (Support 200 `#F2F2F1`, Ink text) in place of plain grey meta text;
  - a footer reading "Clear selection" (was "Clear") and nothing else, as in Figma. ✅ "Done" was removed on 2026-11-18 from these menus and the Timesheets list filters.
  - 🧪 The panel is at least 200px wide (Figma's fixed width) but grows to fit longer labels. The 184px scroll list isn't needed yet: no dashboard filter has more than 5 options.
- The in-menu search and the primary footer action now live in `shared/shell.css` (scoped to `.menu`), so Dashboard and Timesheets share them.

### Inputs
✅ Read from Figma on 2026-11-18.

**Atom / Input** (`615:499380`) is the text content shared by every field. Its states:
- **Placeholder:** Support 450 `#CBCBC7`.
- **Active text:** the value, in Ink.
- **Placeholder with caret** and **Active text with caret:** the same, plus a 1×16px caret in Jibble Orange `#FC6300`.

All text is Label/L1 Slim (14/18).

**input base** (`503:493949`), the text field:
- **Title:** Atom / Input title (`503:493847`), in Label/L2 Neutral (12/12) Ink, with an optional 16px info icon at a 4px gap.
- **Field:** 36px tall, padding 8, gap 8, white fill, 1px Support 250 border, radius 4.
- **Field contents:** an optional 16px leading icon (Ink 650), the input, an optional Small ghost icon button (20px, the clear action), and an optional 16px trailing icon.
- **Error text:** below the field (hidden by default), in Label/L2 Neutral, Red 550 `#E50041`.
- 8px gap between title, field and error. Default width 240.

**States** (shared with Dropdown field and Search field):

| State | Border | Content |
|---|---|---|
| Enabled | Support 250 `#EDEDEB` | Placeholder |
| Hovered | Support Hovered 250 `#DADAD8` | Placeholder |
| Focused | Primary 100 `#FEE8D9` | Placeholder + orange caret |
| Filled | Support 250 | Value in Ink |
| Filled & Focused | Primary 100 | Value + caret |

Gaps:
- 🧪 The Primary 100 focus border is about 1.1:1 against white, so it can't count as a visible focus indicator. Code keeps the shared 2+2px focus ring (decision above) and may also tint the border.
- 🧪 Placeholder `#CBCBC7` on white is about 1.6:1, below the 4.5:1 that WCAG asks of placeholder text. Use Ink 400 `#949495` or darker in code. Contrast audit, open question 3.
- ❓ There is no Disabled, Read-only or Error border state; only the error text exists. Define them in code from the concept: `disabled` fill and Red 550 border.
- **Input types** (`625:503609`): `Text`, `Left_icon`, `Right_icon`, `Double_icon`, each with and without a title, plus Enabled, Hovered, Focused, Filled, Disabled and Error states. 🧪 The Disabled and Error states exist here, so the gap above is partly closed.
- **Time entry (clock-in panel, 2026-11-18).** ✅ Follows Dropdown field `588:499453`: one field showing "11:27 AM" in Label/L1 Slim Ink with a 16px clock icon at the right. In code the time is a plain **text input** for `h:mm` (no native `type="time"`, no picker) followed directly by **AM / PM as a clickable text button** in the same type style; clicking it switches AM and PM. Typing `14:05` flips it to PM. The value is checked against the range from the last clock event to now.
- **Text area** (`673:523098`): full width in the panel, **120px tall**, padding **12** (not 8), 1px border, radius 4, no resize handle. Placeholder "Add a note" (Support 450). Hover, Focus (Primary 100 border, orange caret, **no ring**) and Filled follow the States table.
- **Focus in the clock panel (2026-11-18).** ✅ Text inputs and the text area show Figma's Focused look only: Primary 100 border and orange caret, no 2+2px ring. 🧪 That border is about 1.1:1 against white, so keyboard focus is weak. Revisit with the contrast audit.
- 🧪 In the Dropdown field, the Filled states reuse the `Placeholder` variant with overridden text. Build them as the `Active text` (Ink) state.

### Date picker
✅ Read from Figma on 2026-11-18 (`1352:517458`). One card with three views, switched by the title:
- **Days:** title "Jun 2022", Monday-first weekday row of one letter each, M T W T F S S (Body/P2 Neutral, 12/16; decided by you, Figma shows three-letter names), a 7×6 grid of 36px day cells with 4px gaps, and a pill below.
- **Months:** title "2022", a 3×4 grid of month names.
- **Years:** title "2020 – 2029", a 3×4 grid showing one decade.
- **Header:** two 16px chevrons (Left, Right) with the title between, 253px wide, Title/T2 (14/20) in Ink. The chevrons step a month, a year or a decade. The title steps up one view (days → months → years). Picking a year opens its months, picking a month opens its days.
- **Card:** 308px wide (Figma 280px; cells are 4px larger by your decision), white, 1px Support 250 border, Dropdown shadow, 15px padding (276px content; header and grid 16px apart). Radius 4 like the other menus.
- **Cell states:** default (Ink Slim 300; 14/18 on day, month and year cells by your decision, Figma shows 12/16), hover (Support 150 fill, radius 4), today (orange text), selected (Key/Primary 550 `#FC6300` fill, white text), outside the month (Figma Key 400 `#949495`; code uses Ink muted `#707074` so the 12px text keeps 4.5:1). Day cells are 36×36 (Figma 32×32). Month and year cells are about 92×36.
- **Footer pill** (`629:503770`): Button/B1 (14/18) Ink on white, 1px Support 250 border, radius 20, padding 4 12 6, centred 16px below the grid. No fill at rest or on hover; hover darkens the border to `#DADAD8`. In the concept it reads "Go to current week".

Decided in code:
- **Today on white uses `#C24C00`,** the deeper orange step (see Decisions recorded), so the text keeps 4.5:1.
- **Days after the allowed date are disabled** (Support 450, not-allowed cursor), and the next chevron disables with them. The clock panel allows today at most.
- **Footer pill is contextual** (decided by you). Days view: "Today" when another day is picked, "Go to current month" when the shown month is not the current one (checked first). Months and years views: "Go to current year" when the shown year or decade is not the current one. Otherwise it is hidden. It slides and fades in and out (about 0.2s) and is skipped under reduced motion. Week pickers keep "Go to current week".
- **Keyboard:** arrows move by day (±1) and week (±7), PageUp/PageDown change month, Escape closes and returns focus to the field. Outside days stay clickable and jump to that date.
- **Opens from a Select-style field:** 36px tall, Support 250 border, label left, 16px calendar icon right. The card opens 2px below it, or above when there is no room.

🧪 Built as `shared/date-picker.js` (`createDatePicker`) with styles in `shared/shell.css`. Used in the clock panel's date field.

### Search
✅ Read from Figma on 2026-11-18.

**Search field** (`625:501516`), used standalone (for example above the Timesheets table):
- 240×36. Padding 8 / 12, gap 8, white fill, 1px border, radius 4.
- Content: a 16px search icon in Ink, then the input.
- States are the same five as Inputs, with the same borders.
- Filled states add a Small ghost icon button (20px) at the end to clear the value.
- Prop: `Show Info icon`.

**Dropdown / Search** (`615:499195`), the search row at the top of a Multi-Select Dropdown:
- Full panel width, 39px tall (8 + 20px input + 10, plus the 1px border). Padding 8 / 16 / 10 / 16, gap 8. Top corners round to 4px.
- No box of its own: only a bottom border in Support 250.
- 16px `icon / search` in Ink `#070717` in every state.
- Text is Label/L1 Slim (14/18). Placeholder "Search" in Support 450 `#CBCBC7`; typed text in Ink.
- States:

| State | What shows |
|---|---|
| Enabled | Icon, placeholder |
| Focused | An orange caret (`#FC6300`) before the placeholder. Nothing else changes |
| Filled | Ink text, orange caret, and a 16px `icon / remove / small` (circled ×) in Ink 400 `#949495` at the far end, to clear |

- There is no hover state, and focus doesn't change the border or icon.
- ✅ Typing never resizes the menu. Only the list sets its width (at least 200px): filtered rows collapse but keep their width, and the search row and "No … found" line don't count.
- ✅ **In code (2026-11-18):** `.menu .field-search--menu` in `shared/shell.css`, on Dashboard and Timesheets filter menus. The remove button (`.field-search__clear`, `#i-x-circle`) appears only when there is text; it clears the search, shows the whole list again and keeps focus in the field. Its hover turns it Ink.
- 🧪 The Support 450 placeholder is about 1.6:1 on white, below the 4.5:1 that WCAG asks of text. Kept to match Figma; the leading icon and the menu's context carry the meaning.

**Search behaviour follows the text field Input** (`625:503609`, type Left_icon). ✅ Read from Figma and decided by you on 2026-11-18. In code it is in `shared/shell.css` and applies to `.search` and `.field-search`. The in-menu search is the exception: it follows Dropdown / Search above (no border box, no hover, Ink icon in every state).

| State | Border | Leading icon | Text |
|---|---|---|---|
| Enabled | Support 250 | Ink 650 `#4B4B53` | Placeholder |
| Hovered | Support Hovered 250 | Ink 650 | Placeholder |
| Focused | Primary 100, plus the shared focus ring | **Orange `#FC6300`** | Placeholder or value, orange caret |
| Filled (not focused) | Support 250 | Ink 650 | Value in Ink |
| Disabled | Support 250, white fill | Ink 400 `#949495` | Ink 400 |
| Error | Red 550 `#E50041`, plus error text below (Label/L2 Neutral, Red 550) | Ink 650 | — |

- The prototype goes Enabled → hover → Hovered → click → Focused → click → Filled. Its "mouse leave returns to Enabled" from Focused is a prototype shortcut; in code focus lasts until blur.
- The Input component has no clear button. ✅ Decided by you (2026-11-18): the clear button from Search field is kept, so no control is removed.
- 🧪 Error isn't wired for search, because a search query can't be invalid. The state is ready for other text fields.

🧪 Behaviour for code:
- The search filters the list as you type.
- Escape clears the search first, then closes the panel.
- The clear button is a real `<button>` with an accessible name and returns focus to the input.
- An empty result shows a "No results" row rather than an empty panel.

### Fields in code (2026-11-18)
✅ Every search, select and text field on Dashboard and Timesheets now follows the Selects, Inputs and Search specs above.

| Where | Element | Follows |
|---|---|---|
| Dashboard, Who's in/out | Member search (`.search`) | Search field |
| Timesheets, list | Search (`.field-search`) | Search field |
| Timesheets, filter menus and member picker | In-menu search (`.field-search--menu`) | Dropdown / Search |
| Dashboard, Locations, Groups and Schedules filters | In-menu search (`.field-search--menu`), count chip (`.menu__meta`) | Dropdown / Search, List Item |
| Timesheets, member detail | Timezone select (`.field-select`) | Dropdown field |
| Timesheets, member detail | Member picker (`.who`) | Dropdown field |
| Timesheets, member detail | Member list (`.who-opt`) | List Item, Avatar & Text |
| Timesheets, Export and Add manual time drawers | Selects, inputs, textarea (`.field`) | Dropdown field, input base |
| Both, clock-in panel | Selects, inputs, textarea (`.clock-dialog`) | Dropdown field, input base |
| Timesheets, hours filter | Hour inputs (`.hrs`) | input base |
| Both | Filter, period, date, page-size and add-filter triggers, and every `.menu` | Dropdown Selector, Dropdown (see Selects) |

What changed:
- **Fields:** 36px tall, padding 8 (search fields 8 / 12), radius 4, Slim value text in Ink, orange caret.
- **Borders:** Support 250 at rest, `hover-support` on hover, Primary 100 when focused or open. Focus also shows the shared 2+2px focus ring.
- **Text:** placeholders use Ink 400 `#949495`, not Figma's `#CBCBC7` (contrast). Field titles are 12/12 in Ink, 8px above the field.
- **Icons:** chevrons are Ink and point up while open.
- **Disabled select:** the `disabled` fill and border.
- **Member list:** rows are 48px with radius 4; the selected row gets Support 100.
- **Fonts:** `select` and `textarea` now inherit the app font. The note field was falling back to monospace.

### Profile and organization menus
✅ Avatar trigger in the top bar, opening account and organization menus (list items, divider, Dropdown shadow).

### Time entry row
✅ Avatar, time, type chip, platform flag (mobile, web, browser extension, kiosk, desktop, message), contextual flags (offline, location, face recognition, break violation, auto clock-out, manual), activity and project chips, note, duration, edit and delete; a Deleted state.

### Accordions
✅ Header plus rows; used for tracked hours, payroll hours and change history.

### Time-of-day timeline
✅ In the concept it's built from plain shapes, not a library component:
- a 16px track in Support 200, with Activities & Projects colored segments and break segments in #CBCBC7;
- a split-time marker in Ink 750;
- an hour ruler (the "Dial"). By your decision the Dial is **built in HTML only**, with no Figma component.

Measurements are in SECTION-C-PROPOSALS.md, section 5.

### Label/value summary card
✅ In the concept it's built from plain frames, not a library component:
- bordered card (Support 250, 1px, radius 4) with 16px padding;
- titled groups of label/value rows, label left and value right.

🧪 To be composed in code from tokens.

### Hover-revealed add action
✅ A ghost icon button (Small, 20px) with a 16px plus. Decided by you:
- hidden at rest and shown on hover;
- hover darkens the icon to `ink-hover`, with no background.

🧪 Must also follow the Reveal-On-Focus Rule.

### Link button ("Go to…")
✅ Text link with a trailing 16px arrow-right, used in widget footers ("Go to time off", "Go to locations", "Go to timesheets"). Decided by you:
- text and arrow are `ink` (black) at rest, not grey;
- hover shifts to `ink-hover`, and the arrow nudges 2px right;
- no underline, no background.

### Shared small parts
✅ Avatar (image, initials, icon), tooltip, divider, online dot, scroll bar, progress bar, search field and input atoms.

**Icons.** ✅ Remix Icon line glyphs, not inline SVG. Build them with `riIcon(id, cls)` from `shared/icons.js`, which returns `<i class="i ri-…" aria-hidden="true">` from a lookup of short ids (`clock`, `search`, `chevron-down`). Sizes in `shared/tokens.css`: `i.i` is 20px, `i.i-16` is 16px. `remixicon.css` is loaded on Dashboard, Timesheets and Time off. Figma icon names (`icon / search`) map to these glyphs.

## Do's and Don'ts

### Do:
- **Do** keep Jibble's name, logo, and terminology. ✅ (PRODUCT.md)
- **Do** use placeholder or clearly illustrative data only. ✅ (PRODUCT.md)
- **Do** design a missing component directly in code, following these foundations. Don't wait for Figma. ✅ (PRODUCT.md, Design Workflow)
- **Do** record each component decision alongside its code, and update this file when a component reaches Approved in code. ✅
- **Do** add tokens and components when a screen needs them, and put reusable parts here rather than in one screen. ✅
- **Do** reference tokens by their Figma names while Figma is still the reference, so design and code stay traceable. 🧪
- **Do** extend the concept's visual language consistently when a new component or state is needed (Overview, How to extend it). ✅
- **Do** make every layout work across 1040 to 1920 px, following the responsive foundations. ✅

### Don't:
- **Don't** fabricate customer data, metrics, testimonials, or benchmarks. ✅ (PRODUCT.md)
- **Don't** migrate the whole Figma library upfront. ✅
- **Don't** treat the initial migration record as a whitelist. ✅
- **Don't** treat a Figma component as final once its code is approved. The code wins. ✅
- **Don't** redesign the sidebar or top bar's appearance, structure or navigation arrangement. Adapt their layout only as the supported widths require. ✅
- **Don't** hide a control, column or piece of information to make a layout fit, and don't let the page scroll horizontally. ✅
- **Don't** change what a feature does to suit a visual. Behavior comes from the live product, and conflicts are flagged, not silently resolved (PRODUCT.md, Functional Fidelity). ✅
- **Don't** put screen-specific layouts or scenarios in this file. They belong in surface briefs. ✅
- **Don't** ship interactive controls without a visible focus style. 🧪
- **Don't** touch the Figma Archive page (marked "DO NOT ENTER"). 🧪 Inferred from its name.

## Open questions (system-wide)

Screen-level questions are in the surface briefs. Decisions already made are recorded once, in PRODUCT.md, Decisions.

**Resolved** ✅ (not repeated here): visual direction, shell scope, responsive range, who approves.

**Still open**
1. ❓ A shared focus style and a shared selected/current state, both to be designed in code.
2. ❓ PolySans webfont availability and licensing for the HTML build.
3. ❓ Contrast audit (orange text, faint timeline ticks, Slim at small sizes).
4. ❓ A spacing scale and dark mode.
5. ❓ How sidebar collapsing behaves in the live app, and what a collapsed sidebar looks like (it is not drawn in Figma).
6. ❓ Top bar ladder, step 3: moving "Last out …" into a tooltip at the narrowest widths (see Layout).
7. ❓ Whether content has a maximum width at 1920.
8. ❓ Where per-component decision notes live next to the code, and whether Figma is kept in sync once code becomes the source.


## In code (2026-11-18)

Timesheets (`timesheets/`) and Dashboard (`dashboard/`) are built. Their shared shell and controls now live in `shared/shell.css`: sidebar, top bar, tabs, clock control, buttons, segmented control, filter pills, menus. Tokens are in `shared/tokens.css`. Status of these components: **In code**, under review.

New in code with Timesheets (gaps designed from the concept language):
- **Weekly member table.** A real `<table>` with sortable headers (`aria-sort`). Day cells are links into the member's day. Rest day and leave chips are anchored at the top of the cell, with hours centred below. Member and Total columns are pinned, with scroll shadows. Member 302→240px, Total 140→100px, day floor 112px.
- **Hover-revealed add action.** Shown on cell hover and on focus-within (Reveal-On-Focus Rule).
- **Calendar popover.** The selected period is a grey band, and today has an orange dot.
- **Hours filter menu.** Exclude options, plus More than / Less than / Between / Equal to, with Clear selection and Apply.
- **Right-side drawer.** 480px, with scrim, focus trap, and Escape to close; focus returns to the trigger. Used for Export and Add manual time.
- **Toast.** Deep Ink, with an optional Undo.
- **Entry row type chip.** Outlined: Clock in green, Break yellow, Clock out grey. Platform and flag icons carry tooltips.
- **Account and organization menu.** 272px, shared by both pages through `shared/account.js`. Arrow keys move through it, Escape closes it and returns focus, and it stays inside the viewport.
- **Selected state.** The current page is an orange outline on primary-25.

Decisions recorded:
- ✅ **Initials avatars are coloured.** Each avatar gets one of the eight Activities & Projects colours, picked by a hash of its initials so the same person always gets the same colour (`shared/avatar-colors.js` sets `data-c` 0-7 on `.avatar`; `shared/shell.css` maps each to a 16% tint of the colour on white as background and a 70% mix with black as text).
- **Today on white uses `#C24C00`, a deeper step of Jibble Orange.** It keeps orange text at or above 4.5:1. The brand `#FC6300` stays for fills and large marks.
- **Text inputs use the shared 2+2px focus ring,** like every other control.
- **Font.** Inter remains the stand-in for PolySans (open question 2).
