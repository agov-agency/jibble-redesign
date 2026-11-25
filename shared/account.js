/* Shared top-bar account & organization menu, plus the Members board button.
   Used by Dashboard and Timesheets. Expects #accountBtn inside a .pick wrapper and,
   optionally, #boardBtn. Illustrative only: switching organization, settings, help
   and sign out show a notice. */
(() => {
  "use strict";
  const btn = document.getElementById("accountBtn");
  if (!btn) return;

  const svg = d => `<svg class="i i-16" viewBox="0 0 20 20" aria-hidden="true">${d}</svg>`;
  const use = id => `<svg class="i i-16" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const I = {
    chevR: svg('<path d="M8 5l5 5-5 5"/>'),
    chevL: svg('<path d="M12 5l-5 5 5 5"/>'),
    gear: svg('<circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>'),
    help: svg('<circle cx="10" cy="10" r="7"/><path d="M8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14h.01"/>'),
    swap: svg('<path d="M4 7h11M12 4l3 3-3 3M16 13H5M8 10l-3 3 3 3"/>'),
    org: use('org'),
    book: svg('<path d="M10 5.5C8.5 4.3 6.3 4 3.5 4v11c2.8 0 5 .3 6.5 1.5 1.5-1.2 3.7-1.5 6.5-1.5V4c-2.8 0-5 .3-6.5 1.5zM10 5.5v11"/>'),
    box: svg('<path d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5z"/><path d="M3.5 6.5 10 10l6.5-3.5M10 10v7"/>'),
    out: svg('<path d="M9 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4"/><path d="M8 10h8.5M13 6.5l3.5 3.5-3.5 3.5"/>'),
    plus: svg('<path d="M10 4.5v11M4.5 10h11"/>'),
    check: svg('<path d="m5 10.5 3 3 7-7"/>'),
  };
  const ORGS = [{ id: "acme", name: "Acme Inc.", ini: "AI" }, { id: "tr", name: "Transferity", ini: "TR" }, { id: "gq", name: "Gr. Quota Agency", ini: "GQ" }];
  const ORG = "acme";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const menu = document.createElement("div");
  menu.className = "menu menu--account";
  menu.id = "accountMenu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Account");
  menu.hidden = true;
  menu.innerHTML = `
    <div class="acct" data-pane="main">
      <div class="acct__me"><span class="avatar avatar--40 avatar--me" aria-hidden="true">JL</span><span><span class="acct__name">Jane Long</span><span class="acct__sub">Owner</span></span></div>
      <button class="menu__opt acct__org" role="menuitem" aria-haspopup="true" aria-expanded="false" data-org-open><span class="avatar avatar--32 avatar--me" aria-hidden="true">AI</span><span><span class="acct__name">Acme Inc.</span><span class="acct__sub">Your organization</span></span><span class="acct__chev">${I.chevR}</span></button>
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Manage organization">${I.org}Manage organization</button>
      <button class="menu__opt" role="menuitem" data-soon="Learning center">${I.book}Learning center</button>
      <button class="menu__opt" role="menuitem" data-soon="Account settings">${I.gear}Account settings</button>
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Sign out">${I.out}Sign out</button>
    </div>`;
  const sub = document.createElement("div");
  sub.className = "menu menu--account menu--flyout";
  sub.id = "orgMenu";
  sub.setAttribute("role", "menu");
  sub.setAttribute("aria-label", "Switch organization");
  sub.hidden = true;
  sub.innerHTML = `
    <div class="acct">
      <button class="menu__opt acct__back" role="menuitem" data-org-back>${I.chevL}Switch organization</button>
      ${ORGS.map(o => `<button class="menu__opt" role="menuitemradio" aria-checked="${o.id === ORG}" data-org="${o.id}"><span class="avatar avatar--32${o.id === ORG ? " avatar--me" : ""}" aria-hidden="true">${o.ini}</span>${esc(o.name)}<span class="tick">${I.check}</span></button>`).join("")}
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Create new organization">${I.plus}Create new organization</button>
    </div>`;
  btn.insertAdjacentElement("afterend", menu);
  menu.insertAdjacentElement("afterend", sub);
  const orgRow = menu.querySelector("[data-org-open]");
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "accountMenu");

  // Fade out before hiding; the show animation restarts when `hidden` is cleared.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  function hide(m) {
    if (m.hidden || m.classList.contains("is-closing")) return;
    if (reduce.matches) { m.hidden = true; return; }
    m.classList.add("is-closing");
    const done = () => { m.classList.remove("is-closing"); m.hidden = true; };
    m.addEventListener("animationend", done, { once: true });
    setTimeout(() => m.classList.contains("is-closing") && done(), 250);
  }
  const show = m => { m.classList.remove("is-closing"); m.hidden = false; };
  const items = m => [...m.querySelectorAll(".menu__opt")];
  function openSub(focus) {
    const m = menu.getBoundingClientRect(), r = orgRow.getBoundingClientRect();
    // Flyout sits to the right of the profile menu, its first row level with the organization row.
    sub.style.cssText = `position:fixed;left:${m.right + 8}px;right:auto;bottom:auto;top:${Math.max(8, Math.min(r.top - 7, innerHeight - 8 - 260))}px;`;
    show(sub); orgRow.setAttribute("aria-expanded", "true");
    if (focus) items(sub)[0]?.focus();
  }
  function closeSub(refocus) {
    if (sub.hidden) return;
    hide(sub); orgRow.setAttribute("aria-expanded", "false");
    if (refocus) orgRow.focus();
  }
  function open() {
    show(menu); btn.setAttribute("aria-expanded", "true");
    // Sidebar clips overflow, so anchor the menu to the viewport above the profile button.
    const b = btn.getBoundingClientRect();
    menu.style.cssText = `position:fixed;left:${Math.max(8, b.left)}px;right:auto;top:auto;bottom:${innerHeight - b.top + 8}px;`;
    items(menu)[0]?.focus();
  }
  function close(refocus) {
    if (menu.hidden) return;
    closeSub(false);
    hide(menu); btn.setAttribute("aria-expanded", "false");
    if (refocus) btn.focus();
  }
  btn.addEventListener("click", () => (menu.hidden || menu.classList.contains("is-closing") ? open() : close(false)));
  document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target) && !sub.contains(e.target) && !btn.contains(e.target)) close(false); });
  // Capture phase, so a page-level Escape handler doesn't also act on this keypress.
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { e.preventDefault(); e.stopImmediatePropagation(); if (!sub.hidden) closeSub(true); else close(true); } }, true);
  [menu, sub].forEach(m => m.addEventListener("keydown", e => {
    if (m === sub && e.key === "ArrowLeft") { e.preventDefault(); return closeSub(true); }
    if (m === menu && e.key === "ArrowRight" && document.activeElement === orgRow) { e.preventDefault(); return openSub(true); }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const list = items(m), i = list.indexOf(document.activeElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    list[next].focus();
  }));
  menu.addEventListener("click", e => {
    if (e.target.closest("[data-org-open]")) return sub.hidden ? openSub(false) : closeSub(false);
    if (!sub.hidden) closeSub(false);
    const s = e.target.closest("[data-soon]");
    if (s) { close(true); notice(`${s.dataset.soon} isn't part of this prototype.`); }
  });
  sub.addEventListener("click", e => {
    if (e.target.closest("[data-org-back]")) return closeSub(true);
    const o = e.target.closest("[data-org]");
    if (o) { close(true); if (o.dataset.org !== ORG) notice(`Switching to ${ORGS.find(x => x.id === o.dataset.org).name} isn't part of this prototype.`); return; }
    const s = e.target.closest("[data-soon]");
    if (s) { close(true); notice(`${s.dataset.soon} isn't part of this prototype.`); }
  });

  document.getElementById("boardBtn")?.addEventListener("click", () => notice("The Members board isn't part of this prototype."));

  // Notice: reuses the page's #toast when there is one.
  let timer;
  function notice(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(timer); timer = setTimeout(() => { t.hidden = true; }, 3200);
  }
})();
