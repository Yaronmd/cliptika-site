/* Cliptika site — hero sequence, persona tabs, feature tabs, demo videos.
   Principles: the hero plays ONE paced pass through three real workflows and stops (no endless loop); reduced-motion and
   data-saver visitors get no autoplay at all; everything is also reachable by keyboard and by tapping. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const calm = () => reduceMotion.matches || saveData;

  /* ---------- hero: three scenes, one paced pass ---------- */
  const story = document.querySelector('[data-story]');
  if (story) {
    const steps = [...story.querySelectorAll('.story-step')];
    const scenes = [...story.querySelectorAll('[data-scene-panel]')];
    const caption = story.querySelector('[data-caption]');
    const pauseBtn = story.querySelector('[data-pause]');
    const video = story.querySelector('[data-hero-video]');
    const playBtn = story.querySelector('[data-hero-play]');
    const captions = [
      'Clipboard History — search everything you copied.',
      'Smart Paste — press ⌥V, pick an action, and it pastes. Title Case shown.',
      'Pins & Collections — keep the things you reuse, organized your way.'
    ];
    const IMAGE_MS = 5200, VIDEO_FALLBACK_MS = 9000, VIDEO_TAIL_MS = 900;
    let index = 0, timer = null, started = false, finished = false, userPaused = false, takenOver = false, inView = false;
    let t0 = 0, dur = 0, elapsed = 0;

    const bar = (i) => steps[i].querySelector('.step-bar');
    const setBar = (i, p, ms) => { const b = bar(i); b.style.transition = ms ? `transform ${ms}ms linear` : 'none'; b.style.transform = `scaleX(${p})`; };
    const resetBars = () => steps.forEach((_, i) => setBar(i, 0, 0));

    function show(i) {
      index = i;
      steps.forEach((s, k) => k === i ? s.setAttribute('aria-current', 'true') : s.removeAttribute('aria-current'));
      scenes.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.removeAttribute('hidden'); });
      caption.textContent = captions[i];
      if (video && i !== 1) video.pause();
    }
    const clear = () => { clearTimeout(timer); timer = null; };

    function schedule(ms) { clear(); dur = ms; t0 = performance.now(); elapsed = 0; timer = setTimeout(next, ms); }
    function playScene(i) {
      show(i); resetBars(); if (finished) return;
      if (i === 1 && video) {
        playBtn.hidden = true; video.currentTime = 0;
        const p = video.play();
        if (p && p.catch) p.catch(() => { playBtn.hidden = false; setBar(1, 1, 0); });
        schedule(VIDEO_FALLBACK_MS);                      // safety net; 'ended' normally moves on sooner
        video.onended = () => { if (index === 1 && !takenOver) { clear(); setBar(1, 1, 0); timer = setTimeout(next, VIDEO_TAIL_MS); } };
        video.ontimeupdate = () => { if (index === 1 && video.duration) setBar(1, video.currentTime / video.duration, 0); };
      } else {
        setTimeout(() => setBar(i, 1, IMAGE_MS), 40);
        schedule(IMAGE_MS);
      }
    }
    function next() {
      if (index >= scenes.length - 1) { finished = true; clear(); setBar(index, 1, 0); return; }   // one pass, then rest
      playScene(index + 1);
    }
    function pauseNow() {
      if (!timer) return; elapsed = performance.now() - t0; clear();
      if (index === 1 && video) video.pause(); else setBar(index, Math.min(1, elapsed / dur), 0);
    }
    function resumeNow() {
      if (finished || takenOver || userPaused || !inView || calm()) return;
      if (index === 1 && video && !video.ended) { video.play().catch(() => {}); schedule(Math.max(1500, VIDEO_FALLBACK_MS - elapsed)); return; }
      const left = Math.max(300, dur - elapsed); setBar(index, Math.min(1, elapsed / dur), 0);
      setTimeout(() => setBar(index, 1, left), 40); schedule(left);
    }
    function start() {
      if (started || calm()) return; started = true;
      if (video) { video.preload = 'auto'; video.load(); }                 // ~100 KB; fetched only when the sequence actually runs
      playScene(0);
    }
    function takeOver(i) {                                                 // a person chose a scene: stop auto-advance for good
      takenOver = true; finished = false; clear(); resetBars(); show(i);
      setBar(i, 0, 0);
      if (i === 1 && video) {
        video.preload = 'auto';
        if (calm()) { video.pause(); video.currentTime = 0; playBtn.hidden = false; }
        else { playBtn.hidden = true; video.currentTime = 0; video.play().catch(() => { playBtn.hidden = false; }); }
        video.onended = () => { playBtn.hidden = false; playBtn.textContent = 'Replay'; };
      }
    }
    steps.forEach((s, i) => s.addEventListener('click', () => takeOver(i)));
    playBtn?.addEventListener('click', () => { playBtn.hidden = true; video.currentTime = 0; video.play().catch(() => { playBtn.hidden = false; }); });
    pauseBtn?.addEventListener('click', () => {
      userPaused = !userPaused; pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Resume the sequence' : 'Pause the sequence');
      userPaused ? pauseNow() : resumeNow();
    });
    const stageEl = story.querySelector('[data-stage]');
    let ioFired = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { ioFired = true; inView = e.isIntersecting; if (inView) { started ? resumeNow() : start(); } else pauseNow(); }, { threshold: 0.4 }).observe(stageEl);
    }
    // Fallback for browsers/embedded views that never report intersections: decide once from geometry.
    setTimeout(() => { if (ioFired) return; const r = stageEl.getBoundingClientRect(); inView = r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; if (inView) start(); }, 1200);
    document.addEventListener('visibilitychange', () => document.hidden ? pauseNow() : resumeNow());
    reduceMotion.addEventListener('change', () => { if (calm()) { pauseNow(); clear(); resetBars(); if (video) video.pause(); } });
    show(0);
    if (calm()) pauseBtn.hidden = true;                                    // nothing auto-plays, so nothing to pause
  }

  /* ---------- generic accessible tabs (personas + features) ---------- */
  function tabs(list, tabSel, onShow) {
    const items = [...document.querySelectorAll(`${list} ${tabSel}`)];
    if (!items.length) return;
    const select = (tab) => {
      items.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; const p = document.getElementById(t.getAttribute('aria-controls')); if (p) { p.hidden = !on; if (!on) p.querySelectorAll('video').forEach((v) => v.pause()); } });
      onShow?.(document.getElementById(tab.getAttribute('aria-controls')));
    };
    items.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
        items[n].focus(); select(items[n]);
      });
    });
  }
  tabs('.persona-tabs', '.persona-tab');
  tabs('.tabs', '.tab', (panel) => panel && playVisibleDemos(panel));

  /* ---------- media toggles inside a feature tab ---------- */
  document.querySelectorAll('[data-media-toggle]').forEach((group) => {
    const buttons = [...group.querySelectorAll('button')];
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      const scope = group.parentElement;
      scope.querySelectorAll('.media-choice').forEach((m) => { const on = m.id === b.dataset.mediaTarget; m.hidden = !on; if (!on) m.querySelectorAll('video').forEach((v) => v.pause()); });
      playVisibleDemos(scope);
    }));
  });

  /* ---------- feature demo videos: play once when seen, replay on request ---------- */
  const demos = [...document.querySelectorAll('video[data-demo]')];
  const played = new WeakSet();
  const label = (v, t) => { const c = v.closest('.demo-stage')?.querySelector('.demo-control span'); if (c) c.textContent = t; };
  function visible(v) { return !v.closest('[hidden]') && v.getBoundingClientRect().top < innerHeight * 0.85 && v.getBoundingClientRect().bottom > innerHeight * 0.15; }
  function playOnce(v) { if (calm() || played.has(v) || !visible(v)) return; played.add(v); v.preload = 'auto'; v.currentTime = 0; v.play().catch(() => {}); }
  function playVisibleDemos(root) { root.querySelectorAll('video[data-demo]').forEach(playOnce); }
  demos.forEach((v) => {
    v.loop = false; v.addEventListener('ended', () => label(v, 'Replay'));
    v.addEventListener('play', () => label(v, 'Playing'));
  });
  document.querySelectorAll('.demo-control').forEach((b) => b.addEventListener('click', () => {
    const v = document.getElementById(b.dataset.videoId); v.preload = 'auto'; v.currentTime = 0; played.add(v); v.play().catch(() => {});
  }));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) playOnce(e.target); else e.target.pause(); }), { threshold: 0.6 });
  demos.forEach((v) => io.observe(v));
})();
