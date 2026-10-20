/* Cliptika site. Hero: ONE paced pass through three stories, then it rests. Reduced-motion / data-saver visitors get no
   autoplay. Only one video ever plays at a time. Every control is a real button with a state-aware label. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const calm = () => reduceMotion.matches || saveData;

  /* ---------- video players ----------
     ONE controller. The button label is DERIVED from the real <video> state on every media event, never set by hand:
     idle -> "Play demo", loading -> "Loading…", playing -> "Pause", paused -> "Resume", ended -> "Replay".
     Replay seeks to 0 and starts playback; a rejected play() promise is handled; only one video plays at a time. */
  const players = [...document.querySelectorAll('[data-vplayer]')];
  const interactionHooks = [];                                 // the hero timeline stops auto-advancing when a person touches the video
  const LABEL = { idle: 'Play demo', loading: 'Loading…', playing: 'Pause', paused: 'Resume', ended: 'Replay' };
  const playerOf = (v) => players.find((p) => p.querySelector('video') === v);
  function stateOf(v) {
    if (v.ended) return 'ended';
    if (!v.paused) return (v.readyState >= 3 && !v.seeking) ? 'playing' : 'loading';
    return v.currentTime > 0.05 ? 'paused' : 'idle';
  }
  function sync(p) {
    const v = p.querySelector('video'), btn = p.querySelector('[data-vbtn]'), s = stateOf(v);
    btn.dataset.state = s; p.querySelector('.vl').textContent = LABEL[s];
    btn.setAttribute('aria-label', `${LABEL[s]}: ${v.getAttribute('aria-label')}`);
    btn.setAttribute('aria-busy', String(s === 'loading'));
    p.querySelector('.vprog').style.setProperty('--vp', (v.duration ? v.currentTime / v.duration * 100 : 0) + '%');
  }
  function pauseAllExcept(keep) { players.forEach((p) => { const v = p.querySelector('video'); if (v !== keep && !v.paused) v.pause(); }); }
  // Seeking needs a seekable resource. Servers without HTTP Range support (e.g. `python3 -m http.server`) leave the video unseekable, so
  // currentTime = 0 can stall or be ignored; in that case reload the source, which always restarts from the beginning.
  function canSeekTo(v, t) { try { const n = v.seekable.length; return n > 0 && v.seekable.end(n - 1) >= Math.min(t + 0.1, v.duration || t + 0.1); } catch (e) { return false; } }
  function rewind(v) { if (v.readyState >= 1 && canSeekTo(v, 0.1)) { try { v.currentTime = 0; return; } catch (e) { /* fall through to reload */ } } v.load(); }
  function startPlayback(v, { restart = false } = {}) {        // used by the button, the hero timeline and manual story selection
    const p = playerOf(v); pauseAllExcept(v); v.preload = 'auto';
    if (restart || v.ended) rewind(v);
    const pr = v.play();
    if (pr && pr.catch) pr.catch((err) => {
      if (err && err.name === 'AbortError') v.addEventListener('canplay', () => v.play().catch(() => p && sync(p)), { once: true });   // interrupted by a seek/load: retry once
      if (p) sync(p);                                                                                                                  // NotAllowedError etc.: fall back to a truthful "Play demo"
    });
    if (p) sync(p);
  }
  function resetPlayer(v) { const p = playerOf(v); v.pause(); if (v.currentTime > 0.05 || v.ended) rewind(v); if (p) sync(p); }
  players.forEach((p) => {
    const v = p.querySelector('video'), btn = p.querySelector('[data-vbtn]');
    v.loop = false;
    btn.addEventListener('click', () => {
      interactionHooks.forEach((h) => h(v));
      if (!v.paused && !v.ended) { v.pause(); return; }
      startPlayback(v, { restart: v.ended });
    });
    ['play', 'playing', 'pause', 'ended', 'waiting', 'seeking', 'seeked', 'canplay', 'loadeddata', 'emptied', 'stalled', 'error'].forEach((e) => v.addEventListener(e, () => sync(p)));
    v.addEventListener('timeupdate', () => sync(p));
    sync(p);
  });
  const stopVideosWithin = (root) => root && root.querySelectorAll('video').forEach((v) => v.pause());

  /* ---------- hero: Smart Paste video -> Capture -> Save & find (Pins, Collections, Search) ---------- */
  const story = document.querySelector('[data-story]');
  if (story) {
    const steps = [...story.querySelectorAll('.story-step')];
    const scenes = [...story.querySelectorAll('[data-scene-panel]')];
    const subs = [...story.querySelectorAll('[data-sub]')];
    const subBtns = [...story.querySelectorAll('[data-sub-btn]')];
    const caption = story.querySelector('[data-caption]');
    const pauseBtn = story.querySelector('[data-pause]');
    const stageEl = story.querySelector('[data-stage]');
    const video = story.querySelector('[data-hero-video]');
    const captions = [
      'Smart Paste — copy, press ⌥V, choose an action, and it pastes straight in.',
      'Capture — press ⌥⇧S, drag over an area, and it is on your clipboard. Demo recording coming soon.',
      'Pins — keep what you reuse one click away.',
      'Collections — group related clips, in the order you choose.',
      'Search — find anything you copied, in seconds.'
    ];
    const MS = [0, 3600, 3000, 3000, 3000];            // beat 0 is the video (ends with the video); beats 2-4 are the three Save & find views
    const VIDEO_FALLBACK_MS = 9000, VIDEO_TAIL_MS = 900;
    const sceneOf = (b) => (b >= 2 ? 2 : b);
    const sceneTotal = (sc) => (sc === 2 ? MS[2] + MS[3] + MS[4] : MS[sc]);
    let beat = 0, timer = null, started = false, finished = false, userPaused = false, takenOver = false, inView = false;
    let t0 = 0, dur = 0, elapsed = 0;
    const bar = (i) => steps[i].querySelector('.step-bar');
    const setBar = (i, p, ms) => { const b = bar(i); b.style.transition = ms ? `transform ${ms}ms linear` : 'none'; b.style.transform = `scaleX(${p})`; };
    const resetBars = () => steps.forEach((_, i) => setBar(i, 0, 0));
    const clear = () => { clearTimeout(timer); timer = null; };

    function showSub(k) {
      subs.forEach((s, i) => s.classList.toggle('is-active', i === k));
      subBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
    }
    function show(b) {
      beat = b; const sc = sceneOf(b);
      steps.forEach((s, i) => i === sc ? s.setAttribute('aria-current', 'true') : s.removeAttribute('aria-current'));
      scenes.forEach((s, i) => s.classList.toggle('is-active', i === sc));
      if (sc === 2) showSub(b - 2);
      if (sc !== 0 && video) resetPlayer(video);                           // leaving the Smart Paste story: stop AND rewind, so returning is consistent
      caption.textContent = captions[b];
    }
    function schedule(ms) { clear(); dur = ms; t0 = performance.now(); elapsed = 0; timer = setTimeout(next, ms); }
    function playVideoBeat() {
      resetBars();
      startPlayback(video, { restart: true });
      schedule(VIDEO_FALLBACK_MS);                                         // safety net (also covers a rejected autoplay); 'ended' normally moves on sooner
    }
    function playBeat(b) {
      show(b);
      if (b === 0) { playVideoBeat(); return; }
      if (b === 1) { resetBars(); setTimeout(() => setBar(1, 1, MS[1]), 40); }
      if (b === 2) { resetBars(); setTimeout(() => setBar(2, 1, sceneTotal(2)), 40); }
      schedule(MS[b]);
    }
    function next() {
      if (beat >= 4) { finished = true; clear(); setBar(2, 1, 0); return; }  // one pass, then rest
      playBeat(beat + 1);
    }
    video?.addEventListener('ended', () => { if (beat === 0 && !takenOver && started && !userPaused) { clear(); setBar(0, 1, 0); timer = setTimeout(next, VIDEO_TAIL_MS); } });
    video?.addEventListener('timeupdate', () => { if (beat === 0 && !takenOver && video.duration) setBar(0, video.currentTime / video.duration, 0); });
    function pauseNow() {
      if (!timer) return; elapsed = performance.now() - t0; clear();
      if (beat === 0) { video.pause(); return; }
      const sc = sceneOf(beat), b = bar(sc); const w = b.getBoundingClientRect().width, full = b.parentElement.getBoundingClientRect().width;
      setBar(sc, full ? Math.min(1, w / full) : 0, 0);
    }
    function resumeNow() {
      if (finished || takenOver || userPaused || !inView || calm()) return;
      if (beat === 0) { if (!video.ended) { startPlayback(video); schedule(Math.max(1500, VIDEO_FALLBACK_MS - elapsed)); } return; }
      const sc = sceneOf(beat), left = Math.max(300, dur - elapsed);
      let more = 0; for (let k = beat + 1; k <= 4 && sceneOf(k) === sc; k++) more += MS[k];
      setTimeout(() => setBar(sc, 1, left + more), 40); schedule(left);
    }
    function start() { if (started || calm()) return; started = true; if (video) { video.preload = 'auto'; video.load(); } playBeat(0); }
    function takeOver(b) {                                                  // a person chose something: stop auto-advance for good
      takenOver = true; finished = false; clear(); resetBars();
      show(b);                                                              // show() rewinds the video when leaving story 1
      if (sceneOf(b) === 0 && video) { resetPlayer(video); if (!calm()) startPlayback(video, { restart: true }); }
    }
    interactionHooks.push((v) => { if (v === video) { takenOver = true; clear(); resetBars(); } });   // touching the video hands control to the person: no surprise scene change
    steps.forEach((s, i) => s.addEventListener('click', () => takeOver(i === 2 ? 2 : i)));
    subBtns.forEach((b, i) => b.addEventListener('click', () => takeOver(2 + i)));
    pauseBtn?.addEventListener('click', () => {
      userPaused = !userPaused; pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Resume the sequence' : 'Pause the sequence');
      userPaused ? pauseNow() : resumeNow();
    });
    let ioFired = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { ioFired = true; inView = e.isIntersecting; if (inView) { started ? resumeNow() : start(); } else pauseNow(); }, { threshold: 0.4 }).observe(stageEl);
    }
    setTimeout(() => { if (ioFired) return; const r = stageEl.getBoundingClientRect(); inView = r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; if (inView) start(); }, 1200);
    document.addEventListener('visibilitychange', () => document.hidden ? pauseNow() : resumeNow());
    reduceMotion.addEventListener('change', () => { if (calm()) { pauseNow(); clear(); resetBars(); if (video) resetPlayer(video); } });
    show(0);
    if (calm()) pauseBtn.hidden = true;                                     // nothing auto-plays, so nothing to pause
  }

  /* ---------- accessible tablists ---------- */
  function tablist(listEl, tabSel, { vertical = false, onSelect } = {}) {
    const items = [...listEl.querySelectorAll(`:scope > ${tabSel}`)];
    if (!items.length) return;
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft', nxt = vertical ? 'ArrowDown' : 'ArrowRight';
    function select(tab, focus) {
      items.forEach((t) => {
        const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { if (!on) stopVideosWithin(panel); panel.hidden = !on; }
      });
      if (focus) tab.focus();
      onSelect?.(tab, document.getElementById(tab.getAttribute('aria-controls')));
    }
    items.forEach((t, i) => {
      t.addEventListener('click', () => select(t, false));
      t.addEventListener('keydown', (e) => {
        if (![prev, nxt, 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === nxt ? 1 : -1) + items.length) % items.length;
        select(items[n], true);
      });
    });
  }
  document.querySelectorAll('.persona-tabs').forEach((l) => tablist(l, '.persona-tab', { onSelect: (_, panel) => { document.querySelectorAll('.persona-panel').forEach((p) => { if (p !== panel) stopVideosWithin(p); }); } }));
  document.querySelectorAll('.case-list').forEach((l) => tablist(l, '.case', { vertical: true }));

})();
