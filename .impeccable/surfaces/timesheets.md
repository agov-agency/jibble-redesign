---
version: 1
slug: "timesheets"
primary_target: "timesheets/index.html"
related_targets: ["timesheets/timesheets.css","timesheets/timesheets.js"]
---

# Surface brief: Timesheets (including Time entries)

<!-- DRAFT for review (2026-11-16). Screen-specific strategy only; reusable rules live in DESIGN.md, and product-wide decisions are recorded once in PRODUCT.md. No code exists yet. -->

**Status:** the **first surface**, for the **Admin role**. ✅ (PRODUCT.md, Decision 3.) Dashboard is a later candidate. **The exact first demo scenario is not selected.** It waits until the existing Admin Timesheets workflow has been inspected (section 5). ✅

Tags: ✅ Confirmed · 🧪 Hypothesis · ❓ Missing (same meaning as in DESIGN.md).

**Time entries is part of this surface,** not a separate one. It is a member's detail view inside Timesheets, and in the concept the sidebar keeps Timesheets selected there. ✅

**Decisions that apply here** (recorded once in PRODUCT.md, Decisions, and not repeated): visual direction is the existing Figma concept (1); the sidebar and top bar stay as designed (2); the layout works from 1040 to 1920 px with nothing hidden and no accidental overflow (4); current behavior and Admin permissions are reproduced (6).

**References** in file `IxEzpqNPY2D655pIJ8N1qc`. They are the **visual** reference. Behavior comes from the live product or verified documentation (section 5). ✅

| View | Frame | Size |
|---|---|---|
| Timesheets list | `211:477398` | 1440 × 1144 |
| Time entries | `2306:51443` | 1440 × 900 |

The concept also has sorting variants of the list. It draws only 1440 px frames, so nothing is drawn for other widths.

**Implementation target: bound 2026-11-18** to `timesheets/index.html` (see "Build started"). Earlier note, kept for history: The tooling lists this brief with `primaryTarget: null` and no related targets, because no route or file exists. No target is invented here. When implementation targets are chosen:
1. add the primary route or file (and any related ones) to this brief with `impeccable surface-brief write`. Because Time entries is part of this surface, the Timesheets list and the Time entries view bind to this one brief, with the second as a related target (or the same file, if both live in one);
2. verify the binding by running `impeccable surface-brief read` on each target path and checking that it resolves to this brief, not to `dashboard` or to an ambiguous match;
3. only then start implementation.

Until then the brief is found by its name (`timesheets`) only.

## 1. Job and audience

- ✅ **Admin**, at a desk: review team hours for a period, correct entries, and prepare payroll (PRODUCT.md). PRODUCT.md's success test: "see and approve team time without friction".
- ❓ **What "Admin" can do** is reproduced from the live product or verified documentation (section 5). The concept's profile shows "Owner"; how Admin differs from Owner, Manager and Member is not yet verified.
- **Staff** are not part of this first phase on this surface. ❓ Whether they open Timesheets to check their own hours is a later question.

## 2. What the concept shows ✅

### Timesheets list
- **Top bar tabs:** Timesheets / Approvals.
- **Filter bar:** a row with search, Tracked hours, Groups, Schedules, Add filter and Export; a second row with the period selector (Weekly) and the date range with previous / next.
- **Weekly member table:** member cell, Mon-Sun day columns, Total. Cells show hours or a state: Vacation Leave, Sick Leave, Public Holiday, Rest day, ongoing.
- **Footer:** pagination with "Show [10] members on page".

### Time entries
- **Top bar:** a back arrow, and tabs: Time entries / Payroll / Screenshots.
- **Main column (866px):**
  - date range and "Add manual time";
  - day tabs with daily totals;
  - "View all timezones";
  - the time-of-day timeline;
  - time entry rows;
  - accordions for tracked hours, payroll hours and change history.
- **Right column (278px):**
  - timezone select;
  - member selector;
  - the Timesheet info and Weekly summary card (tracked hours, and payroll hours with its overtime breakdown).

## 3. Component decisions already made

