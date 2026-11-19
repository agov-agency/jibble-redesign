/* Search inside a multi-select menu: filters [data-name] rows, toggles [data-empty],
   and eases the menu's height between the old and new size instead of jumping.
   Rows swap instantly; only the panel height and newly shown items animate. */
window.menuSearch = function (menu, query) {
  const q = query.trim().toLowerCase();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = menu.getBoundingClientRect().height; // includes any in-flight animation
  if (menu._hAnim) { menu._hAnim.cancel(); menu._hAnim = null; }

  const appeared = [];
  let shown = 0;
  menu.querySelectorAll("[data-name]").forEach(row => {
    const hit = row.dataset.name.includes(q);
    if (hit && row.classList.contains("is-filtered")) appeared.push(row);
    row.classList.toggle("is-filtered", !hit);
    if (hit) shown++;
  });
  const empty = menu.querySelector("[data-empty]");
  if (empty) {
    const was = empty.hidden;
    empty.hidden = shown > 0;
    if (was && !empty.hidden) appeared.push(empty);
  }
  if (reduce) return shown;

  const to = menu.getBoundingClientRect().height;
  if (Math.abs(to - from) > 0.5) {
    menu.style.overflow = "hidden"; // no scrollbar flash while the panel grows
    const anim = menu.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 200, easing: "cubic-bezier(.2, 0, 0, 1)" });
    menu._hAnim = anim;
    const done = () => { if (menu._hAnim === anim) { menu._hAnim = null; menu.style.overflow = ""; } };
    anim.onfinish = done; anim.oncancel = done;
  }
  appeared.forEach(el => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 40, easing: "ease-out", fill: "backwards" }));
  return shown;
};
