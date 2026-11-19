---
version: 1
slug: "dashboard"
primary_target: "dashboard/index.html"
related_targets: ["dashboard/dashboard.css","dashboard/dashboard.js"]
---

# Surface brief: Dashboard

<!-- DRAFT for review (2026-11-16). Screen-specific strategy only; reusable rules live in DESIGN.md, and product-wide decisions are recorded once in PRODUCT.md. Updated 2026-11-18: build started; see "Build started". -->

**Status:** build started 2026-11-18 at the user's request (see "Build started" below). The demo scenario stays open (PRODUCT.md, Decision 7).

Tags: ✅ Confirmed · 🧪 Hypothesis · ❓ Missing (same meaning as in DESIGN.md).

**Reference:** Figma frame `345:488187` (1440 × 3415), in file `IxEzpqNPY2D655pIJ8N1qc`. It is the **visual** reference. Behavior comes from the live product or verified documentation, and conflicts are flagged (PRODUCT.md, Functional Fidelity). No behavioral evidence has been gathered for the Dashboard. ❓ ✅

**Decisions that apply here** (recorded once in PRODUCT.md, Decisions, and not repeated): the visual direction is the existing Figma concept (1); the sidebar and top bar stay as designed (2); the layout works from 1040 to 1920 px with nothing hidden and no accidental overflow (4).

**Fitting 1040 to 1920 px:** not worked out yet, because Dashboard isn't first. The concept draws only a 1440 frame. ❓ When this surface starts, apply DESIGN.md, Layout (responsive foundations) to its stat cards, chart, card rows and map, and measure its top bar (its tabs are Organization / Personal, not the Timesheets tabs) against the width ladder.

**Implementation target:** bound 2026-11-18 to `dashboard/index.html` (see "Build started").

## 1. Job and audience

- ✅ **Owner or manager**, at a desk: see team time at a glance, including attendance, tracked hours, locations, and upcoming time off and shifts (PRODUCT.md).
- ❓ **Staff:** whether they see a Dashboard at all, and what it shows them. The concept shows only the owner view.

## 2. Outcome

- 🧪 The manager leaves knowing whether anything needs their action today. PRODUCT.md's principle: every screen answers "what do I do next".
- ❓ There is no usage evidence for which blocks managers actually use (PRODUCT.md, Evidence on Hand).

## 3. What the concept shows ✅

The page is one long scroll of stacked blocks:
1. a greeting with an organization summary sentence;
2. Weekly / Groups / Schedules filters;
3. stat cards: Activities breakdown (a dark panel), tracked hours, best in tracking, days left, attendance, on time;
4. a Tracked hours chart (worked, break, overtime);
5. Reports Templates;
6. Upcoming Shifts / Time Off / Holidays;
7. Locations cards with a map;
8. Leaderboards;
9. the Ultimate plan banner;
10. "Configure widgets".

The concept also shows:
- **No dedicated pending-approvals block.** Time-off items do show Approved / Pending labels.
- **Task and promotional content mixed:** the leaderboard and plan banner sit in the same scroll as the task blocks.

## 4. Decisions already made

- ✅ **Leaderboard skipped.** The Championship Widget ("Chrono Hero") is excluded, by the user's decision.
- ✅ **Concept components the Dashboard may draw on:** listed in SECTION-C-PROPOSALS.md, the initial migration record. That list is not a limit; new components can be designed in code.

## 5. States and ranges ❓

Not defined in the concept:
- empty organization;
- one member against hundreds;
- no locations;
- loading and error states;
- partial data.

## 6. Open UX questions

**Resolved** ✅ (recorded in PRODUCT.md, Decisions): whether Dashboard is the first surface (no; Timesheets for Admin goes first).

**Still open**
1. ❓ The demo scenario, when Dashboard starts. Deliberately not selected.
2. 🧪 Should promotional content (plan banner, mobile promo) be separated from task content, or removed from this surface?
3. ❓ Should a pending-approvals entry point live here? This depends on the Approvals idea in the Timesheets brief.
4. ❓ Which blocks are essential, and is "Configure widgets" (user-arranged dashboard) in scope?
5. ❓ What does staff see, if anything?
6. ❓ How long should the page be: one long scroll, or a shorter page focused on actions?

