
// Pre-release: there is no public App Store link yet, so the page renders non-interactive "coming soon" labels (no <a data-app-store>).
// When the verified public URL exists, replace the .soon-badge/.is-soon elements in the HTML with real links.

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const featureTabs = document.querySelectorAll('[role="tab"]');
const featurePanels = document.querySelectorAll('[role="tabpanel"]');
const mediaSwitches = document.querySelectorAll('[data-media-target]');
const mediaPanels = document.querySelectorAll('.media-choice');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

function pauseMediaWithin(container) {
  container?.querySelectorAll('video').forEach((video) => video.pause());
}

function selectFeature(tab) {
  const target = tab.getAttribute('aria-controls');

  featureTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  featurePanels.forEach((panel) => {
    const selected = panel.id === target;
    if (!selected) pauseMediaWithin(panel);
    panel.hidden = !selected;
  });
}

featureTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectFeature(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? featureTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + featureTabs.length) % featureTabs.length;
    featureTabs[nextIndex].focus();
    selectFeature(featureTabs[nextIndex]);
  });
});

function selectMedia(button) {
  const target = button.dataset.mediaTarget;
  const group = button.closest('[data-media-toggle]');
  const mediaContainer = group?.parentElement;

  group?.querySelectorAll('[data-media-target]').forEach((item) => {
    item.classList.toggle('is-active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });

  mediaPanels.forEach((panel) => {
    const selected = panel.id === target;
    if (panel.closest('.tab-media') !== mediaContainer) return;
    if (!selected) pauseMediaWithin(panel);
    panel.hidden = !selected;
  });
}

mediaSwitches.forEach((button) => button.addEventListener('click', () => selectMedia(button)));

function controlFor(video) {
  return document.querySelector(`[data-video-id="${video.id}"]`);
}

function setControlLabel(video, label, completed = false) {
  const control = controlFor(video);
  if (!control) return;
  control.querySelector('span').textContent = label;
  control.classList.toggle('is-complete', completed);
  control.setAttribute('aria-label', `${label}: ${video.getAttribute('aria-label') || 'product demonstration'}`);
}

function pauseDemo(video) {
  video.pause();
  setControlLabel(video, video.ended ? 'Replay demo' : 'Play demo', video.ended);
}

async function playDemo(video) {
  if (video.ended) video.currentTime = 0;
  try {
    await video.play();
    setControlLabel(video, 'Pause demo');
  } catch {
    setControlLabel(video, 'Play demo');
  }
}

document.querySelectorAll('video[data-demo]').forEach((video) => {
  video.loop = false;
  setControlLabel(video, 'Play demo');

  video.addEventListener('play', () => setControlLabel(video, 'Pause demo'));
  video.addEventListener('pause', () => {
    if (!video.ended) setControlLabel(video, 'Play demo');
  });
  video.addEventListener('ended', () => setControlLabel(video, 'Replay demo', true));
});

document.querySelectorAll('.demo-control').forEach((control) => {
  control.addEventListener('click', () => {
    const video = document.getElementById(control.dataset.videoId);
    if (!video) return;
    if (video.paused || video.ended) {
      playDemo(video);
    } else {
      pauseDemo(video);
    }
  });
});

const visibleMediaObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting && !entry.target.paused) pauseDemo(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('video[data-demo]').forEach((video) => visibleMediaObserver.observe(video));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video[data-demo]').forEach(pauseDemo);
});

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) document.querySelectorAll('video[data-demo]').forEach(pauseDemo);
});

const siteHeader = document.querySelector('.site-header');
function updateHeader() {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 8);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