- ✅ **Concept components this surface may draw on:** listed in SECTION-C-PROPOSALS.md, the initial migration record. That list is not a limit.
- ✅ **Add-entry action in Rest day cells:** hidden at rest, shown on hover as a ghost "+", and hover darkens the icon. The component rule is in DESIGN.md, Hover-revealed add action.
- ✅ **Timeline ruler (Dial):** built in HTML only, with no Figma component.

## 4. Fitting 1040 to 1920 px

The foundations are in DESIGN.md, Layout (content width `C`, the rules, the order of adaptation). This section applies them to this surface. The reference is the 1440 frames, where `C` is 1208 and both views use 24px side padding. Numbers are measured from Figma layers (✅) or derived from them (🧪, to confirm in the browser). The adaptation never hides a control or a column, and the page itself never scrolls horizontally.

### 4.1 Timesheets list

**Measured at 1440 ✅**
- The table spans the full content width, edge to edge. Rows are 84px, the header is 48px.
- Columns: **member 302px** (fixed) | **seven day columns, 109px each** (flexible) | **Total 140px** (fixed). 302 + 763 + 140 = 1205, rounded up to the 1208 frame.
- The widest chip is "Vacation Leave" at 98px. It fills almost the whole 109px day cell.

**Floors 🧪:** member 240px (avatar, name, role with ellipsis); day 104px (a 98px chip plus margin); Total 100px. Natural minimum: 240 + 7 × 104 + 100 = **1068px**. The table fits without scrolling when `C` is at least 1068, which is a viewport of about 1300 (about 1317 with a scrollbar).

| Viewport (about) | `C` | What the table does |
|---|---|---|
| 1440 to 1920 | 1208 to 1688 | As designed. Extra width goes to the day columns (about 178px each at 1920). Member and Total keep their widths. |
| 1317 to 1440 | 1068 to 1208 | Fluid. Member shrinks from 302 toward 240, Total from 140 toward 100, and day columns from 109 toward 104. All seven days stay visible. |
| 1040 to 1317 | 808 to 1068 | The table body scrolls horizontally **inside its own region**. Member (240) and Total (100) are pinned. At 1040 about 468px (4 to 5 day columns) of day area is visible, and the rest is one scroll away. All seven days and all cell actions stay reachable. |

- 🧪 Pinning both ends keeps the person and the total in view while the days scroll. If the day area feels too small, the alternative is to pin only the member column.
- 🧪 The scroll region follows DESIGN.md rule 6: it is keyboard-focusable, labelled, shows a visible focus style, and a partly visible column signals more content.
- 🧪 The hover-revealed add action in Rest day cells appears on keyboard focus too (DESIGN.md, Reveal-On-Focus). Inside the scroll region, focus order runs left to right and scrolls the focused cell into view.

**Filter bar ✅/🧪.** Row 1 is 669px of controls plus the 83px Export button, 24px padding on each side and an 8px gap, about 808px. That fits at 1040 without a scrollbar and is about 17px too wide with one. The row **wraps** (Export drops to its own line, right-aligned) instead of overflowing. Row 2 (period select and date range) is 306px and always fits. No filter, and not Export, is removed.

**Pagination ✅/🧪.** The page buttons and the "Show [10] members on page" control need about 600px, so they fit at every width in range without changes.

### 4.2 Time entries

**Measured at 1440 ✅.** Main column 866px, 16px gap, right column 278px, with 24px padding on both sides: 24 + 866 + 16 + 278 + 24 = 1208. The right column is fixed at 278px; the main column takes whatever is left, `C − 342`.

**Floor 🧪:** the main column's floor is **560px**. An entry row needs its left part (314px) and its right part (100px), leaving about 146px for the middle, and the day strip needs 7 tabs of at least 80px each. Two columns hold while `C − 342 ≥ 560`, so `C ≥ 902`, a viewport of about 1134 (about 1151 with a scrollbar).

| Viewport (about) | `C` | Layout |
|---|---|---|
| 1151 to 1920 | 902 to 1688 | **Two columns.** Main column is `C − 342`: 560 at the narrow end, 866 at 1440, about 1346 at 1920. The right column stays 278px. |
| 1040 to 1151 | 808 to 902 | **One column** (below). |

