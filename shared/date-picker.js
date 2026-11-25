/* Date picker (Figma "Date picker" 1352:517458): one card, three views. Days (Monday first) -> months -> years (a decade).
   The title steps up a view; the chevrons step a month, a year or a decade. Dates after `max` can't be picked.
   createDatePicker(trigger, { value, max, onChange }) turns `trigger` (a button) into the opener and
   returns { value, close }. Dates are local midnight Date objects. */
function createDatePicker(trigger, opts = {}) {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const day = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const today = day(new Date());
  let max = opts.max ? day(opts.max) : null;
  const chevron = d => `<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  let selected = day(opts.value || today), view = "days", cursor = new Date(selected); /* cursor: the date that has keyboard focus */

  const pop = document.createElement("div");
  pop.className = "dp";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Choose a date");
  pop.innerHTML = `<div class="dp__main"></div><div class="dp__foot is-hidden" inert><div><button type="button" class="dp__today" data-today></button></div></div>`;
  const main = pop.querySelector(".dp__main"), foot = pop.querySelector(".dp__foot"), footBtn = pop.querySelector("[data-today]");
  trigger.after(pop);
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-expanded", "false");

  const over = d => max && d > max;
  const decade = y => Math.floor(y / 10) * 10;
  const titles = () => view === "days" ? `${MONTHS[cursor.getMonth()].slice(0, 3)} ${cursor.getFullYear()}`
    : view === "months" ? String(cursor.getFullYear()) : `${decade(cursor.getFullYear())} – ${decade(cursor.getFullYear()) + 9}`;

  const render = () => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    let body = "";
    if (view === "days") {
      const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7; /* Monday-first offset */
      body = `<div class="dp__week">${WEEK.map(w => `<span aria-label="${w}"><span aria-hidden="true">${w[0]}</span></span>`).join("")}</div><div class="dp__grid dp__grid--days" role="grid">`;
      for (let i = 0; i < 42; i++) {
        const d = new Date(y, m, 1 - lead + i), out = d.getMonth() !== m, off = over(d);
        const cls = ["dp__cell", out && "is-out", same(d, today) && "is-today", same(d, selected) && "is-selected"].filter(Boolean).join(" ");
        body += `<button type="button" class="${cls}" data-t="${+d}" tabindex="${same(d, cursor) ? 0 : -1}" ${off ? "disabled" : ""} ${same(d, selected) ? 'aria-pressed="true"' : ""} aria-label="${d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}">${d.getDate()}</button>`;
      }
      body += "</div>";
    } else if (view === "months") {
      body = `<div class="dp__grid dp__grid--wide">${MONTHS.map((n, i) => {
        const on = selected.getFullYear() === y && selected.getMonth() === i, off = max && new Date(y, i, 1) > max;
        return `<button type="button" class="dp__cell dp__cell--wide${on ? " is-selected" : ""}${today.getFullYear() === y && today.getMonth() === i ? " is-today" : ""}" data-m="${i}" tabindex="${i === m ? 0 : -1}" ${off ? "disabled" : ""}>${n}</button>`;
      }).join("")}</div>`;
    } else {
      const start = decade(y);
      body = `<div class="dp__grid dp__grid--wide">${Array.from({ length: 10 }, (_, i) => start + i).map(yr => {
        const on = selected.getFullYear() === yr, off = max && yr > max.getFullYear();
        return `<button type="button" class="dp__cell dp__cell--wide${on ? " is-selected" : ""}${today.getFullYear() === yr ? " is-today" : ""}" data-y="${yr}" tabindex="${yr === y ? 0 : -1}" ${off ? "disabled" : ""}>${yr}</button>`;
      }).join("")}</div>`;
    }
    const step = view === "days" ? "month" : view === "months" ? "year" : "decade";
    const lastStep = max && (view === "days" ? new Date(y, m + 1, 1) > max : view === "months" ? y >= max.getFullYear() : decade(y) + 10 > max.getFullYear());
    main.innerHTML = `<div class="dp__head">
        <button type="button" class="dp__nav" data-nav="-1" aria-label="Previous ${step}">${chevron("M10 3.5L5.5 8l4.5 4.5")}</button>
        <button type="button" class="dp__title" data-up ${view === "years" ? "disabled" : ""} aria-live="polite">${titles()}</button>
        <button type="button" class="dp__nav" data-nav="1" aria-label="Next ${step}" ${lastStep ? "disabled" : ""}>${chevron("M6 3.5L10.5 8 6 12.5")}</button>
      </div>${body}`;
    /* Footer shortcut: "Today" when another day is picked, "Go to current month/year" when the view has moved away. Hidden otherwise. */
    const now = day(new Date());
    const act = view === "days" ? (y !== now.getFullYear() || m !== now.getMonth() ? ["Go to current month", "month"] : !same(selected, now) ? ["Today", "today"] : null)
      : view === "months" ? (y !== now.getFullYear() ? ["Go to current year", "year"] : null)
      : (decade(y) !== decade(now.getFullYear()) ? ["Go to current year", "year"] : null);
    if (act) { footBtn.textContent = act[0]; footBtn.dataset.todayAct = act[1]; }
    foot.classList.toggle("is-hidden", !act);
    foot.inert = !act;
  };

  const focusCell = () => main.querySelector('.dp__cell[tabindex="0"]')?.focus();
  const label = () => opts.empty && opts.empty() ? "Select a date" : same(selected, today) ? "Today" : selected.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: selected.getFullYear() === today.getFullYear() ? undefined : "numeric" });
  const paint = () => { const s = trigger.querySelector("span"); if (s) s.textContent = label(); };
  const isOpen = () => !pop.hidden;
  const close = refocus => {
    if (!isOpen()) return;
    pop.hidden = true; trigger.setAttribute("aria-expanded", "false");
    if (refocus) trigger.focus();
  };
  const open = () => {
    view = "days"; cursor = new Date(selected); render();
    pop.hidden = false; trigger.setAttribute("aria-expanded", "true");
    const box = trigger.getBoundingClientRect(), scroller = trigger.closest(".clock-dialog__body, dialog") || document.body, top = Math.max(0, scroller.getBoundingClientRect().top);
    pop.classList.toggle("is-up", window.innerHeight - box.bottom < pop.offsetHeight + 12 && box.top - top > pop.offsetHeight + 12);
    focusCell();
    pop.scrollIntoView({ block: "nearest" });
  };
  const choose = d => {
    d = day(d);
    if (over(d)) return;
    const changed = !same(d, selected);
    selected = d; paint(); close(true);
    if (changed) opts.onChange?.(new Date(d));
  };
  /* The picked date is clamped to `max`, so "Go to today" and chevrons never land on an unavailable day. */
  const clamp = d => max && d > max ? new Date(max) : d;

  trigger.addEventListener("click", () => isOpen() ? close(true) : open());
  pop.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t || t.disabled || foot.inert && t === footBtn) return;
    if (t.dataset.t) return choose(new Date(+t.dataset.t));
    if (t.dataset.m) { cursor = new Date(cursor.getFullYear(), +t.dataset.m, 1); view = "days"; }
    else if (t.dataset.y) { cursor = new Date(+t.dataset.y, cursor.getMonth(), 1); view = "months"; }
    else if (t.dataset.nav) {
      const n = +t.dataset.nav;
      cursor = view === "days" ? new Date(cursor.getFullYear(), cursor.getMonth() + n, 1)
        : view === "months" ? new Date(cursor.getFullYear() + n, cursor.getMonth(), 1) : new Date(cursor.getFullYear() + 10 * n, cursor.getMonth(), 1);
      cursor = clamp(cursor);
    } else if (t.hasAttribute("data-up")) view = view === "days" ? "months" : "years";
    else if (t.hasAttribute("data-today")) {
      const a = t.dataset.todayAct;
      if (a === "today") { choose(clamp(today)); return; }
      cursor = new Date(today); /* month or year: jump the view, keep the current picker view */
    }
    render();
    if (t.hasAttribute("data-today")) { (foot.inert ? main.querySelector("[data-up]:not(:disabled)") || main.querySelector("[data-nav]") : t).focus(); return; }
    if (t.dataset.nav) (main.querySelector(`[data-nav="${t.dataset.nav}"]:not(:disabled)`) || main.querySelector("[data-up]")).focus();
    else if (t.hasAttribute("data-up")) (main.querySelector("[data-up]:not(:disabled)") || main.querySelector("[data-nav]")).focus();
    else focusCell();
  });
  /* Keys: arrows move a day / a week (days view), PageUp/PageDown change month, Escape closes. */
  pop.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (!e.target.classList.contains("dp__cell")) return;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: view === "days" ? -7 : -3, ArrowDown: view === "days" ? 7 : 3 }[e.key];
    if (view === "days" && (e.key === "PageUp" || e.key === "PageDown")) {
      e.preventDefault(); cursor = clamp(new Date(cursor.getFullYear(), cursor.getMonth() + (e.key === "PageUp" ? -1 : 1), cursor.getDate())); render(); focusCell(); return;
    }
    if (delta === undefined) return;
    e.preventDefault();
    if (view === "days") cursor = clamp(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + delta));
    else if (view === "months") cursor = new Date(cursor.getFullYear(), Math.min(11, Math.max(0, cursor.getMonth() + delta)), 1);
    else { const s = decade(cursor.getFullYear()); cursor = new Date(Math.min(s + 9, Math.max(s, cursor.getFullYear() + delta)), cursor.getMonth(), 1); }
    render(); focusCell();
  });
  /* Disabled buttons swallow or retarget pointer events in some browsers, so "inside" is judged by the event path
     and by the popup's on-screen box, not by e.target alone. */
  const inside = e => {
    if (e.composedPath().some(n => n === pop || n === trigger)) return true;
    const r = pop.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };
  document.addEventListener("pointerdown", e => { if (isOpen() && !inside(e)) close(false); });
  /* A press or click on a disabled day does nothing, and nothing else on the page (the panel's backdrop-click close,
     other menus' outside-click close) should react to it either. Caught in the capture phase before they see it. */
  let pressing = false; /* a pointer is down inside the popup: focus may jump to the dialog, which must not count as leaving */
  ["pointerdown", "mousedown", "mouseup", "pointerup", "click"].forEach(type => window.addEventListener(type, e => {
    if (!isOpen() || e.clientX === undefined) return;
    const r = pop.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (type === "pointerdown" || type === "mousedown") pressing = true;
    else if (type === "pointerup" || type === "mouseup") setTimeout(() => { pressing = false; if (isOpen() && !pop.contains(document.activeElement)) focusCell(); }, 0);
    const t = e.target instanceof Element ? e.target.closest("button") : null;
    if (!pop.contains(e.target) || (t && t.disabled)) { e.stopPropagation(); if (type !== "pointerdown") e.preventDefault(); }
  }, true));
  /* Pressing anywhere in the popup (gaps, disabled days) must not pull focus out of it. */
  pop.addEventListener("mousedown", e => e.preventDefault());
  pop.addEventListener("focusout", e => { if (isOpen() && !pressing && e.relatedTarget && !pop.contains(e.relatedTarget) && !trigger.contains(e.relatedTarget)) close(false); });
  paint();

  return {
    get value() { return new Date(selected); },
    set value(d) { selected = day(d); cursor = new Date(selected); paint(); },
    set max(d) { max = d ? day(d) : null; paint(); },
    close
  };
}

/* Swap a native <input type="date"> for the clock-in panel's field + date picker. The input stays as the form value
   (ISO yyyy-mm-dd); its value, max, disabled and aria-invalid keep working, so existing form code doesn't change. */
function enhanceDateInput(input, label) {
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const wrap = document.createElement("div"), btn = document.createElement("button");
  wrap.className = "dp-wrap";
  btn.type = "button"; btn.className = "time-field time-field--static";
  btn.setAttribute("aria-label", label || "Date");
  btn.innerHTML = `<span></span><svg class="i" aria-hidden="true"><use href="#i-calendar"/></svg>`;
  input.after(wrap); wrap.append(btn); input.hidden = true; input.tabIndex = -1;
  const text = btn.firstChild;
  const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const picker = createDatePicker(btn, { empty: () => !parse(proto.get.call(input)), onChange: d => { setValue(iso(d)); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); } });
  const sync = () => {
    const d = parse(proto.get.call(input));
    text.style.color = d ? "" : "var(--ink-subtle)";
    btn.disabled = input.disabled;
    btn.classList.toggle("is-invalid", input.getAttribute("aria-invalid") === "true");
    picker.value = d || new Date();
    picker.max = parse(input.max);
  };
  const setValue = v => { proto.set.call(input, v); input.removeAttribute("aria-invalid"); sync(); };
  Object.defineProperty(input, "value", { get() { return proto.get.call(this); }, set(v) { proto.set.call(this, v); sync(); }, configurable: true });
  const dis = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "disabled");
  Object.defineProperty(input, "disabled", { get() { return dis.get.call(this); }, set(v) { dis.set.call(this, v); sync(); }, configurable: true });
  const mxd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "max");
  Object.defineProperty(input, "max", { get() { return mxd.get.call(this); }, set(v) { mxd.set.call(this, v); sync(); }, configurable: true });
  new MutationObserver(sync).observe(input, { attributes: true, attributeFilter: ["aria-invalid"] });
  sync();
}
