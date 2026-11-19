# Initial migration and decision record

The first record of which Figma concept components the initial candidate surfaces (Dashboard, and Timesheets including Time entries) were cleared to use, which were skipped, and how orphaned components were replaced. Last updated 2026-11-16.

**What this record is, and isn't** ✅
- **It is** the decision history of the initial migration from the Figma UI Concept. Every approval, skip, dependency and replacement in it stands, and none is reopened.
- **It isn't** a whitelist or a permanent boundary of the design system. New screens bring in further concept components when they need them. Components the concept lacks are designed directly in code (PRODUCT.md, Design Workflow).
- **It isn't** an approval of code. "Approved" here means cleared to migrate from the Figma reference. A component's code becomes the maintained implementation only once it is implemented and approved in the browser (DESIGN.md, Component status).
- **Where later decisions go:** component decisions are recorded alongside the component's code and in DESIGN.md. Screen decisions go in the surface briefs (`.impeccable/surfaces/`). This record is extended only to correct the initial migration.

**Nothing has been included, copied, or recreated in Figma or elsewhere.** Figma was only read. The file keeps its original name (SECTION-C-PROPOSALS.md) so existing links still work.

**Source:** Figma file `IxEzpqNPY2D655pIJ8N1qc`, page `🧡 Design System` (`1078:514812`).

**Screens:** `D` = Dashboard (`345:488187`). `T` = Timesheets list (`211:477398`). `E` = Time entries (`2306:51443`), a member's view **within Timesheets**, not a separate surface.

**History of the scope rule.**
1. The migration first drew only on the page's two Figma sections (Organisms, Additional Components).
2. It then extended, component by component, to top-level frames and loose components.
3. Both rules are now retired in favour of the on-demand growth described in PRODUCT.md. Decisions made under them are unchanged.

**Status key**
- ☑ **approved, direct**: you approved it. It is placed directly on a screen.
- ☑ **approved, essential**: built into an approved component, which cannot render without it. Approved only as that dependency.
- ⛔ **skipped**: you decided not to include it.
- ☐ **pending**: not cleared in the initial migration. Left untouched for now. A later screen may still bring it in, with its own decision.
- ⚠ **flagged**: needs a decision from you.
- **HTML-only**: no Figma component is used or created. Designed in code from tokens.

**How "essential" was decided.** For each approved component set I read its own layers in Figma and listed every component it is built from, then repeated that for the newly approved dependencies, one level further. Anything that only appears on the screens through an unapproved component stays pending.

---

## 0. Components from the two Figma sections

Cleared for the initial surfaces as a group under the first scope rule. Moved here from DESIGN.md, which now holds only product-wide rules.

### Section: Organisms
| Component | Used on |
|---|---|
| Widget (Small, Medium), Widget Content / Members, Widget Content / Bar Chart, Bar | D |
| Widget / Activities & Projects, Tabs (Widget A&P), Legend Item | D |
| Widget / Tracked hours, Tracked Hours Chart | D |
| Card / Report Template, Card / Upcoming Events, Card / Location | D |
| Tabs (Usage: Dashboard, Timesheets) and top bar / tabs | D, T, E |
| Time clock, Time clock Content | D, T, E |
| CTA Banner | D, T, E |

The Tabs usage "Widget Championship" belongs only to the skipped leaderboard. ✅

### Section: Additional Components
| Component | Used on |
|---|---|
| avatar (sizes 32, 40, 48, 72; image, initials, icon) | D, T, E |
| Member (stack avatar) | D |
| Add (Report Template, Holiday, Time Off, Shift, Location) | D |
| Location, Status, Scroll Bar | D |
| Online Dot, Button w/o tooltip | T |
| Button Content, Custom Buttom, tooltip, Onboarding progress card, Progress bar | D, T, E |

---

## 1. Components from top-level frames

### Direct (8)

