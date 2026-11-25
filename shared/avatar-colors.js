/* Gives every initials avatar its own stable background colour (hash of the initials), so each person is
   recognisable at a glance. Observes the DOM so avatars rendered later are coloured too. */
(() => {
  const N = 8;
  const paint = root => root.querySelectorAll?.(".avatar:not([data-c])").forEach(el => {
    const t = el.textContent.trim();
    if (!t) return;
    let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    el.dataset.c = h % N;
  });
  paint(document);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && (n.matches?.(".avatar") ? paint(n.parentNode) : paint(n)))))
    .observe(document.documentElement, { childList: true, subtree: true });
})();
