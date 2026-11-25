/* Shared dropdown field, as in the clock-in panel (Figma 588:497085 / 673:511845). Use it for every single-select
   dropdown in side panels and forms; styles live in shared/shell.css (.dd). Needs the page icon sprite. */
/* Dropdown field (Figma 588:497085) opening a single-select Dropdown (673:511845). Replaces a native <select>; exposes .value. */
function createDropdownField(root, initialItems, { onChange } = {}) {
  const real = list => list.filter(i => i.id !== "none"); /* "No activity" / "No project" are replaced by Clear selection */
  let items = real(initialItems);
  const icon = (id, cls = "i") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const uid = root.id;
  const mode = root.dataset.chip;
  const required = "required" in root.dataset; /* data-required: a value is always needed, so no clear button or Clear selection */
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const label = item => mode ? `<span class="dd-chip dd-chip--${mode}" style="--chip:${mode === "color" ? item.color || "var(--ap-none)" : "var(--ink)"}">${esc(item.name)}</span>` : `<span>${esc(item.name)}</span>`;
  root.innerHTML = `<span class="dd__label" id="${uid}Label">${root.dataset.label}</span>
    <button type="button" class="dd__btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${uid}Label ${uid}Value">
      <span class="dd__value" id="${uid}Value"></span>${icon("chevron-down")}
    </button>
    <button type="button" class="dd__clear" aria-label="Clear ${esc(root.dataset.label.toLowerCase())}" title="Clear" hidden>${icon("x-circle", "i i-16")}</button>
    <div class="menu dd__menu" hidden>
      <label class="field-search field-search--menu">${icon("search")}<span class="sr-only">Search ${esc(root.dataset.label.toLowerCase())}</span><input type="search" placeholder="Search" autocomplete="off" data-msearch><button type="button" class="field-search__clear" data-sclear aria-label="Clear search" title="Clear search" hidden>${icon("x-circle", "i i-16")}</button></label>
      <div class="dd__list" role="listbox" aria-labelledby="${uid}Label"></div>
      <p class="menu__empty" hidden>No ${esc(root.dataset.label.toLowerCase())} found</p>
      ${required ? "" : `<div class="menu__foot"><button type="button" data-clear>Clear selection</button></div>`}
    </div>`;
  const btn = root.querySelector(".dd__btn"), menu = root.querySelector(".dd__menu"), valueEl = root.querySelector(".dd__value");
  const list = menu.querySelector(".dd__list"), search = menu.querySelector("[data-msearch]"), sClear = menu.querySelector("[data-sclear]");
  const clearBtn = root.querySelector(".dd__clear"), foot = menu.querySelector("[data-clear]"), empty = menu.querySelector(".menu__empty");
  let opts = [];
  const filter = () => {
    const q = search.value.trim().toLowerCase();
    sClear.hidden = !search.value;
    let n = 0;
    opts.forEach(o => { const hit = !q || o.dataset.name.includes(q); o.hidden = !hit; if (hit) n++; });
    empty.hidden = n > 0;
  };
  const render = () => {
    list.innerHTML = items.map(item =>
      `<button type="button" class="menu__opt" role="option" tabindex="-1" data-id="${item.id}" data-name="${esc(item.name.toLowerCase())}" aria-selected="false">${label(item)}${icon("check", "i tick")}</button>`).join("");
    opts = [...list.querySelectorAll(".menu__opt")];
    filter();
  };
  render();
  let current = "";
  const set = (id, user) => {
    const item = items.find(i => String(i.id) === String(id));
    const prev = current;
    current = item ? String(item.id) : "";
    if (item) valueEl.innerHTML = label(item); else valueEl.textContent = root.dataset.placeholder || "";
    root.classList.toggle("is-filled", !!item);
    clearBtn.hidden = required || !item; if (foot) foot.disabled = !item;
    opts.forEach(o => o.setAttribute("aria-selected", String(o.dataset.id === current)));
    if (user && prev !== current && onChange) onChange(current);
  };
  const close = refocus => {
    menu.hidden = true; root.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false");
    if (refocus) btn.focus();
  };
  const open = () => {
    document.querySelectorAll(".dd.is-open").forEach(d => d !== root && d.querySelector(".dd__btn").dispatchEvent(new Event("dd-close")));
    search.value = ""; filter();
    menu.hidden = false; root.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
    const room = window.innerHeight - btn.getBoundingClientRect().bottom;
    menu.classList.toggle("is-up", room < menu.offsetHeight + 12);
    search.focus();
    (opts.find(o => o.getAttribute("aria-selected") === "true"))?.scrollIntoView({ block: "nearest" });
  };
  btn.addEventListener("dd-close", () => close(false));
  btn.onclick = () => menu.hidden ? open() : close(true);
  btn.onkeydown = event => { if (menu.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) { event.preventDefault(); open(); } };
  search.addEventListener("input", filter);
  clearBtn.onclick = () => { set("", true); close(false); btn.focus(); };
  menu.onclick = event => {
    if (event.target.closest("[data-sclear]")) { search.value = ""; filter(); search.focus(); return; }
    if (event.target.closest("[data-clear]")) { set("", true); close(true); return; }
    const opt = event.target.closest(".menu__opt");
    if (opt) { set(opt.dataset.id, true); close(true); }
  };
  menu.onkeydown = event => {
    const vis = opts.filter(o => !o.hidden), i = vis.indexOf(document.activeElement);
    if (event.key === "ArrowDown") (i < 0 ? vis[0] : vis[Math.min(i + 1, vis.length - 1)])?.focus();
    else if (event.key === "ArrowUp") (i <= 0 ? search : vis[i - 1]).focus();
    else if (event.key === "Enter" && document.activeElement === search) { if (vis.length === 1) { set(vis[0].dataset.id, true); close(true); } }
    else if (event.key === "Escape") { event.stopPropagation(); close(true); }
    else if (event.key === "Tab") close(false);
    else return;
    if (event.key !== "Tab") event.preventDefault();
  };
  document.addEventListener("pointerdown", event => { if (!menu.hidden && !root.contains(event.target)) close(false); });
  set("");
  return {
    get value() { return current; }, set value(id) { set(id); close(false); },
    set items(l) { items = real(l); render(); set(current); },
    set disabled(v) { btn.disabled = !!v; if (v) { clearBtn.hidden = true; close(false); } else clearBtn.hidden = required || !current; },
    set invalid(v) { btn.classList.toggle("is-invalid", !!v); },
  };
}