| # | Component | Frame (node) | Node | Screens | Status |
|---|---|---|---|---|---|
| 1.1 | button (Outlined, Ghost, Filled; text / icon / left-icon) | Buttons (`1352:517103`) | `277:545497` | D T E | ☑ approved, direct |
| 1.2 | Tracker Button (Clock in, Resume, Members Board; top bar) | Buttons (`1352:517103`) | `294:505591` | D T E | ☑ approved, direct |
| 3.1 | horisontal tab (Left / Center / Right, Light / Dark) | Tabs (`1352:517141`) | `443:493491` | D T E | ☑ approved, direct |
| 3.3 | calendar tab (day strip on Time entries) | Tabs (`1352:517141`) | `2429:96049` | E | ☑ approved, direct |
| 4.1 | Table Header / Weekly Timesheets | Table (`1352:517408`) | `270:481936` | T | ☑ approved, direct |
| 4.2 | Table Row / Weekly Timesheets | Table (`1352:517408`) | `271:482078` | T | ☑ approved, direct |
| 5.1 | sidebar / main (Default, Hover; onboarding) | Sidebar (`1352:517455`) | `231:481537` | D T E | ☑ approved, direct |
| 7.1 | Search field | Search (`1352:517310`) | `625:501516` | T | ☑ approved, direct |

### Essential dependencies

| # | Component | Frame | Node | Needed by | Status |
|---|---|---|---|---|---|
| 1.3 | Tracker Button, second set (`State=1`) | Buttons | `3626:41055` | 1.2 | ☑ approved, essential |
| 2.1 | Chip (default, count, activity, project, ongoing, filter list count) | Chips (`1352:517106`) | `516:493805` | 1.2, 3.1, 3.3, 4.2, 6.2, 6.4 | ☑ approved, essential |
| 2.2 | time entry chip (clock in, break, clock out) | Chips | `2455:98522` | L17, L19 | ☑ approved, essential |
| 3.2 | Atom / Tab | Tabs | `444:493189` | 3.1, 3.3 | ☑ approved, essential |
| 4.3 | cell / table row (avatar & text, text, chip, ongoing, empty, text & chip) | Table | `271:482050` | 4.2 | ☑ approved, essential |
| 4.4 | Cell / Table Header (label, date; sortable) | Table | `271:482157` | 4.1, L27 | ☑ approved, essential |
| 4.5 | Date (weekday header; rest day, today) | Table | `271:482174` | 4.1 | ☑ approved, essential |
| 4.6 | Sort chip | Table | `668:502277` | 4.1 | ☑ approved, essential |
| 4.7 | Sorting | Table | `668:502325` | 4.1 | ☑ approved, essential |
| 5.2 | menu tab | Sidebar | `170:476464` | 5.1 | ☑ approved, essential |
| 5.3 | menu category | Sidebar | `220:477043` | 5.1 | ☑ approved, essential |
| 5.4 | settings | Sidebar | `637:513021` | 5.1 | ☑ approved, essential |
| 5.5 | accordion / settings | Sidebar | `294:499375` | 5.1 | ☑ approved, essential |
| 6.1 | Dropdown (multi-select, with scroll) | Dropdown (`1352:517170`) | `673:511845` | L1, L5, L6 | ☑ approved, essential |
| 6.2 | Dropdown / List Item | Dropdown | `609:498725` | L1, L3, L5, L6, L8, L13 and menus | ☑ approved, essential |
| 6.3 | Dropdown / Search | Dropdown | `615:499195` | L1, L3, L5, L6, L7 | ☑ approved, essential |
| 6.4 | Dropdown Selector | Dropdown | `615:499037` | L1 to L8 | ☑ approved, essential |
| 6.5 | Dropdown field | Dropdown | `588:497085` | L12 | ☑ approved, essential |
| 8.1 | Atom / Input | Tech Components (`1352:517138`) | `615:499380` | 7.1, 6.3, 6.5 | ☑ approved, essential |
| 8.2 | input base | Tech Components | `503:493949` | L12 via 6.5 | ☑ approved, essential |
| 8.3 | Atom / Caret | Tech Components | `503:493610` | 7.1, 6.3 | ☑ approved, essential |
| 8.4 | Atom / Input title | Tech Components | `503:493847` | 6.5, 8.2 | ☑ approved, essential |

