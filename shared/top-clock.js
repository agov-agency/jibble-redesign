/* Top bar time clock for pages with no clock of their own (Time off). Reads and writes the same session
   ("jb-dashboard-clock") as the Dashboard and Timesheets, so your own clock carries across pages.
   Needs topbar.js and clock-panel.js loaded first. */
(() => {
  const KEY = "jb-dashboard-clock", DEMO_START_MIN = 11 * 60 + 40;
  const $ = s => document.querySelector(s);
  const icon = id => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const day = new Date().toDateString();
  const LOCATIONS = [
    { id: "main", name: "NY Main Office", addr: "9513 Delaware St, Astoria, NY 11106" },
    { id: "east", name: "NY East Office", addr: "9250 Jackson Ave, Brooklyn, NY 11213" },
    { id: "post", name: "NY Post", addr: "148 SW Bohemia St, Staten Island, NY 10301" },
    { id: "remote", name: "Remote", addr: "No fixed address" },
  ];
  const PROJECTS = [
    { id: "web", name: "Website refresh", color: "var(--ap-violet)" }, { id: "app", name: "Mobile app", color: "var(--ap-green)" },
    { id: "onb", name: "Client onboarding", color: "var(--ap-pink)" }, { id: "desk", name: "Support desk", color: "var(--ap-turquoise)" },
    { id: "audit", name: "Q4 audit", color: "var(--ap-red)" }, { id: "fit", name: "Warehouse fit-out", color: "var(--ap-blue)" },
    { id: "brand", name: "Brand guidelines", color: "var(--ap-orange)" }, { id: "none", name: "No project", color: "var(--ap-none)" },
  ];
  const ACTIVITIES = [
    { id: "dev", name: "Development", color: "var(--ap-violet)" }, { id: "des", name: "Design", color: "var(--ap-green)" },
    { id: "res", name: "Research", color: "var(--ap-pink)" }, { id: "test", name: "Testing", color: "var(--ap-turquoise)" },
    { id: "meet", name: "Meetings", color: "var(--ap-red)" }, { id: "mgmt", name: "Management", color: "var(--ap-blue)" },
    { id: "sup", name: "Support", color: "var(--ap-orange)" }, { id: "mkt", name: "Marketing", color: "var(--ap-purple)" },
  ];

  let saved;
  try { const s = JSON.parse(sessionStorage.getItem(KEY)); if (s?.day === day && Array.isArray(s.entries) && s.entries.length) saved = s; } catch { /* storage unavailable */ }
  const loadedAt = saved?.loadedAt ?? Date.now();
  const state = {
    activity: saved?.activity ?? "meet", project: saved?.project ?? "app",
    entries: saved?.entries ?? [
      { type: "work", start: 8 * 60 + 5, end: 10 * 60 + 15, act: "meet", project: "app" },
      { type: "break", start: 10 * 60 + 15, end: 10 * 60 + 34 },
      { type: "work", start: 10 * 60 + 34, end: 11 * 60 + 36, act: "meet", project: "app" },
    ],
  };
  const nowMin = () => DEMO_START_MIN + (Date.now() - loadedAt) / 60000;
  const fmtClock = min => { min = Math.floor(min); const h = Math.floor(min / 60) % 24, m = min % 60; return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };
  const ago = min => { const m = Math.max(0, Math.round(nowMin() - min)); if (m < 1) return "just now"; if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`; const h = Math.floor(m / 60); return `${h} hour${h === 1 ? "" : "s"} ago`; };
  const last = () => state.entries.at(-1);
  const lastWork = () => state.entries.filter(e => e.type === "work").at(-1);
  const status = () => (last() && last().end == null ? (last().type === "break" ? "break" : "in") : "out");
  const worked = () => state.entries.filter(e => e.type === "work").reduce((s, e) => s + ((e.end ?? nowMin()) - e.start), 0);

  function render() {
    const st = status(), l = last();
    document.body.dataset.clock = st;
    $("#clockCtl").dataset.clock = st;
    const top = $("#topClockBtn");
    top.className = "round-btn " + (st === "in" ? "round-btn--stop" : "round-btn--go");
    top.innerHTML = icon(st === "in" ? "stop" : "play");
    top.setAttribute("aria-label", st === "in" ? "Clock out" : st === "break" ? "End break" : "Clock in");
    top.title = top.getAttribute("aria-label");
    $("#topState").innerHTML = icon(st === "break" ? "pause" : "play");
    $("#clockRun").hidden = st === "out";
    const rb = $("#runBreak");
    rb.innerHTML = icon(st === "break" ? "play" : "coffee");
    rb.className = "round-btn " + (st === "break" ? "round-btn--go" : "round-btn--break");
    rb.setAttribute("aria-label", st === "break" ? "End break" : "Start break");
    rb.title = rb.getAttribute("aria-label");
    const prev = lastWork(), resume = resumeContent(ACTIVITIES.find(x => x.id === prev?.act), PROJECTS.find(x => x.id === prev?.project));
    const tr = $("#topResumeBtn");
    tr.hidden = st !== "out"; tr.innerHTML = resume.html; tr.title = resume.label; tr.setAttribute("aria-label", resume.label);
    { const A = ACTIVITIES.find(o => o.id === state.activity); $("#activityLabel").textContent = A?.name ?? "No activity"; $("#activityBtn").style.setProperty("--chip", A?.color ?? "var(--ap-none)"); }
    $("#projectLabel").textContent = PROJECTS.find(o => o.id === state.project)?.name ?? "No project";
    tick();
  }
  function tick() {
    const st = status(), l = last(), secs = Math.floor(worked() * 60);
    $("#runTime").textContent = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
    const txt = st === "out" && l ? `Last out ${ago(l.end)}` : st === "in" ? `In since ${fmtClock(l.start)}` : `On break since ${fmtClock(l.start)}`;
    $("#topLast").textContent = txt;
    const ctl = $("#clockCtl"); ctl.title = txt; ctl.setAttribute("role", "group"); ctl.setAttribute("aria-label", `Time clock. ${txt}`);
  }

  const openPanel = createClockPanel([{ id: "none", name: "No activity" }, ...ACTIVITIES], PROJECTS, LOCATIONS, commit);
  function action(act) {
    if (act === "break") { commit(act); return; }
    const prev = act === "resume" ? lastWork() : null;
    openPanel(act, nowMin(), prev?.act ?? "", prev?.project ?? "", last()?.end ?? last()?.start ?? 0);
  }
  function commit(act, fields) {
    if (act === "hours") return; /* manual hours are stored on the timesheet; nothing to change on the clock */
    const l = last(), n = Math.max(fields?.time ?? nowMin(), l?.end ?? l?.start ?? 0);
    if (l && l.end == null) l.end = n;
    if (act === "break") state.entries.push({ type: "break", start: n, end: null });
    else if (act === "out") { l.outNote = fields.note; l.outLocation = fields.location; }
    else {
      state.activity = fields.activity; state.project = fields.project;
      state.entries.push({ type: "work", start: n, end: null, act: state.activity, project: state.project, location: fields.location, note: fields.note });
    }
    try { sessionStorage.setItem(KEY, JSON.stringify({ day, loadedAt, activity: state.activity, project: state.project, entries: state.entries })); } catch { /* keep going without storage */ }
    render();
  }

  /* Activity and project chips: pick while clocked out; otherwise open the switch / end-break panel. */
  let open = null;
  const closeMenu = () => { if (open) { open.menu.hidden = true; open.btn.setAttribute("aria-expanded", "false"); open = null; } };
  function picker(btnSel, menuSel, list, key) {
    const btn = $(btnSel), menu = $(menuSel);
    const draw = () => {
      menu.innerHTML = list.filter(o => o.id !== "none" || key === "project").map(o =>
        `<button class="menu__opt" role="option" data-id="${o.id}" aria-selected="${state[key] === o.id}"><span class="chip__dot" style="width:8px;height:8px;border-radius:50%;background:${o.color}"></span>${o.name}</button>`).join("");
    };
    btn.addEventListener("click", e => {
      e.stopPropagation();
      if (status() !== "out") { closeMenu(); action(status() === "in" ? "switch" : "endbreak"); return; }
      const was = open?.menu === menu; closeMenu(); if (was) return;
      draw(); menu.hidden = false; btn.setAttribute("aria-expanded", "true"); open = { btn, menu };
    });
    menu.addEventListener("click", e => { const o = e.target.closest("[data-id]"); if (!o) return; state[key] = o.dataset.id; closeMenu(); render(); });
  }
  picker("#activityBtn", "#activityMenu", ACTIVITIES, "activity");
  picker("#projectBtn", "#projectMenu", PROJECTS, "project");
  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  $("#topResumeBtn").addEventListener("click", () => action("resume"));
  $("#topClockBtn").addEventListener("click", () => { const st = status(); action(st === "in" ? "out" : st === "break" ? "endbreak" : "in"); });
  $("#runBreak").addEventListener("click", () => action(status() === "break" ? "endbreak" : "break"));
  $("#runSwitch").addEventListener("click", () => action("switch"));
  $("#runStop").addEventListener("click", () => action("out"));

  render();
  setInterval(tick, 1000);
})();
