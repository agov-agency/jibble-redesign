# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

**Prototype stack:** HTML and CSS, plus JavaScript where a browser interaction needs it. No framework, no build step assumed, and no backend. Chosen by the user. Code is also the design medium: see Design Workflow.

- **Data:** illustrative local data only, kept in the prototype itself (for example in static JSON files or JavaScript modules). Nothing fetched from a server, and nothing that looks like real customer data (see Capabilities and Constraints).
- **What the stack must support:** designs reviewed in the browser can be exercised, not just viewed. At minimum:
  - **filtering:** apply, combine and clear filters over the local data;
  - **sorting:** sort tables and see the order change;
  - **navigation:** move between views and back, including from a Timesheets row to its Time entries view;
  - **editing:** add, change and delete items such as time entries, with changes held in memory for the session.
- **Persistence:** not required. State resets on reload unless a surface brief decides otherwise.
- **Out of scope:** real authentication, real saving, real-time updates and anything else that needs a server.
- ❓ **Open:** whether to keep each surface as a separate page or to add simple shared scripts. A framework is not on the table.
- **Accessibility carries over:** interactive prototypes must remain keyboard-operable, since interactions like these are exactly where keyboard support breaks (see Accessibility & Inclusion).

## Users

Two audiences share the product. The buyer is a small-business owner or manager who tracks team hours and attendance and prepares payroll from timesheets. The daily user is staff (frontline or remote employees) who clock in and out. The owner buys, staff use; the UI has to work for both.

**First-phase role: Admin.** Work starts with the Admin role in Timesheets (see Decisions). The Admin's exact permissions are reproduced from the live product or verified documentation, not assumed from the concept. ❓ The concept's profile shows the label "Owner"; how Admin differs from Owner, Manager and Member in the live app is not yet verified.

## Product Purpose

Jibble is a time tracking and attendance product. This project is a redesign of its logged-in web app UI. Success means owners can see and approve team time without friction, and staff can clock in and out without thinking about it.

## Positioning

All-in-one simplicity: time tracking, attendance, timesheets and payroll prep in a single easy tool, rather than a stack of separate ones.

## Operating Context

Owners and managers review timesheets, attendance and team activity at a desk. Staff clock in and out from varied devices and settings. Both are part of evaluating the web app.

## Capabilities and Constraints

- Scope is the logged-in web app UI as a whole, not the marketing site or native mobile apps. Mobile is a separate, later phase.
- Preserve existing Jibble terminology (Timesheets, Clock in, Activities, Projects and similar terms).
- This is a client redesign concept for Agov Agency. Do not invent customer data, metrics, or product claims; use clearly placeholder or illustrative content.
- **First surface:** Timesheets for the Admin role. Time entries is part of Timesheets, not a separate surface. Dashboard is a later candidate. Neither is the boundary of the design system (see Decisions).
- **Supported viewports:** desktop widths from 1040 to 1920 CSS pixels, including every intermediate width. Behavior below 1040 is outside this first phase (see Decisions).
- **Functional fidelity:** the redesign reproduces the current app's behavior (see Functional Fidelity).
- **The exact first demo scenario is not selected.** It stays open until the existing Admin Timesheets workflow has been inspected.

## Brand Commitments

- Keep the existing Jibble name and logo.
- Keep existing Jibble copy and terminology.
- **Visual direction (decided):** develop and extend the existing Figma concept. Preserve its visual language, and use it consistently whenever additional components or states are needed.
- **Shell (decided):** keep the sidebar and top bar as designed in Figma: appearance, structure and navigation arrangement. Adapt their layout only as needed for the supported viewport widths.

## Decisions

The decisions made so far, recorded once here. DESIGN.md and the surface briefs refer to them and add only their own scope. Reviewed with the user in ordinary review; no further approval process is needed (decision 5).

| # | Decision | Detail |
|---|---|---|
| 1 | **Visual direction** | Develop and extend the existing Figma concept. Preserve its visual language and apply it consistently to any new component or state. No separate new visual identity. (Design system rules: DESIGN.md.) |
| 2 | **Shell** | The sidebar and top bar stay as designed in Figma. Only their layout may adapt, and only as needed for the supported widths. (Measurements and rules: DESIGN.md, Layout.) |
| 3 | **Where to start** | Timesheets for the Admin role, with Time entries inside it. Dashboard is a later candidate. (Surface briefs: `timesheets.md`, `dashboard.md`.) |
| 4 | **Viewport support** | Responsive desktop layouts across 1040 to 1920 CSS px, including intermediate widths. Nothing is hidden or removed to make a layout fit, and the page never overflows horizontally by accident. Below 1040 is outside this phase. (How the Timesheets table and detail view fit: `timesheets.md`. Foundations: DESIGN.md, Layout.) |
| 5 | **Review** | Ordinary review with the user is sufficient. No agency or client approval process has to be defined before work can proceed. |
| 6 | **Functional fidelity** | Reproduce the current app's functionality, workflows, business rules and Admin permissions (see Functional Fidelity). |
| 7 | **Demo scenario** | Not selected. It waits until the existing Admin Timesheets workflow has been inspected. |

### Resolved questions

These were open earlier and are now closed. They are not repeated as decisions elsewhere.

- Which visual direction to take, and whether to keep the concept's visual language or only its tokens and components. Decision 1.
- Whether the app shell is open to redesign. Decision 2.
- Which surface goes first, and for which role. Decision 3.
- Whether responsive behavior is in scope, and at which widths. Decision 4.
- Who gives the final approval, and whether an agency or client approval process must be defined first. Decision 5.

## Functional Fidelity

The redesign changes how the product looks and is composed. It does not change what the product does.