**One-column order 🧪:**
1. the header row: date range and "Add manual time";
2. the timezone select and the member selector, moved here from the right column and wrapping side by side (278px each, 8px apart, about 564px, so they fit);
3. the day tabs, the timeline, the entry rows and the accordions, as in the main column;
4. the Timesheet info / Weekly summary card, full width, after the accordions, with its rows unchanged.

Nothing is dropped. The two controls stay near the top because they set who and which timezone is being viewed.

**Inside the main column**
- **Day tabs:** seven equal tabs, so about 80 to 190px each across the range.
- **Timeline:** fills the main column. Colored segments and the split-time marker are positioned in proportion to the 24 hours, so they scale. The Dial ruler has 23 hourly ticks spread evenly, with a label every third tick. At the 560px floor ticks are about 22px apart, so the 3-hourly labels (about 23px wide each) have about 67px of room.
- **Entry rows:** the left part (avatar, time, entry type) and the duration keep their width. The middle (activity and project chips, and the note) takes the flexible space. The chips wrap. The note keeps the concept's single-line truncation, with its full text on hover, on focus and to assistive technology. ❓ How the live app reveals a full note is not verified (section 5).
- **Accordions:** full main-column width. Their rows, including Change history's Change, Reason and Timestamp, share the width, and long text wraps.

**Top bar.** The list view and the detail view need the width ladder in DESIGN.md, Layout (Top bar across widths). The list view's tabs fit after steps 1 and 2, which begin below about 1060 and 1035 px. The Time entries view needs step 1 below about 1226, step 2 below about 1202, and step 3, moving "Last out …" into a tooltip, below about 1178 (about 1195 with a scrollbar). Step 3 is an open review item (section 8).

### 4.3 What to check once built 🧪
- No horizontal page scroll anywhere from 1040 to 1920, at each width listed in DESIGN.md, Layout, and a continuous sweep.
- The table, the one-column Time entries and the top bar at 1040, with and without a scrollbar.
- Menus and dropdowns (the account and organization menus are 272px wide, and the filter dropdowns) stay inside the viewport at 1040.
- Everything is reachable by keyboard, including the table's scroll region and the hover-revealed add action.

## 5. Functional fidelity for Admin Timesheets

The redesign reproduces the current app's functionality, workflows, business rules and Admin permissions (PRODUCT.md, Functional Fidelity). The live product, or documentation verified against it, is the evidence for behavior. Figma is the evidence for the visual design. **No behavioral evidence has been gathered yet.** ❓

**Before the first demo scenario is chosen,** inspect the existing Admin Timesheets workflow, then record what was found in the evidence log below. This is the checklist of what to look at. It lists topics to check, not claims about how the product behaves.