### Icons (all in frame Icons, `1352:517096`)

| # | Icon | Node | Needed by | Status |
|---|---|---|---|---|
| 9.1 | Icon / Arrow | `618:499183` | L12 | ☑ approved, essential |
| 9.2 | Icon / Plus | `618:499185` | 1.2, 5.1, Add Time Entry replacement | ☑ approved, essential |
| 9.3 | Icon / Sort | `659:511006` | 4.1 | ☑ approved, essential |
| 9.4 | Icon Chevron | `618:499168` | 1.2, 5.1, 6.5 | ☑ approved, essential |
| 9.5 | icon / activities | `180:476482` | 5.1 | ☑ approved, essential |
| 9.6 | icon / add | `207:476950` | L13, L14, L15 | ☑ approved, essential |
| 9.7 | icon / bin | `676:510870` | L17, L22 | ☑ approved, essential |
| 9.8 | icon / box | `2050:55910` | L13, L14 | ☑ approved, essential |
| 9.9 | icon / break | `292:492492` | L19, L24, 2.2 | ☑ approved, essential |
| 9.10 | icon / calendar | `179:476563` | 5.1, 6.5 | ☑ approved, essential |
| 9.11 | icon / check-small | `305:497063` | L8, 6.1, 6.2, L13 to L15 | ☑ approved, essential |
| 9.12 | icon / checkbox | `618:499373` | L1, L3, L6, L7 | ☑ approved, essential |
| 9.13 | icon / clock | `178:477796` | 5.1 | ☑ approved, essential |
| 9.14 | icon / clock in | `389:491087` | L19, 2.2 | ☑ approved, essential |
| 9.15 | icon / clock in member | `235:478843` | 1.2 | ☑ approved, essential |
| 9.16 | icon / clock out | `389:491088` | 2.2 | ☑ approved, essential |
| 9.17 | icon / clock-bolt | `2505:587011` | L24 | ☑ approved, essential |
| 9.18 | icon / collapse | `179:476518` | 5.1 | ☑ approved, essential |
| 9.19 | icon / dashboard | `219:477753` | 5.1 | ☑ approved, essential |
| 9.20 | icon / drowser-chrome | `2455:98940` | L23 | ☑ approved, essential |
| 9.21 | icon / faceid | `2455:99017` | L24 | ☑ approved, essential |
| 9.22 | icon / help | `205:476921` | L13, L14 | ☑ approved, essential |
| 9.23 | icon / integrations | `181:476512` | 5.1 | ☑ approved, essential |
| 9.24 | icon / live locations | `178:477803` | 5.1 | ☑ approved, essential |
| 9.25 | icon / location (the node the sidebar uses) | `180:476454` | 5.1 | ☑ approved, essential |
| 9.26 | icon / location (second node with the same name) | `418:494059` | L17, L19, L24 | ☑ approved, essential ⚠ correction, see flags |
| 9.27 | icon / mobile | `2455:98865` | L23 | ☑ approved, essential |
| 9.28 | icon / overtime | `390:491120` | Widget / Tracked hours, Tracked Hours Chart (section 0) | ☑ approved, essential ⚠ correction, see flags |
| 9.29 | icon / pencil | `2505:587372` | L17, L22 | ☑ approved, essential |
| 9.30 | icon / play | `292:492481` | 1.2 (and Icon / Play replacement) | ☑ approved, essential |
| 9.31 | icon / reports | `179:476495` | 5.1 | ☑ approved, essential |
| 9.32 | icon / search | `207:476870` | 7.1, 6.3 | ☑ approved, essential |
| 9.33 | icon / settings | `2050:54422` | L13, L14 | ☑ approved, essential |
| 9.34 | icon / settings 2 | `2050:55949` | L13, L14 | ☑ approved, essential |
| 9.35 | icon / shift | `629:501685` | 5.1 | ☑ approved, essential |
| 9.36 | icon / signout | `2050:55921` | L13, L14 | ☑ approved, essential |
| 9.37 | icon / time off | `179:476483` | 5.1 | ☑ approved, essential |
| 9.38 | icon / time tracking | `179:476549` | 5.1 | ☑ approved, essential |
| 9.39 | icon / user | `2578:602927` | L17, L19 | ☑ approved, essential |
| 9.40 | icon / user-multiple | `179:476539` | 5.1 | ☑ approved, essential |
| 9.41 | icon / web-page | `2455:98873` | L23 | ☑ approved, essential |
| 9.42 | icon / wifi-slash | `2455:586919` | L24 | ☑ approved, essential |
| 9.43 | icon / pause | `294:492519` | 1.2 | ☑ approved, essential |
| 9.44 | icon / stop | `294:492511` | 1.2 | ☑ approved, essential |
| 9.45 | icon / remove / small | `615:499679` | 7.1, 6.3, 8.2 | ☑ approved, essential |
| 9.46 | icon / placeholder (default icon slot in buttons, list items, input base) | `440:493935` | 1.1, 6.2, 8.2 | ☑ approved, essential ⚠ see flags |
| 9.47 | icon / kiosk | `2455:98866` | L23 | ☑ approved, essential |
| 9.48 | icon / kiosk-bolt | `2455:98901` | L23 | ☑ approved, essential |
| 9.49 | icon / desktop | `2455:98867` | L23 | ☑ approved, essential |
| 9.50 | icon / message | `2455:98956` | L23 | ☑ approved, essential |
| 9.51 | icon / manual | `2499:586980` | L24 | ☑ approved, essential |

