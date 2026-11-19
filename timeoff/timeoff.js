/* Time off prototype: Calendar, Requests and Balances over the shared time off store
   (shared/time-off-store.js). Adding, editing, approving, rejecting, cancelling and deleting
   time off all work and persist in localStorage, so Timesheets picks them up. */
(() => {
  "use strict";
  const S = window.JibbleTimeOff;
  const $ = s => document.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const icon = (id, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const initials = n => { const w = n.split(" ").filter(x => !x.endsWith(".")); return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase(); };
  const avatar = (m, size = 32) => `<span class="avatar avatar--${size}${m.id === S.ME ? " avatar--me" : ""}" aria-hidden="true">${initials(m.name)}</span>`;
  const shortName = m => { const w = m.name.split(" "); return w.length > 1 ? `${w[0]} ${w[w.length - 1][0]}.` : w[0]; };
  const STATUS_LABEL = { pending: "Pending", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };
  const HALF_LABEL = { am: "Morning", pm: "Afternoon" };
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const TODAY = S.TODAY, THIS_YEAR = +TODAY.slice(0, 4);

  // ---------- Per-viewer preferences ----------
  const prefs = {
    get(k, d) { try { const v = localStorage.getItem("jb-to-" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("jb-to-" + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  const state = {
    view: "calendar",
    scope: prefs.get("scope", "org"),
    month: { y: THIS_YEAR, m: +TODAY.slice(5, 7) - 1 },
    hidden: new Set(prefs.get("hidden", [])),
    status: "pending", when: "upcoming", pol: new Set(), q: "", member: null,
    year: THIS_YEAR, balQ: "", balM: null,
  };

  // ---------- Scope ----------
  function scopeMembers() {
    if (state.scope === "personal") return S.MEMBERS.filter(m => m.id === S.ME);
    if (state.scope === "managed") return S.MEMBERS.filter(m => m.managed);
    return S.MEMBERS.slice();
  }
  const inScope = () => new Set(scopeMembers().map(m => m.id));

  // ---------- Menus ----------
  let openMenu = null;
  function toggleMenu(btn, menu) {
    const was = openMenu && openMenu.menu === menu;
    closeMenus(false);
    if (was) return;
    menu.hidden = false; btn.setAttribute("aria-expanded", "true"); openMenu = { btn, menu };
    menu.style.translate = "";
    const r = menu.getBoundingClientRect();
    if (r.right > innerWidth - 8) menu.style.translate = `${innerWidth - 8 - r.right}px 0`;
    const first = menu.querySelector("input, [role=option], button"); if (first) first.focus();
  }
  function closeMenus(refocus) {
    if (!openMenu) return;
    openMenu.menu.hidden = true; openMenu.btn.setAttribute("aria-expanded", "false");
    if (refocus) openMenu.btn.focus();
    openMenu = null;
  }
  document.addEventListener("click", e => {
    if (openMenu && !openMenu.menu.contains(e.target) && !openMenu.btn.contains(e.target)) closeMenus(false);
  });

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
  function showDrawer(el, focusSel) {
    if (openDrawer && openDrawer !== el) openDrawer.hidden = true;
    else drawerReturn = document.activeElement;
    closeMenus(false);
    el.classList.remove("is-closing"); $("#scrim").classList.remove("is-closing");
    $("#scrim").hidden = false; el.hidden = false; openDrawer = el;
    requestAnimationFrame(() => (el.querySelector(focusSel || "select, input, textarea, button:not([data-close])") || el.querySelector("[data-close]")).focus());
  }
  function hideDrawer() {
    if (!openDrawer) return;
    animateOut(openDrawer, $("#scrim")); openDrawer = null;
    if (drawerReturn && document.contains(drawerReturn)) drawerReturn.focus();
    drawerReturn = null;
  }
  $("#scrim").addEventListener("click", hideDrawer);
  document.addEventListener("click", e => { if (e.target.closest("[data-close]")) { e.preventDefault(); hideDrawer(); } });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (openMenu) { e.preventDefault(); closeMenus(true); return; }
      if (openDrawer && !document.querySelector("dialog[open]")) { e.preventDefault(); hideDrawer(); }
      return;
    }
    if (e.key === "Tab" && openDrawer) { // keep focus inside the open drawer
      const f = $$("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex='0']", openDrawer).filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg, action, fn) {
    const t = $("#toast");
    t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ""}`;
    t.hidden = false;
    if (action) t.querySelector("button").onclick = () => { fn(); t.hidden = true; };
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, action ? 6000 : 3200);
  }

  // ---------- Roving radio groups ----------
  function roving(group, sel, onPick) {
    group.addEventListener("click", e => { const b = e.target.closest(sel); if (b) pick(b); });
    group.addEventListener("keydown", e => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      const items = $$(sel, group), i = items.indexOf(document.activeElement);
      const n = items[(i + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + items.length) % items.length];
      pick(n); n.focus();
    });
    function pick(b) {
      $$(sel, group).forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.tabIndex = on ? 0 : -1; });
      onPick(b);
    }
  }
  const setRadio = (group, sel, match) => $$(sel, group).forEach(x => { const on = match(x); x.setAttribute("aria-checked", on); x.tabIndex = on ? 0 : -1; });

  // ---------- Routing ----------
  const VIEWS = ["calendar", "requests", "balances"];
  function route() {
    const v = (location.hash.match(/^#\/(\w+)/) || [])[1];
    state.view = VIEWS.includes(v) ? v : "calendar";
    VIEWS.forEach(x => {
      const tab = $(`#viewTabs [data-view="${x}"]`), on = x === state.view;
      tab.setAttribute("aria-selected", on); tab.tabIndex = on ? 0 : -1;
      $("#view" + x[0].toUpperCase() + x.slice(1)).hidden = !on;
    });
    // One toolbar row: scope switch lives at the start of the active view's first bar
    $("#view" + state.view[0].toUpperCase() + state.view.slice(1) + " .bar__group").prepend($("#scopeSeg"));
    document.title = `Jibble - Time off · ${state.view[0].toUpperCase() + state.view.slice(1)}`;
    closeMenus(false);
    render();
  }
  addEventListener("hashchange", route);
  $("#viewTabs").addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const i = VIEWS.indexOf(state.view) + (e.key === "ArrowRight" ? 1 : -1);
    location.hash = "#/" + VIEWS[(i + 3) % 3];
    requestAnimationFrame(() => $(`#viewTabs [data-view="${state.view}"]`).focus());
  });

  // ---------- Render ----------
  function render() {
    renderPendingCount();
    if (state.view === "calendar") renderCalendar();
    else if (state.view === "requests") renderRequests();
    else renderBalances();
  }
  function renderPendingCount() {
    const ids = inScope();
    const n = S.requests.filter(r => r.status === "pending" && ids.has(r.m)).length;
    const pill = $("#pendingCount");
    pill.hidden = !n; pill.textContent = n; pill.setAttribute("aria-label", `${n} pending`);
    $("#nPending").textContent = n || "";
  }

  // ---------- Calendar ----------
  function monthDays() {
    const { y, m } = state.month;
    const first = new Date(y, m, 1, 12), last = new Date(y, m + 1, 0, 12);
    const start = S.addDays(S.key(first), -((first.getDay() + 6) % 7));
    const end = S.addDays(S.key(last), (7 - last.getDay()) % 7);
    const out = [];
    for (let k = start; k <= end; k = S.addDays(k, 1)) out.push(k);
    return out;
  }
  function eventsOn(k, ids) {
    if (S.isWeekend(k) || S.HOLIDAYS[k]) return [];
    return S.requests
      .filter(r => (r.status === "approved" || r.status === "pending") && ids.has(r.m) && !state.hidden.has(r.policy) && r.from <= k && r.to >= k)
      .sort((a, b) => (a.status === b.status ? 0 : a.status === "approved" ? -1 : 1) || S.memberById(a.m).name.localeCompare(S.memberById(b.m).name));
  }
  function evBtn(r, long) {
    const m = S.memberById(r.m), p = S.policyById(r.policy);
    const label = `${m.name}, ${p.name}${r.half ? `, ${HALF_LABEL[r.half].toLowerCase()} only` : ""}, ${STATUS_LABEL[r.status].toLowerCase()}`;
    const meta = long ? `<span class="ev__meta">${esc(p.name)}${r.half ? ` · ${HALF_LABEL[r.half]}` : ""}${r.status === "pending" ? " · Pending" : ""}</span>` : (r.half ? `<span class="ev__half">½</span>` : "");
    return `<button type="button" class="ev ev--${r.status}" style="--c:${p.color}" data-rid="${r.id}" aria-label="${esc(label)}" title="${esc(label)}"><span class="dot"></span><span class="ev__name">${esc(long ? m.name : shortName(m))}</span>${meta}</button>`;
  }
  function renderCalendar() {
    const { y, m } = state.month, ids = inScope();
    $("#monLabel").textContent = `${MONTHS[m]} ${y}`;
    $("#monToday").hidden = y === THIS_YEAR && m === +TODAY.slice(5, 7) - 1;
    const days = monthDays(), MAX = 3;
    let html = `<div role="row" style="display:contents">${DOW.map(d => `<div class="cal__dow" role="columnheader">${d}</div>`).join("")}</div>`;
    for (let w = 0; w < days.length; w += 7) {
      html += `<div role="row" style="display:contents">` + days.slice(w, w + 7).map(k => {
        const d = S.parse(k), out = d.getMonth() !== m, hol = S.HOLIDAYS[k];
        const ev = eventsOn(k, ids), shown = ev.length > MAX + 1 ? ev.slice(0, MAX) : ev;
        const cls = ["cal__day", S.isWeekend(k) && "is-weekend", out && "is-out", k === TODAY && "is-today", hol && "is-hol"].filter(Boolean).join(" ");
        return `<div class="${cls}" role="gridcell" data-day="${k}" aria-label="${esc(S.fmtDate(k))}${hol ? ", " + esc(hol) : ""}${ev.length ? `, ${ev.length} off` : ""}">
          <div class="cal__top"><span class="cal__num"${k === TODAY ? ' aria-current="date"' : ""}>${d.getDate()}</span>${hol ? `<span class="cal__hol" title="${esc(hol)}">${esc(hol)}</span>` : ""}</div>
          ${shown.map(r => evBtn(r)).join("")}
          ${ev.length > shown.length ? `<button type="button" class="cal__more" data-more="${k}">+${ev.length - shown.length} more</button>` : ""}
          <button type="button" class="cal__add" data-add-day="${k}" aria-label="Add time off on ${esc(S.fmtDate(k))}" title="Add time off">${icon("plus")}</button>
        </div>`;
      }).join("") + `</div>`;
    }
    $("#cal").innerHTML = html;
    if (!$("#calLegend")) $("#cal").insertAdjacentHTML("afterend", `<div class="cal-legend" id="calLegend" aria-hidden="true">
      <span><span class="ev ev--approved" style="--c:var(--ink-subtle)"><span class="dot"></span>Approved</span></span>
      <span><span class="ev ev--pending" style="--c:var(--ink-subtle)"><span class="dot"></span>Pending</span></span>
      <span>Weekends and public holidays are not counted as time off.</span></div>`);
    renderLegendMenu();
  }
  function renderLegendMenu() {
    const n = state.hidden.size;
    $("#legendCount").hidden = !n; $("#legendCount").textContent = S.POLICIES.length - n;
    $("#legendMenu").innerHTML = S.POLICIES.map(p => `<label class="menu__opt"><input type="checkbox" data-pol="${p.id}" ${state.hidden.has(p.id) ? "" : "checked"}><span class="box">${icon("check")}</span><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</label>`).join("")
      + `<div class="menu__foot"><button type="button" class="link-btn" data-legend="all">Show all</button><button type="button" class="link-btn" data-legend="paid">Only paid</button></div>`;
  }
  $("#legendBtn").addEventListener("click", () => toggleMenu($("#legendBtn"), $("#legendMenu")));
  $("#legendMenu").addEventListener("change", e => {
    const id = e.target.dataset.pol; if (!id) return;
    e.target.checked ? state.hidden.delete(id) : state.hidden.add(id);
    prefs.set("hidden", [...state.hidden]); renderCalendarKeepMenu();
  });
  $("#legendMenu").addEventListener("click", e => {
    const b = e.target.closest("[data-legend]"); if (!b) return;
    state.hidden = new Set(b.dataset.legend === "all" ? [] : S.POLICIES.filter(p => !p.paid).map(p => p.id));
    prefs.set("hidden", [...state.hidden]); renderCalendarKeepMenu(b.dataset.legend);
  });
  function renderCalendarKeepMenu(focusLegend) {
    const active = document.activeElement?.dataset?.pol;
    renderCalendar();
    const f = active ? $(`#legendMenu [data-pol="${active}"]`) : focusLegend ? $(`#legendMenu [data-legend="${focusLegend}"]`) : null;
    if (f) f.focus();
  }
  function stepMonth(n) { const d = new Date(state.month.y, state.month.m + n, 1); state.month = { y: d.getFullYear(), m: d.getMonth() }; renderCalendar(); }
  $("#monPrev").addEventListener("click", () => stepMonth(-1));
  $("#monNext").addEventListener("click", () => stepMonth(1));
  $("#monToday").addEventListener("click", () => { state.month = { y: THIS_YEAR, m: +TODAY.slice(5, 7) - 1 }; renderCalendar(); $("#monNext").focus(); });
  $("#cal").addEventListener("click", e => {
    const ev = e.target.closest("[data-rid]"); if (ev) { openDetail(ev.dataset.rid); return; }
    const more = e.target.closest("[data-more]"); if (more) { openDay(more.dataset.more); return; }
    const add = e.target.closest("[data-add-day]"); if (add) { openAdd({ date: add.dataset.addDay }); return; }
  });
  $("#cal").addEventListener("dblclick", e => {
    if (e.target.closest("button")) return;
    const c = e.target.closest("[data-day]"); if (c) openAdd({ date: c.dataset.day });
  });

  function openDay(k) {
    const ev = eventsOn(k, inScope()), hol = S.HOLIDAYS[k];
    $("#dayTitle").textContent = S.fmtDate(k);
    $("#dayBody").innerHTML = (hol ? `<p class="day-hol">Public holiday: ${esc(hol)}</p>` : "")
      + (ev.length ? `<ul class="day-list">${ev.map(r => `<li>${evBtn(r, true)}</li>`).join("")}</ul>` : `<p class="panel-note">No one is off.</p>`);
    $("#dayAdd").dataset.day = k;
    showDrawer($("#dayDrawer"), ".ev");
  }
  $("#dayBody").addEventListener("click", e => { const b = e.target.closest("[data-rid]"); if (b) openDetail(b.dataset.rid); });
  $("#dayAdd").addEventListener("click", e => openAdd({ date: e.currentTarget.dataset.day }));

  // ---------- Requests ----------
  function filteredRequests() {
    const ids = inScope(), mon = TODAY.slice(0, 7), yr = String(THIS_YEAR), q = state.q.trim().toLowerCase();
    return S.requests.filter(r => {
      if (!ids.has(r.m)) return false;
      if (state.member && r.m !== state.member) return false;
      if (state.status === "pending" && r.status !== "pending") return false;
      if (state.status === "approved" && r.status !== "approved") return false;
      if (state.status === "declined" && !["rejected", "cancelled"].includes(r.status)) return false;
      if (state.when === "upcoming" && r.to < TODAY) return false;
      if (state.when === "month" && !(r.from.slice(0, 7) <= mon && r.to.slice(0, 7) >= mon)) return false;
      if (state.when === "year" && !(r.from.slice(0, 4) <= yr && r.to.slice(0, 4) >= yr)) return false;
      if (state.pol.size && !state.pol.has(r.policy)) return false;
      if (q && !S.memberById(r.m).name.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => state.when === "upcoming" ? a.from.localeCompare(b.from) : b.from.localeCompare(a.from));
  }
  function renderRequests() {
    const list = filteredRequests();
    $("#reqBody").innerHTML = list.map(r => {
      const m = S.memberById(r.m), p = S.policyById(r.policy), d = S.days(r);
      return `<tr data-rid="${r.id}">
        <td class="c-member"><div class="mem">${avatar(m)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span></div></td>
        <td><span class="pol"><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</span>${r.note ? `<span class="sub note" title="${esc(r.note)}">${esc(r.note)}</span>` : ""}</td>
        <td>${esc(S.fmtRange(r.from, r.to))}${r.half ? `<span class="sub">Half day · ${HALF_LABEL[r.half].toLowerCase()}</span>` : ""}</td>
        <td class="c-num">${String(d)}</td>
        <td><span class="tag tag--${r.status}">${STATUS_LABEL[r.status]}</span></td>
        <td>${esc(S.fmtDate(r.created))}${r.decidedAt && r.status !== "pending" ? `<span class="sub">${STATUS_LABEL[r.status]} ${esc(S.fmtDate(r.decidedAt, false))}</span>` : ""}</td>
        <td class="c-acts">${r.status === "pending" ? `<span class="acts-row">
          <button type="button" class="btn btn--outlined btn--sm" data-act="reject" aria-label="Reject ${esc(m.name)}’s ${esc(p.name)}">Reject</button>
          <button type="button" class="btn btn--approve btn--sm" data-act="approve" aria-label="Approve ${esc(m.name)}’s ${esc(p.name)}">${icon("check", "i i-16")}Approve</button></span>`
          : `<button type="button" class="round-btn round-btn--36" data-act="open" aria-label="Open ${esc(m.name)}’s ${esc(p.name)}">${icon("chevron-right")}</button>`}</td>
      </tr>`;
    }).join("");
    const empty = $("#reqEmpty"), filtered = state.q || state.pol.size || state.member;
    empty.hidden = !!list.length;
    $("#reqTable").closest(".tbl-wrap").hidden = !list.length;
    if (!list.length) empty.innerHTML = state.status === "pending" && !filtered
      ? `<strong>Nothing waiting on you</strong>New time off requests from your team show up here for approval.`
      : `<strong>No time off matches</strong>Try another status, date range or filter.`;
    const polN = state.pol.size;
    $("#polCount").hidden = !polN; $("#polCount").textContent = polN;
    $("#polMenu").innerHTML = S.POLICIES.map(p => `<label class="menu__opt"><input type="checkbox" data-pol="${p.id}" ${state.pol.has(p.id) ? "checked" : ""}><span class="box">${icon("check")}</span><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</label>`).join("");
    $("#memberChip").hidden = !state.member;
    if (state.member) $("#memberChipLabel").textContent = S.memberById(state.member).name;
    $("#reqClear").hidden = !filtered;
    $("#whenLabel").textContent = { upcoming: "Upcoming", month: "This month", year: "This year", all: "Any time" }[state.when];
    $$("#whenMenu [data-when]").forEach(o => o.setAttribute("aria-selected", o.dataset.when === state.when));
    setRadio($("#statusSeg"), ".seg__opt", x => x.dataset.status === state.status);
  }
  roving($("#statusSeg"), ".seg__opt", b => { state.status = b.dataset.status; renderRequests(); });
  $("#reqSearch").addEventListener("input", e => { state.q = e.target.value; renderRequests(); });
  $("#whenBtn").addEventListener("click", () => toggleMenu($("#whenBtn"), $("#whenMenu")));
  $("#whenMenu").addEventListener("click", e => { const o = e.target.closest("[data-when]"); if (!o) return; state.when = o.dataset.when; closeMenus(true); renderRequests(); });
  $("#polBtn").addEventListener("click", () => toggleMenu($("#polBtn"), $("#polMenu")));
  $("#polMenu").addEventListener("change", e => {
    const id = e.target.dataset.pol; if (!id) return;
    e.target.checked ? state.pol.add(id) : state.pol.delete(id);
    renderRequests(); $(`#polMenu [data-pol="${id}"]`).focus();
  });
  $("#memberChip").addEventListener("click", () => { state.member = null; renderRequests(); $("#reqSearch").focus(); });
  $("#reqClear").addEventListener("click", () => { state.q = ""; $("#reqSearch").value = ""; state.pol.clear(); state.member = null; renderRequests(); $("#reqSearch").focus(); });
  $("#reqBody").addEventListener("click", e => {
    const tr = e.target.closest("tr[data-rid]"); if (!tr) return;
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "approve") decide(tr.dataset.rid, "approved");
    else if (act === "reject") decide(tr.dataset.rid, "rejected");
    else openDetail(tr.dataset.rid);
  });

  function decide(id, status, extra = {}) {
    const r = S.requests.find(x => x.id === id), before = { status: r.status, decidedBy: r.decidedBy, decidedAt: r.decidedAt, reason: r.reason };
    const m = S.memberById(r.m), p = S.policyById(r.policy);
    let over = "";
    if (status === "approved" && p.allowance != null) {
      const b = S.balance(r.m, r.policy, r.from.slice(0, 4), r.id), need = S.workdays(r.from, r.to, r.half, r.from.slice(0, 4));
      if (need > b.available) over = ` It goes ${S.fmtDays(need - b.available)} over ${m.name.split(" ")[0]}’s allowance.`;
    }
    S.update(id, { status, ...extra });
    const verb = { approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" }[status];
    toast(`${verb} ${m.name}’s ${p.name}.${over}`, "Undo", () => S.update(id, before));
  }

  // CSV export of what the Requests table shows
  $("#exportBtn").addEventListener("click", () => {
    const list = filteredRequests();
    if (!list.length) { toast("Nothing to export with these filters."); return; }
    const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Member", "Position", "Policy", "Start date", "End date", "Half day", "Working days", "Status", "Requested", "Note"]]
      .concat(list.map(r => { const m = S.memberById(r.m); return [m.name, m.pos, S.policyById(r.policy).name, r.from, r.to, r.half ? HALF_LABEL[r.half] : "", S.days(r), STATUS_LABEL[r.status], r.created, r.note]; }));
    const blob = new Blob([rows.map(r => r.map(q).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `time-off-requests-${TODAY}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Exported ${list.length} ${list.length === 1 ? "request" : "requests"}.`);
  });

  // ---------- Balances ----------
  const num = v => String(+v.toFixed(1));
  const signed = v => v > 0 ? "+" + num(v) : num(v);
  const unit = v => Math.abs(v) === 1 ? "Day" : "Days";
  function balMembers() {
    const q = state.balQ.trim().toLowerCase();
    return scopeMembers().filter(m => !q || m.name.toLowerCase().includes(q));
  }
  function renderBalances() {
    const y = String(state.year), members = balMembers();
    $("#yearLabel").textContent = y;
    $("#yearNext").disabled = state.year >= THIS_YEAR + 1;
    if (!members.some(m => m.id === state.balM)) state.balM = members[0]?.id || null;
    $("#balMembers").innerHTML = members.map(m => `<li role="option" class="bal-mem" tabindex="${m.id === state.balM ? 0 : -1}" aria-selected="${m.id === state.balM}" data-m="${m.id}">
      <div class="mem">${avatar(m)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span></div></li>`).join("");
    $("#balEmpty").hidden = !!members.length;
    $("#balEmpty").innerHTML = `<strong>No members match “${esc(state.balQ)}”</strong>Check the spelling or clear the search.`;
    const m = S.memberById(state.balM);
    $(".bal-main").hidden = !m;
    if (!m) return;
    $("#balWho").innerHTML = `${avatar(m, 40)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span>`;
    const period = `Jan 1 – Dec 31, ${y}`;
    $("#balBody").innerHTML = S.POLICIES.map(p => {
      const b = S.balance(m.id, p.id, y), used = b.taken + b.planned, capped = p.allowance != null;
      const usedSub = [b.planned && `${num(b.planned)} planned`, b.pending && `${num(b.pending)} pending`].filter(Boolean).join(" · ");
      const balCell = capped
        ? `<span class="bal__v${b.available < 0 ? " is-neg" : b.available <= Math.max(1, p.allowance * 0.1) ? " is-low" : ""}">${num(b.available)} ${unit(b.available)}</span>`
        : `<span class="bal__v bal__v--none">No limit</span>`;
      return `<tr data-p="${p.id}">
        <th scope="row"><span class="pol"><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</span><span class="sub">${capped ? period : "Not capped"}</span></th>
        <td class="c-num">${capped ? num(b.carryover) : "–"}</td>
        <td class="c-num">${capped ? num(p.allowance) : "–"}</td>
        <td class="c-num">${capped ? (b.amend ? signed(b.amend) : "0") : "–"}</td>
        <td class="c-num">${num(used)}${usedSub ? `<span class="sub">${usedSub}</span>` : ""}</td>
        <td class="c-num">${balCell}</td>
        <td class="c-acts"><span class="row-acts">
          ${capped ? `<button class="round-btn round-btn--36" data-amend aria-label="Adjust ${esc(p.name)} balance for ${esc(m.name)}" title="Adjust balance"><svg class="i i-16"><use href="#i-pencil"/></svg></button>` : ""}
          <button class="round-btn round-btn--36" data-reqs aria-label="Show ${esc(p.name)} requests for ${esc(m.name)}" title="Show requests"><svg class="i i-16"><use href="#i-history"/></svg></button>
        </span></td></tr>`;
    }).join("");
  }
  $("#yearPrev").addEventListener("click", () => { state.year--; renderBalances(); });
  $("#yearNext").addEventListener("click", () => { state.year++; renderBalances(); });
  $("#balSearch").addEventListener("input", e => { state.balQ = e.target.value; renderBalances(); });
  function pickBalMember(id, focus) {
    state.balM = id; renderBalances();
    if (focus) $(`#balMembers [data-m="${id}"]`)?.focus();
  }
  $("#balMembers").addEventListener("click", e => { const li = e.target.closest(".bal-mem"); if (li) pickBalMember(li.dataset.m); });
  $("#balMembers").addEventListener("keydown", e => {
    const items = $$(".bal-mem", $("#balMembers")), i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const go = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (go != null) { e.preventDefault(); const t = items[Math.max(0, Math.min(items.length - 1, go))]; pickBalMember(t.dataset.m, true); }
  });
  $("#balBody").addEventListener("click", e => {
    const tr = e.target.closest("tr[data-p]"); if (!tr) return;
    if (e.target.closest("[data-amend]")) openAmend(tr.dataset.p);
    else if (e.target.closest("[data-reqs]")) {
      state.member = state.balM; state.pol = new Set([tr.dataset.p]); state.status = "all"; state.when = state.year === THIS_YEAR ? "year" : "all";
      state.q = ""; $("#reqSearch").value = "";
      location.hash = "#/requests";
    }
  });

  // Adjust balance drawer
  let amd = null;
  function renderAmend() {
    const { m, p, y } = amd, b = S.balance(m.id, p.id, y), list = S.amendmentsFor(m.id, p.id, y);
    $("#amdTitle").textContent = `Adjust ${p.name}`;
    $("#amdSummary").innerHTML = `<strong>${esc(m.name)}</strong> · ${y}<br>${num(b.available)} of ${num(b.entitled)} ${b.entitled === 1 ? "day" : "days"} left (${num(p.allowance)} entitled${b.carryover ? `, ${num(b.carryover)} carried over` : ""}${b.amend ? `, ${signed(b.amend)} adjusted` : ""})`;
    $("#amdHistory").innerHTML = list.length ? `<h3 class="amd-sub">Adjustments in ${y}</h3><ul class="amd-list">${list.slice().reverse().map(a => `<li><b class="${a.days < 0 ? "is-neg" : ""}">${signed(a.days)} ${unit(a.days).toLowerCase()}</b><span>${esc(a.note || "No reason given")}</span><span class="sub">${S.fmtDate(a.at)} by ${esc(S.memberById(a.by)?.name || "Admin")}</span></li>`).join("")}</ul>` : "";
  }
  function openAmend(pid) {
    amd = { m: S.memberById(state.balM), p: S.policyById(pid), y: String(state.year) };
    $("#amdDays").value = 1; $("#amdNote").value = ""; $("#amdError").hidden = true;
    setRadio($("#amdDir"), ".seg__opt", x => x.dataset.dir === "1");
    renderAmend();
    showDrawer($("#amdDrawer"), "#amdDays");
  }
  roving($("#amdDir"), ".seg__opt", () => {});
  $("#amdForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = parseFloat($("#amdDays").value);
    if (!(v > 0) || v > 365 || (v * 2) % 1) { $("#amdError").textContent = "Enter a number of days from 0.5 to 365, in half days."; $("#amdError").hidden = false; $("#amdDays").focus(); return; }
    const dir = +$("#amdDir [aria-checked='true']").dataset.dir, d = v * dir;
    S.amend(amd.m.id, amd.p.id, amd.y, d, $("#amdNote").value.trim());
    hideDrawer();
    toast(`${num(v)} ${unit(v).toLowerCase()} ${d > 0 ? "added to" : "deducted from"} ${amd.m.name}’s ${amd.p.name}.`);
  });

  // ---------- Scope ----------
  setRadio($("#scopeSeg"), ".seg__opt", x => x.dataset.scope === state.scope);
  roving($("#scopeSeg"), ".seg__opt", b => {
    state.scope = b.dataset.scope; prefs.set("scope", state.scope);
    if (state.member && !inScope().has(state.member)) state.member = null;
    render();
  });

  // ---------- Detail drawer ----------
  let detId = null, rejecting = false;
  function openDetail(id) { detId = id; rejecting = false; renderDetail(); showDrawer($("#detDrawer"), "#detFoot .btn--approve, #detFoot .btn--ink, #detFoot .btn"); }
  function renderDetail() {
    const r = S.requests.find(x => x.id === detId);
    if (!r) { hideDrawer(); return; }
    const m = S.memberById(r.m), p = S.policyById(r.policy), d = S.days(r), ex = S.excluded(r.from, r.to);
    const exTxt = [ex.weekend && `${ex.weekend} weekend ${ex.weekend === 1 ? "day" : "days"}`, ...ex.holidays].filter(Boolean).join(", ");
    $("#detTitle").textContent = p.name;
    let bal = "";
    if (p.allowance != null && (r.status === "pending" || r.status === "approved")) {
      const y = r.from.slice(0, 4), b = S.balance(r.m, r.policy, y, r.id), after = b.available - S.workdays(r.from, r.to, r.half, y);
      bal = `<p class="det-bal">${r.status === "pending" ? "If approved, " : ""}${esc(m.name.split(" ")[0])} ${r.status === "pending" ? "will have" : "has"} <strong>${after}</strong> of ${b.entitled} ${esc(p.short.toLowerCase())} days left in ${y}.${after < 0 ? " That is over the allowance." : ""}</p>`;
    }
    $("#detBody").innerHTML = `
      <div class="det-head">${avatar(m, 40)}<span class="mem__text"><span class="mem__name">${esc(m.name)}</span><span class="mem__role">${esc(m.pos)}</span></span></div>
      <dl class="kv-list">
        <dt>Status</dt><dd><span class="tag tag--${r.status}">${STATUS_LABEL[r.status]}</span></dd>
        <dt>Policy</dt><dd><span class="pol"><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</span>${p.paid ? "" : `<span class="sub">Unpaid</span>`}</dd>
        <dt>Dates</dt><dd>${esc(S.fmtRange(r.from, r.to))}${r.half ? ` · ${HALF_LABEL[r.half]}` : ""}</dd>
        <dt>Working days</dt><dd>${d}${exTxt ? `<span class="sub">Not counted: ${esc(exTxt)}</span>` : ""}</dd>
        ${r.note ? `<dt>Note</dt><dd>${esc(r.note)}</dd>` : ""}
        <dt>Requested</dt><dd>${esc(S.fmtDate(r.created))}</dd>
        ${r.decidedBy && r.status !== "pending" ? `<dt>${STATUS_LABEL[r.status]}</dt><dd>${esc(S.memberById(r.decidedBy).name)} · ${esc(S.fmtDate(r.decidedAt))}</dd>` : ""}
        ${r.reason ? `<dt>Reason</dt><dd>${esc(r.reason)}</dd>` : ""}
      </dl>
      ${bal}
      ${rejecting ? `<label class="field"><span class="field__label">Reason for rejecting <span class="field__aside">Optional, shown to ${esc(m.name.split(" ")[0])}</span></span><textarea id="rejReason" rows="3" maxlength="300" placeholder="Add a reason"></textarea></label>` : ""}`;
    const B = (act, label, cls) => `<button type="button" class="btn ${cls}" data-det="${act}">${label}</button>`;
    let foot;
    if (rejecting) foot = B("back", "Back", "btn--outlined") + B("reject-confirm", "Reject request", "btn--ink");
    else if (r.status === "pending") foot = B("edit", `${icon("pencil", "i i-16")}Edit`, "btn--outlined") + `<span class="spacer"></span>` + B("reject", "Reject", "btn--outlined") + B("approve", `${icon("check", "i i-16")}Approve`, "btn--approve");
    else if (r.status === "approved") foot = B("cancel", r.to < TODAY ? "Remove" : "Cancel time off", "btn--outlined btn--danger") + `<span class="spacer"></span>` + B("edit", `${icon("pencil", "i i-16")}Edit`, "btn--ink");
    else foot = B("delete", `${icon("trash", "i i-16")}Delete`, "btn--outlined btn--danger") + `<span class="spacer"></span>` + B("reopen", "Move back to pending", "btn--outlined");
    $("#detFoot").innerHTML = foot;
  }
  $("#detFoot").addEventListener("click", e => {
    const act = e.target.closest("[data-det]")?.dataset.det; if (!act) return;
    const id = detId;
    if (act === "approve") { decide(id, "approved"); hideDrawer(); }
    else if (act === "reject") { rejecting = true; renderDetail(); $("#rejReason").focus(); }
    else if (act === "back") { rejecting = false; renderDetail(); $("#detFoot [data-det=reject]").focus(); }
    else if (act === "reject-confirm") { decide(id, "rejected", { reason: $("#rejReason").value.trim() || undefined }); hideDrawer(); }
    else if (act === "cancel") { decide(id, "cancelled"); hideDrawer(); }
    else if (act === "reopen") { const r = S.requests.find(x => x.id === id), v = S.validate(r, id); if (v.error) { toast(v.error); return; } S.update(id, { status: "pending", decidedBy: null, decidedAt: null, reason: undefined }); renderDetail(); toast("Moved back to pending."); }
    else if (act === "delete") {
      const r = S.remove(id); hideDrawer();
      toast(`Deleted ${S.memberById(r.m).name}’s ${S.policyById(r.policy).name}.`, "Undo", () => S.restore(r));
    }
    else if (act === "edit") openAdd({ editId: id });
  });

  // ---------- Add / edit drawer ----------
  const F = { m: $("#fMember"), policy: $("#fPolicy"), from: $("#fFrom"), to: $("#fTo"), half: $("#fHalf"), note: $("#fNote") };
  enhanceDateInput(F.from, "Start date"); enhanceDateInput(F.to, "End date");
  enhanceSelectField(F.m, "Member"); enhanceSelectField(F.policy, "Policy");
  let editId = null, halfWhich = "am";
  function openAdd({ date, editId: id } = {}) {
    editId = id || null;
    const r = id ? S.requests.find(x => x.id === id) : null;
    const members = scopeMembers();
    if (r && !members.some(m => m.id === r.m)) members.push(S.memberById(r.m));
    F.m.innerHTML = (members.length > 1 ? `<option value="">Select a member</option>` : "") + members.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join("");
    F.m.value = r ? r.m : members.length === 1 ? members[0].id : "";
    F.m.disabled = !!r;
    F.policy.innerHTML = `<option value="">Select a policy</option>` + S.POLICIES.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("");
    F.policy.value = r ? r.policy : "";
    F.from.value = r ? r.from : date || "";
    F.to.value = r && r.to !== r.from ? r.to : "";
    F.half.checked = !!r?.half; halfWhich = r?.half || "am";
    F.note.value = r ? r.note : "";
    $("#addTitle").textContent = r ? "Edit time off" : "Add time off";
    $("#addSave").textContent = r ? "Save changes" : "Add time off";
    $("#addError").hidden = true;
    Object.values(F).forEach(f => f.removeAttribute("aria-invalid"));
    syncAdd();
    showDrawer($("#addDrawer"), r ? "#fPolicy" : F.m.value ? "#fPolicy" : "#fMember");
  }
  function draft() {
    return { m: F.m.value, policy: F.policy.value, from: F.from.value, to: F.to.value && F.to.value !== F.from.value ? F.to.value : "", half: F.half.checked ? halfWhich : null, note: F.note.value.trim() };
  }
  function syncAdd() {
    const d = draft();
    const single = !d.to;
    F.half.disabled = !single;
    if (!single) F.half.checked = false;
    F.half.closest(".check").title = single ? "" : "Half days are for single-day time off";
    $("#halfSeg").hidden = !F.half.checked;
    setRadio($("#halfSeg"), ".seg__opt", x => x.dataset.half === halfWhich);
    if (F.from.value) F.to.min = F.from.value; else F.to.removeAttribute("min");
    // Balance hint next to the policy label
    const p = d.policy && S.policyById(d.policy), y = (d.from || TODAY).slice(0, 4);
    if (p && d.m) {
      const b = S.balance(d.m, d.policy, y, editId);
      $("#fPolicyAside").textContent = p.allowance == null ? `No limit · ${b.taken + b.planned} booked in ${y}` : `${b.available} of ${b.entitled} days left in ${y}`;
    } else $("#fPolicyAside").textContent = "";
    // Live summary
    const sum = $("#fSummary");
    if (!d.from || !d.m || !d.policy) { sum.hidden = true; return; }
    const v = S.validate(d, editId), ex = S.excluded(d.from, d.to || d.from);
    const exTxt = [ex.weekend && `${ex.weekend} weekend ${ex.weekend === 1 ? "day" : "days"}`, ...ex.holidays].filter(Boolean).join(", ");
    sum.hidden = false;
    sum.classList.toggle("is-warn", !!v.error);
    if (v.error) { sum.innerHTML = `<strong>Can’t book this yet</strong><span class="sub">${esc(v.error)}</span>`; return; }
    let after = "";
    if (p.allowance != null) { const b = S.balance(d.m, d.policy, y, editId); after = ` · ${b.available - S.workdays(d.from, d.to || d.from, d.half, y)} of ${b.entitled} left after this`; }
    sum.innerHTML = `<strong>${esc(S.fmtDays(v.days))} of ${esc(p.name)}</strong><span class="sub">${esc(S.fmtRange(d.from, d.to || d.from))}${exTxt ? ` · not counting ${esc(exTxt)}` : ""}${esc(after)}</span>`;
  }
  ["change", "input"].forEach(t => $("#addForm").addEventListener(t, e => { if (e.target !== F.note) { e.target.removeAttribute("aria-invalid"); $("#addError").hidden = true; syncAdd(); } }));
  roving($("#halfSeg"), ".seg__opt", b => { halfWhich = b.dataset.half; syncAdd(); });
  $("#addForm").addEventListener("submit", e => {
    e.preventDefault();
    const d = draft(), v = S.validate(d, editId);
    if (v.error) {
      const err = $("#addError"); err.textContent = v.error; err.hidden = false;
      const f = F[v.field]; if (f) { f.setAttribute("aria-invalid", "true"); f.focus(); }
      return;
    }
    const m = S.memberById(d.m);
    if (editId) {
      const r = S.requests.find(x => x.id === editId), before = { policy: r.policy, from: r.from, to: r.to, half: r.half, note: r.note };
      S.update(editId, { policy: d.policy, from: d.from, to: d.to || d.from, half: d.half, note: d.note });
      hideDrawer(); toast(`Saved ${m.name}’s time off.`, "Undo", () => S.update(r.id, before));
    } else {
      const r = S.add(d);
      hideDrawer();
      toast(`Added ${S.fmtDays(v.days)} of ${S.policyById(d.policy).name} for ${m.name}.`, "Undo", () => S.remove(r.id));
      if (state.view === "calendar") { const t = S.parse(d.from); state.month = { y: t.getFullYear(), m: t.getMonth() }; renderCalendar(); }
    }
  });
  document.addEventListener("click", e => { if (e.target.closest("[data-add]")) openAdd({}); });

  // Re-render whenever the store changes (also keeps an open detail drawer current)
  S.subscribe(() => { render(); if (openDrawer === $("#detDrawer")) renderDetail(); });
  addEventListener("storage", e => { if (e.key === "jb-timeoff-v1") location.reload(); });

  // ---------- Shell: sidebar ----------
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
  });
  requestAnimationFrame(() => requestAnimationFrame(() => $("#app").classList.add("is-ready")));

  // ---------- Shell: top-bar clock (same controls as the other pages, kept simple here) ----------
  const ACTIVITIES = [
    { id: "dev", name: "Development", color: "var(--ap-violet)" }, { id: "des", name: "Design", color: "var(--ap-green)" },
    { id: "res", name: "Research", color: "var(--ap-pink)" }, { id: "test", name: "Testing", color: "var(--ap-turquoise)" },
    { id: "meet", name: "Meetings", color: "var(--ap-red)" }, { id: "mgmt", name: "Management", color: "var(--ap-blue)" },
    { id: "sup", name: "Support", color: "var(--ap-orange)" }, { id: "mkt", name: "Marketing", color: "var(--ap-purple)" },
  ];
  const PROJECTS = [
    { id: "web", name: "Website refresh", color: "var(--ap-violet)" }, { id: "app", name: "Mobile app", color: "var(--ap-green)" },
    { id: "onb", name: "Client onboarding", color: "var(--ap-pink)" }, { id: "desk", name: "Support desk", color: "var(--ap-turquoise)" },
    { id: "none", name: "No project", color: "var(--ap-none)" },
  ];
  const LOCATIONS = [{ id: "main", name: "NY Main Office" }, { id: "east", name: "NY East Office" }, { id: "post", name: "NY Post" }, { id: "remote", name: "Remote" }];
  const clock = { st: "out", activity: "meet", project: "app", since: null, lastOut: Date.now() - 4 * 60000, worked: 0 };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; };
  const fmtClock = ms => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  const ago = ms => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} ${m === 1 ? "minute" : "minutes"} ago` : `${Math.floor(m / 60)} h ago`; };
  const openClockPanel = createClockPanel([{ id: "none", name: "No activity" }, ...ACTIVITIES], PROJECTS, LOCATIONS, (act, f) => {
    if (act === "out") { if (clock.st === "in") clock.worked += Date.now() - clock.since; clock.st = "out"; clock.lastOut = Date.now(); }
    else {
      if (clock.st === "in") clock.worked += Date.now() - clock.since;
      clock.st = "in"; clock.since = Date.now(); clock.activity = f.activity || clock.activity; clock.project = f.project || clock.project;
    }
    renderClock();
    toast(act === "out" ? "Clocked out." : act === "switch" ? "Switched activity." : "Clocked in.");
  });
  function renderClock() {
    const st = clock.st, top = $("#topClockBtn");
    top.className = "round-btn " + (st === "in" ? "round-btn--stop" : "round-btn--go");
    top.setAttribute("aria-label", st === "in" ? "Clock out" : st === "break" ? "End break" : "Clock in");
    top.title = top.getAttribute("aria-label");
    top.innerHTML = icon(st === "in" ? "stop" : "play");
    $("#clockRun").hidden = st === "out";
    const rb = $("#runBreak");
    rb.innerHTML = icon(st === "break" ? "play" : "coffee");
    rb.className = "round-btn " + (st === "break" ? "round-btn--go" : "round-btn--break");
    rb.setAttribute("aria-label", st === "break" ? "End break" : "Start break"); rb.title = rb.getAttribute("aria-label");
    $("#activityLabel").textContent = ACTIVITIES.find(a => a.id === clock.activity)?.name ?? "No activity";
    $("#projectLabel").textContent = PROJECTS.find(p => p.id === clock.project)?.name ?? "No project";
    tickClock();
  }
  function tickClock() {
    const ms = clock.worked + (clock.st === "in" ? Date.now() - clock.since : 0), s = Math.floor(ms / 1000);
    $("#runTime").textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    $("#topLast").textContent = clock.st === "out" ? `Last out ${ago(clock.lastOut)}` : clock.st === "in" ? `In since ${fmtClock(clock.since)}` : `On break since ${fmtClock(clock.since)}`;
    $("#clockCtl").title = $("#topLast").textContent;
  }
  $("#topClockBtn").addEventListener("click", () => {
    if (clock.st === "break") { clock.st = "in"; clock.since = Date.now(); renderClock(); return; }
    openClockPanel(clock.st === "in" ? "out" : "in", nowMin(), clock.activity, clock.project, 0);
  });
  $("#runStop").addEventListener("click", () => openClockPanel("out", nowMin(), clock.activity, clock.project, 0));
  $("#runSwitch").addEventListener("click", () => openClockPanel("switch", nowMin(), clock.activity, clock.project, 0));
  $("#runBreak").addEventListener("click", () => {
    if (clock.st === "in") { clock.worked += Date.now() - clock.since; clock.st = "break"; }
    else { clock.st = "in"; }
    clock.since = Date.now(); renderClock();
  });
  [["#activityBtn", "#activityMenu", ACTIVITIES, "activity"], ["#projectBtn", "#projectMenu", PROJECTS, "project"]].forEach(([b, mSel, list, k]) => {
    const btn = $(b), menu = $(mSel);
    btn.addEventListener("click", () => {
      if (clock.st !== "out") { openClockPanel("switch", nowMin(), clock.activity, clock.project, 0); return; }
      menu.innerHTML = list.map(o => `<button class="menu__opt" role="option" data-id="${o.id}" aria-selected="${clock[k] === o.id}"><span class="dot" style="--c:${o.color}"></span>${esc(o.name)}${icon("check", "i i-16 tick")}</button>`).join("");
      toggleMenu(btn, menu);
    });
    menu.addEventListener("click", e => { const o = e.target.closest("[data-id]"); if (!o) return; clock[k] = o.dataset.id; closeMenus(true); renderClock(); });
  });
  setInterval(tickClock, 1000);
  renderClock();

  route();
})();
