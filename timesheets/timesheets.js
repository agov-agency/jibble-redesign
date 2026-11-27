/* Timesheets prototype (Admin). Illustrative local data only; edits live in memory for
   the session. Only per-viewer view preferences (page size) go to localStorage. */
(() => {
  "use strict";

  // ---------- Demo clock ----------
  // Anchored to Wed 18 Nov 2026, 11:40 (same anchor as the Dashboard). Time moves on from load.
  const TODAY = new Date(2026, 10, 18, 12);
  const DEMO_START_MIN = 11 * 60 + 40;
  /* Shared with the Dashboard (sessionStorage "jb-dashboard-clock"), so your own clock carries across pages. */
  const CLOCK_KEY = "jb-dashboard-clock", sessionDay = new Date().toDateString();
  let savedClock = null;
  try {
    const saved = JSON.parse(sessionStorage.getItem(CLOCK_KEY));
    if (saved?.day === sessionDay && Array.isArray(saved.entries) && saved.entries.length) savedClock = saved;
  } catch { /* Session storage may be unavailable for local files. */ }
  const loadedAt = savedClock?.loadedAt ?? Date.now();
  const nowMin = () => DEMO_START_MIN + (Date.now() - loadedAt) / 60000;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("jb-ts-" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("jb-ts-" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  // ---------- Dates ----------
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mk = (y, m, d) => new Date(y, m, d, 12);
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return mk(y, m - 1, d); };
  const addDays = (d, n) => mk(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const weekStart = d => addDays(d, -((d.getDay() + 6) % 7));
  const sameDay = (a, b) => key(a) === key(b);
  const TODAY_KEY = key(TODAY);
  const cmpDay = d => (key(d) < TODAY_KEY ? -1 : key(d) > TODAY_KEY ? 1 : 0);
  const fmtD = d => `${d.getDate()} ${MON[d.getMonth()]}`;
  const fmtDay = d => `${DOW3[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;

  // ---------- Formatting ----------
  const pad = n => String(n).padStart(2, "0");
  const hhmm = min => { const t = Math.round(min); return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };   // list cells: 07:58
  const hmm = min => { const t = Math.round(min); return `${Math.floor(t / 60)}:${pad(t % 60)}`; };          // durations: 1:13
  const clock12 = min => { let m = Math.round(min); m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60); return `${pad((h % 12) || 12)}:${pad(m % 60)} ${h < 12 ? "am" : "pm"}`; };
  const clockShort = min => { let m = Math.round(min); m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60); return `${(h % 12) || 12}:${pad(m % 60)} ${h < 12 ? "am" : "pm"}`; };
  const gmt = off => `GMT${off >= 0 ? "+" : "-"}${Math.abs(off)}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const initials = n => n.split(/\s+/).filter(w => /^[A-ZÀ-Ž]/.test(w)).slice(0, 2).map(w => w[0]).join("");
  const ago = min => { const m = Math.max(0, Math.round(min)); if (m < 1) return "just now"; if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`; const h = Math.floor(m / 60); if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`; const d = Math.floor(h / 24); return d === 1 ? "yesterday" : `${d} days ago`; };

  // ---------- Reference data ----------
  const ACTIVITIES = [
    { id: "dev", name: "Development", color: "var(--ap-violet)" },
    { id: "des", name: "Design", color: "var(--ap-green)" },
    { id: "res", name: "Research", color: "var(--ap-pink)" },
    { id: "test", name: "Testing", color: "var(--ap-turquoise)" },
    { id: "meet", name: "Meetings", color: "var(--ap-red)" },
    { id: "mgmt", name: "Management", color: "var(--ap-blue)" },
    { id: "sup", name: "Support", color: "var(--ap-orange)" },
    { id: "mkt", name: "Marketing", color: "var(--ap-purple)" },
  ];
  const PROJECTS = [
    { id: "web", name: "Website refresh", color: "var(--ap-violet)", tasks: ["Homepage", "Pricing page", "Blog templates"] },
    { id: "app", name: "Mobile app", color: "var(--ap-green)", tasks: ["Onboarding flow", "Offline mode", "Release 4.2"] },
    { id: "onb", name: "Client onboarding", color: "var(--ap-pink)", tasks: ["Kick-off calls", "Data import"] },
    { id: "desk", name: "Support desk", color: "var(--ap-turquoise)", tasks: ["Tier 1 queue", "Escalations"] },
    { id: "audit", name: "Q4 audit", color: "var(--ap-red)", tasks: ["Expense review", "Payroll checks"] },
    { id: "fit", name: "Warehouse fit-out", color: "var(--ap-blue)", tasks: ["Shelving", "Safety signage"] },
    { id: "brand", name: "Brand guidelines", color: "var(--ap-orange)", tasks: ["Logo usage", "Tone of voice"] },
  ];
  const LOCATIONS = [
    { id: "main", name: "NY Main Office" }, { id: "east", name: "NY East Office" }, { id: "post", name: "NY Post" }, { id: "remote", name: "Remote" },
  ];
  const GROUPS = [{ id: "design", name: "Design" }, { id: "eng", name: "Engineering" }, { id: "support", name: "Support" }, { id: "ops", name: "Operations" }, { id: "sales", name: "Sales" }];
  const SCHEDULES = [
    { id: "std", name: "Standard 9–5", rest: [0, 6] },
    { id: "early", name: "Early shift", rest: [0, 6] },
    { id: "flex", name: "Flexible", rest: [0] },
    { id: "rota", name: "Retail rota", rest: [1, 2] },
  ];
  const EMP = [{ id: "ft", name: "Full-time" }, { id: "pt", name: "Part-time" }, { id: "ct", name: "Contractor" }];
  const TZ = {
    ny: { off: -5, label: "(GMT-5) New York, United States" },
    la: { off: -8, label: "(GMT-8) Los Angeles, United States" },
    ldn: { off: 0, label: "(GMT+0) London, United Kingdom" },
    ber: { off: 1, label: "(GMT+1) Berlin, Germany" },
    ist: { off: 3, label: "(GMT+3) Istanbul, Türkiye" },
  };
  const VIEWER_TZ = TZ.ny;
  const ME_ID = "jl";

  const P = (id, name, pos, group, sched, emp, tz, managed, loc) => ({ id, name, pos, group, sched, emp, tz, managed, loc, code: "" });
  const MEMBERS = [
    P("am", "Angus MacGyver", "Customer Service Representative", "support", "std", "ft", "ny", true, "main"),
    P("ab", "Angela Bower", "Marketing Manager", "sales", "std", "ft", "ny", true, "main"),
    P("ck", "Chikayo Kodama", "Sales Representative", "sales", "flex", "ft", "la", false, "remote"),
    P("dz", "Dalma Zayas Orta", "Administrative Assistant", "ops", "std", "pt", "ny", true, "east"),
    P("dm", "Devon Miles", "Financial Analyst", "ops", "std", "ft", "ny", false, "main"),
    P("hi", "Hanna Ingveldardóttir", "Human Resources Specialist", "ops", "std", "ft", "ldn", true, "remote"),
    P("hk", "Hazel C. Kennedy", "Software Developer", "eng", "flex", "ft", "ber", true, "remote"),
    P("jl", "Jane Long", "CEO", "ops", "std", "ft", "ny", false, "main"),
    P("lw", "Latanya D. Walls", "Project Manager", "eng", "std", "ft", "ny", true, "east"),
    P("mh", "Mario B. Hardin", "Operations Manager", "ops", "early", "ft", "ny", false, "post"),
    P("xy", "Xiong Yao", "Software Developer", "eng", "flex", "ft", "ist", true, "remote"),
    P("sm", "Scott R. Maag", "Support Specialist", "support", "early", "ft", "ny", false, "post"),
    P("ok", "Oliver Kuprešak", "Warehouse Associate", "support", "rota", "pt", "ny", false, "post"),
    P("ao", "Amara Okafor", "QA Engineer", "eng", "std", "ft", "ldn", true, "remote"),
    P("lf", "Luis Ferreira", "Facilities Coordinator", "ops", "rota", "ft", "ny", false, "east"),
    P("pn", "Priya Nair", "Data Analyst", "eng", "flex", "ct", "ber", false, "remote"),
    P("tw", "Tomasz Wójcik", "Support Specialist", "support", "early", "pt", "ber", false, "remote"),
    P("ed", "Elif Demir", "Product Designer", "design", "std", "ft", "ist", true, "remote"),
    P("rb", "Rosa Bianchi", "Brand Designer", "design", "flex", "ct", "ber", false, "remote"),
    P("kn", "Kwame Nkansah", "Account Executive", "sales", "std", "ft", "ny", false, "main"),
    P("sj", "Sofia Järvinen", "UX Researcher", "design", "std", "ft", "ldn", true, "remote"),
    P("mt", "Marcus Thompson", "Retail Associate", "sales", "rota", "pt", "la", false, "remote"),
    P("ys", "Yuki Sato", "Backend Engineer", "eng", "std", "ft", "la", false, "remote"),
    P("nb", "Noah Bergström", "Payroll Specialist", "ops", "std", "ft", "ldn", true, "remote"),
  ];
  MEMBERS.forEach((m, i) => { m.code = `JB-${String(1040 + i * 7)}`; m.idx = i; });
  const byId = id => MEMBERS.find(m => m.id === id);
  const ME = byId(ME_ID);
  // Neutral initials, as on the Dashboard; Activities & Projects colours stay on chips and the timeline.
  const avatar = (m, size = 48, extra = "") => `<span class="avatar avatar--${size}${m.id === ME_ID ? " avatar--me" : ""} ${extra}" aria-hidden="true">${initials(m.name)}</span>`;

  const HOLIDAYS = window.JibbleTimeOff ? window.JibbleTimeOff.HOLIDAYS : { "2026-11-11": "Veterans Day", "2026-11-26": "Thanksgiving Day", "2026-11-27": "Day after Thanksgiving", "2026-12-25": "Christmas Day" };
  // Approved time off comes from the shared store (edited on the Time off page); the list below is the fallback.
  const TIME_OFF = window.JibbleTimeOff ? window.JibbleTimeOff.timesheetRanges() : [
    { m: "ab", type: "vacation", from: "2026-11-16", to: "2026-11-16" },
    { m: "hk", type: "vacation", from: "2026-11-16", to: "2026-11-17" },
    { m: "dz", type: "sick", from: "2026-11-17", to: "2026-11-17" },
    { m: "dm", type: "sick", from: "2026-11-19", to: "2026-11-19" },
    { m: "ao", type: "vacation", from: "2026-11-19", to: "2026-11-20" },
    { m: "pn", type: "vacation", from: "2026-11-09", to: "2026-11-13" },
    { m: "sm", type: "sick", from: "2026-11-05", to: "2026-11-06" },
    { m: "kn", type: "vacation", from: "2026-11-23", to: "2026-11-25" },
    { m: "lw", type: "vacation", from: "2026-11-02", to: "2026-11-03" },
  ];
  const TIME_OFF_NAME = window.JibbleTimeOff ? window.JibbleTimeOff.policyNames() : { vacation: "Vacation Leave", sick: "Sick Leave" };
  const NOTES = [
    "Kick-off for the onboarding flow with the product team.", "Reviewing the support backlog before stand-up.",
    "Excited to start the new app project. Let's make it a success!", "Beginning research on the new feature.",
    "Payroll checks for the October close.",
    "Client call about the data import timeline.", "Pairing on the offline mode bug.", "", "", "", "",
  ];

  const OUT_NOTES = ["Staying late to tackle the workload on the website.", "Wrapped up the release checklist.", "Leaving early for a dentist appointment."];

  // ---------- Deterministic generator ----------
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const dayNum = d => Math.round((d - mk(2026, 0, 1)) / 86400000);
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  let uid = 1;
  const PLATFORMS = ["mobile", "web", "desktop", "kiosk", "browser"];
  const PLATFORM_NAME = { mobile: "Mobile app", web: "Web app", desktop: "Desktop app", kiosk: "Kiosk", browser: "Browser extension" };

  function dayInfo(m, d) {
    const k = key(d);
    const sched = SCHEDULES.find(s => s.id === m.sched);
    const off = TIME_OFF.find(t => t.m === m.id && k >= t.from && k <= t.to);
    return {
      rest: sched.rest.includes(d.getDay()),
      holiday: HOLIDAYS[k] || null,
      timeoff: off ? off.type : null,
      future: cmpDay(d) > 0,
      today: k === TODAY_KEY,
    };
  }

  function generate(m, d) {
    const info = dayInfo(m, d);
    if (info.future || info.timeoff) return [];
    if (m.id === ME_ID && info.today && savedClock) {
      const out = [], list = savedClock.entries;
      list.forEach((e, i) => {
        const x = ev(e.type === "break" ? "break" : "in", e.start, e.act || null, e.project || null, e.note || "", "web");
        x.loc = e.location || "";
        out.push(x);
        // A clock in is always followed by a break or a clock out, never by another clock in.
        const next = list[i + 1];
        if (e.end != null && (next?.start !== e.end || (e.type !== "break" && next?.type !== "break"))) { const o = ev("out", e.end, null, null, e.outNote || "", "web"); o.loc = e.outLocation || ""; out.push(o); }
      });
      return out;
    }
    if (m.id === ME_ID && info.today) {
      return [
        ev("in", 8 * 60 + 5, "meet", "app", "", "web"),
        ev("break", 10 * 60 + 15, null, null, "", "web"),
        ev("in", 10 * 60 + 34, "meet", "app", "Client call about the data import timeline.", "web"),
        ev("out", 11 * 60 + 36, null, null, "", "web"),
      ];
    }
    const r = rng(9973 + m.idx * 7919 + dayNum(d) * 104729);
    if (info.rest && r() > 0.1) return [];
    if (info.holiday && r() > 0.3) return [];
    if (!info.rest && !info.holiday && r() < 0.04) return [];
    const short = info.rest || info.holiday || m.emp === "pt";
    const early = m.sched === "early";
    let t = (early ? 6 * 60 + 30 : 7 * 60 + 45) + Math.floor(r() * (early ? 50 : 95));
    const target = short ? 180 + r() * 120 : 420 + r() * (r() < 0.25 ? 190 : 110);
    const plat = pick(r, PLATFORMS);
    const a1 = pick(r, ACTIVITIES).id, p1 = pick(r, PROJECTS).id, a2 = pick(r, ACTIVITIES).id, p2 = r() < 0.6 ? p1 : pick(r, PROJECTS).id;
    const out = [];
    const block1 = short ? target : 110 + r() * 80;
    out.push(ev("in", t, a1, p1, pick(r, NOTES), plat, r));
    t += Math.round(block1);
    if (!short) {
      const brk = 20 + Math.round(r() * 40);
      out.push(ev("break", t, null, null, "", plat, r));
      t += brk;
      const block2 = Math.max(60, target - block1);
      out.push(ev("in", t, a2, p2, pick(r, NOTES), plat, r));
      t += Math.round(block2);
    }
    out.push(ev("out", t, null, null, r() < 0.25 ? pick(r, OUT_NOTES) : "", plat, r));
    if (info.today) {
      // Today: keep what has happened by the demo's 11:40, so some members are still clocked in.
      const now = DEMO_START_MIN;
      return out.filter(e => e.t <= now);
    }
    return out;
  }
  function ev(type, t, act, proj, note, plat, r) {
    const flags = {};
    if (r) {
      if (plat === "mobile" || plat === "kiosk") flags.loc = r() < 0.8;
      if (plat === "kiosk" || (plat === "mobile" && r() < 0.4)) flags.face = true;
      if (plat === "mobile" && r() < 0.08) flags.offline = true;
    }
    return { id: uid++, type, t, act, proj, task: "", note: note || "", plat, flags, manual: false, deleted: false, loc: "" };
  }

  // Entries cache: generated on first view, then edited in memory.
  const ENTRIES = new Map();
  function entriesFor(m, d) {
    const k = m.id + "|" + key(d);
    if (!ENTRIES.has(k)) ENTRIES.set(k, generate(m, d));
    return ENTRIES.get(k);
  }
  const HISTORY = [];   // { mid, day, ts, change, reason, by }

  // Seed the concept's scenario on Angus: a manual entry and a deleted one, both logged.
  (() => {
    const d = mk(2026, 10, 17), list = entriesFor(byId("am"), d);
    const e = ev("in", 9 * 60 + 15, "mgmt", "app", "", "mobile"); e.deleted = true; e.flags.loc = true;
    list.push(e);
    const first = list.find(x => x.type === "in");
    if (first) { first.manual = true; first.note = first.note || "Forgot to clock in on arrival."; }
    HISTORY.push({ mid: "am", day: key(d), ts: "17 Nov, 4:12 pm", change: `Added Clock in at ${first ? clockShort(first.t) : "9:02 am"}`, reason: "Forgot to clock in on arrival.", by: "Jane Long" });
    HISTORY.push({ mid: "am", day: key(d), ts: "17 Nov, 4:14 pm", change: "Deleted Clock in at 9:15 am", reason: "Duplicate entry", by: "Jane Long" });
  })();

  // ---------- Day computation ----------
  function compute(m, d) {
    const info = dayInfo(m, d);
    const all = entriesFor(m, d);
    const live = all.filter(e => !e.deleted && e.type !== "hours").sort((a, b) => a.t - b.t);
    const hours = all.filter(e => !e.deleted && e.type === "hours");
    const now = nowMin();
    let worked = 0, brk = 0; const segs = []; const durs = new Map();
    live.forEach((e, i) => {
      if (e.type === "out") { durs.set(e.id, null); return; }
      const next = live[i + 1];
      let end = next ? next.t : (info.today ? now : null);
      const open = !next;
      if (end == null) { durs.set(e.id, null); return; }
      const len = Math.max(0, end - e.t);
      durs.set(e.id, { len, live: open && info.today });
      if (e.type === "in") worked += len; else brk += len;
      segs.push({ type: e.type, from: e.t, to: end, act: e.act, live: open && info.today, id: e.id });
    });
    hours.forEach(h => { worked += h.dur; durs.set(h.id, { len: h.dur }); });
    const last = live[live.length - 1];
    const status = info.today && last ? (last.type === "in" ? "in" : last.type === "break" ? "break" : "out") : null;
    const first = live.find(e => e.type === "in");
    const lastOut = [...live].reverse().find(e => e.type === "out");
    const acts = [...new Set(live.filter(e => e.type === "in").map(e => e.act).filter(Boolean))];
    return { info, all, live, hours, worked, brk, segs, durs, status, first, lastOut, acts, has: live.length + hours.length > 0 };
  }
  function payroll(c) {
    const w = c.worked, out = { regular: 0, dot: 0, ddot: 0, rest: 0, hol: 0, off: 0 };
    if (c.info.rest) out.rest = w;
    else if (c.info.holiday) out.hol = w;
    else { out.regular = Math.min(w, 480); out.dot = Math.min(Math.max(w - 480, 0), 240); out.ddot = Math.max(w - 720, 0); }
    if (c.info.timeoff && !c.info.rest && !c.info.holiday) out.off = 480;
    out.total = out.regular + out.dot + out.ddot + out.rest + out.hol + out.off;
    return out;
  }

  // ---------- State ----------
  const state = {
    view: "list",                 // list | approvals | detail
    period: "week",
    anchor: TODAY,
    scope: "org",
    search: "",
    filters: { groups: new Set(), members: new Set(), schedules: new Set(), codes: new Set(), positions: new Set(), emp: new Set() },
    extra: [],                    // added filters: codes | positions | emp
    hourFilters: { tracked: null, payroll: null },
    sort: { key: "name", dir: "asc" },
    page: 1,
    size: store.get("size", 10),
    detail: { mid: "am", day: key(addDays(TODAY, -1)), tab: "entries" },
    tzMode: "theirs",
    open: { tracked: false, payroll: false, history: false },
    activity: savedClock?.activity ?? "meet", project: savedClock?.project ?? "app",
  };

  // ---------- Helpers ----------
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  function periodDays() {
    const a = state.anchor;
    if (state.period === "day") return [a];
    if (state.period === "week") { const s = weekStart(a); return [0, 1, 2, 3, 4, 5, 6].map(i => addDays(s, i)); }
    const first = mk(a.getFullYear(), a.getMonth(), 1), n = new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => addDays(first, i));
  }
  function rangeLabel(days = periodDays()) {
    if (state.period === "day") return fmtDay(days[0]);
    if (state.period === "week") return `${fmtD(days[0])} – ${fmtD(days[6])}`;
    return `${MONTH[days[0].getMonth()]} ${days[0].getFullYear()}`;
  }
  const PERIOD_WORD = { day: "Daily", week: "Weekly", month: "Monthly" };
  const PERIOD_UNIT = { day: "day", week: "week", month: "month" };

  // ---------- Filters ----------
  const FILTER_DEFS = {
    groups: { label: "Groups", opts: () => GROUPS, match: (m, s) => s.has(m.group) },
    members: { label: "Members", opts: () => MEMBERS.map(m => ({ id: m.id, name: m.name })), match: (m, s) => s.has(m.id), search: true },
    schedules: { label: "Schedules", opts: () => SCHEDULES, match: (m, s) => s.has(m.sched) },
    codes: { label: "Member codes", opts: () => MEMBERS.map(m => ({ id: m.code, name: m.code })), match: (m, s) => s.has(m.code), search: true, extra: true },
    positions: { label: "Positions", opts: () => [...new Set(MEMBERS.map(m => m.pos))].sort().map(p => ({ id: p, name: p })), match: (m, s) => s.has(m.pos), search: true, extra: true },
    emp: { label: "Employment types", opts: () => EMP, match: (m, s) => s.has(m.emp), extra: true },
  };
  const HOUR_DEFS = { payroll: "Payroll hours", tracked: "Tracked hours" };
  // Live order: Payroll hours, Groups, Members, Schedules, Tracked hours, then added filters.
  // Approvals (live) has no Payroll hours filter.
  const filterOrder = () => [...(state.view === "approvals" ? [] : ["h:payroll"]), "groups", "members", "schedules", "h:tracked", ...state.extra];

  const trackedOf = c => c.worked + c.brk;
  function hoursFor(m, kind, days, f) {
    let sum = 0;
    days.forEach(d => {
      const c = compute(m, d);
      if (f && f.exRest && (c.info.rest || c.info.holiday)) return;
      if (f && f.exOff && c.info.timeoff) return;
      sum += kind === "payroll" ? payroll(c).total : trackedOf(c);
    });
    return sum;
  }
  function hourMatch(f, minutes) {
    if (!f || !f.op) return true;
    const h = minutes / 60, a = +f.a, b = +f.b;
    if (f.op === "more") return h > a;
    if (f.op === "less") return h < a;
    if (f.op === "equal") return Math.abs(h - a) < 0.0083;
    if (f.op === "between") return h >= Math.min(a, b) && h <= Math.max(a, b);
    return true;
  }
  function inScope(member) {
    if (state.scope === "personal") return member.id === "jl";
    return state.scope !== "managed" || member.managed;
  }
  function visibleMembers(days = periodDays()) {
    const q = state.search.trim().toLowerCase();
    return MEMBERS.filter(m => {
      if (!inScope(m)) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.pos.toLowerCase().includes(q)) return false;
      for (const [k, def] of Object.entries(FILTER_DEFS)) { const s = state.filters[k]; if (s.size && !def.match(m, s)) return false; }
      for (const kind of state.view === "approvals" ? ["tracked"] : ["tracked", "payroll"]) {
        const f = state.hourFilters[kind];
        if (f && f.op && !hourMatch(f, hoursFor(m, kind, days, f))) return false;
      }
      return true;
    });
  }
  const activeFilterCount = () => Object.values(state.filters).reduce((n, s) => n + (s.size ? 1 : 0), 0)
    + Object.entries(state.hourFilters).filter(([k, f]) => f && f.op && !(k === "payroll" && state.view === "approvals")).length
    + (state.view === "approvals" && AP.statuses.size ? 1 : 0);

  function renderFilters() {
    const wrap = $("#filters");
    const focusedId = document.activeElement && document.activeElement.closest(".filter") ? document.activeElement.closest(".filter").dataset.f : null;
    wrap.innerHTML = filterOrder().map(id => {
      if (id.startsWith("h:")) {
        const kind = id.slice(2), f = state.hourFilters[kind], on = f && f.op;
        const label = on ? `${HOUR_DEFS[kind]}: ${opText(f)}` : HOUR_DEFS[kind];
        return `<div class="filter" data-f="${id}"><button class="filter__btn${on ? " is-active" : ""}" aria-haspopup="dialog" aria-expanded="false"><span>${esc(label)}</span>${icon("chevron-down", "i i-16")}</button></div>`;
      }
      const def = FILTER_DEFS[id], s = state.filters[id];
      let label = def.label;
      if (s.size === 1) label = def.opts().find(o => s.has(o.id))?.name || def.label;
      const count = s.size > 1 ? ` <span class="filter__count">${s.size}</span>` : "";
      return `<div class="filter" data-f="${id}"><button class="filter__btn${s.size ? " is-active" : ""}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(def.label)}${s.size ? `: ${s.size} selected` : ""}"><span>${esc(label)}</span>${count}${icon("chevron-down", "i i-16")}</button></div>`;
    }).join("");
    if (focusedId) wrap.querySelector(`[data-f="${focusedId}"] .filter__btn`)?.focus();
    // More filters: each extra filter toggles on and off in place; the menu stays open. Skip rebuilding while open so focus stays put.
    $("#clearAll").hidden = activeFilterCount() === 0 && !state.search;
  }
  const opText = f => ({ more: `> ${f.a}h`, less: `< ${f.a}h`, equal: `= ${f.a}h`, between: `${f.a}–${f.b}h` }[f.op]);

  // Filter popovers are built on open, so they always reflect state.
  function openFilterMenu(wrap) {
    const id = wrap.dataset.f, btn = wrap.querySelector(".filter__btn");
    let menu = wrap.querySelector(".menu");
    if (!menu) { menu = document.createElement("div"); menu.className = "menu"; menu.hidden = true; menu.setAttribute("role", "dialog"); wrap.appendChild(menu); }
    if (id.startsWith("h:")) buildHourMenu(menu, id.slice(2)); else buildListMenu(menu, id);
    menu.setAttribute("aria-label", id.startsWith("h:") ? HOUR_DEFS[id.slice(2)] : FILTER_DEFS[id].label);
    toggleMenu(btn, menu);
  }
  function buildListMenu(menu, id) {
    const def = FILTER_DEFS[id], s = state.filters[id];
    const opts = def.opts();
    menu.innerHTML = `${def.search ? `<label class="field-search field-search--menu">${icon("search", "i i-16")}<span class="sr-only">Search ${esc(def.label)}</span><input type="search" placeholder="Search" data-msearch autocomplete="off"><button type="button" class="field-search__clear" data-sclear aria-label="Clear search" title="Clear search" hidden>${icon("x-circle", "i i-16")}</button></label>` : ""}
      <div data-list>${opts.map(o => `<label class="menu__opt" data-name="${esc(o.name.toLowerCase())}"><input type="checkbox" value="${esc(o.id)}" ${s.has(o.id) ? "checked" : ""}><span class="box">${icon("check")}</span><span>${esc(o.name)}</span></label>`).join("")}</div>
      ${def.search ? `<p class="menu__empty" data-empty hidden>No ${esc(def.label.toLowerCase())} found</p>` : ""}
      <div class="menu__foot"><button type="button" data-clear>Clear selection</button></div>`;
    menu.onchange = e => { if (!e.target.matches("input[type=checkbox]")) return; e.target.checked ? s.add(e.target.value) : s.delete(e.target.value); state.page = 1; renderList(); renderFiltersKeepMenu(); };
    menu.oninput = e => { if (!e.target.matches("[data-msearch]")) return; menu.querySelector("[data-sclear]").hidden = !e.target.value; menuSearch(menu, e.target.value); };
    menu.onclick = e => {
      if (e.target.closest("[data-sclear]")) { e.preventDefault(); const i = menu.querySelector("[data-msearch]"); i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); i.focus(); }
      if (e.target.closest("[data-clear]")) { s.clear(); menu.querySelectorAll("input[type=checkbox]").forEach(i => { i.checked = false; }); state.page = 1; renderList(); renderFiltersKeepMenu(); }
    };
  }
  function buildHourMenu(menu, kind) {
    menu.classList.add("menu--hours");
    const f = state.hourFilters[kind] || {};
    const radio = (op, label) => `<label class="menu__opt menu__opt--radio"><input type="radio" name="op-${kind}" value="${op}" ${f.op === op ? "checked" : ""}><span class="dot"></span><span>${label}</span></label>
      <div class="hrs" data-op="${op}" ${f.op === op ? "" : "hidden"}>${op === "between"
        ? `<div class="field"><input type="number" min="0" step="0.5" data-a value="${f.op === op ? f.a : ""}" aria-label="From hours"></div> and <div class="field"><input type="number" min="0" step="0.5" data-b value="${f.op === op ? f.b : ""}" aria-label="To hours"></div> hours`
        : `<div class="field"><input type="number" min="0" step="0.5" data-a value="${f.op === op ? f.a : ""}" aria-label="Hours"></div> hours`}</div>`;
    menu.innerHTML = `
      <label class="menu__opt"><input type="checkbox" data-exrest ${f.exRest ? "checked" : ""}><span class="box">${icon("check")}</span><span>Exclude rest days &amp; public holidays</span></label>
      <label class="menu__opt"><input type="checkbox" data-exoff ${f.exOff ? "checked" : ""}><span class="box">${icon("check")}</span><span>Exclude time offs</span></label>
      <hr class="menu__sep">
      ${radio("more", "More than")}${radio("less", "Less than")}${radio("between", "Between")}${radio("equal", "Equal to")}
      <p class="form-error" data-err hidden></p>
      <div class="menu__foot"><button type="button" data-clear>Clear selection</button><button type="button" data-apply class="is-primary">Apply</button></div>`;
    menu.onchange = e => {
      if (e.target.type === "radio") menu.querySelectorAll(".hrs").forEach(h => { h.hidden = h.dataset.op !== e.target.value; if (!h.hidden) h.querySelector("input").focus(); });
    };
    menu.onclick = e => {
      if (e.target.closest("[data-sclear]")) { e.preventDefault(); const i = menu.querySelector("[data-msearch]"); i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); i.focus(); }
      if (e.target.closest("[data-clear]")) { state.hourFilters[kind] = null; state.page = 1; closeMenus(true); renderList(); renderFilters(); }
      if (e.target.closest("[data-apply]")) {
        const op = menu.querySelector("input[type=radio]:checked")?.value || null;
        const box = op ? menu.querySelector(`.hrs[data-op="${op}"]`) : null;
        const a = box ? box.querySelector("[data-a]").value : "", b = box && box.querySelector("[data-b]") ? box.querySelector("[data-b]").value : "";
        const err = menu.querySelector("[data-err]");
        if (op && (a === "" || (op === "between" && b === ""))) { err.textContent = "Enter the hours to compare against."; err.hidden = false; return; }
        state.hourFilters[kind] = { op, a, b, exRest: menu.querySelector("[data-exrest]").checked, exOff: menu.querySelector("[data-exoff]").checked };
        state.page = 1; closeMenus(true); renderList(); renderFilters();
      }
    };
    menu.onkeydown = e => { if (e.key === "Enter" && e.target.matches(".hrs input")) { e.preventDefault(); menu.querySelector("[data-apply]").click(); } };
  }
  // Re-render filter buttons without losing the open menu.
  function renderFiltersKeepMenu() {
    if (!openMenu) return renderFilters();
    const wrap = openMenu.menu.closest(".filter[data-f]");
    if (!wrap) return renderFilters();
    const id = wrap.dataset.f, def = FILTER_DEFS[id], s = state.filters[id], btn = wrap.querySelector(".filter__btn");
    let label = def.label; if (s.size === 1) label = def.opts().find(o => s.has(o.id))?.name || def.label;
    btn.classList.toggle("is-active", s.size > 0);
    btn.querySelector("span").textContent = label;
    btn.querySelector(".filter__count")?.remove();
    if (s.size > 1) btn.querySelector("span").insertAdjacentHTML("afterend", ` <span class="filter__count">${s.size}</span>`);
    $("#clearAll").hidden = activeFilterCount() === 0 && !state.search;
  }

  // ---------- Menus ----------
  let openMenu = null;
  function toggleMenu(btn, menu) {
    const wasOpen = openMenu && openMenu.menu === menu;
    closeMenus(false);
    if (wasOpen) return;
    menu.hidden = false; btn.setAttribute("aria-expanded", "true");
    openMenu = { btn, menu };
    clampMenu(menu);
    const first = menu.querySelector("[aria-current=date]:not(:disabled)") || menu.querySelector("[aria-selected=true], input:not([type=radio]), input:checked, [role=option], button.menu__opt, button.cal__day:not(:disabled), button");
    if (first) first.focus();
  }
  function closeMenus(refocus) {
    if (!openMenu) return;
    openMenu.menu.hidden = true; openMenu.btn.setAttribute("aria-expanded", "false");
    if (refocus && document.contains(openMenu.btn)) openMenu.btn.focus();
    openMenu = null;
  }
  function clampMenu(menu) {
    menu.style.translate = "";
    const r = menu.getBoundingClientRect(), padPx = 8;
    let dx = 0;
    if (r.right > innerWidth - padPx) dx = innerWidth - padPx - r.right;
    if (r.left + dx < padPx) dx = padPx - r.left;
    if (dx) menu.style.translate = `${dx}px 0`;
  }
  document.addEventListener("click", e => { if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.btn.contains(e.target) && document.contains(e.target)) closeMenus(false); });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (openMenu) { e.preventDefault(); closeMenus(true); return; }
    if (openDrawer) { e.preventDefault(); closeDrawer(); }
  });
  function listboxKeys(menu) {
    menu.addEventListener("keydown", e => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const opts = [...menu.querySelectorAll("[role=option]")].filter(o => !o.hidden), i = opts.indexOf(document.activeElement);
      opts[(i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length]?.focus();
    });
  }

  // Overview range trigger uses the shared date picker (as in Clock in); picking a day moves to its period.
  let rangePicker = null;

  // ---------- Calendar popover ----------
  function buildCal(menu, mode, onPick) {
    let view = mk(state.view === "detail" ? parseKey(state.detail.day).getFullYear() : state.anchor.getFullYear(), (state.view === "detail" ? parseKey(state.detail.day) : state.anchor).getMonth(), 1);
    const sel = () => {
      if (mode === "detail") { const s = weekStart(parseKey(state.detail.day)); return [s, addDays(s, 6)]; }
      const d = periodDays(); return [d[0], d[d.length - 1]];
    };
    const draw = () => {
      const [s0, s1] = sel(); const ks0 = key(s0), ks1 = key(s1);
      const start = weekStart(view);
      const cells = [];
      for (let i = 0; i < 42; i++) {
        const d = addDays(start, i), k = key(d);
        if (i >= 35 && d.getMonth() !== view.getMonth()) break;
        const inSel = k >= ks0 && k <= ks1;
        const cls = ["cal__day", d.getMonth() !== view.getMonth() && "is-out", inSel && "is-sel", k === ks0 && "is-sel-start", k === ks1 && "is-sel-end", k === TODAY_KEY && "is-today"].filter(Boolean).join(" ");
        const disabled = mode === "detail" && k > TODAY_KEY && weekStart(d) > weekStart(TODAY);
        cells.push(`<button type="button" class="${cls}" data-day="${k}" ${disabled ? "disabled" : ""} aria-label="${fmtDay(d)}${k === TODAY_KEY ? ", today" : ""}" ${inSel ? 'aria-current="date"' : ""}>${d.getDate()}</button>`);
      }
      menu.innerHTML = `<div class="cal__head"><button type="button" class="icon-btn" data-nav="-1" aria-label="Previous month">${icon("chevron-left")}</button><span class="cal__title" aria-live="polite">${MONTH[view.getMonth()]} ${view.getFullYear()}</span><button type="button" class="icon-btn" data-nav="1" aria-label="Next month">${icon("chevron-right")}</button></div>
        <div class="cal__grid">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(x => `<span class="cal__dow" aria-hidden="true">${x}</span>`).join("")}${cells.join("")}</div>`;
    };
    draw();
    menu.onclick = e => {
      const n = e.target.closest("[data-nav]");
      if (n) { view = mk(view.getFullYear(), view.getMonth() + +n.dataset.nav, 1); draw(); menu.querySelector(`[data-nav="${n.dataset.nav}"]`).focus(); return; }
      const d = e.target.closest("[data-day]");
      if (d && !d.disabled) { onPick(parseKey(d.dataset.day)); closeMenus(true); }
    };
    menu.onkeydown = e => {
      const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(e.key in keys) || !e.target.dataset.day) return;
      e.preventDefault();
      const target = addDays(parseKey(e.target.dataset.day), keys[e.key]);
      if (target.getMonth() !== view.getMonth()) { view = mk(target.getFullYear(), target.getMonth(), 1); draw(); }
      menu.querySelector(`[data-day="${key(target)}"]`)?.focus();
    };
  }

  // ---------- List: table ----------
  function columns() {
    const days = periodDays();
    if (state.period === "week") return days.map((d, i) => ({ id: "d" + i, kind: "day", day: d, head: `<span class="day-h">${DOW3[d.getDay()]} <span class="day-n">${d.getDate()}</span></span>`, today: key(d) === TODAY_KEY, future: cmpDay(d) > 0, label: fmtDay(d) }));
    if (state.period === "day") {
      const d = days[0];
      return [
        { id: "first", kind: "first", day: d, head: "First in", label: "First in" },
        { id: "last", kind: "last", day: d, head: "Last out", label: "Last out" },
        { id: "reg", kind: "reg", day: d, head: "Regular", label: "Regular" },
      ];
    }
    // Month: one heat square per day, as live; the Legend explains the bands.
    return days.map((d, i) => ({ id: "d" + i, kind: "mday", day: d, head: `<span class="day-h day-h--stack"><span>${DOW3[d.getDay()][0]}</span><span class="day-n">${d.getDate()}</span></span>`, today: key(d) === TODAY_KEY, future: cmpDay(d) > 0, label: fmtDay(d), nosort: true }));
  }
  function cellValue(m, col) {
    if (col.kind === "day" || col.kind === "mday") return trackedOf(compute(m, col.day));
    if (col.kind === "week") return col.days.reduce((s, d) => s + compute(m, d).worked, 0);
    const c = compute(m, col.day);
    if (col.kind === "first") return c.first ? c.first.t : null;
    if (col.kind === "last") return c.lastOut ? c.lastOut.t : null;
    if (col.kind === "reg") return payroll(c).regular;
    return 0;
  }
  const totalFor = (m, days) => days.reduce((s, d) => s + trackedOf(compute(m, d)), 0);

  function sortMembers(list, cols, days) {
    const { key: k, dir } = state.sort, f = dir === "asc" ? 1 : -1;
    const val = m => k === "name" ? m.name : k === "total" ? totalFor(m, days) : cellValue(m, cols.find(c => c.id === k) || cols[0]);
    return [...list].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (k === "name") return f * va.localeCompare(vb);
      if (va == null && vb == null) return a.name.localeCompare(b.name);
      if (va == null) return 1; if (vb == null) return -1;
      return f * (va - vb) || a.name.localeCompare(b.name);
    });
  }

  function sortHead(id, label, align) {
    const on = state.sort.key === id;
    const dir = on ? state.sort.dir : null;
    return `<button class="sort" data-sort="${id}" ${dir ? `data-dir="${dir}"` : ""} aria-label="Sort by ${esc(label.replace(/<[^>]+>/g, ""))}">${align === "right" ? icon(dir === "asc" ? "chevron-up" : dir === "desc" ? "chevron-down" : "sort") + label : label + icon(dir === "asc" ? "chevron-up" : dir === "desc" ? "chevron-down" : "sort")}</button>`;
  }

  // Shortcut buttons (Today, Current period) slide in and out instead of popping, as in the date picker footer.
  function reveal(wrap, on) {
    if (!on && wrap.contains(document.activeElement)) wrap.closest(".bar__group")?.querySelector(".filter__btn, .round-btn")?.focus();
    wrap.classList.toggle("is-hidden", !on);
    wrap.inert = !on;
  }
  function renderList() {
    const days = periodDays(), cols = columns();
    const all = visibleMembers();
    const sorted = sortMembers(all, cols, days);
    const pages = Math.max(1, Math.ceil(sorted.length / state.size));
    state.page = Math.min(state.page, pages);
    const rows = sorted.slice((state.page - 1) * state.size, state.page * state.size);

    $("#periodLabel").textContent = PERIOD_WORD[state.period];
    $$("#periodMenu [data-period]").forEach(o => o.setAttribute("aria-selected", o.dataset.period === state.period));
    if (rangePicker) rangePicker.value = state.anchor;
    $("#rangeLabel").textContent = rangeLabel(days);
    $("#prevBtn").setAttribute("aria-label", `Previous ${PERIOD_UNIT[state.period]}`);
    $("#nextBtn").setAttribute("aria-label", `Next ${PERIOD_UNIT[state.period]}`);
    reveal($("#todayWrap"), !days.some(d => key(d) === TODAY_KEY));
    $("#todayBtn").textContent = { week: "This week", month: "This month" }[state.period] || "Today";

    // Columns: member 302 → 240 floor, total 140 → 100, days share the rest (≥104).
    $("#gridCols").innerHTML = `<col data-col="member">${cols.map(() => "<col>").join("")}<col data-col="total">`;
    const dayMin = state.period === "day" ? 140 : state.period === "month" ? 22 : 112;
    $("#grid").classList.toggle("grid--month", state.period === "month");
    $("#legendWrap").hidden = state.period !== "month";
    $("#grid").style.minWidth = `${(state.period === "month" ? 200 : 272) + cols.length * dayMin + 88}px`;
    sizeColumns();

    const ariaSort = id => state.sort.key === id ? (state.sort.dir === "asc" ? "ascending" : "descending") : "none";
    $("#gridHead").innerHTML = `<tr>
      <th scope="col" class="c-member" aria-sort="${ariaSort("name")}">${sortHead("name", "Member")}</th>
      ${cols.map(c => `<th scope="col" class="${c.today ? "is-today" : c.future ? "is-future" : ""}" ${c.nosort ? "" : `aria-sort="${ariaSort(c.id)}"`}>${c.nosort ? c.head : sortHead(c.id, c.head)}</th>`).join("")}
      <th scope="col" class="c-total" aria-sort="${ariaSort("total")}">${sortHead("total", state.period === "day" ? "Tracked" : "Total", "right")}</th></tr>`;

    $("#gridBody").innerHTML = rows.map(m => `<tr>
      <th scope="row" class="c-member"><a class="mem" href="#/details/${m.id}/${key(defaultDay(days))}">${avatar(m)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span></a></th>
      ${cols.map(c => `<td${c.future ? ' class="is-future"' : ""}>${cellHtml(m, c)}</td>`).join("")}
      <td class="c-total">${totalHtml(m, days)}</td></tr>`).join("");

    const empty = $("#gridEmpty");
    empty.hidden = rows.length > 0;
    $("#gridWrap").hidden = rows.length === 0;
    if (!rows.length) empty.innerHTML = `<strong>No members match</strong>${activeFilterCount() || state.search ? "Try another search or clear the filters." : "No members in this view."}`;

    renderPager(sorted.length, pages);
    updateScrollCue();
    if (state.view === "approvals") renderApprovals();
  }
  const defaultDay = days => days.find(d => key(d) === TODAY_KEY) || (cmpDay(days[0]) > 0 ? days[0] : days.filter(d => cmpDay(d) <= 0).pop() || days[0]);

  function tagFor(info) {
    if (info.timeoff) return `<span class="tag tag--${info.timeoff}"><span>${TIME_OFF_NAME[info.timeoff]}</span></span>`;
    if (info.holiday) return `<span class="tag tag--holiday" title="${esc(info.holiday)}"><span>Public Holiday</span></span>`;
    if (info.rest) return `<span class="tag tag--rest"><span>Rest day</span></span>`;
    return "";
  }
  // Monthly status tiles, as live Jibble: green = full day (8h+), yellow = under 8h, red = a past workday with no time.
  // Days off show an icon instead: rest day, public holiday, time off. Overtime adds a corner dot.
  const DAY_TARGET = 480;
  // Jibble-style heatmap: tile colour = hours tracked (2h buckets), icon = day marker.
  const HEAT_BUCKETS = [["h0", "0 hours"], ["h1", "0-2 hours"], ["h2", "2-4 hours"], ["h3", "4-6 hours"], ["h4", "6-8 hours"], ["h5", "8-10 hours"], ["h6", "10+ hours"]];
  const HEAT_MARKS = [["holiday", "calendar", "Public holiday"], ["rest", "palm", "Rest day"], ["off", "case", "Time off"], ["short", "history", "Shortened workday"], ["ot", "moon", "Overtime"]];
  const HEAT_ICON = Object.fromEntries(HEAT_MARKS.map(([k, ic]) => [k, ic]));
  const bucketOf = v => v <= 0 ? "h0" : "h" + Math.min(6, Math.floor(v / 120) + 1);
  const heatTile = mk => mk ? icon(HEAT_ICON[mk], "i i-14") : "";
  function heatHtml(m, d) {
    const c = compute(m, d), v = trackedOf(c), i = c.info, p = payroll(c);
    const ot = p.dot + p.ddot + p.rest + p.hol > 0, short = m.emp === "pt" && !i.rest && !i.holiday && !i.timeoff;
    const mk = i.timeoff ? "off" : i.holiday ? "holiday" : i.rest ? "rest" : ot ? "ot" : short ? "short" : "";
    const words = [i.timeoff && TIME_OFF_NAME[i.timeoff], i.holiday && `Public Holiday (${i.holiday})`, i.rest && "Rest day", short && "Shortened workday", v ? `${hmm(v)} tracked` : "no time tracked", ot && "includes overtime"].filter(Boolean).join(", ");
    if (i.future) return `<span class="hm hm--future" aria-hidden="true">${heatTile(i.timeoff ? "off" : i.holiday ? "holiday" : i.rest ? "rest" : "")}</span>`;
    const lvl = i.today && !v ? "none" : bucketOf(v);
    return `<a class="hm hm--${lvl}" href="#/details/${m.id}/${key(d)}" aria-label="${esc(m.name)}, ${fmtDay(d)}: ${esc(words)}" data-tip="${fmtDay(d)} · ${esc(words)}">${heatTile(mk)}</a>`;
  }

  function cellHtml(m, col) {
    if (col.kind === "mday") return heatHtml(m, col.day);
    if (col.kind === "week") {
      const v = cellValue(m, col);
      return `<button class="cell" data-goweek="${key(col.days[0])}" aria-label="${esc(m.name)}, ${esc(col.label)}: ${v ? hmm(v) + " tracked" : "no time"}. Open week"><span class="cell__h${v ? "" : " is-empty"}">${v ? hhmm(v) : "–"}</span></button>`;
    }
    const d = col.day, c = compute(m, d), href = `#/details/${m.id}/${key(d)}`;
    if (col.kind !== "day") {
      let body;
      if (col.kind === "first") body = c.first ? clock12(c.first.t) : null;
      else if (col.kind === "last") body = c.lastOut ? clock12(c.lastOut.t) : c.status === "in" || c.status === "break" ? `<span class="tag tag--${c.status === "in" ? "ongoing" : "break"}">${c.status === "in" ? "ongoing" : "on break"}</span>` : null;
      else if (col.kind === "reg") { const r = payroll(c).regular; body = r ? hhmm(r) : null; }
      else if (col.kind === "brk") body = c.brk ? hmm(c.brk) : null;
      else body = c.acts.length ? `<span class="acts">${c.acts.map(a => { const A = ACTIVITIES.find(x => x.id === a); return A ? `<span class="dd-chip dd-chip--color" style="--chip:${A.color}">${esc(A.name)}</span>` : ""; }).join("")}</span>` : null;
      const tag = col.kind === "first" ? tagFor(c.info) : "";
      return `<a class="cell" href="${href}" aria-label="${esc(m.name)}, ${esc(col.label)}: ${body ? String(body).replace(/<[^>]+>/g, " ").trim() : "none"}">${tag}${body && body.startsWith("<") ? body : `<span class="cell__h${body ? "" : " is-empty"}">${body || "–"}</span>`}</a>`;
    }
    const tag = tagFor(c.info);
    const v = trackedOf(c);
    const showH = v > 0 || !(c.info.rest || c.info.timeoff || c.info.holiday);
    const hours = showH ? `<span class="cell__h${v ? "" : " is-empty"}">${v ? hhmm(v) : "–"}</span>` : "";
    const live = c.status === "in" ? `<span class="tag tag--ongoing">ongoing</span>` : c.status === "break" ? `<span class="tag tag--break">on break</span>` : "";
    const state_ = [c.info.timeoff && TIME_OFF_NAME[c.info.timeoff], c.info.holiday && `Public Holiday (${c.info.holiday})`, c.info.rest && "Rest day", v ? `${hmm(v)} tracked` : "no time tracked", c.status === "in" && "ongoing", c.status === "break" && "on break"].filter(Boolean).join(", ");
    const add = c.info.future ? "" : `<button class="cell__add" data-add="${m.id}|${key(d)}" aria-label="Add time for ${esc(m.name)} on ${fmtDay(d)}" title="Add time">${icon("plus")}</button>`;
    return `<a class="cell${c.info.future ? " cell--future" : ""}" href="${href}" aria-label="${esc(m.name)}, ${fmtDay(d)}: ${esc(state_)}">${tag}${hours}${live}</a>${add}`;
  }
  function totalHtml(m, days) {
    const t = totalFor(m, days);
    return `<span class="t${t ? "" : " is-empty"}">${t ? hhmm(t) : "–"}</span>`;
  }

  function renderPager(n, pages) {
    $("#pager").hidden = n === 0;
    $("#pages").hidden = pages <= 1;
    const p = state.page;
    const nums = [];
    if (pages <= 7) for (let i = 1; i <= pages; i++) nums.push(i);
    else { nums.push(1); if (p > 3) nums.push("…"); for (let i = Math.max(2, p - 1); i <= Math.min(pages - 1, p + 1); i++) nums.push(i); if (p < pages - 2) nums.push("…"); nums.push(pages); }
    $("#pages").innerHTML = `<button class="pg" data-page="${p - 1}" ${p === 1 ? "disabled" : ""} aria-label="Previous page">${icon("arrow-left")}</button>
      ${nums.map(x => x === "…" ? `<span class="pg pg--gap" aria-hidden="true">…</span>` : `<button class="pg" data-page="${x}" ${x === p ? 'aria-current="page"' : ""} aria-label="Page ${x}">${x}</button>`).join("")}
      <button class="pg" data-page="${p + 1}" ${p === pages ? "disabled" : ""} aria-label="Next page">${icon("arrow-right")}</button>`;
    $("#sizeLabel").textContent = state.size;
    $$("#sizeMenu [data-size]").forEach(o => o.setAttribute("aria-selected", +o.dataset.size === state.size));
  }

  // Member 302 → 240 floor and Total 140 → 100 floor, in step with the content width (brief §4.1).
  function sizeColumns() {
    const w = $("#gridWrap").clientWidth || $("#content").clientWidth;
    const mc = $('#gridCols [data-col="member"]'), tc = $('#gridCols [data-col="total"]');
    if (!mc) return;
    mc.style.width = (state.period === "month" ? 200 : Math.round(Math.min(340, Math.max(272, w * 0.28)))) + "px";
    tc.style.width = Math.round(Math.min(104, Math.max(88, w * 0.09))) + "px";
  }
  function updateScrollCue() {
    const w = $("#gridWrap");
    w.classList.toggle("is-scroll-l", w.scrollLeft > 1);
    w.classList.toggle("is-scroll-r", w.scrollLeft + w.clientWidth < w.scrollWidth - 1);
  }

  // ---------- Detail ----------
  const viewerShift = m => state.tzMode === "yours" ? (VIEWER_TZ.off - TZ[m.tz].off) * 60 : 0;
  function renderDetail() {
    const m = byId(state.detail.mid), day = parseKey(state.detail.day), ws = weekStart(day);
    const week = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(ws, i));
    const c = compute(m, day);

    $("#dRangeLabel").textContent = `${fmtD(week[0])} – ${fmtD(week[6])}`;
    { const atNow = weekStart(addDays(ws, 7)) > weekStart(TODAY); $("#dNext").disabled = atNow; $("#dNext").style.visibility = atNow ? "hidden" : ""; }
    $("#addTimeBtn").disabled = false;

    // Detail tabs
    $$("#detailTabs [data-tab]").forEach(t => { const on = t.dataset.tab === state.detail.tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    $("#panelEntries").hidden = state.detail.tab !== "entries";
    $("#panelPayroll").hidden = state.detail.tab !== "payroll";
    $("#panelShots").hidden = state.detail.tab !== "screenshots";

    // Day strip
    $("#days").innerHTML = week.map(d => {
      const cc = compute(m, d), k = key(d), on = k === state.detail.day;
      const sub = cc.info.timeoff ? `<span class="tag">${TIME_OFF_NAME[cc.info.timeoff]}</span>` : cc.info.holiday && !cc.worked ? `<span class="tag">Public Holiday</span>` : cc.info.rest && !cc.worked ? `<span class="tag">Rest day</span>` : `<span class="day__total">${cc.info.future ? "–" : hhmm(cc.worked)}</span>`;
      return `<button role="tab" class="day${k === TODAY_KEY ? " is-today" : ""}${cc.info.future ? " is-future" : ""}" data-day="${k}" aria-selected="${on}" tabindex="${on ? 0 : -1}" aria-controls="dayPanel" aria-label="${fmtDay(d)}${k === TODAY_KEY ? ", today" : ""}: ${cc.info.future ? "upcoming" : hmm(cc.worked) + " tracked"}${cc.info.rest ? ", rest day" : ""}"><span class="day__name">${DOW3[d.getDay()]} ${d.getDate()}</span>${sub}</button>`;
    }).join("");

    renderEntries(m, c, day);
    renderAccordions(m, week);
    renderPayrollTab(m, week);
    renderShots(m, day);
    renderSide(m, week);
  }


  const PLAT = { mobile: ["phone", "Mobile app"], web: ["browser", "Web app"], desktop: ["kiosk", "Desktop app"], kiosk: ["kiosk", "Kiosk"], browser: ["globe", "Browser extension"] };
  // One table per day: Time · Type (with source flags) · Activity · Project · Note · Duration, edit/delete revealed on hover.
  function renderEntries(m, c, day) {
    const list = $("#entries");
    const rows = [...c.all].filter(e => e.type !== "hours").sort((a, b) => a.t - b.t || a.id - b.id);
    const hours = c.all.filter(e => e.type === "hours");
    if (!rows.length && !hours.length) {
      const why = c.info.future ? "This day hasn't happened yet." : c.info.timeoff ? `${TIME_OFF_NAME[c.info.timeoff]} on this day.` : c.info.rest ? "Rest day. There are no time entries on this day." : "There are no time entries on this day.";
      list.innerHTML = `<div class="day-empty">${icon("clock")}<strong>Tick tock goes the clock</strong>${why}</div>`;
      return;
    }
    const shift = viewerShift(m);
    const none = `<span class="is-empty">–</span>`;
    list.innerHTML = `<table class="etable"><caption class="sr-only">Time entries, ${fmtDay(day)}</caption>
      <colgroup><col class="col-time"><col class="col-type"><col class="col-act"><col class="col-proj"><col><col class="col-dur"><col class="col-ops"></colgroup>
      <thead><tr><th scope="col">Time</th><th scope="col">Type</th><th scope="col">Activity</th><th scope="col">Project</th><th scope="col">Note</th><th scope="col" class="c-dur">Duration</th><th scope="col" class="c-ops"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows.concat(hours).map(e => {
      const A = e.act && ACTIVITIES.find(a => a.id === e.act), Pj = e.proj && PROJECTS.find(p => p.id === e.proj);
      const d = c.durs.get(e.id);
      const dur = e.deleted ? `<span class="tag tag--deleted">Deleted</span>` : d ? `<span class="entry__dur${d.live ? " is-live" : ""}">${hmm(d.len)}</span>` : none;
      const typeChip = e.type === "in" ? `<span class="type type--in">${icon("login")}Clock in</span>` : e.type === "break" ? `<span class="type type--break">${icon("coffee")}Break</span>` : e.type === "out" ? `<span class="type type--out">${icon("logout")}Clock out</span>` : `<span class="type type--hours">${icon("clock")}Hour entry</span>`;
      const [pi, pl] = PLAT[e.plat] || PLAT.web;
      const flags = [
        `<span role="img" aria-label="${pl}" data-tip="${pl}">${icon(pi)}</span>`,
        e.flags.offline ? `<span role="img" aria-label="Clocked offline" data-tip="Clocked offline">${icon("wifi-off")}</span>` : "",
        e.flags.loc ? `<span role="img" aria-label="Location recorded" data-tip="Location recorded">${icon("pin")}</span>` : "",
        e.flags.face ? `<span role="img" aria-label="Face recognition" data-tip="Face recognition">${icon("face")}</span>` : "",
        e.manual ? `<span role="img" aria-label="Manual entry" data-tip="Manual entry">${icon("hand")}</span>` : "",
      ].join("");
      const timeTxt = e.type === "hours" ? none : clock12(e.t + shift);
      const label = `${e.type === "hours" ? "Hour entry " + hmm(e.dur) : `${{ in: "Clock in", break: "Break", out: "Clock out" }[e.type]} at ${clock12(e.t + shift)}`}`;
      return `<tr class="${e.deleted ? "is-deleted" : ""}" data-id="${e.id}">
        <td class="c-time">${timeTxt}</td>
        <td><span class="etable__type">${typeChip}<span class="flags">${flags}</span></span></td>
        <td>${A ? `<span class="dd-chip dd-chip--color" style="--chip:${A.color}" title="${esc(A.name)}">${esc(A.name)}</span>` : none}</td>
        <td>${Pj ? `<span class="dd-chip dd-chip--grey" title="${esc(Pj.name)}">${esc(Pj.name)}${e.task ? ` · ${esc(e.task)}` : ""}</span>` : none}</td>
        <td class="c-note">${e.note ? `<p class="entry__note" data-tip="${esc(e.note)}" data-tip-overflow>${esc(e.note)}</p>` : none}</td>
        <td class="c-dur">${dur}</td>
        <td class="c-ops">${e.deleted ? "" : `<span class="entry__acts"><button class="icon-btn" data-edit="${e.id}" aria-label="Edit ${esc(label)}" title="Edit">${icon("pencil")}</button><button class="icon-btn" data-del="${e.id}" aria-label="Delete ${esc(label)}" title="Delete">${icon("trash")}</button></span>`}</td>
      </tr>`;
    }).join("")}</tbody></table>`;
  }

  function renderAccordions(m, week) {
    const comps = week.map(d => ({ d, c: compute(m, d) }));
    const tot = comps.reduce((s, x) => ({ w: s.w + x.c.worked, b: s.b + x.c.brk }), { w: 0, b: 0 });
    const hist = HISTORY.filter(h => h.mid === m.id && week.some(d => key(d) === h.day));
    const card = (title, sub, meta, body) => `<section class="tcard"><header class="tcard__head"><span class="acc__title"><h2 class="tcard__title">${title}</h2><p class="tcard__sub">${sub}</p></span><span class="acc__meta">${meta}</span></header>${body}</section>`;
    $("#historyCount").textContent = hist.length;
    $("#historyCount").hidden = !hist.length;
    $("#historyBody").innerHTML = hist.length
      ? `<p class="fs__hint">Time entries that were added or changed by hand, ${fmtD(week[0])} – ${fmtD(week[6])}</p><div class="kv-wrap"><table class="kv kv--text"><thead><tr><th>Change</th><th>Reason</th><th>Timestamp</th></tr></thead><tbody>${hist.map(h => `<tr><td>${esc(h.change)}<br><span class="cell__sub">by ${esc(h.by)}</span></td><td>${esc(h.reason || "-")}</td><td>${esc(h.ts)}</td></tr>`).join("")}</tbody></table></div>`
      : `<p class="panel-note">No manual changes this week.</p>`;
    $("#accs").innerHTML =
      card("Tracked hours", "Worked hours and breaks for each day", hmm(tot.w + tot.b), hoursGrid(m, week, ["tracked"]));
  }
  // Week grid (Jibble's payroll layout): metrics down the side with the week total beside each label,
  // days across with each day's tracked total, rest days grouped under one bar, week arrows at both ends.
  // Rows and labels mirror the side panel's Weekly summary.
  const HOUR_GROUPS = {
    tracked: [
      ["Tracked hours", c => trackedOf(c), true],
      ["Worked hours", c => c.worked],
      [`Breaks<span class="unpaid">UNPAID</span>`, c => c.brk],
      ["Auto deductions", () => 0],
    ],
    payroll: [
      ["Payroll hours", (c, p) => p.total, true],
      ["Regular hours", (c, p) => p.regular],
      ["Daily OT", (c, p) => p.dot],
      ["Daily double OT", (c, p) => p.ddot],
      ["Rest day OT", (c, p) => p.rest],
      ["Public holiday OT", (c, p) => p.hol],
      ["Time off", (c, p) => p.off],
    ],
  };
  function hoursGrid(m, week, groups) {
    const comps = week.map(d => compute(m, d)), pays = comps.map(payroll);
    const infos = week.map(d => dayInfo(m, d));
    const v = x => x ? hmm(x) : "-";
    const cell = x => `<td class="${x ? "" : "is-muted"}">${v(x)}</td>`;
    const atNow = weekStart(addDays(week[0], 7)) > weekStart(TODAY);
    // Rest-day bar row: consecutive rest days share one bar
    let bar = "", i = 0;
    while (i < 7) {
      if (!infos[i].rest) { bar += `<td></td>`; i++; continue; }
      let n = 0; while (i + n < 7 && infos[i + n].rest) n++;
      bar += `<td colspan="${n}"><span class="wk__rest">Rest day</span></td>`; i += n;
    }
    const head = `<thead>
      <tr class="wk__bar" aria-hidden="true"><td colspan="3"></td>${bar}<td></td></tr>
      <tr><th scope="col" class="wk__label"><span class="sr-only">Metric</span></th><th scope="col" class="wk__total">Week</th>
        <td class="wk__nav"><button class="round-btn round-btn--36" data-wk="-1" aria-label="Previous week">${icon("chevron-left")}</button></td>
        ${week.map((d, j) => `<th scope="col" class="wk__day${key(d) === TODAY_KEY ? " is-today" : ""}${infos[j].future || infos[j].rest ? " is-dim" : ""}">${DOW3[d.getDay()]}, ${d.getDate()}<span class="kv__sub">${v(trackedOf(comps[j]))}</span></th>`).join("")}
        <td class="wk__nav">${atNow ? "" : `<button class="round-btn round-btn--36" data-wk="1" aria-label="Next week">${icon("chevron-right")}</button>`}</td></tr></thead>`;
    const body = groups.map(g => `<tbody>${HOUR_GROUPS[g].map(([label, f, lead]) => {
      const vals = comps.map((c, j) => f(c, pays[j])), tot = vals.reduce((a, b) => a + b, 0);
      return `<tr class="${lead ? "kv__group" : "kv__sub-row"}"><th scope="row" class="wk__label">${label}</th><td class="wk__total">${v(tot)}</td><td class="wk__nav"></td>${vals.map(cell).join("")}<td class="wk__nav"></td></tr>`;
    }).join("")}</tbody>`).join("");
    return `<div class="kv-wrap"><table class="kv kv--week">${head}${body}</table></div>`;
  }
  function renderPayrollTab(m, week) {
    $("#panelPayroll").innerHTML = `<div class="panel-head"><h2 class="panel-title">Payroll hours</h2><p class="panel-sub">Hours generated from tracked time to prepare for payroll, ${fmtD(week[0])} – ${fmtD(week[6])}</p></div>
      <div class="tcard">${hoursGrid(m, week, ["tracked", "payroll"])}</div>
      <p class="panel-note">Overtime here follows a sample rule set: daily overtime after 8 hours, double after 12, rest days and public holidays paid as overtime, 8 hours per day of time off.</p>`;
  }
  function renderShots(m, day) {
    $("#panelShots").innerHTML = `<div class="day-empty">${icon("image")}<strong>No screenshots here</strong>You can use the desktop app for time tracking and screenshot recording.</div>`;
  }

  function memberStatus(m) {
    const c = compute(m, TODAY);
    if (c.status === "in") return { s: "in", text: `Clocked in at ${clockShort(c.live.filter(e => e.type === "in").pop().t)}` };
    if (c.status === "break") return { s: "break", text: "On break" };
    if (c.lastOut) return { s: "out", text: `Last out ${ago(nowMin() - c.lastOut.t)}` };
    for (let i = 1; i < 14; i++) { const cc = compute(m, addDays(TODAY, -i)); if (cc.lastOut) return { s: "out", text: `Last out ${i === 1 ? "yesterday" : `${i} days ago`}` }; }
    return { s: "out", text: "No recent time" };
  }
  function renderSide(m, week) {
    const off = TZ[m.tz].off;
    const st = memberStatus(m);
    $("#whoBtn").innerHTML = `<span class="who__av" data-status="${st.s}">${avatar(m, 48)}</span><span class="who__text"><span class="who__name">${esc(m.name)}</span><span class="who__meta">${esc(st.text)}</span></span>`;
    $("#whoBtn").setAttribute("aria-label", `Member: ${m.name}. ${st.text}. Change member`);

    const comps = week.map(d => compute(m, d));
    const w = comps.reduce((s, c) => s + c.worked, 0), b = comps.reduce((s, c) => s + c.brk, 0);
    const pays = comps.map(payroll), sum = k => pays.reduce((s, p) => s + p[k], 0);
    const v = x => x ? hmm(x) : "-";
    const sched = SCHEDULES.find(s => s.id === m.sched);
    $("#info").innerHTML = `
      <div class="info__group">
        <h2 class="info__title">Timesheet info</h2>
        <span class="info__label">Timesheet timezone</span><span class="info__value">${esc(TZ[m.tz].label)}</span>
        <span class="info__label">Split time</span><span class="info__value">12:00 am</span>
        <span class="info__label">Work schedule</span><span class="info__value">${esc(sched.name)}</span>
      </div>
      <div class="info__group">
        <h2 class="info__title">Weekly summary</h2>
        <dl>
          <dt class="is-head">Tracked hours</dt><dd class="is-head">${v(w + b)}</dd>
          <dt>Worked hours</dt><dd>${v(w)}</dd>
          <dt>Breaks<span class="unpaid">UNPAID</span></dt><dd>${v(b)}</dd>
          <dt>Auto deductions</dt><dd>-</dd>
          <dt class="is-head">Payroll hours</dt><dd class="is-head">${v(sum("total"))}</dd>
          <dt>Regular hours</dt><dd>${v(sum("regular"))}</dd>
          <dt>Daily OT</dt><dd>${v(sum("dot"))}</dd>
          <dt>Daily double OT</dt><dd>${v(sum("ddot"))}</dd>
          <dt>Rest day OT</dt><dd>${v(sum("rest"))}</dd>
          <dt>Public holiday OT</dt><dd>${v(sum("hol"))}</dd>
          <dt>Time off</dt><dd>${v(sum("off"))}</dd>
        </dl>
      </div>`;
  }
  function renderWhoList() {
    const q = $("#whoSearch").value.trim().toLowerCase();
    const list = MEMBERS.filter(m => inScope(m) && m.name.toLowerCase().includes(q));
    $("#whoList").innerHTML = list.length ? list.map(m => `<button class="who-opt" role="option" data-mid="${m.id}" aria-selected="${m.id === state.detail.mid}">${avatar(m, 32)}<span>${esc(m.name)}</span></button>`).join("") : `<p class="menu__title">No members match</p>`;
  }

  // ---------- Top bar clock (your own time) ----------
  function renderTopClock() {
    const c = compute(ME, TODAY);
    const st = c.status || "out";
    $("#clockCtl").dataset.clock = st;
    document.body.dataset.clock = st;
    const btn = $("#topClockBtn");
    btn.className = `round-btn ${st === "in" ? "round-btn--stop" : "round-btn--go"}`;
    btn.innerHTML = icon(st === "in" ? "stop" : "play");
    btn.setAttribute("aria-label", st === "in" ? "Clock out" : st === "break" ? "End break" : "Clock in");
    btn.title = btn.getAttribute("aria-label");
    $("#clockRun").hidden = !(st === "in" || st === "break");
    const rb = $("#runBreak");
    rb.className = `round-btn ${st === "break" ? "round-btn--go" : "round-btn--break"}`;
    rb.innerHTML = icon(st === "break" ? "play" : "coffee");
    rb.setAttribute("aria-label", st === "break" ? "End break" : "Start break");
    rb.title = rb.getAttribute("aria-label");
    renderRunTime();
    const txt = st === "in" ? `Clocked in at ${clockShort(c.live.filter(e => e.type === "in").pop().t)}` : st === "break" ? "On break" : c.lastOut ? `Last out ${ago(nowMin() - c.lastOut.t)}` : "Not clocked in today";
    $("#topLast").textContent = txt;
    $("#clockCtl").title = txt;
    const A = ACTIVITIES.find(a => a.id === state.activity), Pj = PROJECTS.find(p => p.id === state.project);
    $("#activityLabel").textContent = A?.name ?? "No activity"; $("#activityBtn").style.setProperty("--chip", A?.color ?? "var(--ap-none)"); $("#activityBtn").setAttribute("aria-label", `Activity: ${A?.name ?? "none"}`);
    $("#projectLabel").textContent = Pj?.name ?? "No project"; $("#projectBtn").setAttribute("aria-label", `Project: ${Pj?.name ?? "none"}`);
    const prev = lastClockIn(), resume = resumeContent(ACTIVITIES.find(a => a.id === prev?.act), PROJECTS.find(p => p.id === prev?.proj));
    const top = $("#topResumeBtn");
    top.hidden = st !== "out";
    top.innerHTML = resume.html; top.title = resume.label; top.setAttribute("aria-label", resume.label);
  }
  function renderRunTime() {
    const secs = Math.floor(compute(ME, TODAY).worked * 60);
    $("#runTime").textContent = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  }
  setInterval(renderRunTime, 1000);
  /* Your last clock in (today, else the latest earlier day), for Resume. */
  function lastClockIn() {
    for (let i = 0; i < 14; i++) {
      const e = [...compute(ME, addDays(TODAY, -i)).live].reverse().find(x => x.type === "in");
      if (e) return e;
    }
    return null;
  }
  function buildPicker(btnSel, menuSel, list, stateKey) {
    const btn = $(btnSel), menu = $(menuSel);
    const draw = () => { menu.innerHTML = list.map(o => `<button class="menu__opt" role="option" data-id="${o.id}" aria-selected="${state[stateKey] === o.id}"><span style="width:8px;height:8px;border-radius:50%;background:${o.color};flex:none"></span>${esc(o.name)}${icon("check", "i i-16 tick")}</button>`).join(""); };
    draw();
    btn.addEventListener("click", () => { draw(); toggleMenu(btn, menu); });
    menu.addEventListener("click", e => { const o = e.target.closest("[data-id]"); if (!o) return; state[stateKey] = o.dataset.id; closeMenus(true); renderTopClock(); });
    listboxKeys(menu);
  }
  const openClockPanel = createClockPanel(ACTIVITIES, PROJECTS, LOCATIONS, (action, fields) => {
    if (action === "hours") {
      const list = entriesFor(ME, new Date(fields.date.getFullYear(), fields.date.getMonth(), fields.date.getDate()));
      list.push(Object.assign(ev("hours", null, null, null, "", "web"), { act: fields.activity || null, proj: fields.project || null, note: fields.note, loc: fields.location, dur: fields.duration, manual: true }));
      toast(`Hour entry of ${hmm(fields.duration)} added.`);
      rerender();
      return;
    }
    const isOut = action === "out";
    if (!isOut) { state.activity = fields.activity; state.project = fields.project; }
    const entry = ev(isOut ? "out" : "in", fields.time,
      isOut ? null : state.activity, isOut ? null : state.project, fields.note, "web");
    entry.loc = fields.location;
    entriesFor(ME, TODAY).push(entry);
    toast(isOut ? "You clocked out." : action === "endbreak" ? "Break ended. You're clocked in." : "You clocked in.");
    rerender();
  });
  $("#topResumeBtn").addEventListener("click", () => {
    const prev = lastClockIn();
    openClockPanel("resume", nowMin(), prev?.act ?? "", prev?.proj ?? "", compute(ME, TODAY).live.at(-1)?.t ?? 0);
  });
  $("#topClockBtn").addEventListener("click", () => {
    const { status, live } = compute(ME, TODAY);
    const action = status === "in" ? "out" : status === "break" ? "endbreak" : "in";
    openClockPanel(action, nowMin(), "", "", live.at(-1)?.t ?? 0);
  });

  $("#runSwitch").addEventListener("click", () => openClockPanel("switch", nowMin(), state.activity, state.project, compute(ME, TODAY).live.at(-1)?.t ?? 0));
  $("#runBreak").addEventListener("click", () => {
    const { status, live } = compute(ME, TODAY);
    if (status === "break") { openClockPanel("endbreak", nowMin(), "", "", live.at(-1)?.t ?? 0); return; }
    entriesFor(ME, TODAY).push(ev("break", nowMin(), null, null, "", "web"));
    toast("Break started."); rerender();
  });
  $("#runStop").addEventListener("click", () => openClockPanel("out", nowMin(), "", "", compute(ME, TODAY).live.at(-1)?.t ?? 0));

  // ---------- Drawers ----------
  // Slide the panel out like the clock-in panel, then hide it (instant when motion is reduced).
  function animateOut(el, scrim) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.hidden = true; scrim.hidden = true; return; }
    el.classList.add("is-closing"); scrim.classList.add("is-closing");
    const done = () => { if (!el.classList.contains("is-closing")) return; el.classList.remove("is-closing"); scrim.classList.remove("is-closing"); el.hidden = true; if (!document.querySelector(".drawer:not([hidden]):not(.is-closing)")) scrim.hidden = true; };
    el.addEventListener("animationend", e => { if (e.target === el) done(); });
    setTimeout(done, 300); // fallback if animationend never fires
  }
  let openDrawer = null, drawerReturn = null;
  function showDrawer(el, from) {
    closeMenus(false);
    drawerReturn = from || document.activeElement;
    el.classList.remove("is-closing"); $("#scrim").classList.remove("is-closing");
    $("#scrim").hidden = false; el.hidden = false; openDrawer = el;
    document.querySelector(".app").inert = true;
    (el.querySelector("[aria-checked=true], input:not([type=hidden]):not([disabled]), select, button:not([data-close])") || el).focus();
  }
  function closeDrawer() {
    if (!openDrawer) return;
    animateOut(openDrawer, $("#scrim")); openDrawer = null;
    document.querySelector(".app").inert = false;
    if (drawerReturn && document.contains(drawerReturn)) drawerReturn.focus();
  }
  $("#scrim").addEventListener("click", closeDrawer);
  $$("[data-close]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); closeDrawer(); }));
  // Keep focus inside the open drawer.
  document.addEventListener("keydown", e => {
    if (e.key !== "Tab" || !openDrawer) return;
    const f = [...openDrawer.querySelectorAll("button, input, select, textarea, [tabindex='0']")].filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  // Export
  function openExport() {
    $("#exportTitle").textContent = `Export ${PERIOD_WORD[state.period]} Timesheets Data`;
    $("#exPeriod").textContent = { day: "Day", week: "Week", month: "Month" }[state.period];
    $("#exRange").textContent = rangeLabel();
    const parts = [];
    if (state.scope === "managed") parts.push("Managed by me");
    if (state.scope === "personal") parts.push("Personal");
    if (state.search) parts.push(`Search "${state.search}"`);
    Object.entries(state.filters).forEach(([k, s]) => { if (s.size) parts.push(`${FILTER_DEFS[k].label} (${s.size})`); });
    Object.entries(state.hourFilters).forEach(([k, f]) => { if (f && f.op) parts.push(`${HOUR_DEFS[k]} ${opText(f)}`); });
    const n = visibleMembers().length;
    $("#exFilters").textContent = `${parts.length ? parts.join(", ") : "No filters"}. ${n} member${n === 1 ? "" : "s"} will be exported.`;
    $("#fmtHint").classList.remove("is-error");
    showDrawer($("#exportDrawer"), $("#exportBtn"));
  }
  $("#exportForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target, fmts = $$("#exportForm [name=fmt]:checked").map(x => x.value), lists = $$("#exportForm [name=list]:checked").map(x => x.value);
    const hint = $("#fmtHint");
    if (!fmts.length || !lists.length) { hint.textContent = !fmts.length ? "Choose at least one format to export" : "Choose at least one list to export"; hint.classList.add("is-error"); return; }
    const t12 = f.timeFmt.value === "12", dfmt = f.durFmt.value;
    const T = min => { let m = ((Math.round(min) % 1440) + 1440) % 1440; return t12 ? clockShort(m) : `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
    const D = min => { const s = Math.round(min * 60); if (dfmt === "dec") return (min / 60).toFixed(2); if (dfmt === "hm") return hmm(min); return `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
    const days = periodDays(), members = sortMembers(visibleMembers(), columns(), days);
    const files = [];
    if (lists.includes("timesheets")) {
      const head = ["Member", "Position", "Member code", ...days.map(d => key(d)), "Total tracked", "Total payroll"];
      const rows = members.map(m => [m.name, m.pos, m.code, ...days.map(d => { const c = compute(m, d); return c.worked ? D(c.worked) : (c.info.timeoff ? TIME_OFF_NAME[c.info.timeoff] : c.info.rest ? "Rest day" : ""); }), D(totalFor(m, days)), D(hoursFor(m, "payroll", days))]);
      files.push(["timesheets", head, rows]);
    }
    if (lists.includes("entries")) {
      const head = ["Member", "Date", "Type", "Time", "Duration", "Activity", "Project", "Note", "Status"];
      const rows = [];
      members.forEach(m => days.forEach(d => { const c = compute(m, d); [...c.all].sort((a, b) => (a.t ?? 0) - (b.t ?? 0)).forEach(e => { const du = c.durs.get(e.id); rows.push([m.name, key(d), { in: "Clock in", break: "Break", out: "Clock out", hours: "Hour entry" }[e.type], e.type === "hours" ? "" : T(e.t), du ? D(du.len) : "", ACTIVITIES.find(a => a.id === e.act)?.name || "", PROJECTS.find(p => p.id === e.proj)?.name || "", e.note, e.deleted ? "Deleted" : e.manual ? "Manual" : ""]); }); }));
      files.push(["time-entries", head, rows]);
    }
    const stamp = `${key(days[0])}_${key(days[days.length - 1])}`;
    files.forEach(([name, head, rows]) => fmts.forEach(fm => {
      let blob;
      if (fm === "csv") {
        const q = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
        blob = new Blob(["﻿" + [head, ...rows].map(r => r.map(q).join(",")).join("\n")], { type: "text/csv" });
      } else {
        const html = `<html><head><meta charset="utf-8"></head><body><table><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
        blob = new Blob([html], { type: "application/vnd.ms-excel" });
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `jibble-${name}_${stamp}.${fm}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }));
    closeDrawer();
    const n = files.length * fmts.length;
    toast(`Exported ${n} file${n === 1 ? "" : "s"} for ${members.length} member${members.length === 1 ? "" : "s"}.`);
  });

  // Add / edit time entry
  let editing = null;  // { mid, day, id|null }
  const entryForm = $("#entryForm");
  function fillSelect(sel, opts, value, placeholder) {
    sel.innerHTML = `<option value="">${placeholder}</option>` + opts.map(o => `<option value="${esc(o.id)}"${o.color ? ` data-color="${esc(o.color)}"` : ""} ${o.id === value ? "selected" : ""}>${esc(o.name)}</option>`).join("");
    sel._sync?.();
  }
  $$("#entryForm select[data-combo]").forEach(enhanceDropdownSelect);
  enhanceDateInput(entryForm.date, "Date");
  $$("#exportForm select").forEach(enhanceDropdownSelect);
  function setKind(kind) {
    $$("#kindSeg .seg__opt").forEach(b => { const on = b.dataset.kind === kind; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
    $("#typeSeg").hidden = kind === "hours";
    $("#timeField").hidden = kind === "hours";
    $("#durField").hidden = kind !== "hours";
    syncTypeFields();
  }
  function setType(type) {
    $$("#typeSeg .seg__opt").forEach(b => { const on = b.dataset.type === type; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
    syncTypeFields();
  }
  const curKind = () => $("#kindSeg [aria-checked=true]").dataset.kind;
  const curType = () => curKind() === "hours" ? "hours" : $("#typeSeg [aria-checked=true]").dataset.type;
  function syncTypeFields() {
    const t = curType();
    $$("#entryForm [data-for]").forEach(f => { f.hidden = !f.dataset.for.split(" ").includes(t); });
  }
  function openEntry(mid, dayK, id, from) {
    const m = byId(mid), list = entriesFor(m, parseKey(dayK)), e = id ? list.find(x => x.id === id) : null;
    editing = { mid, day: dayK, id: e ? e.id : null };
    $("#entryTitle").textContent = e ? "Edit time entry" : "Add manual time entry";
    $("#kindSeg").hidden = !!e;
    $("#entryDelete").hidden = !e;
    const st = memberStatus(m);
    const tz = gmt(TZ[m.tz].off);
    const whoMeta = e ? `Clocked ${e.type === "out" ? "out" : "in"} · ${esc(PLATFORM_NAME[e.plat] || "Web")}${e.manual ? " · Manual entry" : ""}` : esc(st.text);
    $("#entryWho").innerHTML = `<span class="who__av" data-status="${st.s}">${avatar(m, 72)}</span><span class="clock-member__text"><strong class="clock-member__name">${esc(m.name)}</strong><span class="clock-member__meta">${whoMeta}</span><span class="clock-member__chips"><span class="clock-member__chip" title="Clocking from">${tz}</span><span class="clock-member__chip" title="Split time">12:00</span></span></span>`;
    $("#entryTz").textContent = gmt(TZ[m.tz].off);
    entryForm.reset();
    entryForm.date.max = TODAY_KEY;
    entryForm.date.value = dayK;
    entryForm.date.disabled = !!e;
    fillSelect(entryForm.loc, LOCATIONS, e ? e.loc : m.loc, "Select a location");
    fillSelect(entryForm.act, ACTIVITIES, e ? e.act : "", "Select an activity");
    fillSelect(entryForm.proj, PROJECTS, e ? e.proj : "", "Select a project");
    if (e && e.type === "hours") { setKind("hours"); entryForm.dur.value = hmm(e.dur); }
    else {
      setKind("time"); setType(e ? e.type : "in");
      const t = e ? e.t : (dayK === TODAY_KEY ? Math.floor(nowMin()) : 9 * 60);
      entryForm.time.value = `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
    }
    entryForm.note.value = e ? e.note : "";
    $("#entryError").hidden = true;
    $$("#entryForm [aria-invalid]").forEach(x => x.removeAttribute("aria-invalid"));
    showDrawer($("#entryDrawer"), from);
  }
  roving($("#kindSeg"), ".seg__opt", b => setKind(b.dataset.kind));
  roving($("#typeSeg"), ".seg__opt", b => setType(b.dataset.type));
  entryForm.addEventListener("submit", e => {
    e.preventDefault();
    const err = msg => { const p = $("#entryError"); p.textContent = msg; p.hidden = false; };
    $$("#entryForm [aria-invalid]").forEach(x => x.removeAttribute("aria-invalid"));
    const m = byId(editing.mid), dayK = entryForm.date.value || editing.day;
    if (!dayK) { entryForm.date.setAttribute("aria-invalid", "true"); return err("Choose a date."); }
    if (dayK > TODAY_KEY) { entryForm.date.setAttribute("aria-invalid", "true"); return err("Time can't be added to a future date."); }
    const day = parseKey(dayK), list = entriesFor(m, day), type = curType();
    const base = { act: entryForm.act.value || null, proj: entryForm.proj.value || null, note: entryForm.note.value.trim(), loc: entryForm.loc.value };
    let label;
    if (type === "hours") {
      const mm = /^(\d{1,2}):([0-5]\d)$/.exec(entryForm.dur.value.trim());
      const dur = mm ? +mm[1] * 60 + +mm[2] : 0;
      if (!dur || dur > 1440) { entryForm.dur.setAttribute("aria-invalid", "true"); return err("Enter a duration as h:mm, for example 2:30."); }
      if (editing.id) Object.assign(list.find(x => x.id === editing.id), base, { dur });
      else list.push(Object.assign(ev("hours", null, null, null, "", "web"), base, { dur, manual: true }));
      label = `Hour entry of ${hmm(dur)}`;
    } else {
      if (!entryForm.time.value) { entryForm.time.setAttribute("aria-invalid", "true"); return err("Enter a time."); }
      const [hh, mi] = entryForm.time.value.split(":").map(Number), t = hh * 60 + mi;
      if (dayK === TODAY_KEY && t > nowMin()) { entryForm.time.setAttribute("aria-invalid", "true"); return err("That time hasn't happened yet."); }
      const others = list.filter(x => !x.deleted && x.type !== "hours" && x.id !== editing.id).sort((a, b) => a.t - b.t);
      if (others.some(x => x.t === t)) { entryForm.time.setAttribute("aria-invalid", "true"); return err(`There's already an entry at ${clockShort(t)}. Pick another time.`); }
      const prev = [...others].reverse().find(x => x.t < t);
      const next = others.find(x => x.t > t);
      if (type === "in" && (prev?.type === "in" || next?.type === "in")) { entryForm.time.setAttribute("aria-invalid", "true"); return err("A clock in must be followed by a break or a clock out, not another clock in. Pick another time or entry type."); }
      if (type !== "in" && (!prev || prev.type === "out")) { entryForm.time.setAttribute("aria-invalid", "true"); return err(`A ${type === "break" ? "break" : "clock out"} needs a clock in before it. Add the clock in first.`); }
      const name = { in: "Clock in", break: "Break", out: "Clock out" }[type];
      if (editing.id) {
        const x = list.find(y => y.id === editing.id), before = clockShort(x.t);
        Object.assign(x, base, { t, type: type === "in" ? "in" : type, manual: true });
        if (type !== "in") { x.act = null; x.proj = null; x.task = ""; }
        label = before !== clockShort(t) ? `${name} from ${before} to ${clockShort(t)}` : `${name} at ${clockShort(t)}`;
      } else {
        const x = Object.assign(ev(type, t, null, null, "", "web"), base, { manual: true });
        if (type !== "in") { x.act = null; x.proj = null; x.task = ""; }
        list.push(x);
        label = `${name} at ${clockShort(t)}`;
      }
    }
    HISTORY.push({ mid: m.id, day: dayK, ts: `${fmtD(TODAY)}, ${clockShort(nowMin())}`, change: `${editing.id ? "Changed" : "Added"} ${label}`, reason: base.note || "-", by: ME.name });
    const wasEdit = !!editing.id;
    closeDrawer();
    if (state.view === "detail") { state.detail.mid = m.id; state.detail.day = dayK; }
    rerender();
    toast(wasEdit ? "Time entry updated." : `Time added for ${m.name}.`);
  });

  function deleteEntry(id) {
    const m = byId(state.detail.mid), day = parseKey(state.detail.day), e = entriesFor(m, day).find(x => x.id === id);
    if (!e) return;
    e.deleted = true;
    const label = e.type === "hours" ? `Hour entry of ${hmm(e.dur)}` : `${{ in: "Clock in", break: "Break", out: "Clock out" }[e.type]} at ${clockShort(e.t)}`;
    const h = { mid: m.id, day: key(day), ts: `${fmtD(TODAY)}, ${clockShort(nowMin())}`, change: `Deleted ${label}`, reason: "-", by: ME.name };
    HISTORY.push(h);
    rerender();
    toast(`${label} deleted.`, "Undo", () => { e.deleted = false; HISTORY.splice(HISTORY.indexOf(h), 1); rerender(); ($(`#entries [data-edit="${e.id}"]`) || $("#entries")).focus(); });
    $("#entries").focus();
  }

  // ---------- Toast & tooltip ----------
  let toastTimer;
  function toast(msg, action, fn) {
    const t = $("#toast");
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ""}`;
    t.hidden = false;
    if (action) t.querySelector("button").onclick = () => { fn(); t.hidden = true; };
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, action ? 6000 : 3200);
  }
  const tip = $("#tooltip");
  function showTip(target) {
    const text = target.dataset.tip;
    if (!text) return;
    if (target.hasAttribute("data-tip-overflow") && target.scrollWidth <= target.clientWidth) return;
    tip.textContent = text; tip.hidden = false;
    const r = target.getBoundingClientRect(), t = tip.getBoundingClientRect();
    let x = r.left + r.width / 2 - t.width / 2; x = Math.min(Math.max(8, x), innerWidth - t.width - 8);
    let y = r.top - t.height - 8; if (y < 68) y = r.bottom + 8;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  document.addEventListener("mouseover", e => { const t = e.target.closest("[data-tip]"); if (t) showTip(t); else tip.hidden = true; });
  document.addEventListener("focusin", e => { const t = e.target.closest("[data-tip]"); if (t) showTip(t); else tip.hidden = true; });
  document.addEventListener("scroll", () => { tip.hidden = true; }, true);

  // ---------- Roving groups ----------
  function roving(container, itemSel, onPick) {
    const items = () => [...container.querySelectorAll(itemSel)];
    container.addEventListener("click", e => { const it = e.target.closest(itemSel); if (it) onPick(it); });
    container.addEventListener("keydown", e => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys) && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      const list = items(), i = list.indexOf(document.activeElement);
      const next = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : (i + keys[e.key] + list.length) % list.length;
      list[next].focus(); onPick(list[next]);
    });
  }

  // ---------- Routing ----------
  // #/overview · #/approvals · #/details/<member>/<yyyy-mm-dd>[/payroll|/screenshots]
  let listScroll = 0;
  function parseRoute() {
    const h = location.hash.replace(/^#\/?/, "");
    const [p, a, b, c] = h.split("/");
    if (p === "approvals") return { view: "approvals", none: a === "no-pay-periods" };
    if (p === "details" && byId(a) && /^\d{4}-\d{2}-\d{2}$/.test(b || "")) return { view: "detail", mid: a, day: b > TODAY_KEY ? TODAY_KEY : b, tab: ["payroll", "screenshots"].includes(c) ? c : "entries" };
    return { view: "list" };
  }
  function applyRoute() {
    const r = parseRoute(), prev = state.view;
    if (prev === "list" && r.view !== "list") listScroll = scrollY;
    state.view = r.view;
    if (r.view === "detail") Object.assign(state.detail, { mid: r.mid, day: r.day, tab: r.tab });
    AP.none = !!r.none;
    placeSharedBars(r.view);
    closeMenus(false);
    $("#listTabs").hidden = r.view === "detail";
    $("#detailNav").hidden = r.view !== "detail";
    $("#viewList").hidden = r.view !== "list";
    $("#viewApprovals").hidden = r.view !== "approvals";
    $("#viewDetail").hidden = r.view !== "detail";
    $("#tabOverview").setAttribute("aria-selected", r.view !== "approvals"); $("#tabOverview").tabIndex = r.view !== "approvals" ? 0 : -1;
    $("#tabApprovals").setAttribute("aria-selected", r.view === "approvals"); $("#tabApprovals").tabIndex = r.view === "approvals" ? 0 : -1;
    document.title = r.view === "detail" ? `${byId(r.mid).name} - Time entries - Jibble` : r.view === "approvals" ? "Jibble - Approvals" : "Jibble - Timesheets";
    rerender();
    if (r.view === "list" && prev === "detail") scrollTo(0, listScroll);
    else if (r.view !== prev) scrollTo(0, 0);
  }
  function go(hash) {
    if (location.hash !== hash) location.hash = hash;
  }
  addEventListener("hashchange", applyRoute);

  /* Write your own clock back for the Dashboard whenever today's entries change. */
  let clockSig = null;
  function syncClock() {
    const live = compute(ME, TODAY).live;
    const sig = JSON.stringify(live.map(e => [e.type, e.t, e.act, e.proj, e.note, e.loc]));
    if (clockSig === null) { clockSig = sig; return; }
    if (sig === clockSig) return;
    clockSig = sig;
    const entries = [];
    live.forEach((e, i) => {
      if (e.type === "out") return;
      const next = live[i + 1];
      const o = { type: e.type === "break" ? "break" : "work", start: e.t, end: next ? next.t : null };
      if (o.type === "work") { o.act = e.act || ""; o.project = e.proj || ""; o.note = e.note; o.location = e.loc; }
      if (next?.type === "out") { o.outNote = next.note; o.outLocation = next.loc; }
      entries.push(o);
    });
    try { sessionStorage.setItem(CLOCK_KEY, JSON.stringify({ day: sessionDay, loadedAt, activity: state.activity, project: state.project, entries })); } catch { /* storage unavailable */ }
  }
  function rerender() {
    syncClock();
    renderTopClock();
    if (state.view === "list") { renderFilters(); renderList(); }
    if (state.view === "detail") renderDetail();
    if (state.view === "approvals") { renderFilters(); renderApprovals(); }
  }
  const detailHash = (mid, day, tab) => `#/details/${mid}/${day}${tab && tab !== "entries" ? "/" + tab : ""}`;

  // ---------- Approvals (live: weekly pay periods, Open / In progress / Approved / Reopened) ----------
  const AP = { week: weekStart(TODAY), status: new Map(), sel: new Set(), statuses: new Set(), none: false };
  const AP_STATUS = { open: "Open", progress: "In progress", approved: "Approved", reopened: "Reopened" };
  const curWeek = () => key(weekStart(TODAY));
  const hm = v => { const t = Math.round(v); return `${Math.floor(t / 60)}h ${pad(t % 60)}m`; };
  const apDays = () => [0, 1, 2, 3, 4, 5, 6].map(i => addDays(AP.week, i));
  const apRange = () => { const d = apDays(); return `${fmtD(d[0])} – ${fmtD(d[6])} ${d[6].getFullYear()}`; };
  function apStatus(m, ws) {
    const wk = key(ws);
    if (wk >= curWeek()) return "progress";
    if (AP.status.has(wk + "|" + m.id)) return AP.status.get(wk + "|" + m.id);
    // Seeded history: last period mostly open, older periods approved, with a few exceptions.
    const ago = Math.round((weekStart(TODAY) - ws) / (7 * 864e5)), i = MEMBERS.indexOf(m);
    if (ago === 1) return i % 4 === 1 ? "approved" : "open";
    if (ago === 2 && i % 5 === 2) return "reopened";
    return "approved";
  }
  function apTotals(m, days) {
    const t = { tracked: 0, regular: 0, ot: 0, off: 0 };
    days.forEach(d => { const c = compute(m, d), p = payroll(c); t.tracked += trackedOf(c); t.regular += p.regular; t.ot += p.dot + p.ddot + p.rest + p.hol; t.off += p.off; });
    return t;
  }
  const apCan = st => st === "open" || st === "reopened";
  const apPick = st => apCan(st) || st === "approved"; /* selectable: can be approved, or reopened in bulk */
  function renderApprovals() {
    $("#apNone").hidden = !AP.none; $("#apMain").hidden = AP.none;
    if (AP.none) return;
    const days = apDays(), cur = key(AP.week) >= curWeek();
    $("#apRange").textContent = apRange();
    $("#apNext").disabled = cur; $("#apNext").style.visibility = cur ? "hidden" : "";
    reveal($("#apCurrentWrap"), !cur);
    const list = visibleMembers(days).map(m => ({ m, st: apStatus(m, AP.week), t: apTotals(m, days) }))
      .filter(x => !AP.statuses.size || AP.statuses.has(x.st)).sort((a, b) => a.m.name.localeCompare(b.m.name));
    [...AP.sel].forEach(id => { if (!list.some(x => x.m.id === id && apPick(x.st))) AP.sel.delete(id); });
    const act = list.filter(x => apPick(x.st)), allOn = act.length > 0 && act.every(x => AP.sel.has(x.m.id));
    const box = (attrs, on, label) => `<label class="check check--bare"><input type="checkbox" ${attrs} ${on ? "checked" : ""} aria-label="${esc(label)}"><span class="box">${icon("check")}</span></label>`;
    $("#apHead").innerHTML = `<tr><th scope="col" class="c-check">${box(`id="apAll"${act.length ? "" : " disabled"}`, allOn, "Select every member that can be approved or reopened")}</th>
      <th scope="col" class="c-member">Member</th><th scope="col">Tracked</th><th scope="col">Regular</th><th scope="col">Overtime</th><th scope="col">Time off</th><th scope="col">Status</th><th scope="col" class="c-act"><span class="sr-only">Actions</span></th></tr>`;
    const v = x => x ? `<span class="t">${hm(x)}</span>` : `<span class="t is-empty">–</span>`;
    const day1 = key(AP.week) > TODAY_KEY ? TODAY_KEY : key(AP.week);
    $("#apBody").innerHTML = list.map(({ m, st, t }) => `<tr class="${AP.sel.has(m.id) ? "is-selected" : ""}">
      <td class="c-check">${box(`data-apsel="${m.id}"${apPick(st) ? "" : " disabled"}`, AP.sel.has(m.id), apPick(st) ? `Select ${m.name}` : `${m.name}: ${AP_STATUS[st]}, nothing to approve or reopen`)}</td>
      <th scope="row" class="c-member"><a class="mem" href="#/details/${m.id}/${day1}">${avatar(m)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span></a></th>
      <td>${v(t.tracked)}</td><td>${v(t.regular)}</td><td>${v(t.ot)}</td><td>${v(t.off)}</td>
      <td><span class="tag tag--st tag--st-${st}">${AP_STATUS[st]}</span></td>
      <td class="c-act">${apCan(st) ? `<button class="btn btn--positive btn--icon" data-approve="${m.id}" aria-label="Approve ${esc(m.name)}" title="Approve">${icon("check", "i i-16")}</button>` : st === "approved" ? `<button class="btn btn--outlined btn--icon" data-reopen="${m.id}" aria-label="Reopen ${esc(m.name)}" title="Reopen">${icon("history", "i i-16")}</button>` : ""}</td></tr>`).join("");
    $("#apGrid").classList.toggle("is-nocheck", !act.length);
    $("#apEmpty").hidden = list.length > 0; $("#apGridWrap").hidden = !list.length;
    if (!list.length) $("#apEmpty").innerHTML = `<strong>No members match</strong>Try another search, status or filter.`;
    const some = act.some(x => AP.sel.has(x.m.id));
    if ($("#apAll")) $("#apAll").indeterminate = some && !allOn;
    $("#clearAll").hidden = activeFilterCount() === 0 && !state.search;
    $("#apBulk").hidden = !AP.sel.size;
    $("#apBulkCountText").textContent = `${AP.sel.size} selected`;
    $("#apBulkCount").setAttribute("aria-label", `${AP.sel.size} selected. Clear selection`);
    // Mixed selection: each action names how many rows it applies to.
    const { approve, reopen } = apSplit(), mixed = approve.length && reopen.length;
    $("#apBulkApprove").hidden = !approve.length;
    $("#apBulkReopen").hidden = !reopen.length;
    $("#apBulkApproveLbl").textContent = mixed ? `Approve ${approve.length}` : "Approve";
    $("#apBulkReopenLbl").textContent = mixed ? `Reopen ${reopen.length}` : "Reopen";
    $("#statusBtn").classList.toggle("is-active", AP.statuses.size > 0);
    $("#statusLabel").textContent = AP.statuses.size === 1 ? AP_STATUS[[...AP.statuses][0]] : "Statuses";
    $("#statusCount").textContent = AP.statuses.size > 1 ? AP.statuses.size : "";
    $("#statusCount").hidden = AP.statuses.size < 2;
  }
  // After a re-render, put focus back on the row's control (or the table) so keyboard users keep their place.
  function apFocus(id) {
    const t = id && ($(`#apBody [data-approve="${id}"]`) || $(`#apBody [data-reopen="${id}"]`) || $(`#apBody [data-apsel="${id}"]:not(:disabled)`));
    (t || $("#apAll") || $("#apBody .mem") || $("#apPrev")).focus();
  }
  function setApproval(ids, st, msg) {
    const wk = key(AP.week), prev = ids.map(id => [id, AP.status.get(wk + "|" + id)]);
    const one = ids.length === 1 ? ids[0] : null;
    ids.forEach(id => AP.status.set(wk + "|" + id, st));
    AP.sel.clear(); renderApprovals(); apFocus(one);
    toast(msg, "Undo", () => { prev.forEach(([id, was]) => { if (was === undefined) AP.status.delete(wk + "|" + id); else AP.status.set(wk + "|" + id, was); }); renderApprovals(); apFocus(one); });
  }
  function buildStatusMenu() {
    const menu = $("#statusMenu");
    menu.innerHTML = `<div>${Object.entries(AP_STATUS).map(([id, n]) => `<label class="menu__opt"><input type="checkbox" value="${id}" ${AP.statuses.has(id) ? "checked" : ""}><span class="box">${icon("check")}</span><span>${n}</span></label>`).join("")}</div>
      <div class="menu__foot"><button type="button" data-clear>Clear selection</button></div>`;
    menu.onchange = e => { const i = e.target; if (i.checked) AP.statuses.add(i.value); else AP.statuses.delete(i.value); renderApprovals(); };
    menu.onclick = e => { if (e.target.closest("[data-clear]")) { AP.statuses.clear(); menu.querySelectorAll("input").forEach(i => { i.checked = false; }); renderApprovals(); } };
  }
  // The scope switch and the filter bar are one control set, moved between Timesheets and Approvals.
  function placeSharedBars(view) {
    const ap = view === "approvals";
    if (ap) { $("#apMain > .bar > .bar__group").prepend($("#scopeSeg")); $("#apFilterSlot").append($("#filterBar")); }
    else { $("#viewList > .bar > .bar__group").prepend($("#scopeSeg")); $("#gridWrap").before($("#filterBar")); }
    $("#statusWrap").hidden = !ap;
  }
  const apStep = dir => { const n = addDays(AP.week, 7 * dir); if (key(n) > curWeek()) return; AP.week = n; AP.sel.clear(); renderApprovals(); };
  $("#apPrev").addEventListener("click", () => apStep(-1));
  $("#apNext").addEventListener("click", () => apStep(1));
  $("#apCurrent").addEventListener("click", () => { AP.week = weekStart(TODAY); AP.sel.clear(); renderApprovals(); $("#apPrev").focus(); });
  $("#apGrid").addEventListener("change", e => {
    const i = e.target;
    if (i.id === "apAll") $$("#apBody [data-apsel]:not(:disabled)").forEach(x => { if (i.checked) AP.sel.add(x.dataset.apsel); else AP.sel.delete(x.dataset.apsel); });
    else if (i.dataset.apsel) { if (i.checked) AP.sel.add(i.dataset.apsel); else AP.sel.delete(i.dataset.apsel); }
    else return;
    renderApprovals();
    (i.id === "apAll" ? $("#apAll") : $(`#apBody [data-apsel="${i.dataset.apsel}"]`))?.focus();
  });
  $("#apGrid").addEventListener("click", e => {
    const a = e.target.closest("[data-approve]"), r = e.target.closest("[data-reopen]");
    if (a) setApproval([a.dataset.approve], "approved", `${byId(a.dataset.approve).name}'s timesheet approved for ${apRange()}.`);
    if (r) setApproval([r.dataset.reopen], "reopened", `${byId(r.dataset.reopen).name}'s timesheet reopened for ${apRange()}.`);
  });
  function apSplit() {
    const ids = [...AP.sel], st = id => apStatus(byId(id), AP.week);
    return { approve: ids.filter(id => apCan(st(id))), reopen: ids.filter(id => st(id) === "approved") };
  }
  const plural = n => `${n} timesheet${n > 1 ? "s" : ""}`;
  $("#apBulkApprove").addEventListener("click", () => { const ids = apSplit().approve; setApproval(ids, "approved", `${plural(ids.length)} approved for ${apRange()}.`); });
  $("#apBulkReopen").addEventListener("click", () => { const ids = apSplit().reopen; setApproval(ids, "reopened", `${plural(ids.length)} reopened for ${apRange()}.`); });
  $("#apBulkCount").addEventListener("click", () => { AP.sel.clear(); renderApprovals(); ($("#apAll:not(:disabled)") || $("#apPrev")).focus(); });
  $("#statusBtn").addEventListener("click", () => { buildStatusMenu(); toggleMenu($("#statusBtn"), $("#statusMenu")); });

  // ---------- Monthly legend ----------
  { const li = (vis, l) => `<li>${vis}<span>${l}</span></li>`;
    $("#legendMenu").innerHTML = `<ul class="legend">${HEAT_BUCKETS.map(([k, l]) => li(`<span class="hm hm--${k}" aria-hidden="true"></span>`, l)).join("")}</ul>`
      + `<ul class="legend">${HEAT_MARKS.map(([, ic, l]) => li(icon(ic, "i legend__ic"), l)).join("")}</ul>`; }
  { // Info popover: hover/focus open, click toggles (touch), Esc/mouseleave/blur close.
    const wrap = $("#legendWrap"), btn = $("#legendBtn"), pop = $("#legendMenu");
    let pinned = false, t;
    const show = () => { clearTimeout(t); pop.hidden = false; btn.setAttribute("aria-expanded", "true"); clampMenu(pop); };
    const hide = () => { clearTimeout(t); pinned = false; pop.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    wrap.addEventListener("mouseenter", show);
    wrap.addEventListener("mouseleave", () => { if (!pinned) t = setTimeout(hide, 120); });
    btn.addEventListener("focus", show);
    wrap.addEventListener("focusout", e => { if (!wrap.contains(e.relatedTarget)) hide(); });
    btn.addEventListener("click", () => { if (pinned) hide(); else { pinned = true; show(); } });
    document.addEventListener("pointerdown", e => { if (!pop.hidden && !wrap.contains(e.target)) hide(); });
    wrap.addEventListener("keydown", e => { if (e.key === "Escape" && !pop.hidden) { e.stopPropagation(); hide(); btn.focus(); } });
  }

  // ---------- Wire up: list ----------
  $("#periodBtn").addEventListener("click", () => toggleMenu($("#periodBtn"), $("#periodMenu")));
  listboxKeys($("#periodMenu"));
  $("#periodMenu").addEventListener("click", e => {
    const o = e.target.closest("[data-period]"); if (!o) return;
    state.period = o.dataset.period;
    if (state.period === "day" && cmpDay(state.anchor) > 0) state.anchor = TODAY;
    if (state.sort.key !== "name" && state.sort.key !== "total") state.sort = { key: "name", dir: "asc" };
    state.page = 1; closeMenus(true); renderList();
  });
  const step = dir => {
    const a = state.anchor;
    state.anchor = state.period === "day" ? addDays(a, dir) : state.period === "week" ? addDays(a, 7 * dir) : mk(a.getFullYear(), a.getMonth() + dir, Math.min(a.getDate(), 28));
    renderList();
  };
  $("#prevBtn").addEventListener("click", () => step(-1));
  $("#nextBtn").addEventListener("click", () => step(1));
  $("#todayBtn").addEventListener("click", () => { state.anchor = TODAY; renderList(); $("#rangeBtn").focus(); });
  $("#rangeBtn").addEventListener("click", () => closeMenus(false));
  rangePicker = createDatePicker($("#rangeBtn"), { value: state.anchor, onChange: d => { state.anchor = d; renderList(); } });
  rangePicker.value = state.anchor; $("#rangeLabel").textContent = rangeLabel();
  roving($("#scopeSeg"), ".seg__opt", b => {
    state.scope = b.dataset.scope; state.page = 1;
    $$("#scopeSeg .seg__opt").forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.tabIndex = on ? 0 : -1; });
    renderList(); renderFilters();
  });
  $("#exportBtn").addEventListener("click", openExport);
  $("#search").addEventListener("input", e => { state.search = e.target.value; state.page = 1; renderList(); $("#clearAll").hidden = activeFilterCount() === 0 && !state.search; });
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".filter__btn"); if (b) openFilterMenu(b.closest(".filter"));
  });
  // More filters: ticks are staged in the menu and only take effect on Apply; closing the menu discards them.
  $("#addFilterBtn").addEventListener("click", () => {
    const menu = $("#addFilterMenu");
    if (menu.hidden) menu.innerHTML = Object.keys(FILTER_DEFS).filter(k => FILTER_DEFS[k].extra)
      .map(k => `<label class="menu__opt"><input type="checkbox" value="${k}" ${state.extra.includes(k) ? "checked" : ""}><span class="box">${icon("check")}</span><span>${esc(FILTER_DEFS[k].label)}</span></label>`).join("")
      + `<div class="menu__foot menu__foot--end"><button type="button" data-apply class="is-primary">Apply</button></div>`;
    toggleMenu($("#addFilterBtn"), menu);
  });
  $("#addFilterMenu").addEventListener("click", e => {
    if (!e.target.closest("[data-apply]")) return;
    const on = [...$("#addFilterMenu").querySelectorAll("input[type=checkbox]:checked")].map(i => i.value);
    const removed = state.extra.filter(k => !on.includes(k));
    removed.forEach(k => state.filters[k].clear());
    state.extra = [...state.extra.filter(k => on.includes(k)), ...on.filter(k => !state.extra.includes(k))];
    if (removed.length) state.page = 1;
    closeMenus(true); renderList(); renderFilters();
  });
  function clearAll() {
    Object.values(state.filters).forEach(s => s.clear());
    state.hourFilters = { tracked: null, payroll: null }; state.extra = []; AP.statuses.clear();
    state.search = ""; $("#search").value = ""; state.page = 1;
    renderList(); renderFilters();
  }
  $("#clearAll").addEventListener("click", () => { clearAll(); $("#search").focus(); });

  $("#gridHead").addEventListener("click", e => {
    const s = e.target.closest("[data-sort]"); if (!s) return;
    const k = s.dataset.sort;
    state.sort = state.sort.key === k ? { key: k, dir: state.sort.dir === "asc" ? "desc" : "asc" } : { key: k, dir: k === "name" ? "asc" : "desc" };
    renderList();
    $(`#gridHead [data-sort="${k}"]`).focus();
  });
  $("#gridBody").addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { const [mid, d] = add.dataset.add.split("|"); openEntry(mid, d, null, add); return; }
    const wk = e.target.closest("[data-goweek]");
    if (wk) { state.period = "week"; state.anchor = parseKey(wk.dataset.goweek); state.sort = { key: "name", dir: "asc" }; renderList(); $("#rangeBtn").focus(); return; }
    const a = e.target.closest("a[href^='#/details']");
    if (a && !e.metaKey && !e.ctrlKey) { e.preventDefault(); go(a.getAttribute("href")); }
  });
  $("#pages").addEventListener("click", e => {
    const b = e.target.closest("[data-page]"); if (!b || b.disabled) return;
    state.page = +b.dataset.page; renderList();
    $("#grid").scrollIntoView({ block: "start", behavior: "instant" });
    ($(`#pages [aria-current]`) || $("#pages .pg")).focus();
  });
  $("#sizeBtn").addEventListener("click", () => toggleMenu($("#sizeBtn"), $("#sizeMenu")));
  listboxKeys($("#sizeMenu"));
  $("#sizeMenu").addEventListener("click", e => { const o = e.target.closest("[data-size]"); if (!o) return; state.size = +o.dataset.size; store.set("size", state.size); state.page = 1; closeMenus(true); renderList(); });
  $("#gridWrap").addEventListener("scroll", updateScrollCue, { passive: true });
  addEventListener("resize", () => { sizeColumns(); updateScrollCue(); });
  // Keep a focused cell visible inside the scroll region, clear of the pinned columns.
  $("#gridWrap").addEventListener("focusin", e => {
    const td = e.target.closest("td"); if (!td || td.classList.contains("c-total")) return;
    const w = $("#gridWrap"), r = td.getBoundingClientRect(), wr = w.getBoundingClientRect();
    const left = wr.left + $("#grid .c-member").offsetWidth, right = wr.right - $("#grid .c-total").offsetWidth;
    if (r.left < left) w.scrollLeft -= left - r.left; else if (r.right > right) w.scrollLeft += r.right - right;
  });
  $("#entryDelete").addEventListener("click", () => { const id = editing.id; closeDrawer(); deleteEntry(id); });
  $("#payPeriodsBtn").addEventListener("click", () => toast("Pay periods are set up in Settings. That screen isn't part of this prototype."));

  // ---------- Wire up: detail ----------
  $("#backBtn").addEventListener("click", e => { e.preventDefault(); go("#/overview"); });
  roving($("#days"), ".day", b => {
    history.replaceState(null, "", detailHash(state.detail.mid, b.dataset.day, state.detail.tab));
    state.detail.day = b.dataset.day; renderDetail();
    $(`#days [data-day="${b.dataset.day}"]`).focus();
  });
  const weekStep = dir => {
    const d = addDays(parseKey(state.detail.day), 7 * dir);
    const target = key(d) > TODAY_KEY ? TODAY_KEY : key(d);
    history.replaceState(null, "", detailHash(state.detail.mid, target, state.detail.tab));
    state.detail.day = target; renderDetail();
  };
  $("#dPrev").addEventListener("click", () => weekStep(-1));
  document.addEventListener("click", e => { const b = e.target.closest("[data-wk]"); if (b) weekStep(+b.dataset.wk); });
  $("#dNext").addEventListener("click", () => weekStep(1));
  $("#dRangeBtn").addEventListener("click", () => {
    buildCal($("#dCalMenu"), "detail", d => { const k = key(d) > TODAY_KEY ? TODAY_KEY : key(d); history.replaceState(null, "", detailHash(state.detail.mid, k, state.detail.tab)); state.detail.day = k; renderDetail(); });
    toggleMenu($("#dRangeBtn"), $("#dCalMenu"));
  });
  document.addEventListener("clock-manual-time", () => { openEntry(state.detail.mid, TODAY_KEY, null, null); setKind("hours"); });
  $("#historyBtn").addEventListener("click", () => showDrawer($("#historyDrawer"), $("#historyBtn")));
  $("#addTimeBtn").addEventListener("click", () => openEntry(state.detail.mid, state.detail.day, null, $("#addTimeBtn")));
  roving($("#detailTabs"), "[data-tab]", t => { go(detailHash(state.detail.mid, state.detail.day, t.dataset.tab)); requestAnimationFrame(() => $(`#detailTabs [data-tab="${t.dataset.tab}"]`).focus()); });
  $("#entries").setAttribute("tabindex", "-1");
  $("#entries").addEventListener("click", e => {
    const ed = e.target.closest("[data-edit]"); if (ed) { openEntry(state.detail.mid, state.detail.day, +ed.dataset.edit, ed); return; }
    const del = e.target.closest("[data-del]"); if (del) deleteEntry(+del.dataset.del);
  });
  $("#accs").addEventListener("click", e => {
    const b = e.target.closest("[data-acc]"); if (!b) return;
    state.open[b.dataset.acc] = !state.open[b.dataset.acc];
    b.setAttribute("aria-expanded", state.open[b.dataset.acc]);
    $("#acc-" + b.dataset.acc).hidden = !state.open[b.dataset.acc];
  });
  $("#whoBtn").addEventListener("click", () => { $("#whoSearch").value = ""; renderWhoList(); toggleMenu($("#whoBtn"), $("#whoMenu")); $("#whoSearch").focus(); });
  $("#whoSearch").addEventListener("input", renderWhoList);
  $("#whoMenu").addEventListener("keydown", e => {
    if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const opts = [...$("#whoList").querySelectorAll("[role=option]")], i = opts.indexOf(document.activeElement);
    opts[i < 0 ? 0 : (i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length]?.focus();
  });
  $("#whoList").addEventListener("click", e => {
    const o = e.target.closest("[data-mid]"); if (!o) return;
    closeMenus(false);
    go(detailHash(o.dataset.mid, state.detail.day, state.detail.tab));
    requestAnimationFrame(() => $("#whoBtn").focus());
  });

  // ---------- Wire up: shell ----------
  buildPicker("#activityBtn", "#activityMenu", ACTIVITIES, "activity");
  buildPicker("#projectBtn", "#projectMenu", PROJECTS, "project");
  $("#settingsToggle").addEventListener("click", e => {
    const b = e.currentTarget, open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open); $("#settingsList").hidden = !open;
  });
  $("#collapseBtn").addEventListener("click", e => {
    const app = $("#app"), collapsed = !app.classList.contains("is-collapsed");
    app.classList.toggle("is-collapsed", collapsed);
    e.currentTarget.setAttribute("aria-expanded", !collapsed);
    e.currentTarget.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    e.currentTarget.title = e.currentTarget.getAttribute("aria-label");
    sizeColumns(); updateScrollCue();
  });
  $("#app").addEventListener("transitionend", e => {
    if (e.target === e.currentTarget && e.propertyName === "grid-template-columns") { sizeColumns(); updateScrollCue(); }
  });
  requestAnimationFrame(() => requestAnimationFrame(() => $("#app").classList.add("is-ready")));

  // Live durations and "last out" text tick on.
  setInterval(() => {
    renderTopClock();
    if (state.view === "detail" && state.detail.day === TODAY_KEY && !openDrawer && !openMenu && !document.activeElement.closest("#entries, #days")) renderDetail();
  }, 30000);

  applyRoute();
})();