## Visual direction and direction contract

**Visual direction: decided.** Develop and extend the existing Figma concept, preserving its visual language (PRODUCT.md, Decision 1). The development direction contract is under "Direction contract" below.

## Build started (2026-11-18)

**Implementation target:** `dashboard/index.html` (with `dashboard/dashboard.css`, `dashboard/dashboard.js`, shared `shared/tokens.css`). Mode: **Operate**, code-led.

**User decision (2026-11-18):** rebuild the **live** dashboard's blocks and behavior (from the user's screenshots of app.test.jibble.io/dashboard, the first behavioral evidence for this surface) in the **Figma concept's** visual language. This supersedes the concept's block list for this surface.

Live blocks reproduced: location / group / schedule filters; Organization / Managed by me / Personal scope; clock card (timer, last out, Resume, Clock in); Day / Week / Month period; Upcoming holidays and time off; Tracked hours (worked, breaks); Top 10 projects; Locations map with "Go to locations" and hide-map; "Configure widgets"; Who's in/out rail (IN / BREAK / OUT, member search).

### Conflicts logged (live vs Figma; neither silently picked)
1. **Sidebar items.** Live: Dashboard, Timesheets, Live Locations, Time Off, Reports, Invoices, Productivity, Jibble AI; Settings: People, Time Tracking, Work Schedules, Time Off & Holidays, Locations, Activities & Projects, Organization, Integrations. Figma: no Invoices, Productivity, Jibble AI, Organization; has Schedule & Calendar and Shifts. Built: live items in the Figma sidebar's appearance (new items are a recorded visual gap).
2. **Scope tabs.** Live has three (Organization / Managed by me / Personal); Figma top bar has two. Built: three, Figma tab style.
3. **Clock.** Live puts a large clock card on the Dashboard; Figma puts the time clock in the top bar. Built: both, driven by one shared clock state. ❓ Whether the dashboard card stays once the top-bar clock exists.
4. **Who's in/out.** Live: a right rail on the Dashboard. Figma: none on this frame (Members Board button only). Built: a panel in concept card style spanning the clock and Tracked hours rows, its list scrolling inside. Below ~1330px viewport it stacks under the clock card.
5. **Top 10 projects.** Live: donut + legend. Figma: dark Activities & Projects widget with bars. Built: the Figma dark widget, Projects first, Activities as second tab. ❓ Activities tab is from Figma, not verified in live.
6. **Map.** Live uses Google Maps. Built: an illustrative static map; no map provider in the prototype.
7. **Greeting.** Live: "Hello Jay". Built: concept greeting with illustrative summary sentence, including an attendance figure (share of member weekdays this week with tracked time; simulated over local data).

## Direction contract

THESIS: A manager's morning check in one screen: who is working right now, how much time the team has logged, and what time off is coming. Refuses the long promotional scroll of the concept frame; task blocks only, no leaderboard or plan banner.

OWN-WORLD: The Figma concept as is: white page, #EDEDEB hairline cards at 4px-ish radius, near-black Deep Ink type, PolySans voice (fallback Inter), orange only on the brand mark, current nav and scope tab; green / yellow / grey for in / break / out; green / yellow / red for worked / break / overtime; one dark Deep Ink panel (projects).

STORY: The manager reads the greeting sentence (members in, attendance), scans the in/out rail, checks tracked hours for the period, sees upcoming leave, then filters by location or group, or clocks themselves in.

FIRST VIEWPORT: Shell (232px sidebar, 60px top bar with scope tabs + time clock). Content: greeting headline left, filters row under it with Day/Week/Month segmented at left and location/group/schedule filters at right (amended 2026-11-18: period sits left, matching the live order and the concept's filter row, so it reads before the range label); then a row of clock card (timer 48px numbers, Resume outlined + green Clock in) and the Who's in/out panel spanning the clock and Tracked hours rows in the right column at ≥1330px, with Upcoming holidays and time off and Top 10 projects sharing the next row, and Locations full width below.

FORM: Live content, concept form; seed: none (pinned) — "Live blocks, concept look (Recommended)" chosen by the user: keep the live app's content and behavior and render it in the Figma concept's visual language.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
