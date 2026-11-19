/* Dashboard prototype. Illustrative local data only; nothing is fetched or saved
   except a few per-viewer view preferences in localStorage. */
(() => {
  "use strict";

  // ---------- Demo clock ----------
  // The data is anchored to Wed 18 Nov 2026, 11:40. Time moves on from page load.
  const TODAY = 18;                     // day of November 2026
  const DEMO_START_MIN = 11 * 60 + 40;  // 11:40
  // Keep the demo session running across reloads and same-tab navigation.
  const sessionDay = new Date().toDateString();
  let savedClock;
  try {
    const saved = JSON.parse(sessionStorage.getItem("jb-dashboard-clock"));
    if (saved?.day === sessionDay && Array.isArray(saved.entries) && saved.entries.length) savedClock = saved;
  } catch { /* Session storage may be unavailable for local files. */ }
  const loadedAt = savedClock?.loadedAt ?? Date.now();
  const nowMin = () => DEMO_START_MIN + (Date.now() - loadedAt) / 60000;
  const nowSec = () => DEMO_START_MIN * 60 + (Date.now() - loadedAt) / 1000;

  const store = {
    get(k, d) { try { const v = localStorage.getItem("jb-dash-" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("jb-dash-" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  // ---------- Data ----------
  const LOCATIONS = [
    { id: "main", name: "NY Main Office", addr: "9513 Delaware St, Astoria, NY 11106", x: 47, y: 52 },
    { id: "east", name: "NY East Office", addr: "9250 Jackson Ave, Brooklyn, NY 11213", x: 71, y: 34 },
    { id: "post", name: "NY Post", addr: "148 SW Bohemia St, Staten Island, NY 10301", x: 27, y: 74 },
    { id: "remote", name: "Remote", addr: "No fixed address" },
  ];
  const GROUPS = [
    { id: "design", name: "Design" }, { id: "eng", name: "Engineering" },
    { id: "support", name: "Support" }, { id: "ops", name: "Operations" },
  ];
  const SCHEDULES = [
    { id: "std", name: "Standard 9–5" }, { id: "early", name: "Early shift" }, { id: "flex", name: "Flexible" },
  ];
  const PROJECTS = [
    { id: "web", name: "Website refresh", color: "var(--ap-violet)" },
    { id: "app", name: "Mobile app", color: "var(--ap-green)" },
    { id: "onb", name: "Client onboarding", color: "var(--ap-pink)" },
    { id: "desk", name: "Support desk", color: "var(--ap-turquoise)" },
    { id: "audit", name: "Q4 audit", color: "var(--ap-red)" },
    { id: "fit", name: "Warehouse fit-out", color: "var(--ap-blue)" },
    { id: "brand", name: "Brand guidelines", color: "var(--ap-orange)" },
    { id: "none", name: "No project", color: "var(--ap-none)" },
  ];
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

  // status: in | break | out; since: minutes after midnight today (null = not today)
  const MEMBERS = [
    { id: "me", name: "Jane Long", group: "ops", loc: "main", sched: "std", status: "out", since: 11 * 60 + 36, managed: true, proj: { app: 2, onb: 1 }, act: { mgmt: 2, meet: 2 } },
    { id: "m1", name: "Hanna Ingveldardóttir", group: "design", loc: "main", sched: "std", status: "in", since: 8 * 60 + 52, managed: true, proj: { web: 3, brand: 1 }, act: { des: 4, meet: 1 } },
    { id: "m2", name: "Xiong Yao", group: "eng", loc: "east", sched: "flex", status: "in", since: 9 * 60 + 14, managed: true, proj: { app: 3, web: 1 }, act: { dev: 4, test: 1 } },
    { id: "m3", name: "Dalma Zayas Orta", group: "eng", loc: "remote", sched: "flex", status: "break", since: 11 * 60 + 25, start: 7 * 60 + 58, managed: true, proj: { app: 2, none: 1 }, act: { dev: 3, res: 1 } },
    { id: "m4", name: "Scott R. Maag", group: "support", loc: "post", sched: "early", status: "in", since: 6 * 60 + 58, managed: false, proj: { desk: 4 }, act: { sup: 4, meet: 1 } },
    { id: "m5", name: "Devon Miles", group: "ops", loc: "main", sched: "std", status: "out", since: null, managed: false, proj: { audit: 2, fit: 2 }, act: { mgmt: 2, res: 1 } },
    { id: "m6", name: "Chikayo Kodama", group: "design", loc: "east", sched: "std", status: "in", since: 9 * 60 + 3, managed: true, proj: { brand: 2, onb: 1 }, act: { des: 3, mkt: 1 } },
    { id: "m7", name: "Oliver Kuprešak", group: "support", loc: "post", sched: "early", status: "out", since: 6 * 60 + 2, end: 10 * 60 + 30, managed: false, proj: { desk: 3, none: 1 }, act: { sup: 3 } },
    { id: "m8", name: "Amara Okafor", group: "eng", loc: "main", sched: "std", status: "out", since: null, managed: true, proj: { web: 2, audit: 1 }, act: { dev: 2, test: 2 } },
    { id: "m9", name: "Luis Ferreira", group: "ops", loc: "east", sched: "std", status: "out", since: null, managed: false, proj: { fit: 3 }, act: { mgmt: 1, meet: 1 } },
    { id: "m10", name: "Priya Nair", group: "eng", loc: "remote", sched: "flex", status: "out", since: null, managed: false, proj: { app: 1, desk: 1 }, act: { test: 3, dev: 1 } },
    { id: "m11", name: "Tomasz Wójcik", group: "support", loc: "post", sched: "early", status: "out", since: null, managed: false, proj: { desk: 3, onb: 1 }, act: { sup: 3, meet: 1 } },
    { id: "m12", name: "Elif Demir", group: "design", loc: "main", sched: "std", status: "out", since: null, managed: false, proj: { onb: 2, brand: 1 }, act: { des: 2, mkt: 2 } },
  ];
  const ME = MEMBERS[0];

  const TIME_OFF = [
    { member: "m5", type: "Sick leave", status: "approved", from: [11, 19], to: [11, 19], days: 1 },
    { member: "m1", type: "Vacation leave", status: "approved", from: [11, 23], to: [11, 27], days: 5 },
    { member: "m2", type: "Vacation leave", status: "pending", from: [11, 30], to: [12, 4], days: 5 },
    { member: "me", type: "Annual leave", status: "pending", from: [12, 21], to: [12, 31], days: 7 },
    { member: "m10", type: "Vacation leave", status: "approved", from: [12, 14], to: [12, 18], days: 5 },
  ];
  const HOLIDAYS = [
    { name: "Thanksgiving Day", cal: "Imported calendar (United States)", from: [11, 26], to: [11, 26], days: 1 },
    { name: "Christmas Day", cal: "Imported calendar (United States)", from: [12, 25], to: [12, 25], days: 1 },
    { name: "New Year's Day", cal: "Imported calendar (United States)", from: [1, 1], to: [1, 1], days: 1, year: 2027 },
  ];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Deterministic daily hours per member for November 2026 (1 Nov is a Sunday).
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const DOW = d => (d - 1) % 7; // 0 = Sun
  MEMBERS.forEach((m, i) => {
    const r = rng(97 + i * 131);
    m.days = {};
    for (let d = 1; d < TODAY; d++) {
      const weekend = DOW(d) === 0 || DOW(d) === 6;
      const works = weekend ? r() < 0.12 : r() > 0.06;
      if (!works) { r(); r(); continue; }
      const worked = weekend ? 2 + r() * 3 : 7 + r() * 2.6;
      m.days[d] = { worked, brk: 0.2 + r() * 0.55 };
    }
  });

  // ---------- State ----------
  const state = {
    scope: "org",
    period: "week",
    filters: { locations: new Set(), groups: new Set(), schedules: new Set() },
    railStatus: "in",
    search: "",
    widgets: Object.assign({ hours: true, upcoming: true, projects: true, activities: true, locations: true }, store.get("widgets", {})),
    activity: savedClock?.activity ?? "meet",
    project: savedClock?.project ?? "app",
    // Your own entries today, in minutes after midnight.
    entries: savedClock?.entries ?? [
      { type: "work", start: 8 * 60 + 5, end: 10 * 60 + 15, act: "meet", project: "app" },
      { type: "break", start: 10 * 60 + 15, end: 10 * 60 + 34 },
      { type: "work", start: 10 * 60 + 34, end: 11 * 60 + 36, act: "meet", project: "app" },
    ],
  };

  // ---------- Helpers ----------
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = n => n.split(/\s+/).filter(w => /^[A-ZÀ-Ž]/.test(w)).slice(0, 2).map(w => w[0]).join("");
  const fmtClock = min => { min = Math.floor(min); const h = Math.floor(min / 60) % 24, m = min % 60; return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };
  const fmtH = hours => { const t = Math.round(hours * 60); return { h: Math.floor(t / 60).toLocaleString("en-US"), m: t % 60 }; };
  const fmtHText = hours => { const { h, m } = fmtH(hours); return `${h}h ${m}m`; };
  const icon = (id, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const ago = min => { const m = Math.max(0, Math.round(nowMin() - min)); if (m < 1) return "just now"; if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`; const h = Math.floor(m / 60); return `${h} hour${h === 1 ? "" : "s"} ago`; };

  function myStatus() {
    const last = state.entries[state.entries.length - 1];
    if (last && last.end == null) return last.type === "break" ? "break" : "in";
    return "out";
  }
  function myWorkedToday() {
    const n = nowMin();
    return state.entries.filter(e => e.type === "work").reduce((s, e) => s + ((e.end ?? n) - e.start), 0);
  }
  function myBreakToday() {
    const n = nowMin();
    return state.entries.filter(e => e.type === "break").reduce((s, e) => s + ((e.end ?? n) - e.start), 0);
  }
  function syncMe() {
    ME.status = myStatus();
    const last = state.entries[state.entries.length - 1];
    ME.since = last ? (ME.status === "out" ? last.end : last.start) : null;
    if (ME.status === "out" && last) ME.end = last.end; else delete ME.end;
  }

  // Today's worked hours for a member (span-based, for teammates).
  function todaySpan(m) {
    if (m.id === "me") return null;
    const start = m.start ?? m.since;
    if (start == null) return null;
    if (m.status === "out") return m.end ? [start, m.end] : null;
    return [start, m.status === "break" ? m.since : nowMin()];
  }
  function todayFor(m) {
    if (m.id === "me") return { worked: myWorkedToday() / 60, brk: myBreakToday() / 60 };
    const s = todaySpan(m); if (!s) return null;
    const brk = m.status === "break" ? (nowMin() - m.since) / 60 : 0;
    return { worked: (s[1] - s[0]) / 60, brk };
  }
  function dayFor(m, d) { return d === TODAY ? todayFor(m) : (d < TODAY ? m.days[d] : null); }

  function visibleMembers(forRail = false) {
    const f = state.filters;
    return MEMBERS.filter(m => {
      if (state.scope === "personal" && m.id !== "me" && !forRail) return false;
      if (state.scope === "managed" && !m.managed) return false;
      if (f.locations.size && !f.locations.has(m.loc)) return false;
      if (f.groups.size && !f.groups.has(m.group)) return false;
      if (f.schedules.size && !f.schedules.has(m.sched)) return false;
      return true;
    });
  }

  // ---------- Period columns ----------
  function periodColumns(members) {
    const cols = [];
    const add = (label, ds, today, title) => {
      let worked = 0, brk = 0, over = 0;
      ds.forEach(d => members.forEach(m => {
        const v = dayFor(m, d); if (!v) return;
        worked += v.worked; brk += v.brk; over += Math.max(0, v.worked - 8);
      }));
      cols.push({ label, worked, brk, over, today, title });
    };
    if (state.period === "week") {
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((n, i) => add(n, [16 + i], 16 + i === TODAY, `${n} ${16 + i} Nov`));
    } else if (state.period === "month") {
      for (let d = 1; d <= 30; d++) add(String(d), [d], d === TODAY, `${d} Nov`);
    } else {
      // Day: hourly buckets, 6 am – 8 pm, from today's spans
      for (let h = 6; h < 20; h++) {
        let worked = 0;
        members.forEach(m => {
          const spans = m.id === "me"
            ? state.entries.filter(e => e.type === "work").map(e => [e.start, e.end ?? nowMin()])
            : (todaySpan(m) ? [todaySpan(m)] : []);
          spans.forEach(([a, b]) => { worked += Math.max(0, Math.min(b, (h + 1) * 60) - Math.max(a, h * 60)) / 60; });
        });
        const label = h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`;
        cols.push({ label, worked, brk: 0, over: 0, today: Math.floor(nowMin() / 60) === h, title: `${fmtClock(h * 60)} – ${fmtClock((h + 1) * 60)}` });
      }
    }
    return cols;
  }
  const RANGE = { day: "Wed, 18 Nov", week: "16 – 22 Nov", month: "November 2026" };

  // ---------- Render: clock card ----------
  function renderClock() {
    const st = myStatus();
    const card = $(".clock");
    card.dataset.state = st;
    document.body.dataset.clock = st;
    $("#clockStatusText").textContent = st === "in" ? "Clocked in" : st === "break" ? "On break" : "Clocked out";
    $("#activityLabel").textContent = ACTIVITIES.find(item => item.id === state.activity)?.name ?? "No activity";
    $("#projectLabel").textContent = PROJECTS.find(item => item.id === state.project)?.name ?? "No project";
    for (const selector of ["#activityBtn", "#projectBtn"]) {
      $(selector).setAttribute("aria-haspopup", st === "out" ? "listbox" : "dialog");
    }
    renderTimer();

    /* While clocked in (or on break), show what the running time is tracked against, with the side panel's chips. */
    $("#clockStatus").hidden = st === "in";
    const now = $("#clockNow");
    const cur = st === "out" ? null : lastWork();
    const act = cur && ACTIVITIES.find(x => x.id === cur.act);
    const proj = cur && PROJECTS.find(x => x.id === cur.project && x.id !== "none");
    now.hidden = !act && !proj;
    const nowKey = `${act?.id}|${proj?.id}`;
    if (now.dataset.key !== nowKey) {
      now.dataset.key = nowKey;
      now.innerHTML = [
        act && `<span class="dd-chip dd-chip--color" style="--chip:${act.color}" title="Activity">${esc(act.name)}</span>`,
        proj && `<span class="dd-chip dd-chip--grey" title="Project">${esc(proj.name)}</span>`,
      ].filter(Boolean).join("");
      now.setAttribute("aria-label", [act && `Activity: ${act.name}`, proj && `Project: ${proj.name}`].filter(Boolean).join(". "));
    }

    const a = $("#clockActions");
    const resume = lastResume();
    const btns = {
      out: `<button class="btn btn--outlined btn--lg resume" data-act="resume" title="${esc(resume.label)}" aria-label="${esc(resume.label)}">${resume.html}</button>
            <button class="btn btn--green btn--lg" data-act="in">${icon("play", "i")} Clock in</button>`,
      in: `<button class="btn btn--green btn--lg" data-act="switch">${icon("tag", "i")} Switch activity</button>
           <button class="btn clock-break btn--lg" data-act="break">${icon("coffee", "i")} Start break</button>
           <button class="btn clock-stop btn--lg" data-act="out">${icon("stop", "i")} Clock out</button>`,
      break: `<button class="btn clock-break btn--lg" data-act="endbreak">${icon("play", "i")} End break</button>
              <button class="btn clock-stop btn--lg" data-act="out">${icon("stop", "i")} Clock out</button>`,
    }[st];
    const key = st + "|" + resume.label;
    if (a.dataset.st !== key) { a.innerHTML = btns; a.dataset.st = key; }
    const topResume = $("#topResumeBtn");
    topResume.hidden = st !== "out";
    topResume.innerHTML = resume.html;
    topResume.title = resume.label;
    topResume.setAttribute("aria-label", resume.label);

    const top = $("#topClockBtn");
    top.className = "round-btn " + (st === "in" ? "round-btn--stop" : "round-btn--go");
    top.setAttribute("aria-label", st === "in" ? "Clock out" : st === "break" ? "End break" : "Clock in");
    top.title = top.getAttribute("aria-label");
    top.innerHTML = icon(st === "in" ? "stop" : "play");
    $("#topState").innerHTML = icon(st === "break" ? "pause" : "play", "i");
    $("#clockRun").hidden = st === "out";
    const rb = $("#runBreak");
    rb.innerHTML = icon(st === "break" ? "play" : "coffee");
    rb.className = "round-btn " + (st === "break" ? "round-btn--go" : "round-btn--break");
    rb.setAttribute("aria-label", st === "break" ? "End break" : "Start break");
    rb.title = rb.getAttribute("aria-label");
    renderTimeline();
  }
  function renderTimer() {
    const st = myStatus();
    const secs = Math.floor(myWorkedToday() * 60);
    const h = Math.floor(secs / 3600), m = Math.floor(secs / 60) % 60, s = secs % 60;
    $("#timerHM").textContent = `${h}:${String(m).padStart(2, "0")}`;
    $("#timerS").textContent = `:${String(s).padStart(2, "0")}`;
    $("#runTime").textContent = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    $("#clockTimer").setAttribute("aria-label", `${h} hours ${m} minutes tracked today`);
    const last = state.entries[state.entries.length - 1];
    let sub;
    if (st === "out") sub = last ? `Tracked today · Last out ${ago(last.end)}` : "Nothing tracked yet today";
    else if (st === "in") sub = `Tracked today · In since ${fmtClock(last.start)}`;
    else sub = `Tracked today · Break ${fmtHText((nowMin() - last.start) / 60)}`;
    $("#clockSub").textContent = sub;
    $("#topLast").textContent = st === "out" && last ? `Last out ${ago(last.end)}` : st === "in" ? `In since ${fmtClock(last.start)}` : `On break since ${fmtClock(last.start)}`;
    const ctl = $("#clockCtl");
    ctl.title = $("#topLast").textContent;
    ctl.setAttribute("role", "group");
    ctl.setAttribute("aria-label", `Time clock. ${ctl.title}`);
  }
  const TL_FROM = 6 * 60, TL_TO = 20 * 60;
  function renderTimeline() {
    const pct = v => ((Math.min(Math.max(v, TL_FROM), TL_TO) - TL_FROM) / (TL_TO - TL_FROM)) * 100;
    const n = nowMin();
    const t = $("#tlTrack");
    t.innerHTML = state.entries.map(e => {
      const end = e.end ?? n;
      const act = ACTIVITIES.find(a => a.id === (e.act || "meet"))?.name ?? "No activity";
      const tip = `${e.type === "work" ? `Worked · ${act}` : "Break"} · ${fmtClock(e.start)} – ${e.end == null ? "now" : fmtClock(e.end)}`;
      return `<span class="tl__seg tl__seg--${e.type}${e.end == null ? " is-live" : ""}" title="${esc([tip, PROJECTS.find(p => p.id === e.project)?.name, e.note, e.outNote].filter(Boolean).join(" · "))}" style="left:${pct(e.start)}%;width:${Math.max(0.3, pct(end) - pct(e.start))}%"></span>`;
    }).join("") + `<span class="tl__now" style="left:${pct(n)}%"></span>`;
    t.setAttribute("role", "img");
    t.setAttribute("aria-label", "Today: " + state.entries.map(e => `${e.type === "work" ? "worked" : "break"} ${fmtClock(e.start)} to ${e.end == null ? "now" : fmtClock(e.end)}`).join(", "));
    if (!$("#tlRuler").childElementCount) {
      $("#tlRuler").innerHTML = [6, 8, 10, 12, 14, 16, 18, 20].map(h => `<span style="left:${pct(h * 60)}%">${h === 12 ? "12 pm" : h < 12 ? h + " am" : h - 12 + " pm"}</span>`).join("");
    }
  }

  const openClockPanel = createClockPanel([{ id: "none", name: "No activity" }, ...ACTIVITIES], PROJECTS, LOCATIONS, commitClock);
  /* The last clock in's activity and project, for Resume. */
  function lastWork() { return state.entries.filter(e => e.type === "work").at(-1); }
  function lastResume() {
    const prev = lastWork();
    return resumeContent(ACTIVITIES.find(x => x.id === prev?.act), PROJECTS.find(x => x.id === prev?.project));
  }
  function clockAction(act) {
    if (act === "break") { commitClock(act); return; }
    const last = state.entries.at(-1);
    /* Resume (as in Jibble's timer): clock back in with the activity and project of your last clock in. */
    const prev = act === "resume" ? lastWork() : null;
    const prevAct = prev?.act ?? "", prevProj = prev?.project ?? "";
    openClockPanel(act, nowMin(), prevAct, prevProj, last?.end ?? last?.start ?? 0);
  }
  function commitClock(act, fields) {
    const last = state.entries.at(-1);
    const n = Math.max(fields?.time ?? nowMin(), last?.end ?? last?.start ?? 0);
    if (last && last.end == null) last.end = n;
    if (act === "break") {
      state.entries.push({ type: "break", start: n, end: null });
    } else if (act === "out") {
      last.outNote = fields.note;
      last.outLocation = fields.location;
    } else {
      state.activity = fields.activity;
      state.project = fields.project;
      state.entries.push({ type: "work", start: n, end: null, act: state.activity, project: state.project, location: fields.location, note: fields.note });
    }
    try {
      const { activity, project, entries } = state;
      sessionStorage.setItem("jb-dashboard-clock", JSON.stringify({ day: sessionDay, loadedAt, activity, project, entries }));
    } catch { /* The current page still tracks time without storage. */ }
    renderAll();
    announce({ in: "Clocked in", resume: "Activity resumed", switch: "Activity switched", break: "Break started", endbreak: "Break ended", out: "Clocked out" }[act]);
  }
  const live = el("div", "sr-only"); live.setAttribute("aria-live", "polite"); document.body.append(live);
  const announce = msg => { live.textContent = ""; setTimeout(() => { live.textContent = msg; }, 30); };

  // ---------- Render: rail ----------
  function placeRailList() {
    const rail = $(".rail"), list = $("#memberList");
    rail.style.setProperty("--rail-list-top", `${$(".search").offsetTop + $(".search").offsetHeight + 4}px`);
  }
  function renderRail(members) {
    const by = s => members.filter(m => m.status === s);
    $("#nIn").textContent = by("in").length;
    $("#nBreak").textContent = by("break").length;
    $("#nOut").textContent = by("out").length;
    $("#railCount").textContent = `${members.length} member${members.length === 1 ? "" : "s"}`;
    document.querySelectorAll("#countTabs .counts__tab").forEach(t => {
      const on = t.dataset.status === state.railStatus;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
    });
    const q = state.search.trim().toLowerCase();
    const list = by(state.railStatus).filter(m => !q || m.name.toLowerCase().includes(q))
      .sort((a, b) => (a.id === "me" ? -1 : b.id === "me" ? 1 : (a.since ?? 9999) - (b.since ?? 9999)));
    const ul = $("#memberList");
    if (!list.length) {
      const word = { in: "clocked in", break: "on a break", out: "clocked out" }[state.railStatus];
      ul.innerHTML = q
        ? `<li class="empty"><strong>No members match “${esc(state.search)}”</strong>Try another name, or check the other status tabs.</li>`
        : `<li class="empty"><strong>No one is ${word}</strong>${members.length ? "Members appear here as their status changes." : "No members match the current filters."}</li>`;
      return;
    }
    ul.innerHTML = list.map(m => {
      const loc = LOCATIONS.find(l => l.id === m.loc).name;
      let when;
      if (m.status === "in") when = `In since ${fmtClock(m.since)}`;
      else if (m.status === "break") when = `Break since ${fmtClock(m.since)}`;
      else when = m.since != null ? `Out at ${fmtClock(m.end ?? m.since)}` : "Not in today";
      return `<li class="member" data-status="${m.status}">
        <span class="member__av avatar avatar--32${m.id === "me" ? " avatar--me" : ""}" aria-hidden="true">${esc(initials(m.name))}</span>
        <span class="member__text"><span class="member__name">${esc(m.name)}${m.id === "me" ? '<span class="member__you">(you)</span>' : ""}</span>
        <span class="member__meta">${when} · ${esc(loc)}</span></span></li>`;
    }).join("");
  }

  // ---------- Chart data (drawn by widgets.jsx) ----------
  function hoursData(members) {
    const cols = periodColumns(members);
    const maxV = Math.max(1, ...cols.map(c => c.worked + c.brk));
    const step = niceStep(maxV / 4);
    const top = step * Math.max(1, Math.ceil(maxV / step));
    const ticks = []; for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
    return { cols, ticks, top };
  }
  function niceStep(raw) {
    if (raw <= 0.25) return 0.25; if (raw <= 0.5) return 0.5;
    const p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function breakdownData(members, kind) {
    const list = kind === "projects" ? PROJECTS : ACTIVITIES;
    const key = kind === "projects" ? "proj" : "act";
    const totals = Object.fromEntries(list.map(p => [p.id, 0]));
    const days = state.period === "day" ? [TODAY] : state.period === "week" ? [16, 17, 18, 19, 20, 21, 22] : Array.from({ length: 30 }, (_, i) => i + 1);
    members.forEach(m => {
      const w = m[key], sum = Object.values(w).reduce((a, b) => a + b, 0);
      const hrs = days.reduce((s, d) => s + ((dayFor(m, d) || {}).worked || 0), 0);
      Object.entries(w).forEach(([id, v]) => { totals[id] += hrs * v / sum; });
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const rows = list.map(p => ({ ...p, hrs: totals[p.id] })).filter(p => p.hrs > 0.004).sort((a, b) => b.hrs - a.hrs).slice(0, 10);
    return { total, rows };
  }
  // A tiny external store: widgets.jsx reads it with useSyncExternalStore.
  const chartStore = (() => {
    let snap = null, version = 0;
    const subs = new Set();
    return {
      publish(next, quiet) { if (!quiet) version++; snap = { ...next, version }; subs.forEach(f => f()); },
      getSnapshot: () => snap,
      subscribe: f => { subs.add(f); return () => subs.delete(f); },
    };
  })();
  window.JBDashboard = { subscribe: chartStore.subscribe, getSnapshot: chartStore.getSnapshot };

  // ---------- Render: upcoming ----------
  function renderUpcoming(members) {
    const ids = new Set(members.map(m => m.id));
    const key = (mo, d, y) => (y || (mo < 11 ? 2027 : 2026)) * 10000 + mo * 100 + d;
    const items = [
      ...TIME_OFF.filter(t => ids.has(t.member)).map(t => {
        const m = MEMBERS.find(x => x.id === t.member);
        return { sort: key(...t.from), from: t.from, to: t.to, days: t.days, title: m.id === "me" ? "Your leave" : m.name, meta: `${t.type}<span class="tag tag--${t.status}">${t.status === "approved" ? "Approved" : "Pending"}</span>` };
      }),
      ...(state.scope === "personal" ? [] : HOLIDAYS.map(hd => ({ sort: key(...hd.from, hd.year), from: hd.from, to: hd.to, days: hd.days, title: hd.name, meta: hd.cal }))),
    ].filter(x => x.sort >= key(11, TODAY)).sort((a, b) => a.sort - b.sort).slice(0, 5);
    const ul = $("#eventList");
    if (!items.length) { ul.innerHTML = `<li class="empty"><strong>Nothing coming up</strong>Approved and pending time off, and holidays, appear here.</li>`; return; }
    ul.innerHTML = items.map(x => {
      const sameMonth = x.from[0] === x.to[0];
      const day = x.from[1] === x.to[1] && sameMonth ? `${x.from[1]}` : `${x.from[1]} – ${x.to[1]}`;
      const mon = sameMonth ? MONTHS[x.from[0] - 1] : `${MONTHS[x.from[0] - 1]} – ${MONTHS[x.to[0] - 1]}`;
      const days = `${x.days} day${x.days === 1 ? "" : "s"}`;
      return `<li class="event"><span class="event__date"><span class="event__mon">${mon}</span><span class="event__day">${day}</span></span>
        <span class="event__body"><span class="event__title" title="${esc(x.title)}">${esc(x.title)}</span><span class="event__meta">${x.meta.replace(/(<span class="tag|$)/, ` · ${days} $1`)}</span></span></li>`;
    }).join("");
  }

  // ---------- Render: locations ----------
  function renderLocations(members) {
    const sel = state.filters.locations;
    const scoped = MEMBERS.filter(m => (state.scope === "org" || (state.scope === "managed" ? m.managed : m.id === "me"))
      && (!state.filters.groups.size || state.filters.groups.has(m.group))
      && (!state.filters.schedules.size || state.filters.schedules.has(m.sched)));
    const counts = id => { const ms = scoped.filter(m => m.loc === id); return ["in", "break", "out"].map(s => ms.filter(m => m.status === s).length); };

    const map = $("#map");
    if (!map.querySelector("svg")) map.insertAdjacentHTML("afterbegin", MAP_SVG);
    map.querySelectorAll(".map__pin").forEach(p => p.remove());
    LOCATIONS.filter(l => l.x != null).forEach(l => {
      const [i, b] = counts(l.id);
      const tone = i ? "in" : b ? "break" : "out";
      const p = el("button", "map__pin");
      p.dataset.tone = tone; p.dataset.loc = l.id;
      p.style.left = l.x + "%"; p.style.top = l.y + "%";
      p.setAttribute("aria-pressed", sel.has(l.id));
      p.setAttribute("aria-label", `${l.name} on map: ${i} in, ${b} on break`);
      p.innerHTML = `<span class="map__name">${esc(l.name)}</span>`;
      map.append(p);
    });
  }
  // Illustrative map: land, a river and bay, a road grid. No map provider.
  const MAP_SVG = `<svg viewBox="0 0 1000 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1000" height="360" fill="#F7F7F6"/>
    <path d="M0 250 C120 230 180 300 300 290 S470 330 560 360 L0 360Z" fill="#EDEDEB"/>
    <path d="M380 0 C400 70 360 120 420 170 S560 220 560 360 L600 360 C600 230 470 190 455 150 S440 60 430 0Z" fill="#EDEDEB"/>
    <path d="M700 360 C740 300 860 290 1000 310 L1000 360Z" fill="#EDEDEB"/>
    <g fill="#F2F2F1"><rect x="610" y="60" width="90" height="60" rx="6"/><rect x="150" y="70" width="70" height="90" rx="6"/><rect x="820" y="170" width="80" height="50" rx="6"/></g>
    <g stroke="#FFFFFF" stroke-width="10" fill="none" stroke-linecap="round">
      <path d="M0 140 C200 120 300 160 470 140 S800 90 1000 120"/>
      <path d="M520 0 C540 120 650 200 1000 230"/>
      <path d="M0 40 C150 60 260 30 380 50"/>
      <path d="M180 360 C200 260 160 180 230 0"/>
    </g>
    <g stroke="#FFFFFF" stroke-width="4" fill="none">
      <path d="M0 200 H360 M600 180 H1000 M0 90 H380 M480 60 H1000 M620 270 H1000 M60 0 V230 M300 0 V250 M660 0 V300 M760 0 V280 M880 0 V300 M960 0 V300"/>
      <path d="M90 300 L240 210 M700 40 L980 190 M520 300 L640 210"/>
    </g>
  </svg><span class="map__note">Illustrative map</span>`;

  // ---------- Filters ----------
  const FILTERS = {
    locations: { all: "All locations", one: "location", many: "Locations", opts: LOCATIONS },
    groups: { all: "All groups", one: "group", many: "Groups", opts: GROUPS },
    schedules: { all: "All schedules", one: "schedule", many: "Schedules", opts: SCHEDULES },
  };
  function buildFilters() {
    document.querySelectorAll(".filter").forEach(wrap => {
      const key = wrap.dataset.filter, cfg = FILTERS[key];
      wrap.innerHTML = `<button class="filter__btn" aria-haspopup="true" aria-expanded="false" aria-controls="menu-${key}"></button>
        <div class="menu is-right" id="menu-${key}" hidden role="group" aria-label="${cfg.many}">
          <label class="field-search field-search--menu">${icon("search", "i")}<span class="sr-only">Search ${cfg.many.toLowerCase()}</span><input type="search" placeholder="Search" data-msearch autocomplete="off"><button type="button" class="field-search__clear" data-sclear aria-label="Clear search" title="Clear search" hidden>${icon("x-circle", "i i-16")}</button></label>
          <div data-list>${cfg.opts.map(o => `<label class="menu__opt" data-name="${esc(o.name.toLowerCase())}"><input type="checkbox" value="${o.id}"><span class="box">${icon("check")}</span><span>${esc(o.name)}</span></label>`).join("")}</div>
          <p class="menu__empty" data-empty hidden>No ${cfg.many.toLowerCase()} found</p>
          <div class="menu__foot"><button type="button" data-clear>Clear selection</button></div>
        </div>`;
      const btn = wrap.querySelector(".filter__btn"), menu = wrap.querySelector(".menu");
      btn.addEventListener("click", () => toggleMenu(btn, menu));
      menu.addEventListener("input", e => {
        if (!e.target.matches("[data-msearch]")) return;
        menu.querySelector("[data-sclear]").hidden = !e.target.value;
        menuSearch(menu, e.target.value);
      });
      menu.addEventListener("change", e => {
        if (!e.target.matches("input[type=checkbox]")) return;
        const set = state.filters[key];
        e.target.checked ? set.add(e.target.value) : set.delete(e.target.value);
        renderAll();
      });
      menu.querySelector("[data-sclear]").addEventListener("click", e => {
        e.preventDefault();
        const i = menu.querySelector("[data-msearch]");
        i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); i.focus();
      });
      menu.querySelector("[data-clear]").addEventListener("click", () => { state.filters[key].clear(); renderAll(); });
    });
  }
  function renderFilters() {
    let any = false;
    document.querySelectorAll(".filter").forEach(wrap => {
      const key = wrap.dataset.filter, cfg = FILTERS[key], set = state.filters[key];
      const btn = wrap.querySelector(".filter__btn");
      let label;
      if (!set.size) label = cfg.all;
      else if (set.size === 1) label = esc(cfg.opts.find(o => set.has(o.id)).name);
      else label = `${cfg.many} <span class="filter__count">${set.size}</span>`;
      btn.innerHTML = `<span>${label}</span>${icon("chevron-down", "i")}`;
      btn.classList.toggle("is-active", set.size > 0);
      btn.setAttribute("aria-label", set.size ? `${cfg.many}: ${set.size} selected` : cfg.all);
      wrap.querySelectorAll("input[type=checkbox]").forEach(i => { i.checked = set.has(i.value); });
      if (set.size) any = true;
    });
    $("#clearFilters").hidden = !any;
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
    const first = menu.querySelector("input, [role=option], button");
    if (first) first.focus();
  }
  function closeMenus(refocus) {
    if (!openMenu) return;
    openMenu.menu.hidden = true; openMenu.btn.setAttribute("aria-expanded", "false");
    if (refocus) openMenu.btn.focus();
    openMenu = null;
  }
  function clampMenu(menu) {
    menu.style.translate = "";
    const r = menu.getBoundingClientRect(), pad = 8;
    let dx = 0;
    if (r.right > innerWidth - pad) dx = innerWidth - pad - r.right;
    if (r.left + dx < pad) dx = pad - r.left;
    if (dx) menu.style.translate = `${dx}px 0`;
  }
  document.addEventListener("click", e => { if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.btn.contains(e.target)) closeMenus(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && openMenu) { e.preventDefault(); closeMenus(true); } });

  // Picker menus in the top-bar clock control
  function buildPicker(btnSel, menuSel, list, stateKey, labelSel) {
    const btn = $(btnSel), menu = $(menuSel);
    const draw = () => {
      menu.innerHTML = list.filter(o => o.id !== "none" || stateKey === "project").map(o =>
        `<button class="menu__opt" role="option" data-id="${o.id}" aria-selected="${state[stateKey] === o.id}"><span class="chip__dot" style="width:8px;height:8px;border-radius:50%;background:${o.color}"></span>${esc(o.name)}${icon("check", "i i-16 tick")}</button>`).join("");
      $(labelSel).textContent = list.find(o => o.id === state[stateKey])?.name ?? "No activity";
    };
    draw();
    btn.addEventListener("click", () => {
      if (myStatus() === "out") { draw(); toggleMenu(btn, menu); return; }
      clockAction(myStatus() === "in" ? "switch" : "endbreak");
      $(stateKey === "activity" ? "#clockActivity" : "#clockProject").focus();
    });
    menu.addEventListener("click", e => {
      const o = e.target.closest("[data-id]"); if (!o) return;
      state[stateKey] = o.dataset.id; draw(); closeMenus(true);

    });
    menu.addEventListener("keydown", e => {
      if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const opts = [...menu.querySelectorAll("[role=option]")], i = opts.indexOf(document.activeElement);
      opts[(i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length].focus();
    });
  }

  // ---------- Roving tab / radio groups ----------
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
  function setGroup(container, itemSel, attr, active) {
    container.querySelectorAll(itemSel).forEach(it => { const on = it === active; it.setAttribute(attr, on); it.tabIndex = on ? 0 : -1; });
  }

  // ---------- Configure widgets ----------
  const WIDGET_NAMES = { hours: "Tracked hours", upcoming: "Upcoming holidays and time off", projects: "Top 10 projects", activities: "Top 10 activities", locations: "Locations" };
  function buildConfigure() {
    const menu = $("#configureMenu"), btn = $("#configureBtn");
    menu.insertAdjacentHTML("beforeend", Object.entries(WIDGET_NAMES).map(([k, n]) =>
      `<label class="menu__opt"><input type="checkbox" value="${k}" ${state.widgets[k] ? "checked" : ""}><span class="box">${icon("check")}</span><span>${n}</span></label>`).join(""));
    btn.addEventListener("click", () => toggleMenu(btn, menu));
    menu.addEventListener("change", e => { state.widgets[e.target.value] = e.target.checked; store.set("widgets", state.widgets); applyWidgets(); });
  }
  function applyWidgets() {
    document.querySelectorAll("[data-widget]").forEach(w => { w.hidden = !state.widgets[w.dataset.widget]; });
  }

  // ---------- Render all ----------
  function renderAll(quiet = false) {
    document.body.classList.toggle("is-quiet", quiet);
    syncMe();
    const members = visibleMembers();
    renderFilters();
    renderClock();
    // Who's in/out shows the whole team in every scope, including Personal.
    $(".rail").hidden = false;
    $(".dash").classList.remove("no-rail");
    renderRail(visibleMembers(true));
    chartStore.publish({
      period: state.period,
      hours: hoursData(members),
      projects: breakdownData(members, "projects"),
      activities: breakdownData(members, "activities"),
    }, quiet);
    renderUpcoming(members);
    renderLocations(members);
    $("#rangeLabel").textContent = RANGE[state.period];
    placeRailList();
  }

  // ---------- Wire up ----------
  roving($("#scopeTabs"), ".seg__opt", t => {
    // FLIP: measure, re-render, then animate each widget from its old box to its new one.
    const items = [...document.querySelectorAll(".dash > .clockwrap, .dash > [data-widget]")];
    const before = new Map(items.map(el => [el, el.getBoundingClientRect()]));
    state.scope = t.dataset.scope; setGroup($("#scopeTabs"), ".seg__opt", "aria-checked", t); renderAll();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    items.forEach(el => {
      const a = before.get(el), b = el.getBoundingClientRect();
      if (!b.width || (Math.abs(a.left - b.left) < 1 && Math.abs(a.top - b.top) < 1 && Math.abs(a.width - b.width) < 1)) return;
      el.animate(
        [{ width: `${a.width}px`, transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` },
         { width: `${b.width}px`, transform: "none" }],
        { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  });
  roving($("#periodSeg"), ".seg__opt", t => { state.period = t.dataset.period; setGroup($("#periodSeg"), ".seg__opt", "aria-checked", t); renderAll(); });
  roving($("#countTabs"), ".counts__tab", t => { state.railStatus = t.dataset.status; renderRail(visibleMembers(true)); });
  setGroup($("#periodSeg"), ".seg__opt", "aria-checked", $('#periodSeg [data-period="week"]'));

  const searchInput = $("#memberSearch"), searchClear = $("#memberSearchClear");
  const setSearch = v => {
    searchInput.value = v; state.search = v;
    searchClear.hidden = !v;
    renderRail(visibleMembers(true));
  };
  searchInput.addEventListener("input", e => setSearch(e.target.value));
  searchInput.addEventListener("keydown", e => { if (e.key === "Escape" && searchInput.value) { e.preventDefault(); setSearch(""); } });
  searchClear.addEventListener("click", e => { e.preventDefault(); setSearch(""); searchInput.focus(); });
  $("#clockActions").addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (b) clockAction(b.dataset.act); });
  $("#topResumeBtn").addEventListener("click", () => clockAction("resume"));
  $("#runSwitch").addEventListener("click", () => clockAction("switch"));
  $("#runBreak").addEventListener("click", () => clockAction(myStatus() === "break" ? "endbreak" : "break"));
  $("#runStop").addEventListener("click", () => clockAction("out"));
  $("#topClockBtn").addEventListener("click", () => { const st = myStatus(); clockAction(st === "in" ? "out" : st === "break" ? "endbreak" : "in"); });
  $("#map").addEventListener("click", e => {
    const p = e.target.closest(".map__pin"); if (!p) return;
    const set = state.filters.locations, id = p.dataset.loc;
    const only = set.size === 1 && set.has(id);
    set.clear(); if (!only) set.add(id);
    renderAll();
  });
  $("#clearFilters").addEventListener("click", () => { Object.values(state.filters).forEach(s => s.clear()); renderAll(); });

  const app = $("#app"), cb = $("#collapseBtn");
  const setCollapsed = c => {
    app.classList.toggle("is-collapsed", c);
    cb.setAttribute("aria-expanded", !c);
    cb.setAttribute("aria-label", c ? "Expand sidebar" : "Collapse sidebar"); cb.title = cb.getAttribute("aria-label");
    document.querySelectorAll(".nav__item").forEach(a => { a.title = c ? a.textContent.trim() : ""; });
    store.set("collapsed", c);
  };
  cb.addEventListener("click", () => setCollapsed(!app.classList.contains("is-collapsed")));
  setCollapsed(store.get("collapsed", false));
  requestAnimationFrame(() => requestAnimationFrame(() => app.classList.add("is-ready")));
  $("#settingsToggle").addEventListener("click", e => {
    const open = e.currentTarget.getAttribute("aria-expanded") === "true";
    e.currentTarget.setAttribute("aria-expanded", !open); $("#settingsList").hidden = open;
  });

  buildFilters();
  buildPicker("#activityBtn", "#activityMenu", ACTIVITIES, "activity", "#activityLabel");
  buildPicker("#projectBtn", "#projectMenu", PROJECTS, "project", "#projectLabel");
  buildConfigure();
  applyWidgets();
  renderAll();

  // Tick: timer each second; live figures each minute.
  let lastMinute = Math.floor(nowMin());
  setInterval(() => {
    renderTimer();
    const mNow = Math.floor(nowMin());
    if (mNow !== lastMinute) { lastMinute = mNow; renderAll(true); }
  }, 1000);
})();