**Timesheets list**
- the Timesheets and Approvals tabs: what each shows and does;
- the period selector (Weekly, other periods?), previous / next, and the date range picker;
- search: what it matches;
- filters: Tracked hours, Groups, Schedules, and what Add filter offers (the concept's menus show "Kiosks" and "Clear selection"); how filters combine and clear;
- sorting: which columns sort, direction, and the default order;
- pagination and the page-size options;
- Export: formats, and what it includes;
- the day states (Vacation Leave, Sick Leave, Public Holiday, Rest day, ongoing) and what the Total counts;
- opening a member's Time entries from a row;
- adding an entry from an empty or Rest day cell;
- which members an Admin sees, and any limits.

**Time entries**
- the Time entries, Payroll and Screenshots tabs;
- day selection and the daily totals;
- the timezone select, "View all timezones", and the member selector;
- Add manual time: fields, validation, overlaps;
- editing and deleting entries, including the reason that feeds Change history;
- split time;
- the Weekly summary: how tracked hours, payroll hours and each overtime line are calculated;
- Change history: what is logged;
- approving: where it happens, and what it does to editing afterward;
- locked or closed periods;
- what the back arrow does;
- empty, loading and error states.

**Admin permissions**
- what an Admin can view, edit, delete, approve and export;
- how Admin differs from Owner, Manager and Member.

### Evidence log

| Behavior | Source (live product or verified documentation) | How verified | Status |
|---|---|---|---|
| List: Timesheets / Approvals tabs; Organization / Managed by me scope | app.dev.jibble.io/timesheets/overview | inspected 2026-11-18 | ✅ |
| List: period select Daily / Weekly / Monthly Timesheets; prev / next; date range opens a month calendar | live | menus opened 2026-11-18 | ✅ |
| List: filters Payroll hours, Groups, Members, Schedules, Tracked hours; Add filter offers Member codes, Positions, Employment types | live | menus opened | ✅ |
| Hours filters: Exclude rest days & public holidays, Exclude time offs, More than / Less than / Between / Equal to, Clear selection, Apply | live | menu opened | ✅ |
| Search field sits in the Member column header | live | seen | ✅ |
| Every day cell links to `/timesheets/<date>/<member>/details`; days up to today also carry an add button | live | accessibility tree | ✅ |
| Rest day shown as one bar across Sat and Sun; empty days show "-" | live | seen | ✅ |
| Export opens a right drawer: File format (XLS, CSV), Timesheets list / Time entries list, Date range, Filter by, Time format, Duration format, Cancel / Export | live | opened | ✅ |
| Approvals with no pay periods: empty state "No pay periods set up yet", "Set up Pay Periods" | live | opened | ✅ |
| Details: Weekly Summary (Timesheet timezone, Split time, Work schedule; Tracked hours: Worked, Breaks UNPAID; Payroll hours: Regular, Time Off); day strip with h:mm:ss totals and Rest day; "Add Time Entry"; Change history with count; empty state "Tick tock goes the clock" | live | opened | ✅ |
| Add Manual Time Entry drawer: Time entry / Hour entry; In / Break / Out; time with timezone; date; location; activity; project; task (disabled until project); note; Add new; Duplicate; Cancel / Save | live | opened, not saved | ✅ |
| Daily layout: columns First in, Last out, Regular, Tracked | web.jibble.io/timesheets/overview/<date>/day | inspected 2026-11-19 | ✅ built |
| Monthly layout: one square per day coloured by hours; Legend: 0, 0–2, 2–4, 4–6, 6–8, 8–10, 10+ hours, Public Holiday, Rest Day, Time Off, Shortened Workday, Overtime | web.jibble.io …/month | inspected 2026-11-19 | ✅ built (green ramp, concept look) |
| Details Payroll view: rows Tracked / Worked / Breaks / Payroll / Regular / Time Off across the seven days | web.jibble.io details, dollar toggle | inspected 2026-11-19 | ✅ built, plus a Week column and the overtime lines |
| Details Screenshots view: "No screenshots here", desktop-app hint | web.jibble.io details | inspected 2026-11-19 | ✅ built |
| Entry row actions: edit (pencil) and delete (bin); Edit drawer shows device and OS, time + timezone, date, location, activity, project, note, Delete / Cancel / Save | web.jibble.io details | drawer opened, not saved; delete not triggered | ✅ built |
| Approvals with pay periods: weekly period stepper; filters Groups, Members, Schedules, Tracked hours, Statuses (Open, In progress, Approved, Reopened); columns Tracked, Regular, Overtime, Time Off, Status; past periods have row checkboxes and a per-row approve action; current period "In progress", no action | web.jibble.io/timesheets/approvals | inspected 2026-11-19, nothing approved | ✅ built; Reopen and the bulk bar are designed, not observed |
| Column sorting | live | headers carry no sort control | ✅ not in live |
| What approving does to editing afterward; the delete confirmation | live | not triggered (production data) | ❓ |

### Conflict log

Each conflict names what Figma shows, what the product does, and the source of each. It is flagged for review, not silently resolved.

| # | Item | Figma shows | Live product or documentation shows | Status |
|---|---|---|---|---|
| 1 | Day label | "Sut" | "S 21" / "Sat, 21" | ✅ Typo; built as "Sat". |
| 2 | Scope | none | Organization / Managed by me | Built: live control, concept segmented style. |
| 3 | Filters | Tracked hours, Groups, Schedules, Add filter | adds Payroll hours and Members, Add filter extras | Built: live set. |
| 4 | Sorting | Member header sort arrow | no sorting | Built: concept sorting (prototype stack requires it); flagged for review. |
| 5 | Detail tabs | Time entries / Payroll / Screenshots | one view, three unlabeled icon toggles | Built: concept tabs; Payroll and Screenshots content is a recorded gap. |
| 6 | Member subtitle | job title | name only | Built: position (live has a Positions filter). |
| 7 | Durations | hh:mm | h:mm:ss in details, "-" in list | Built: concept hh:mm in list, h:mm in details. |
| 8 | Details layout | summary on the right | summary on the left | Built: concept (right column). |

## 6. Navigation within Timesheets

**Not established.** The brief mentions Timesheets can go up to five levels deep. The concept doesn't label levels or define breadcrumbs. The table below is 🧪 one possible reading, kept for discussion only. It should be checked against the live product:

| Possible level | What the concept shows |
|---|---|
| 1 | Sidebar: Timesheets |
| 2 | Top-bar tab: Timesheets / Approvals |
| 3 | A member's Time entries (from a table row) |
| 4 | Sub-tab: Payroll or Screenshots |
| 5 | A single day, entry, or accordion section |

- ✅ One back arrow on Time entries.
- 🧪 It presumably returns to the list, but the concept doesn't say.

## 7. Idea: move Approvals to the top level

Status: 🧪 an idea from the concept, not a decision, and not designed. The concept has no Approvals content screen, only the tab label and an icon. This changes the shell's navigation arrangement, which is currently fixed (PRODUCT.md, Decision 2), so it would need its own decision. It may also affect Dashboard, so the Dashboard brief points here.

### What it could simplify for managers (hypotheses)
- **Fewer steps.** Today it's sidebar → Timesheets → Approvals tab; at the top level, one click from anywhere. 🧪
- **A visible work queue.** A sidebar item can carry a pending count. 🧪
- **Cleaner Timesheets.** Timesheets is for viewing and correcting hours; approving becomes its own task. 🧪
- **A Dashboard link.** A pending-approvals card could deep-link straight in. 🧪
- **The product promise.** It matches PRODUCT.md's "see and approve team time without friction". ✅ that statement; 🧪 that this change delivers it.

### What still needs validation
- ❓ **What Approvals contains and does** in the live app: whole timesheets per member per period, individual entries, time-off requests (which already show Pending on the Dashboard and live under Time off)? This decides whether it is one queue or two. Inspect it as part of section 5.
- ❓ **Who sees it:** Admin and other roles, and how the nav looks for each.
- ❓ **Whether depth really drops:** deciding usually needs the Time entries context, so a top-level page might only move that depth unless the context is shown inline.
- ❓ **Sidebar capacity:** 5 main items plus 8 settings items already; check against real label lengths.
- ❓ **Duplicate entry points:** keep the Timesheets tab too, or remove it?
- ❓ **Bulk actions and edits after approval:** not in the concept.
- ❓ **Evidence:** design evidence only, no usage research (PRODUCT.md). Everything above is reasoning, not measurement.
- ❓ **Terminology:** "Approvals" is existing Jibble vocabulary; new sub-labels are not covered.

## 8. Open UX questions

**Resolved** ✅ (recorded in PRODUCT.md, Decisions): whether Timesheets is the first surface (yes, for Admin); the layout range (1040 to 1920); who approves (ordinary review).

**Still open**
1. ❓ The exact first demo scenario. It is deliberately not selected; it waits for the workflow inspection (section 5).
2. ❓ The navigation structure inside Timesheets and how back behavior works (section 6).
3. ❓ The Approvals idea (section 7).
4. ❓ How the Payroll and Screenshots tabs relate to Time entries. Only Time entries is designed in the concept.
5. ❓ Whether the "Last out …" text may move into a tooltip at the narrowest widths on the Time entries top bar (section 4.2; DESIGN.md, Layout).
6. ❓ Whether Total stays pinned beside the member column at narrow widths (section 4.1).
7. ❓ What staff see on Timesheets, if anything. Later phase.

## 9. States and ranges ❓

Not defined in the concept:
- empty week;
- members with no entries;
- very long names;
- many members (pagination only goes to 8 in the sample);
- overlapping or deleted entries (Deleted exists);
- timezones that differ between viewer and member;
- loading and error states.

Behavior for these comes from the live product (section 5). Where Figma never drew a state, its visual is designed from the concept's language and recorded as a gap.

## Visual direction and direction contract

**Visual direction: decided.** The user's words: develop and extend the existing Figma concept, preserve its visual language, and use it consistently when additional components or states are needed. ✅ (PRODUCT.md, Decision 1.)

A development direction contract for this surface is written when implementation starts, together with the target binding above. Its visual world is the concept's, pinned by those words, so no separate direction exploration is needed. No contract exists yet.


## Build started (2026-11-18)

**Implementation target:** `timesheets/index.html`, with `timesheets/timesheets.css`, `timesheets/timesheets.js`, shared `shared/tokens.css` and `shared/shell.css` (shell extracted from the Dashboard build). Mode: **Operate**, code-led.

**User decision (2026-11-18):** "Live + concept look": every live control and behavior (evidence log above), drawn in the Figma concept's visual language; Figma-only extras kept where they don't contradict live; conflicts logged above. Demo data anchored to Wed 18 Nov 2026, like the Dashboard.

**Gaps designed from the concept language:** Daily and Monthly layouts, Payroll and Screenshots tabs, entry edit / delete, the date calendar, the Export drawer and Add time drawer, Approvals empty state, loading of none (local data).

## Direction contract

THESIS: An admin's payroll-prep desk: one week of the whole team in a dense, calm grid, one click from any cell into that person's day. Refuses the live app's grey, cramped table and the concept's decorative overlays; keeps every live control.

OWN-WORLD: The Figma concept: white page, #EDEDEB hairlines, Deep Ink type, PolySans voice (Inter fallback), pill filters and round arrow buttons, grey-track top-bar tabs with white selected tab, status chips (green ongoing, grey Rest day, tinted leave chips), Activities & Projects colors on chips and timeline segments, orange only on the brand mark, current nav, current page and today.

STORY: The admin picks the week, narrows by scope, filters or search, scans totals, spots leave and ongoing days, opens a member's day, corrects or adds time, then exports.

FIRST VIEWPORT: Shell (232px sidebar, 60px top bar with Timesheets / Approvals tabs and the time clock). Row 1: period select, round prev / next, date range; scope segmented and Export at right. Row 2: search, then pill filters and Add filter. Then the 84px-row table full width: member 302 | seven day columns | Total 140, pagination below.

FORM: Live content, concept form; seed: none (pinned) — "Live + concept look (Recommended)" chosen by the user, and "develop and extend the existing Figma concept" (PRODUCT.md, Decision 1). Signature interaction: a cell click slides into that member's Time entries for that day, with the timeline and entry rows; back returns to the same week and scroll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Finish review (2026-11-18)

**Verdict: fix then ship.** All material fixes applied and re-verified the same day:
- account and organization menus wired (272px, clamped in viewport);
- Members board gives a "not in prototype" notice;
- entry rows use a fixed first track, so their columns align;
- one-column detail controls are equal height and the info card follows the accordions;
- initials avatars are neutral (Activities & Projects colours stay on chips and the timeline);
- contrast lifted: today in #C24C00, muted dashes in ink-muted;
- the detail tabs and day tabs are wired to their panels, and timeline segments are focusable;
- text inputs carry the shared focus ring;
- the split-time marker is drawn as the concept's bracket.

**Not checked:** a sweep across 1100–1300 px (spot widths 1040, 1100, 1440 and 1920 were checked). The Dashboard was checked after the shell extraction at 1440 only.

**Open follow-ups:**
- the account menu and the Members board notice are now one shared script (`shared/account.js`, styles in `shared/shell.css`), used by Dashboard and Timesheets (2026-11-18);
- Daily and Monthly layouts, Payroll and Screenshots content, and edit, delete and approval behavior are designed gaps, not live-verified;
- sorting is a concept-only behavior (conflict 4);
- "View all timezones" does nothing when the member and the viewer share a timezone.