---

## 2. Loose components on the Design System page

### Direct (14)

| # | Component | Node | Screens | Status |
|---|---|---|---|---|
| L1 | Timesheets Filter / Multi select | `615:498755` | T | ☑ approved, direct |
| L2 | Timesheets Filter / Date | `629:504703` | T E | ☑ approved, direct |
| L3 | Tracked Hours Filter | `1274:516657` | T | ☑ approved, direct |
| L5 | Add Filter | `634:503350` | T | ☑ approved, direct |
| L6 | Dashboard Filter / Multi select | `621:500042` | D | ☑ approved, direct |
| L7 | Filter / Schedules | `3187:193901` | D | ☑ approved, direct |
| L8 | Filter / Single select | `621:499368` | D T E | ☑ approved, direct |
| L9 | Dropdown Icon | `615:498769` | D T E | ☑ approved, direct |
| L12 | Pagination | `676:524845` | T | ☑ approved, direct |
| L13 | profile | `2050:64825` | D T E | ☑ approved, direct |
| L17 | time entry row | `2505:587659` | E | ☑ approved, direct |
| L25 | accordion / tracked hours | `2555:590512` | E | ☑ approved, direct |
| L26 | accordion / payroll hours | `2555:591094` | E | ☑ approved, direct |
| L27 | accordion / change history | `2555:591196` | E | ☑ approved, direct |

### Essential dependencies

