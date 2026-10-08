const APP_STORE_URL = null; // Add the verified public App Store URL here before launch.

document.querySelectorAll('[data-app-store]').forEach((link) => {
  if (APP_STORE_URL) link.href = APP_STORE_URL;
  else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.title = 'App Store link coming soon'; }
});

const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
if (header && hero) {
  const observer = new IntersectionObserver(([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting), { threshold: 0.2 });
  observer.observe(hero);
}

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const allVideos = [...document.querySelectorAll('video')];
function updateVideos() {
  allVideos.forEach((video) => {
    const panel = video.closest('[role="tabpanel"]');
    const hidden = panel?.hidden || video.closest('[hidden]');
    const visible = video.dataset.inView === 'true';
    if (!reduceMotion.matches && !hidden && visible) video.play().catch(() => {}); else video.pause();
  });
}
const videoObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => entry.target.dataset.inView = entry.isIntersecting); updateVideos(); }, { threshold: .25 });
allVideos.forEach((video) => videoObserver.observe(video));
reduceMotion.addEventListener('change', updateVideos);

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  const target = document.getElementById(tab.getAttribute('aria-controls'));
  tabs.forEach((item) => { const selected = item === tab; item.setAttribute('aria-selected', selected); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; });
  target.hidden = false; updateVideos();
}
tabs.forEach((tab, index) => { tab.addEventListener('click', () => activateTab(tab)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); activateTab(tabs[next]); }); });

document.querySelectorAll('[data-media-toggle]').forEach((group) => group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { const target = button.dataset.media; group.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button)); group.parentElement.querySelectorAll('.media-choice').forEach((media) => media.hidden = media.id !== target); updateVideos(); })));
