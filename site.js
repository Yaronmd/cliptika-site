/* Cliptika site: compact section menu for phones (rev. 9). Closes on selection, Escape or a tap outside. */
(() => {
  const btn = document.querySelector('[data-menu]'), nav = btn && document.getElementById(btn.getAttribute('aria-controls'));
  if (!btn || !nav) return;
  const set = (open, focusBtn) => {
    btn.setAttribute('aria-expanded', String(open)); nav.hidden = !open;
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open && focusBtn) btn.focus();
  };
  btn.addEventListener('click', () => set(nav.hidden));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) set(false, true); });
  document.addEventListener('click', (e) => { if (!nav.hidden && !nav.contains(e.target) && !btn.contains(e.target)) set(false); });
  matchMedia('(max-width: 760px)').addEventListener('change', (m) => { if (!m.matches) set(false); });
})();