/* Same dropdown for forms built on a native <select>: the select stays as the form value (hidden), the .dd replaces its UI.
   Options become items ({ id, name, color from data-color }); the field title comes from data-label or the wrapping
   .field's .field__label; data-chip="color" | "grey" turns values into chips. Call select._sync() after changing its
   options, value or disabled state. */
function enhanceDropdownSelect(select) {
  const field = select.closest(".field");
  const root = document.createElement("div");
  root.className = "dd";
  root.id = `${select.name || "dd"}Dd${Math.random().toString(36).slice(2, 7)}`;
  root.dataset.label = select.dataset.label || field?.querySelector(".field__label")?.firstChild?.textContent.trim() || select.name;
  root.dataset.placeholder = select.options[0] && !select.options[0].value ? select.options[0].textContent : "";
  if (select.dataset.chip) root.dataset.chip = select.dataset.chip;
  if (select.required) root.dataset.required = "";
  select.after(root); select.hidden = true; select.tabIndex = -1;
  const read = () => [...select.options].filter(o => o.value).map(o => ({ id: o.value, name: o.textContent, color: o.dataset.color }));
  const dd = createDropdownField(root, read(), { onChange: v => { select.value = v; select.dispatchEvent(new Event("change", { bubbles: true })); } });
  select._sync = () => {
    const first = select.options[0];
    root.dataset.placeholder = first && !first.value ? first.textContent : "";
    dd.items = read(); dd.value = select.value; dd.disabled = select.disabled;
    dd.invalid = select.getAttribute("aria-invalid") === "true";
  };
  select._sync();
  return dd;
}


