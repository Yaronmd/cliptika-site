/* Cliptika site. Hero: ONE paced pass through three stories, then it rests. Reduced-motion / data-saver visitors get no
   autoplay. Only one video ever plays at a time. Every control is a real button with a state-aware label. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const calm = () => reduceMotion.matches || saveData;

  /* ---------- video players: Play demo -> Pause -> Resume -> Replay; one at a time ---------- */
  const players = [...document.querySelectorAll('[data-vplayer]')];
  function setState(p, state) {
    const btn = p.querySelector('[data-vbtn]'), label = p.querySelector('.vl'), v = p.querySelector('video');
    const text = { idle: 'Play demo', playing: 'Pause', paused: 'Resume', ended: 'Replay' }[state];
    btn.dataset.state = state; label.textContent = text;
    btn.setAttribute('aria-label', `${text}: ${v.getAttribute('aria-label')}`);
  }
  function pauseAllExcept(keep) { players.forEach((p) => { const v = p.querySelector('video'); if (v !== keep && !v.paused) v.pause(); }); }
  players.forEach((p) => {
    const v = p.querySelector('video'), btn = p.querySelector('[data-vbtn]'), prog = p.querySelector('.vprog');
    v.loop = false;
    btn.addEventListener('click', () => {
      if (btn.dataset.state === 'playing') { v.pause(); return; }
      if (btn.dataset.state === 'ended') v.currentTime = 0;
      v.preload = 'auto'; pauseAllExcept(v); v.play().catch(() => setState(p, 'idle'));
    });
    v.addEventListener('play', () => { pauseAllExcept(v); setState(p, 'playing'); });
    v.addEventListener('pause', () => { if (!v.ended) setState(p, v.currentTime > 0 ? 'paused' : 'idle'); });
    v.addEventListener('ended', () => { setState(p, 'ended'); prog.style.setProperty('--vp', '100%'); });
    v.addEventListener('timeupdate', () => { if (v.duration) prog.style.setProperty('--vp', (v.currentTime / v.duration * 100) + '%'); });
    setState(p, 'idle');
  });
  const stopVideosWithin = (root) => root && root.querySelectorAll('video').forEach((v) => v.pause());

  /* ---------- hero ---------- */
  const story = document.querySelector('[data-story]');
  if (story) {
    const steps = [...story.querySelectorAll('.story-step')];
    const scenes = [...story.querySelectorAll('[data-scene-panel]')];
    const subs = [...story.querySelectorAll('[data-sub]')];
    const subBtns = [...story.querySelectorAll('[data-sub-btn]')];
    const caption = story.querySelector('[data-caption]');
    const pauseBtn = story.querySelector('[data-pause]');
    const stageEl = story.querySelector('[data-stage]');
    const captions = [
      'Clipboard History — everything you copied, searchable and ready to reuse.',
      'Capture — press ⌥⇧S, drag over an area, and it is on your clipboard. Real recording coming soon.',
      'Pins — keep the things you reuse one click away.',
      'Collections — group related clips, in the order you choose.'
    ];
    const MS = { 0: 4800, 1: 3800, 2: 3300, 3: 3300 };   // 2 = pins view, 3 = collections view (both are scene 2)
    let beat = 0, timer = null, started = false, finished = false, userPaused = false, takenOver = false, inView = false;
    let t0 = 0, dur = 0, elapsed = 0;
    const sceneOf = (b) => (b >= 2 ? 2 : b);
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
      caption.textContent = captions[b];
    }
    function schedule(ms) { clear(); dur = ms; t0 = performance.now(); elapsed = 0; timer = setTimeout(next, ms); }
    function playBeat(b) {
      show(b);
      if (b === 0 || b === 1) resetBars();
      if (b === 2) setBar(2, 0, 0);
      const total = b === 2 ? MS[2] + MS[3] : MS[b];
      if (b === 3) { /* continue the bar started at beat 2 */ } else { setTimeout(() => setBar(sceneOf(b), 1, total), 40); }
      schedule(MS[b]);
    }
    function next() {
      if (beat >= 3) { finished = true; clear(); setBar(2, 1, 0); return; }          // one pass, then rest
      playBeat(beat + 1);
    }
    function pauseNow() { if (!timer) return; elapsed = performance.now() - t0; clear(); const i = sceneOf(beat); const b = bar(i); const w = b.getBoundingClientRect().width, full = b.parentElement.getBoundingClientRect().width; setBar(i, full ? Math.min(1, w / full) : 0, 0); }
    function resumeNow() {
      if (finished || takenOver || userPaused || !inView || calm()) return;
      const left = Math.max(300, dur - elapsed); const i = sceneOf(beat);
      const remainingBeats = beat === 2 ? MS[3] : 0;
      setTimeout(() => setBar(i, 1, left + remainingBeats), 40); schedule(left);
    }
    function start() { if (started || calm()) return; started = true; playBeat(0); }
    function takeOver(i) {                                         // a person chose a story: stop auto-advance for good
      takenOver = true; clear(); resetBars(); show(i === 2 ? 2 : i);
    }
    steps.forEach((s, i) => s.addEventListener('click', () => takeOver(i)));
    subBtns.forEach((b, i) => b.addEventListener('click', () => { takenOver = true; clear(); resetBars(); show(2 + i); }));
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
    reduceMotion.addEventListener('change', () => { if (calm()) { pauseNow(); clear(); resetBars(); } });
    show(0);
    if (calm()) pauseBtn.hidden = true;                            // nothing auto-plays, so nothing to pause
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
  document.querySelectorAll('.tabs').forEach((l) => tablist(l, '.tab'));

  /* ---------- two-way switch (Smart Paste: change case / translate) ---------- */
  document.querySelectorAll('[data-switch]').forEach((group) => {
    const buttons = [...group.querySelectorAll('button')];
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      document.querySelectorAll('.switch-pane').forEach((p) => { const on = p.id === b.dataset.target; p.hidden = !on; if (!on) stopVideosWithin(p); });
    }));
  });
})();
