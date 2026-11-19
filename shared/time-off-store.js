/* Time off data shared by the Time off page and Timesheets.
   Illustrative local data: requests live in localStorage ("jb-timeoff-v1") so changes made on the
   Time off page show up in Timesheets. Nothing is sent anywhere. */
window.JibbleTimeOff = (() => {
  "use strict";
  const KEY = "jb-timeoff-v1";
  const TODAY = "2026-11-18"; // the demo is anchored to Wed 18 Nov 2026, like the Dashboard and Timesheets
  const ME = "jl";

  const M = (id, name, pos, group, managed) => ({ id, name, pos, group, managed });
  const MEMBERS = [
    M("am", "Angus MacGyver", "Customer Service Representative", "support", true),
    M("ab", "Angela Bower", "Marketing Manager", "sales", true),
    M("ck", "Chikayo Kodama", "Sales Representative", "sales", false),
    M("dz", "Dalma Zayas Orta", "Administrative Assistant", "ops", true),
    M("dm", "Devon Miles", "Financial Analyst", "ops", false),
    M("hi", "Hanna Ingveldardóttir", "Human Resources Specialist", "ops", true),
    M("hk", "Hazel C. Kennedy", "Software Developer", "eng", true),
    M("jl", "Jane Long", "CEO", "ops", false),
    M("lw", "Latanya D. Walls", "Project Manager", "eng", true),
    M("mh", "Mario B. Hardin", "Operations Manager", "ops", false),
    M("xy", "Xiong Yao", "Software Developer", "eng", true),
    M("sm", "Scott R. Maag", "Support Specialist", "support", false),
    M("ok", "Oliver Kuprešak", "Warehouse Associate", "support", false),
    M("ao", "Amara Okafor", "QA Engineer", "eng", true),
    M("lf", "Luis Ferreira", "Facilities Coordinator", "ops", false),
    M("pn", "Priya Nair", "Data Analyst", "eng", false),
    M("tw", "Tomasz Wójcik", "Support Specialist", "support", false),
    M("ed", "Elif Demir", "Product Designer", "design", true),
    M("rb", "Rosa Bianchi", "Brand Designer", "design", false),
    M("kn", "Kwame Nkansah", "Account Executive", "sales", false),
    M("sj", "Sofia Järvinen", "UX Researcher", "design", true),
    M("mt", "Marcus Thompson", "Retail Associate", "sales", false),
    M("ys", "Yuki Sato", "Backend Engineer", "eng", false),
    M("nb", "Noah Bergström", "Payroll Specialist", "ops", true),
  ];

  /* allowance: days per calendar year, null = not capped. Colours reuse the Activities & Projects set. */
  const POLICIES = [
    { id: "vacation", name: "Vacation Leave", short: "Vacation", color: "var(--ap-blue)", allowance: 20, paid: true },
    { id: "sick", name: "Sick Leave", short: "Sick", color: "var(--ap-red)", allowance: 10, paid: true },
    { id: "personal", name: "Personal Leave", short: "Personal", color: "var(--ap-purple)", allowance: 3, paid: true },
    { id: "parental", name: "Parental Leave", short: "Parental", color: "var(--ap-turquoise)", allowance: null, paid: true },
    { id: "unpaid", name: "Unpaid Leave", short: "Unpaid", color: "var(--ap-none)", allowance: null, paid: false },
  ];

  const HOLIDAYS = {
    "2026-01-01": "New Year's Day", "2026-01-19": "Martin Luther King Jr. Day", "2026-02-16": "Presidents' Day",
    "2026-05-25": "Memorial Day", "2026-06-19": "Juneteenth", "2026-07-03": "Independence Day (observed)",
    "2026-09-07": "Labor Day", "2026-11-11": "Veterans Day", "2026-11-26": "Thanksgiving Day",
    "2026-11-27": "Day after Thanksgiving", "2026-12-24": "Christmas Eve", "2026-12-25": "Christmas Day",
    "2027-01-01": "New Year's Day", "2027-01-18": "Martin Luther King Jr. Day", "2027-02-15": "Presidents' Day",
  };

  // ---------- Dates (local, day precision, "YYYY-MM-DD" keys) ----------
  const pad = n => String(n).padStart(2, "0");
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
  const isWeekend = k => { const g = parse(k).getDay(); return g === 0 || g === 6; };
  function* eachDay(from, to) { for (let k = from; k <= to; k = addDays(k, 1)) yield k; }

  /* Working days a request takes: weekdays that are not public holidays; a half day counts 0.5. */
  function workdays(from, to, half, year) {
    let n = 0;
    for (const k of eachDay(from, to || from)) {
      if (year && !k.startsWith(year + "-")) continue;
      if (!isWeekend(k) && !HOLIDAYS[k]) n++;
    }
    return half && n ? 0.5 : n;
  }
  function excluded(from, to) {
    const out = { weekend: 0, holidays: [] };
    for (const k of eachDay(from, to || from)) {
      if (isWeekend(k)) out.weekend++;
      else if (HOLIDAYS[k]) out.holidays.push(HOLIDAYS[k]);
    }
    return out;
  }

  // ---------- Seed ----------
  let seq = 1;
  const R = (m, policy, from, to, status = "approved", extra = {}) => ({
    id: "r" + seq++, m, policy, from, to: to || from, half: null, note: "", status,
    created: addDays(from, -14), decidedBy: status === "pending" ? null : ME, ...extra,
  });
  function seed() {
    seq = 1;
    const list = [
      // Same entries Timesheets showed before this store existed.
      R("ab", "vacation", "2026-11-16"), R("hk", "vacation", "2026-11-16", "2026-11-17"),
      R("dz", "sick", "2026-11-17"), R("dm", "sick", "2026-11-19"), R("ao", "vacation", "2026-11-19", "2026-11-20"),
      R("pn", "vacation", "2026-11-09", "2026-11-13"), R("sm", "sick", "2026-11-05", "2026-11-06"),
      R("kn", "vacation", "2026-11-23", "2026-11-25"), R("lw", "vacation", "2026-11-02", "2026-11-03"),
      // Waiting on a decision.
      R("ed", "vacation", "2026-12-21", "2026-12-31", "pending", { note: "Visiting family in Izmir over the holidays." }),
      R("ys", "personal", "2026-12-01", null, "pending", { half: "pm", note: "Moving apartments." }),
      R("ck", "vacation", "2026-12-28", "2027-01-04", "pending"),
      R("sj", "vacation", "2026-11-30", "2026-12-02", "pending", { note: "Long weekend after Thanksgiving." }),
      R("mt", "unpaid", "2026-11-20", null, "pending"),
      // Decided.
      R("tw", "personal", "2026-11-27", null, "rejected", { note: "Bridge day", reason: "Support rota is short that day." }),
      R("mh", "vacation", "2026-11-23", "2026-11-24", "cancelled"),
      R("nb", "sick", "2026-11-18", null, "approved", { half: "am", note: "Doctor's appointment." }),
      R("xy", "vacation", "2026-12-14", "2026-12-18"), R("am", "vacation", "2026-12-07", "2026-12-08"),
      R("rb", "parental", "2026-10-05", "2026-12-04", "approved", { note: "Parental leave." }),
      R("jl", "vacation", "2026-12-28", "2026-12-31", "approved", { note: "End of year break." }),
      // Earlier in the year, so balances have history.
      R("jl", "vacation", "2026-08-03", "2026-08-07"), R("jl", "sick", "2026-03-12"),
      R("am", "vacation", "2026-07-06", "2026-07-10"), R("ab", "vacation", "2026-08-17", "2026-08-28"),
      R("ck", "vacation", "2026-06-22", "2026-06-26"), R("dz", "sick", "2026-02-09", "2026-02-11"),
      R("dm", "vacation", "2026-09-14", "2026-09-18"), R("hk", "vacation", "2026-05-04", "2026-05-15"),
      R("lw", "vacation", "2026-07-20", "2026-07-31"), R("mh", "vacation", "2026-10-12", "2026-10-16"),
      R("xy", "sick", "2026-04-07", "2026-04-08"), R("sm", "vacation", "2026-06-01", "2026-06-05"),
      R("ok", "unpaid", "2026-09-21", "2026-09-22"), R("ao", "vacation", "2026-08-10", "2026-08-14"),
      R("lf", "vacation", "2026-07-27", "2026-08-07"), R("pn", "sick", "2026-01-26", "2026-01-28"),
      R("tw", "vacation", "2026-10-26", "2026-10-30"), R("ed", "personal", "2026-05-29"),
      R("rb", "vacation", "2026-08-03", "2026-08-14"), R("kn", "sick", "2026-10-20"),
      R("sj", "vacation", "2026-06-15", "2026-06-19"), R("mt", "vacation", "2026-07-13", "2026-07-17"),
      R("ys", "vacation", "2026-08-24", "2026-09-04"), R("nb", "vacation", "2026-04-13", "2026-04-17"),
      R("am", "sick", "2026-10-01", "2026-10-02"), R("ab", "personal", "2026-03-20"), R("hk", "sick", "2026-09-09"),
    ];
    list.forEach(r => { r.created = addDays(r.from, -12); r.decidedAt = r.decidedBy ? addDays(r.from, -10) : null; if (r.created > TODAY) r.created = TODAY; if (r.decidedAt && r.decidedAt > TODAY) r.decidedAt = TODAY; });
    return list;
  }

  // ---------- Persistence ----------
  let requests;
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s?.requests)) { requests = s.requests; seq = s.seq || requests.length + 1; } } catch { /* storage unavailable */ }
  if (!requests) requests = seed();
  const subs = new Set();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ requests, seq })); } catch { /* storage unavailable: changes last until reload */ }
    subs.forEach(fn => fn());
  }

  // ---------- API ----------
  const memberById = id => MEMBERS.find(m => m.id === id);
  const policyById = id => POLICIES.find(p => p.id === id);
  const active = r => r.status === "approved" || r.status === "pending";
  const days = r => workdays(r.from, r.to, r.half);

  function overlaps(m, from, to, ignoreId) {
    return requests.find(r => r.m === m && r.id !== ignoreId && active(r) && r.from <= to && r.to >= from);
  }

  /* Balance for one member and policy in a calendar year. Taken = approved days up to today,
     planned = approved days after today, pending = days waiting on a decision. */
  function balance(m, policyId, year = TODAY.slice(0, 4), ignoreId) {
    const p = policyById(policyId);
    const out = { allowance: p.allowance, taken: 0, planned: 0, pending: 0 };
    for (const r of requests) {
      if (r.m !== m || r.policy !== policyId || r.id === ignoreId || !active(r)) continue;
      for (const k of eachDay(r.from, r.to)) {
        if (!k.startsWith(year + "-") || isWeekend(k) || HOLIDAYS[k]) continue;
        const v = r.half ? 0.5 : 1;
        if (r.status === "pending") out.pending += v;
        else if (k <= TODAY) out.taken += v;
        else out.planned += v;
      }
    }
    out.available = p.allowance == null ? null : p.allowance - out.taken - out.planned;
    return out;
  }

  /* Checks a draft request. Returns { error } for problems that block saving, { warning } otherwise. */
  function validate(d, ignoreId) {
    if (!d.m) return { error: "Choose a member.", field: "m" };
    if (!d.policy) return { error: "Choose a policy.", field: "policy" };
    if (!d.from) return { error: "Choose a start date.", field: "from" };
    const to = d.to || d.from;
    if (to < d.from) return { error: "End date can’t be before the start date.", field: "to" };
    const n = workdays(d.from, to, d.half);
    if (!n) return { error: "Those dates are all weekends or public holidays, so there is nothing to book.", field: "from" };
    const clash = overlaps(d.m, d.from, to, ignoreId);
    if (clash) return { error: `${memberById(d.m).name.split(" ")[0]} already has ${policyById(clash.policy).name} (${clash.status}) on ${fmtRange(clash.from, clash.to)}.`, field: "from" };
    const p = policyById(d.policy);
    if (p.allowance != null) {
      for (const y of new Set([d.from.slice(0, 4), to.slice(0, 4)])) {
        const b = balance(d.m, d.policy, y, ignoreId), need = workdays(d.from, to, d.half, y);
        if (need > b.available) return { error: `Only ${fmtDays(Math.max(0, b.available))} of ${p.name} left in ${y}; this needs ${fmtDays(need)}.`, field: "policy" };
      }
    }
    return { days: n };
  }

  function add(d) {
    const r = { id: "r" + seq++, m: d.m, policy: d.policy, from: d.from, to: d.to || d.from, half: d.half || null, note: d.note || "",
      status: d.status || "approved", created: TODAY, decidedBy: d.status === "pending" ? null : ME, decidedAt: d.status === "pending" ? null : TODAY };
    requests.push(r); save(); return r;
  }
  function update(id, patch) {
    const r = requests.find(x => x.id === id); if (!r) return null;
    Object.assign(r, patch);
    if (patch.status && patch.status !== "pending") { r.decidedBy = ME; r.decidedAt = TODAY; }
    save(); return r;
  }
  function remove(id) {
    const i = requests.findIndex(x => x.id === id); if (i < 0) return null;
    const [r] = requests.splice(i, 1); save(); return r;
  }
  function restore(r) { requests.push(r); save(); }
  function reset() { requests = seed(); save(); }

  // ---------- Formatting ----------
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(k, withYear = true) { const d = parse(k); return `${d.getDate()} ${MON[d.getMonth()]}${withYear ? " " + d.getFullYear() : ""}`; }
  function fmtRange(from, to) {
    if (!to || to === from) return fmtDate(from);
    const a = parse(from), b = parse(to);
    if (a.getFullYear() !== b.getFullYear()) return `${fmtDate(from)} – ${fmtDate(to)}`;
    if (a.getMonth() !== b.getMonth()) return `${fmtDate(from, false)} – ${fmtDate(to)}`;
    return `${a.getDate()} – ${fmtDate(to)}`;
  }
  const fmtDays = n => `${String(n).replace(/\.0$/, "")} ${n === 1 ? "day" : "days"}`;

  return {
    TODAY, ME, MEMBERS, POLICIES, HOLIDAYS,
    get requests() { return requests; },
    memberById, policyById, days, workdays, excluded, balance, validate, overlaps,
    add, update, remove, restore, reset, subscribe: fn => (subs.add(fn), () => subs.delete(fn)),
    key, parse, addDays, isWeekend, fmtDate, fmtRange, fmtDays,
    /* For Timesheets: approved time off as day ranges, and policy names. */
    timesheetRanges: () => requests.filter(r => r.status === "approved").map(r => ({ m: r.m, type: r.policy, from: r.from, to: r.to, half: r.half })),
    policyNames: () => Object.fromEntries(POLICIES.map(p => [p.id, p.name])),
  };
})();