| # | Component | Node | Needed by | Status |
|---|---|---|---|---|
| L4 | Tracked Hours Filter / Dropdown Selector | `1275:517871` | L3 | ☑ approved, essential |
| L10 | Dropdown Icon 3 | `1460:14240` | L3 | ☑ approved, essential |
| L14 | account menu | `2050:56031` | L13 | ☑ approved, essential |
| L15 | organization menu | `2050:55930` | L13 | ☑ approved, essential |
| L16 | divider | `2050:49877` | L13, L14 | ☑ approved, essential |
| L18 | inner atom | `2505:587396` | L17 | ☑ approved, essential |
| L19 | left part | `2505:587298` | L17 | ☑ approved, essential |
| L20 | center part | `2505:587297` | L17 | ☑ approved, essential |
| L21 | right part | `2505:587312` | L17 | ☑ approved, essential |
| L22 | actions | `2505:587386` | L17 | ☑ approved, essential |
| L23 | platform flag | `2455:98970` | L17 | ☑ approved, essential |
| L24 | contextual flag | `2455:98981` | L17 | ☑ approved, essential |
| L28 | accordion / header | `2555:590405` | L25, L26, L27 | ☑ approved, essential |
| L29 | accordion / row | `2555:590436` | L25, L26 | ☑ approved, essential |
| L31 | Tracked Hours Filter / List Item | `1274:517501` | L3 | ☑ approved, essential |
| L32 | Date Picker (frame Date picker `1352:517458`) | `629:504505` | L2 | ☑ approved, essential |
| L33 | Atom / Header (Date picker frame) | `629:502815` | L2 via L32 | ☑ approved, essential |
| L34 | Atom / Day Title (Date picker frame) | `629:502821` | L2 via L32 | ☑ approved, essential |
| L35 | Atom / Date Picker (Date picker frame) | `629:502871` | L2 via L32 | ☑ approved, essential |

### Dependencies in the two named sections

These are already cleared in section 0, so no separate approval is needed: avatar, Custom Buttom, Onboarding progress card, Progress bar, tooltip, Button Content, CTA Banner, Scroll Bar, Button w/o tooltip.

### Reverse check: what the section 0 components are built from

I applied the same dependency rule in the other direction: every component outside the named sections that the planned Organisms and Additional Components items are built from.
- **Already approved here:** the tabs, Tracker Buttons, Chip, profile and its menus, Dropdown / List Item, button, and every icon involved.
- **One exception:** `icon / overtime` (9.28), which Widget / Tracked hours and Tracked Hours Chart use. It moves to approved, essential.

Nothing else was missing.

---

## 3. Skipped and pending

Only L11 remains pending; it is needed only by the skipped L30.

| # | Component | Node | Screens | Status |
|---|---|---|---|---|
| L30 | Championship Widget (leaderboard "Chrono Hero") | `1500:37571` | D | ⛔ skipped (your decision: promotional surface) |
| L11 | Leaderboards Filter / Single select | `1476:32443` | D | ☐ pending. Only nested in L30, so not needed. |

---

## 4. Orphaned components and their replacements

An orphan is a component that the screens still point to but that is not attached to any page in the file. You chose to replace orphans with live components. The mappings below use only components that are already approved. **Nothing was changed in Figma.**

| Orphan | Where it is used | Replacement | Status |
|---|---|---|---|
| Icon / Play `7:19999` | Tracker Button (1.2), "Small size, Usage=Sidebar" variant, 16x16 | icon / play `292:492481` (9.30). The other Tracker Button variants already use it at 16x16. | ☑ final |
| Atom/ Input / Chip `588:497324` | Dropdown field (6.5), **only** in the four `Type=Chip`, `State=Filled` or `Filled & Focused` variants | Chip `516:493805` (2.1) | ☑ final, but not used by any concept screen (see verification) |
| Add Time Entry Button `284:481985` | 24 Rest day cells in Table Row (4.2 via 4.3) | button `277:545497` (1.1), **Ghost, Icon, Small** (20x20, fully round), with Icon / Plus (9.2), **Default type** (16px) | ☑ final for hover-only visibility (your decision), hover (ghost icon darkening, your decision) and pressed; ⚠ focus still open |
| Dial `3274:233288` | Time entries timeline ruler | none. **HTML-only**, your decision. | ☑ decided |

### Verification: Pagination (L12)

Checked against the actual instance on the Timesheets list:

