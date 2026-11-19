/* Shared top-bar account & organization menu, plus the Members board button.
   Used by Dashboard and Timesheets. Expects #accountBtn inside a .pick wrapper and,
   optionally, #boardBtn. Illustrative only: switching organization, settings, help
   and sign out show a notice. */
(() => {
  "use strict";
  const btn = document.getElementById("accountBtn");
  if (!btn) return;

  const svg = d => `<svg class="i i-16" viewBox="0 0 20 20" aria-hidden="true">${d}</svg>`;
  const I = {
    chevR: svg('<path d="M8 5l5 5-5 5"/>'),
    chevL: svg('<path d="M12 5l-5 5 5 5"/>'),
    gear: svg('<circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>'),
    help: svg('<circle cx="10" cy="10" r="7"/><path d="M8 8a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2v.5M10 14h.01"/>'),
    box: svg('<path d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5z"/><path d="M3.5 6.5 10 10l6.5-3.5M10 10v7"/>'),
    out: svg('<path d="M9 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4"/><path d="M8 10h8.5M13 6.5l3.5 3.5-3.5 3.5"/>'),
    plus: svg('<path d="M10 4.5v11M4.5 10h11"/>'),
    check: svg('<path d="m5 10.5 3 3 7-7"/>'),
  };
  const ORGS = [{ id: "acme", name: "Acme Inc.", ini: "AI" }, { id: "tr", name: "Transferity", ini: "TR" }, { id: "gq", name: "Gr. Quota Agency", ini: "GQ" }];
  const ORG = "acme";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const menu = document.createElement("div");
  menu.className = "menu is-right menu--account";
  menu.id = "accountMenu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Account");
  menu.hidden = true;
  menu.innerHTML = `
    <div class="acct" data-pane="main">
      <div class="acct__me"><span class="avatar avatar--40 avatar--me" aria-hidden="true">JL</span><span><span class="acct__name">Jane Long</span><span class="acct__sub">Owner</span></span></div>
      <button class="menu__opt acct__org" role="menuitem" data-org-open><span class="avatar avatar--32 avatar--me" aria-hidden="true">AI</span><span><span class="acct__name">Acme Inc.</span><span class="acct__sub">Your organization</span></span><span class="acct__chev">${I.chevR}</span></button>
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Settings">${I.gear}Settings</button>
      <button class="menu__opt" role="menuitem" data-soon="Help center">${I.help}Help center</button>
      <button class="menu__opt" role="menuitem" data-soon="Product updates">${I.box}Product updates</button>
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Sign out">${I.out}Sign out</button>
    </div>
    <div class="acct" data-pane="org" hidden>
      <button class="menu__opt acct__back" role="menuitem" data-org-back>${I.chevL}Switch organization</button>
      ${ORGS.map(o => `<button class="menu__opt" role="menuitemradio" aria-checked="${o.id === ORG}" data-org="${o.id}"><span class="avatar avatar--32${o.id === ORG ? " avatar--me" : ""}" aria-hidden="true">${o.ini}</span>${esc(o.name)}<span class="tick">${I.check}</span></button>`).join("")}
      <hr class="menu__sep">
      <button class="menu__opt" role="menuitem" data-soon="Create new organization">${I.plus}Create new organization</button>
    </div>`;
  btn.insertAdjacentElement("afterend", menu);
  btn.setAttribute("aria-haspopup", "true");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "accountMenu");

  const items = () => [...menu.querySelectorAll(".acct:not([hidden]) .menu__opt")];
  function pane(name) {
    menu.querySelectorAll("[data-pane]").forEach(p => { p.hidden = p.dataset.pane !== name; });
    items()[0]?.focus();
  }
  function open() {
    menu.hidden = false; btn.setAttribute("aria-expanded", "true");
    menu.style.translate = "";
    const r = menu.getBoundingClientRect();
    if (r.left < 8) menu.style.translate = `${8 - r.left}px 0`;
    pane("main");
  }
  function close(refocus) {
    if (menu.hidden) return;
    menu.hidden = true; btn.setAttribute("aria-expanded", "false");
    if (refocus) btn.focus();
  }
  btn.addEventListener("click", () => (menu.hidden ? open() : close(false)));
  document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close(false); });
  // Capture phase, so a page-level Escape handler doesn't also act on this keypress.
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { e.preventDefault(); e.stopImmediatePropagation(); close(true); } }, true);
  menu.addEventListener("keydown", e => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const list = items(), i = list.indexOf(document.activeElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : (i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    list[next].focus();
  });
  menu.addEventListener("click", e => {
    if (e.target.closest("[data-org-open]")) return pane("org");
    if (e.target.closest("[data-org-back]")) return pane("main");
    const o = e.target.closest("[data-org]");
    if (o) { close(true); if (o.dataset.org !== ORG) notice(`Switching to ${ORGS.find(x => x.id === o.dataset.org).name} isn't part of this prototype.`); return; }
    const s = e.target.closest("[data-soon]");
    if (s) { close(true); notice(`${s.dataset.soon} isn't part of this prototype.`); }
  });

  document.getElementById("notesBtn")?.addEventListener("click", () => notice("Notes aren't part of this prototype."));
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
