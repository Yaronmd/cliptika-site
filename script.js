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
function isInViewport(video) {
  const rect = video.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
}
function isActiveVideo(video) {
  const panel = video.closest('[role="tabpanel"]');
  return !panel?.hidden && !video.closest('[hidden]') && isInViewport(video);
}
function setReplayAvailable(video, available) {
  video.closest('.demo-stage')?.classList.toggle('is-complete', available);
}
function restartDemo(video, manual = false) {
  video.pause();
  video.currentTime = 0;
  setReplayAvailable(video, false);
  if ((manual || !reduceMotion.matches) && isActiveVideo(video)) video.play().catch(() => {});
}
function updateVideos() {
  allVideos.forEach((video) => {
    if (reduceMotion.matches) {
      video.pause();
      if (!video.ended) setReplayAvailable(video, true);
    } else if (video.ended) {
      video.pause();
      setReplayAvailable(video, true);
    } else if (isActiveVideo(video)) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}
const videoObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => entry.target.dataset.inView = entry.isIntersecting); updateVideos(); }, { threshold: .25 });
allVideos.forEach((video) => {
  video.loop = false;
  video.addEventListener('ended', () => setReplayAvailable(video, true));
  video.addEventListener('pause', () => { if (video.ended) setReplayAvailable(video, true); });
  video.addEventListener('timeupdate', () => { if (video.duration && video.currentTime >= video.duration - .05) setReplayAvailable(video, true); });
  videoObserver.observe(video);
});
reduceMotion.addEventListener('change', updateVideos);
addEventListener('scroll', updateVideos, { passive: true });
addEventListener('resize', updateVideos);

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  const target = document.getElementById(tab.getAttribute('aria-controls'));
  tabs.forEach((item) => { const selected = item === tab; item.setAttribute('aria-selected', selected); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; });
  target.hidden = false;
  target.querySelectorAll('video').forEach((video) => { if (!video.closest('[hidden]')) restartDemo(video); });
  updateVideos();
}
tabs.forEach((tab, index) => { tab.addEventListener('click', () => activateTab(tab)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); activateTab(tabs[next]); }); });

document.querySelectorAll('[data-media-toggle]').forEach((group) => group.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => { const target = button.dataset.media; group.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button)); group.parentElement.querySelectorAll('.media-choice').forEach((media) => media.hidden = media.id !== target); restartDemo(document.querySelector(`#${target} video`)); updateVideos(); })));
document.querySelectorAll('.demo-replay').forEach((button) => button.addEventListener('click', () => restartDemo(button.closest('.demo-stage').querySelector('video'), true)));
updateVideos();