- **Page numbers:** seven 36x36 `button` instances (1.1), Outlined. Two are Icon class with Icon / Arrow (9.1, left and right). Five are Text class: "1", "2", "3", "...", "8".
- **Current page:** "1" is shown in orange by a **text-color override** (`#FC6300`, not bound to a variable). No "selected" variant exists. Other numbers use Ink 650 `#4B4B53`; "..." uses Ink 400 `#949495`. Every button has a white fill and a Support 250 `#EDEDEB` stroke.
- **Page size:** the "Show [10] members on page" control uses Dropdown field (6.5) in variant `Label=No, State=Filled, Type=Default`. That variant holds input base (8.2), Atom / Input (8.1) and Icon Chevron (9.4).
- **Correction:** the earlier note that Atom/ Input / Chip affects Pagination was **wrong**. The orphan sits only in the `Type=Chip` variants, which Pagination does not use. Pagination needs no replacement. The Atom/ Input / Chip mapping stays as recorded but has no effect on the concept screens.

### Verification: Add Time Entry Button

| State | Orphan component in Figma | Live replacement (Ghost, Icon, Small) |
|---|---|---|
| Default | 20x20, corner radius 16, 2px padding, no fill; Icon / Plus Default, 16px | 20x20, radius 20, no fill; icon in Ink 900 |
| Hover | Warm fill `#F8F0E8` (not bound to any variable, not a token) | No fill; icon darkens to Key Hovered 900 `#1D1D2E` |
| Pressed | Not defined | Icon Ink 750 `#2C2C39` |
| Focus | **Not defined** | **Not defined.** The whole button set has no focus variant (States: Enabled, Hovered, Pressed, Disabled). |

Also verified: all 24 instances on the Timesheets list are visible, in the Default state, inside Rest day chip cells, but they render **empty on the canvas** (the instance has no layers because its component is orphaned). That is why no "+" shows in the concept screenshot. The orphan's own Default variant does contain a visible plus icon.

Why the mapping changed: the earlier mapping (Outlined, Icon, Small with Icon / Plus Small) was a guess. Ghost matches the orphan's transparent, round 20x20 default exactly, and Icon / Plus Default matches its 16px icon. Both components were already approved, so no approval is reopened.

✅ **Hover, decided by you:** use the live Ghost button's hover. No background; the icon darkens to `ink-hover` `#1D1D2E`. The orphan's warm fill `#F8F0E8` is dropped and not carried into the tokens.

✅ **Visibility, decided by you:** the "+" shows **only on hover**. At rest the Rest day cell shows no button, which matches the concept screenshot. This departs from the orphan's own Default variant, which draws the plus at rest.

🧪 Consequence for keyboard users: a control that appears only on hover has to appear on keyboard focus too, or it can't be reached without a mouse. That ties into the focus item below.

⚠ **Still open for this element:**
1. **Focus:** needs a visible focus style. No button in the library defines one. DESIGN.md, Interaction states, records the product-wide rules: Visible Focus, and Reveal-On-Focus, since this button is hidden at rest.

---

## 5. Designed in code: no Figma library component

### Dial (Time entries ruler): your decision, HTML-only

The Dial orphan stays untouched in Figma. Measurements are read from instance `3274:234074`:

| Property | Value |
|---|---|
| Overall size | 866 x 20, one horizontal row |
| Padding and gap | 22px left and right; 5px gap; children spread evenly |
| Ticks | 23 hourly ticks, 1 am to 11 pm; two small, then one major with a label |
| Small tick | 1px line, 2px tall, in a 32px-wide column |
| Major tick | 1px line, 4px tall, label below, in a 32 x 20 column |
| Tick color | Support 200 `#F2F2F1` (bound variable) |
| Labels | 3 am, 6 am, 9 am, 12 pm, 3 pm, 6 pm, 9 pm; PolySans Slim 10/16, Ink 400 `#949495` (Label/L3 Slim) |
| Variants in Figma | `Every=3 hours` (used on the screen) and `Every=6 hours` |

⚠ Tick color `#F2F2F1` on white is almost invisible. Fine if decorative, but worth a look at review.

### Timeline bar (Time entries)

Inspected frame `3274:234533` (866 x 124). It contains no library component except the Dial and one button:

