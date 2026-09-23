const root = document.documentElement;
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const button = document.querySelector<HTMLButtonElement>('#motion-toggle');
let explicit: string | null = null;
try {
  explicit = localStorage.getItem('fm-motion');
} catch {
  /* Storage is optional. */
}
function applyMotion() {
  const reduced = explicit === 'reduced' || (explicit !== 'full' && preference.matches);
  root.dataset.motion = reduced ? 'reduced' : 'full';
  if (button) {
    button.setAttribute('aria-pressed', String(reduced));
    button.textContent = reduced ? button.dataset.off! : button.dataset.on!;
  }
  document.dispatchEvent(new Event('motionchange'));
}
applyMotion();
preference.addEventListener('change', applyMotion);
button?.addEventListener('click', () => {
  explicit = root.dataset.motion === 'reduced' ? 'full' : 'reduced';
  try {
    localStorage.setItem('fm-motion', explicit);
  } catch {
    /* optional */
  }
  applyMotion();
});
// Retire the historical root worker, which could serve stale HTML indefinitely.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) =>
      Promise.all(
        regs.filter((r) => new URL(r.scope).origin === location.origin).map((r) => r.unregister()),
      ),
    )
    .catch(() => {});
}
const connection = (navigator as Navigator & { connection?: { saveData: boolean } }).connection;
if (!connection?.saveData && !new URLSearchParams(location.search).has('no3d')) {
  const load = () =>
    import('../graphics/scene')
      .then((m) => m.startScene())
      .catch(() => {
        /* Semantic HTML/SVG is the fallback. */
      });
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 2500 });
  else setTimeout(load, 800);
}
// Keep locale changes on the same chapter. Works as ordinary links without JS.
document.querySelectorAll<HTMLAnchorElement>('.languages a').forEach((a) =>
  a.addEventListener('click', () => {
    a.hash = location.hash;
  }),
);