- **Reproduce** the current app's functionality, workflows, business rules and Admin permissions.
- **Evidence for behavior:** the live product, or documentation that has been verified. Documentation counts as verified once it has been checked against the live product, or confirmed by the user.
- **Evidence for visuals:** the Figma concept.
- **Conflicts:** when the live product (or verified documentation) and Figma disagree, flag the specific conflict. Name what Figma shows, what the product does, and the source of each. Do not silently pick one or change the behavior. Conflicts are logged in the relevant surface brief.
- **Gaps:** where neither source covers a behavior (for example a state Figma never drew), design it from the concept's visual language. Keep the behavior as the live product has it, and record that the visual is new.
- **Data:** behavior is reproduced, never real data. The prototype uses illustrative local data (see Stack). Rules that depend on server data are simulated over that data, and the simulation is noted where it simplifies.
- **Status:** no behavioral evidence has been gathered yet (see Evidence on Hand).

## Design Workflow

The goal is an **ongoing, code-based design workflow** for the Jibble product. Designs are created, reviewed and iterated in the browser as working HTML/CSS, not as static mockups, and the work continues after the first surfaces.

### Where design truth lives

| Stage | Source of truth | Notes |
|---|---|---|
| Starting point | **Figma UI Concept** (see Evidence on Hand) | The initial reference for tokens, components and layouts. Read-only. |
| A component is implemented and approved | **Its code** | The code becomes the maintained visual implementation of that component. Its decisions are documented alongside the code. |
| A component the concept doesn't have | **Its code**, designed directly in the browser | A missing Figma component never blocks design work. New components follow DESIGN.md's foundations and go through the same review. |

Today nothing is implemented, so the Figma concept is still the reference for everything. Undecided:
- whether Figma is kept in sync once code becomes the source;
- where per-component decision notes sit next to the code.

**Review.** A component or surface is reviewed with the user in ordinary review. That is sufficient to approve it (Decision 5).

### How the system grows

- **On demand.** Components move from the Figma reference into code when a screen being designed needs them. The Figma library is not migrated upfront.
- **Shared first.** Anything reusable goes into the shared system (DESIGN.md plus the component's code), not into one screen.
- **Recorded.** Every approval, rejection or replacement is written down, never left implicit.
- **Exercisable.** A surface isn't reviewed as a picture. Reviewers can use it: filter, sort, navigate and edit over illustrative local data, with no backend (see Stack).

### Document map

| Document | Holds |
|---|---|
| PRODUCT.md (this file) | Product truth, evidence, and this workflow. Product-wide. |
| DESIGN.md | Reusable foundations, components, interaction states and rules across the whole product. No screen-specific layouts. |
| `.impeccable/surfaces/<surface>.md` | One brief per surface: layout, scenarios, open UX questions. Current briefs: `dashboard.md`, `timesheets.md` (includes Time entries). |
| SECTION-C-PROPOSALS.md | The **initial migration and decision record**: which Figma components the first surfaces were cleared to use, what was skipped, and how orphaned components were replaced. A historical record, not a whitelist. |
| Component code (once it exists) | The maintained implementation of each approved component, with its decision notes alongside. |

## Evidence on Hand

Three kinds of evidence are kept apart here: design evidence (what the product should look like), behavioral evidence (what the product does, per Functional Fidelity) and usage research (how people actually use it). The project has the first and none of the other two.

### Available: design evidence

- **Figma UI Concept** (file `IxEzpqNPY2D655pIJ8N1qc`): an existing concept, not the production app. Read-only so far. It contains:
  - concept screens for Dashboard, Timesheets (list and member Time entries), Members board and Time clock, Live locations, Settings, Members, Sign up, and Mobile;
  - a Design System page with color variables, text styles and components (the component library is only partly organized);
  - a Presentation page with the concept's own narrative, plus Moodboard and Artefacts pages.
- **What it can support:** visual tokens, component structure, screen layout, and existing Jibble terminology as used in the concept.
- **What it cannot support:**
  - claims about user behavior, frequency, or pain points;
  - real data: the names, organizations and hours in it are sample content;
  - production parity: whether it matches the live Jibble app is unconfirmed;
  - behavior and business rules: see Functional Fidelity. The live product is the evidence, not Figma;
  - responsive behavior: the web frames are 1440 px wide, and the sidebar has only Default and Hover variants at 232 px, with no collapsed state drawn.

### Missing: behavioral evidence and usage research

Nothing below has been supplied:
- **About users:** product analytics or usage data; user interviews or usability-test results; support tickets or customer feedback.
- **About the approval feature:** how often managers approve timesheets in the live app, who approves, or how long it takes.
- **About the live app (behavioral evidence):** no live-product access and no verified documentation have been used yet. Needed for the Admin Timesheets workflow: the behavior of filters, sorting, entry editing and approvals, the Admin permissions, the sidebar collapse behavior, and real copy where the concept may differ.
- **Brand files:** brand asset files (logo source, webfont licenses).

Until behavioral evidence exists, the behavior of every feature is unverified. Until usage research exists, every statement about what users need or do is a hypothesis. Future work must not fabricate testimonials, customer logos, metrics, or benchmarks.

## Product Principles

- Simplicity across the whole workflow is the product, so one tool should feel like one tool.
- Serve two people at once: the owner who reviews and approves, and the staff member who just clocks in.
- Keep Jibble's own vocabulary; clarity beats novelty in labels.
- Show real task states, not decoration; every screen should answer what the user needs to do next.

## Accessibility & Inclusion

No specific standard was required. Baseline expectations for a daily-use tool apply (legible contrast, keyboard operability). The Figma concept's buttons define no focus state, so keyboard focus has to be designed (see DESIGN.md).