- **Track:** a rectangle, 866 x 16, radius 4, Support 200 `#F2F2F1`, at y=64.
- **Segments:** rectangles, 16px tall, radius 4, on the same row. Fills are bound to Activities & Projects variables (Red 575, Blue 550, Pink 550). A break segment uses Support 450 `#CBCBC7`.
- **Split-time marker:** two 1px vertical lines, Ink 750 `#2C2C39`, with a 3px white gap.
- **Dial:** directly below the track, at y=80.
- **"View all timezones":** button (1.1), Ghost, Text, Default, at the top right (y=8).

### Timesheet info and Weekly summary card (Time entries)

Inspected frame `2455:96881` (278 x 660). It is built from **plain frames and text styles, with no components**:

- **Card:** 1px stroke Support 250 `#EDEDEB`, radius 4, no fill, 16px padding, 40px between sections.
- **Section titles** ("Timesheet info", "Weekly summary"): Label/L1 Neutral, Ink 900.
- **Timesheet info items:** label in Label/L2 Slim, Ink 525 `#707074`; value below it in Label/L1 Slim, Ink 900.
- **Weekly summary rows:** label left, value right. Group headers ("Tracked hours", "Payroll hours") are Label/L1 Neutral, Ink 900. Sub-rows (Worked hours, Breaks, Regular hours, Daily OT and so on) are Label/L1 Slim with Neutral values, both Ink 525.

🧪 With no library component for the timeline bar or the summary card, there is nothing to migrate. Both are designed in code from tokens, as DESIGN.md describes (Time-of-day timeline, Label/value summary card). This adds nothing to the Figma library. Confirm at review.

---

## 6. ⚠ Flags still open

- **Add Time Entry Button:** focus style only (section 4). It must also make the button appear on keyboard focus, because it is hidden at rest. Hover and visibility are decided.
- **9.26 icon / location, correction:** it was listed as pending because two icons share the name `icon / location`. Checking node by node shows that the time entry row, its left part and the contextual flag (all approved) use `418:494059`, while the sidebar uses `180:476454`. Under the dependency rule you already approved, it is essential, so it moves to approved. Card / Location (section 0) uses it too. The two same-named icons remain a library-hygiene issue.
- **9.28 icon / overtime, correction:** it was listed as pending because only the register's own components had been dependency-checked, not those in the named sections. Widget / Tracked hours and Tracked Hours Chart (section 0, already cleared) are built from it, so it moves to approved under the same rule.
- **9.46 icon / placeholder:** a default icon slot inside buttons, list items and input base. Approved as essential; drop it if you consider it noise.
- **1.3 Tracker Button, second set:** approved only as nested inside 1.2. Possibly a duplicate set.
- **Second `Sidebar` frame (`2270:44793`):** the screens use `1352:517455`. Confirm which is canonical.
- **Dial tick contrast:** see section 5.

## 7. Figma reference: library hygiene notes ✅ observed

Kept here for future migrations. These are facts about the Figma concept, not rules for the code.

- **Sample names in variants:** several variant names embed sample people's names (for example `Member / Name=...`). ❓ Not to be carried into code names.
- **Duplicate names:**
  - frames: two "Timesheets Filter / Multi select", two "Sidebar", three "Dropdown";
  - icons: two `icon / location` nodes;
  - near-duplicates: `icon / settings` and `icon / settings 2`.
- **Orphans:** four components are referenced by screens but attached to no page (section 4).
- **Unbound values:** hard-coded values where tokens exist, for example the current-page orange and the old add-entry hover fill.
- **Out of scope for the initial migration and left untouched:**
  - Geofence, Location Members Board, Pin, map image, Notification, Timeline point, mobile timeline accordions;
  - plan and payment cards, iPhone status bar and home indicator, Flow Cover, Groups and Locations filter accordions;
  - all mobile material;
  - the Presentation, Moodboard, Artefacts, Cover and Archive pages.

  Later screens may bring some of these in, with their own decisions.

