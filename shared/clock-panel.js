function createClockPanel(activities, projects, locations, onSave) {
  const dialog = document.createElement("dialog");
  dialog.className = "clock-dialog";
  dialog.id = "clockDialog";
  dialog.setAttribute("aria-labelledby", "clockDialogTitle");
  /* Layout follows Figma "Confirm clock in_Sidebar" (490:506122); field titles are kept for screen readers only. */
  const svg = d => `<svg class="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><path d="${d}"/></svg>`;
  dialog.innerHTML = `<form id="clockForm" novalidate>
    <header class="clock-dialog__head">
      <h2 id="clockDialogTitle">Clock in</h2>
      <button type="button" class="round-btn clock-dialog__close" id="clockClose" aria-label="Close panel">${svg("M4 4l8 8M12 4l-8 8")}</button>
    </header>
    <div class="clock-dialog__body">
    <div class="clock-member">
      <span class="avatar avatar--72 avatar--me" aria-hidden="true">JL</span>
      <span class="clock-member__text">
        <strong class="clock-member__name">Jane Long</strong>
        <span class="clock-member__meta" id="clockPanelStatus"></span>
        <span class="clock-member__chips"><span class="clock-member__chip" title="Clocking from">GMT−5</span><span class="clock-member__chip" title="Split time">12:00</span></span>
      </span>
    </div>
    <div class="seg seg--full" role="radiogroup" aria-label="Entry kind" id="clockKind">
      <button type="button" role="radio" class="seg__opt" data-kind="time" aria-checked="true">Time entry</button>
      <button type="button" role="radio" class="seg__opt" data-kind="hours" aria-checked="false" tabindex="-1">Hour entry</button>
    </div>
    <div class="clock-dialog__row">
    <div class="dp-wrap">
      <button type="button" class="time-field time-field--static" id="clockDate" aria-label="Date"><span>Today</span><svg class="i" aria-hidden="true"><use href="#i-calendar"/></svg></button>
    </div>
    <div class="tf" id="clockTimeWrap">
      <label class="tf__label" for="clockEntryTime">Time · Today</label>
      <span class="time-field">
        <input id="clockEntryTime" type="text" role="combobox" aria-expanded="false" aria-controls="clockTimeList" aria-describedby="clockTimeMsg" autocomplete="off" spellcheck="false" placeholder="h:mm" required>
        <button type="button" class="time-field__period" id="clockPeriod" aria-label="AM, press to switch to PM">AM</button>
        <button type="button" class="time-field__toggle" id="clockTimeToggle" tabindex="-1" aria-label="Choose a time"><svg class="i" aria-hidden="true"><use href="#i-clock"/></svg></button>
      </span>
      <div class="menu dd__menu tf__menu" id="clockTimeList" role="listbox" aria-label="Times" hidden></div>
      <span class="tf__msg" id="clockTimeMsg" aria-live="polite"></span>
    </div>
    <div class="tf" id="clockDurWrap" hidden>
      <label class="tf__label" for="clockDur">Duration</label>
      <input id="clockDur" type="text" inputmode="numeric" autocomplete="off" placeholder="hh:mm" maxlength="5" pattern="\\d{1,2}:\\d{2}" aria-describedby="clockDurMsg">
      <span class="tf__msg" id="clockDurMsg" aria-live="polite"></span>
    </div>
    </div>
    <div id="clockWorkFields">
      <div class="dd" id="clockActivity" data-label="Activity" data-placeholder="Select an activity" data-chip="color"></div>
      <div class="dd" id="clockProject" data-label="Project" data-placeholder="Select a project" data-chip="grey"></div>
    </div>
    <div class="dd" id="clockLocation" data-label="Location" data-placeholder="Select a location"></div>
    <textarea id="clockNote" placeholder="Add a note" aria-label="Note (optional)"></textarea>
    </div>
    <div class="clock-dialog__actions">
      <button type="button" class="btn btn--outlined" id="clockCancel">Cancel</button>
      <button type="submit" class="btn btn--ink">Confirm</button>
    </div>
  </form>`;
  document.body.append(dialog);
  const field = id => dialog.querySelector("#" + id);
  const location = createDropdownField(field("clockLocation"), locations);
  const activity = createDropdownField(field("clockActivity"), activities);
  const project = createDropdownField(field("clockProject"), projects);
  const note = field("clockNote");
  const time = createTimeField(field("clockEntryTime"), field("clockPeriod"), field("clockTimeToggle"), field("clockTimeList"), field("clockTimeMsg"));
  /* Date picker (Figma 1352:517458). Today keeps the live time range; an earlier day allows any time and starts at 9:00 am. */
  let timeRange = [0, 1439];
  const datePicker = createDatePicker(field("clockDate"), { max: new Date(), onChange: date => {
    const isToday = date.toDateString() === new Date().toDateString();
    field("clockEntryTime").closest(".tf").querySelector(".tf__label").textContent = `Time · ${isToday ? "Today" : date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
    if (isToday) time.reset(timeRange[1], timeRange[0]); else time.reset(1439, 0, 540);
    time.hug();
  } });
  /* Slide out before closing; falls back to an instant close under reduced motion. */
  const closePanel = () => {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return dialog.close();
    dialog.classList.add("is-closing");
    const done = () => { dialog.classList.remove("is-closing"); if (dialog.open) dialog.close(); };
    dialog.addEventListener("animationend", done, { once: true });
    setTimeout(done, 500);
  };
  dialog.addEventListener("cancel", event => {
    if (dialog.querySelector(".dd.is-open, .tf.is-open, .dp:not([hidden])")) event.preventDefault();
    else { event.preventDefault(); closePanel(); }
  });
  /* Click on the backdrop (outside the panel) closes it; a drag that merely ends outside does not. */
  let downOutside = false;
  dialog.addEventListener("pointerdown", event => { downOutside = event.target === dialog; });
  dialog.addEventListener("click", event => {
    if (event.target === dialog && downOutside && !dialog.querySelector(".dd.is-open, .tf.is-open, .dp:not([hidden])")) closePanel();
    downOutside = false;
  });
  field("clockCancel").onclick = field("clockClose").onclick = closePanel;
  /* Time entry / Hour entry tabs, as in the Add manual time entry drawer. Hour entry swaps the time for a h:mm duration. */
  let kind = "time", action = "in";
  const kindBtns = [...field("clockKind").querySelectorAll(".seg__opt")];
  const setKind = k => {
    kind = k;
    kindBtns.forEach(b => { const on = b.dataset.kind === k; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    field("clockTimeWrap").hidden = k === "hours";
    field("clockDurWrap").hidden = k !== "hours";
    field("clockWorkFields").hidden = k === "time" && action === "out";
    if (k === "time") time.hug();
  };
  kindBtns.forEach((b, i) => {
    b.onclick = () => setKind(b.dataset.kind);
    b.onkeydown = event => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = kindBtns[(i + step + kindBtns.length) % kindBtns.length];
      setKind(next.dataset.kind); next.focus();
    };
  });
  const dur = field("clockDur"), durTf = field("clockDurWrap");
  const durError = text => { field("clockDurMsg").textContent = text; durTf.classList.toggle("is-invalid", !!text); dur.setAttribute("aria-invalid", String(!!text)); };
  dur.addEventListener("input", () => durError(""));
  field("clockForm").onsubmit = event => {
    event.preventDefault();
    if (kind === "hours") {
      const m = /^(\d{1,2}):([0-5]\d)$/.exec(dur.value.trim());
      const minutes = m ? +m[1] * 60 + +m[2] : 0;
      if (!minutes || minutes > 1440) { durError("Enter a duration as h:mm, for example 2:30"); return dur.focus(); }
      closePanel();
      return onSave("hours", { date: datePicker.value, duration: minutes, location: location.value, activity: activity.value, project: project.value, note: note.value.trim() });
    }
    const minutes = time.commit();
    if (minutes === null) return time.focus();
    closePanel();
    onSave(dialog.dataset.action, { date: datePicker.value, time: minutes, location: location.value, activity: activity.value, project: project.value, note: note.value.trim() });
  };
  const titles = { in: "Confirm Clock In", resume: "Resume last activity", switch: "Switch activity", endbreak: "End break", out: "Clock out" };
  return function open(act, now, selectedActivity, selectedProject, earliest) {
    action = act;
    dialog.dataset.action = act;
    dur.value = ""; durError(""); setKind("time");
    field("clockDialogTitle").textContent = titles[act];
    timeRange = [earliest, now];
    datePicker.value = new Date();
    field("clockEntryTime").closest(".tf").querySelector(".tf__label").textContent = "Time · Today";
    time.reset(now, earliest);
    location.value = "";
    field("clockPanelStatus").textContent = document.getElementById("topLast").textContent;
    field("clockWorkFields").hidden = act === "out";
    activity.value = selectedActivity;
    project.value = selectedProject;
    note.value = "";
    dialog.showModal();
    time.hug();
  };
}

/* Time field: type a time (9:30, 930, 9:30p, 21:30) or pick one from the list (now, then 5-minute steps back to the
   earliest allowed time). AM/PM follows the toggle, a typed a/p, or whichever half of the day is in range. */
function createTimeField(input, periodBtn, toggle, list, msg) {
  const root = input.closest(".tf");
  let range = [0, 1439], period = "am", chosen = false, opts = []; /* chosen: the person set AM/PM themselves */
  const clock = m => { const h = Math.floor(m / 60) % 24; return `${h % 12 || 12}:${String(Math.floor(m) % 60).padStart(2, "0")}`; };
  const fmt = m => `${clock(m)} ${Math.floor(m / 60) % 24 < 12 ? "am" : "pm"}`;
  const inRange = m => m >= range[0] && m <= range[1];
  const setPeriod = p => { period = p; periodBtn.textContent = p.toUpperCase(); periodBtn.setAttribute("aria-label", `${p.toUpperCase()}, press to switch to ${p === "am" ? "PM" : "AM"}`); };
  /* Text -> minutes, or null. Pure: never changes the toggle. */
  const parse = text => {
    text = text.trim().replace(/^(\d{1,2}):(?!\d)/, "$1").replace(/^(\d{1,2}):(\d)(?!\d)/, "$1$2"); /* "13:0" from typing 130 means 1:30 */
    const m = text.toLowerCase().match(/^(\d{1,2})(?:[:.]?(\d{2}))?\s*(?:([ap])\.?m?\.?)?$/);
    if (!m) return null;
    const h = +m[1], min = +(m[2] || 0);
    if (min > 59 || h > 23 || (m[3] && (h === 0 || h > 12))) return null;
    if (h === 0 || h > 12) return h * 60 + min; /* 24-hour */
    const at = p => (h % 12 + (p === "pm" ? 12 : 0)) * 60 + min;
    if (m[3]) return at(m[3] + "m");
    const other = period === "am" ? "pm" : "am";
    if (chosen || inRange(at(period))) return at(period);
    const off = m => Math.max(range[0] - m, m - range[1], 0); /* minutes outside the allowed range */
    return off(at(other)) < off(at(period)) ? at(other) : at(period);
  };
  const error = text => {
    msg.textContent = text; root.classList.toggle("is-invalid", !!text);
    input.setAttribute("aria-invalid", String(!!text));
  };
  /* The input hugs its text so AM/PM sits right after the time. */
  const hug = () => {
    if (!input.offsetParent) return; /* hidden: measured again on open */
    input.style.width = "0";
    input.style.width = input.scrollWidth + "px";
  };
  document.fonts?.ready.then(hug); /* re-measure once the web font is in */
  const show = m => { input.value = clock(m); setPeriod(Math.floor(m / 60) % 24 < 12 ? "am" : "pm"); hug(); };
  const ago = m => { const d = range[1] - m; return d < 1 ? "Now" : d < 60 ? `${d} min ago` : `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60} min` : ""} ago`; };
  const render = () => {
    const times = [range[1]];
    for (let t = Math.floor(range[1] / 5) * 5; t >= range[0]; t -= 5) if (t !== range[1]) times.push(t); /* every 5 min that is allowed */
    if (times.at(-1) !== range[0]) times.push(range[0]);
    list.innerHTML = times.map((t, i) => `<button type="button" class="menu__opt" role="option" tabindex="-1" id="${list.id}-${i}" data-t="${t}" aria-selected="false"><span>${fmt(t)}</span><span class="tf__ago">${ago(t)}</span></button>`).join("");
    opts = [...list.querySelectorAll(".menu__opt")];
  };
  const mark = () => {
    const v = parse(input.value);
    let best = null;
    opts.forEach(o => { const on = +o.dataset.t === v; o.setAttribute("aria-selected", String(on)); if (on) best = o; });
    return best;
  };
  const isOpen = () => !list.hidden;
  const close = refocus => {
    list.hidden = true; root.classList.remove("is-open"); input.setAttribute("aria-expanded", "false");
    if (refocus) input.focus();
  };
  const open = focusList => {
    if (isOpen()) return;
    list.hidden = false; root.classList.add("is-open"); input.setAttribute("aria-expanded", "true");
    list.classList.toggle("is-up", window.innerHeight - input.getBoundingClientRect().bottom < list.offsetHeight + 12);
    const sel = mark();
    (sel || opts[0])?.scrollIntoView({ block: "nearest" });
    if (focusList) (sel || opts[0])?.focus();
  };
  const commit = () => {
    if (!/\d/.test(input.value)) { error("Enter a time"); return null; }
    const v = parse(input.value);
    if (v === null) { error("Enter a time like 9:30 or 9:30 pm"); return null; }
    if (!inRange(v)) { error(range[1] - range[0] < 1 ? `Time must be ${fmt(range[1])}` : v > range[1] ? `Time can't be later than now (${fmt(range[1])})` : `Time can't be earlier than ${fmt(range[0])}, your last entry`); return null; }
    show(v); error(""); return v;
  };
  const pick = opt => { show(+opt.dataset.t); error(""); close(true); };

  input.addEventListener("pointerdown", () => { if (isOpen()) return; requestAnimationFrame(() => open(false)); });
  input.addEventListener("focus", () => input.select());
  /* The ":" is fixed: Backspace/Delete step over it, a typed ":" or "." jumps past it, and any edit that removes it
     (select-all and type, cut, paste) rebuilds h:mm from the digits. */
  const caret = i => input.setSelectionRange(i, i);
  const fixColon = () => {
    const v = input.value, at = input.selectionStart;
    if (v.includes(":")) {
      const c = v.indexOf(":");
      if (at === c && /^\d{2}$/.test(v.slice(0, c)) && input.selectionEnd === at) caret(c + 1); /* hours full: move to minutes */
      return;
    }
    const suffix = (v.match(/\s*[ap]\.?m?\.?\s*$/i) || [""])[0];
    const d = v.slice(0, v.length - suffix.length).replace(/\D/g, "").slice(0, 4);
    const h = d.length > 2 ? d.slice(0, d.length - 2) : d, m = d.length > 2 ? d.slice(-2) : "";
    input.value = h + ":" + m + suffix;
    caret(d.length === 0 || (d.length === 1 && +d < 2) ? h.length : h.length + 1 + m.length);
  };
  input.addEventListener("keydown", event => {
    const v = input.value, s = input.selectionStart, e = input.selectionEnd;
    if (event.key === ":" || event.key === ".") { event.preventDefault(); if (v.includes(":")) caret(v.indexOf(":") + 1); }
    else if (event.key === "Backspace" && s === e && v[s - 1] === ":") { event.preventDefault(); caret(s - 1); }
    else if (event.key === "Delete" && s === e && v[s] === ":") { event.preventDefault(); caret(s + 1); }
  });
  input.addEventListener("input", () => {
    fixColon(); hug();
    const typed = input.value.trim().toLowerCase().match(/([ap])\.?m?\.?$/);
    if (typed) { setPeriod(typed[1] + "m"); chosen = true; }
    if (root.classList.contains("is-invalid")) error("");
    if (isOpen()) mark()?.scrollIntoView({ block: "nearest" });
  });
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); if (isOpen()) (mark() || opts[0])?.focus(); else open(true); }
    else if (event.key === "Escape" && isOpen()) { event.preventDefault(); event.stopPropagation(); close(false); }
    else if (event.key === "Enter" && isOpen()) { event.preventDefault(); close(false); commit(); }
    else if (event.key === "Tab") close(false);
  });
  input.addEventListener("blur", event => { if (!root.contains(event.relatedTarget) && /\d/.test(input.value)) commit(); });
  periodBtn.onclick = () => {
    setPeriod(period === "am" ? "pm" : "am"); chosen = true;
    input.value = input.value.replace(/\s*[ap]\.?m?\.?\s*$/i, ""); hug(); /* the toggle wins over a typed a/p */
    if (root.classList.contains("is-invalid")) commit();
    input.focus();
  };
  toggle.onclick = () => isOpen() ? close(true) : (input.focus(), open(true));
  list.onclick = event => { const opt = event.target.closest(".menu__opt"); if (opt) pick(opt); };
  list.onkeydown = event => {
    const i = opts.indexOf(document.activeElement);
    if (event.key === "ArrowDown") opts[Math.min(i + 1, opts.length - 1)].focus();
    else if (event.key === "ArrowUp") (i <= 0 ? input : opts[i - 1]).focus();
    else if (event.key === "Home") opts[0].focus();
    else if (event.key === "End") opts.at(-1).focus();
    else if (event.key === "Enter" || event.key === " ") { if (i >= 0) pick(opts[i]); }
    else if (event.key === "Escape") { event.stopPropagation(); close(true); }
    else if (event.key === "Tab") { close(false); return; }
    else return;
    event.preventDefault();
  };
  document.addEventListener("pointerdown", event => { if (isOpen() && !root.contains(event.target)) close(false); });

  return {
    commit, hug, focus: () => input.focus(),
    reset(now, earliest, initial) { chosen = false; range = [Math.ceil(earliest), Math.floor(now)]; if (range[0] > range[1]) range[0] = range[1]; show(initial ?? range[1]); error(""); close(false); render(); }
  };
}

/* Resume button content, shared by the top bar and the dashboard clock card: a play icon plus the last clock in's
   activity and project as chips, or just "Resume" when that clock in had neither. Returns the markup and a label. */
function resumeContent(activity, project) {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const play = `<svg class="i i-16" aria-hidden="true"><use href="#i-play"/></svg>`;
  const chips = [
    activity && `<span class="chip chip--activity" style="--chip:${activity.color || "var(--ap-none)"}"><span>${esc(activity.name)}</span></span>`,
    project && `<span class="chip chip--project"><span>${esc(project.name)}</span></span>`,
  ].filter(Boolean);
  const names = [activity?.name, project?.name].filter(Boolean);
  return {
    html: play + (chips.length ? `<span class="resume__chips">${chips.join("")}</span>` : `<span>Resume</span>`),
    label: names.length ? `Resume ${names.join(", ")}` : "Resume last activity",
  };
}
