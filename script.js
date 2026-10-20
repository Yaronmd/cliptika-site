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
  /* ---------- keyboard-shortcut overlay ----------
     Per-video metadata on the player:  data-cues='[{"t":0.55,"d":1.3,"keys":["⌥","V"],"label":"Smart Paste","pos":"bl"}]'
       t = second the shortcut is pressed in THAT recording, d = how long to show it, keys = glyph tokens, pos = bl|br|tl|tr|bc (default bl).
     The overlay is STATELESS: whether a cue shows is derived from video.currentTime on every frame/event, so Replay, Pause, Resume, seeking,
     switching demos and reloads can never leave it out of sync. It is decorative (aria-hidden); the same shortcut is exposed to assistive
     technology as text. Add ?cuedebug=1 to the URL for a frame-accurate time readout (and , / . to step one frame) while authoring cues. */
  const MODS = { '⌃': 'Control', '⌥': 'Option', '⇧': 'Shift', '⌘': 'Command' };
  const MOD_ORDER = '⌃⌥⇧⌘';                                      // macOS order
  const KEY_SPEAK = { '↩': 'Return', '⎋': 'Escape', '⇥': 'Tab', '⌫': 'Delete', '↑': 'Up Arrow', '↓': 'Down Arrow', '←': 'Left Arrow', '→': 'Right Arrow', Space: 'Space' };
  const ORDER = (k) => { const i = MOD_ORDER.indexOf(k); return i < 0 ? 99 : i; };
  const cueDebug = /[?&]cuedebug\b/.test(location.search);
  function parseCues(p) {
    let raw = []; try { raw = JSON.parse(p.dataset.cues || '[]'); } catch (e) { raw = []; }
    return raw.filter((c) => c && c.keys && c.keys.length && isFinite(c.t) && isFinite(c.d) && c.d > 0)
      .map((c) => ({ t: +c.t, d: +c.d, label: c.label || '', pos: ['bl', 'br', 'tl', 'tr', 'bc'].includes(c.pos) ? c.pos : 'bl',
        keys: [...c.keys].sort((a, b) => ORDER(a) - ORDER(b)) }))
      .sort((a, b) => a.t - b.t);
  }
  const speak = (c) => c.keys.map((k) => MODS[k] || KEY_SPEAK[k] || k).join(' ') + (c.label ? ` (${c.label})` : '');
  function setupKeys(p) {
    const cues = parseCues(p); if (!cues.length && !cueDebug) return;
    const v = p.querySelector('video'), el = document.createElement('div');
    el.className = 'vkeys'; el.setAttribute('aria-hidden', 'true'); (p.querySelector('.vclip') || p).appendChild(el);   // sits on the footage itself
    p._keys = { cues, el, cur: -1, loop: 0 };
    if (cues.length) {                                                        // text alternative for assistive technology
      const sr = document.createElement('p'); sr.className = 'sr-only'; sr.id = (v.id || 'demo') + '-keys';
      sr.textContent = 'Keyboard shortcuts shown in this demo: ' + cues.map(speak).join('; ') + '.';
      p.appendChild(sr); v.setAttribute('aria-describedby', [v.getAttribute('aria-describedby'), sr.id].filter(Boolean).join(' '));
    }
    if (cueDebug) {
      const d = document.createElement('div'); d.className = 'vdebug'; d.setAttribute('aria-hidden', 'true'); (p.querySelector('.vclip') || p).appendChild(d); p._keys.dbg = d;
      p.tabIndex = 0; p.addEventListener('keydown', (e) => { if (e.key === ',' || e.key === '.') { v.pause(); v.currentTime = Math.max(0, v.currentTime + (e.key === '.' ? 1 : -1) / 30); e.preventDefault(); } });
    }
    const frame = () => { renderKeys(p); if (!v.paused && !v.ended) p._keys.loop = (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(frame) : requestAnimationFrame(frame)); };
    v.addEventListener('playing', () => { cancelAnimationFrame(p._keys.loop); frame(); });
  }
  function renderKeys(p) {
    const st = p._keys; if (!st) return;
    const v = p.querySelector('video'), t = v.currentTime || 0;
    if (st.dbg) st.dbg.textContent = t.toFixed(3) + ' s · ' + (v.paused ? 'paused' : 'playing');
    let i = -1; for (let k = 0; k < st.cues.length; k++) { if (t >= st.cues[k].t && t < st.cues[k].t + st.cues[k].d) { i = k; break; } }
    if (i === st.cur) return;
    st.cur = i;
    if (i >= 0) {                                                             // content stays in place while fading out, so there is no empty flash
      const c = st.cues[i]; st.el.className = 'vkeys vkeys--' + c.pos; st.el.replaceChildren();
      c.keys.forEach((k) => { const kc = document.createElement('kbd'); kc.className = 'vk' + (k.length > 1 ? ' vk-word' : ''); kc.textContent = k; st.el.appendChild(kc); });
      if (c.label) { const l = document.createElement('span'); l.className = 'vk-label'; l.textContent = c.label; st.el.appendChild(l); }
      void st.el.offsetWidth;                                                 // restart the entrance for each cue
      st.el.classList.add('is-on');
    } else st.el.classList.remove('is-on');
  }

  const players = [...document.querySelectorAll('[data-vplayer]')];
  const interactionHooks = [];                                 // the hero timeline stops auto-advancing when a person touches the video
  const LABEL = { idle: 'Play demo', loading: 'Pause', playing: 'Pause', paused: 'Resume', ended: 'Replay' };   // no 'Loading…' flash: a requested play shows its next action
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
    renderKeys(p);
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
    v.loop = false; setupKeys(p);
    btn.addEventListener('click', () => {
      interactionHooks.forEach((h) => h(v));
      if (!v.paused && !v.ended) { v.pause(); return; }
      startPlayback(v, { restart: v.ended });
    });
    ['play', 'playing', 'pause', 'ended', 'waiting', 'seeking', 'seeked', 'canplay', 'loadeddata', 'emptied', 'stalled', 'error'].forEach((e) => v.addEventListener(e, () => sync(p)));
    v.addEventListener('timeupdate', () => sync(p));
    sync(p);
  });
  const stopVideosWithin = (root) => root && root.querySelectorAll('video').forEach((v) => resetPlayer(v));      // leaving a demo: stop AND rewind, so returning is consistent

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
      'Capture — press ⌥⇧S, drag over an area, and it is on your clipboard, ready to paste.',
      'Pins — keep what you reuse one click away.',
      'Collections — group related clips, in the order you choose.',
      'Search — find anything you copied, in seconds.'
    ];
    const MS = [0, 3600, 6500, 6500, 6500];            // beat 0 is the video (ends with the video); beats 2-4 are the three Save & find views (6.5 s each: time to read a real screenshot)
    const VIDEO_FALLBACK_MS = 9000, VIDEO_TAIL_MS = 900;
    const sceneOf = (b) => (b >= 2 ? 2 : b);
    let beat = 0, timer = null, started = false, finished = false, userPaused = false, takenOver = false, inView = false;
    let t0 = 0, dur = 0, elapsed = 0;
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
      startPlayback(video, { restart: true });
      schedule(VIDEO_FALLBACK_MS);                                         // safety net (also covers a rejected autoplay); 'ended' normally moves on sooner
    }
    function playBeat(b) {
      show(b);
      if (b === 0) { playVideoBeat(); return; }
      schedule(MS[b]);
    }
    function next() {
      if (takenOver) return;                                                // a person is in control: an old timer must never move the stage
      if (beat >= 4) { finished = true; clear(); ui(); return; }  // one pass, then rest
      playBeat(beat + 1);
    }
    video?.addEventListener('ended', () => { if (beat === 0 && !takenOver && started && !userPaused) { clear(); timer = setTimeout(next, VIDEO_TAIL_MS); } });
    function pauseNow() {
      if (!timer) return; elapsed = performance.now() - t0; clear();
      if (beat === 0) video.pause();
    }
    function resumeNow() {
      if (finished || takenOver || userPaused || !inView || calm()) return;
      if (beat === 0) { if (!video.ended) { startPlayback(video); schedule(Math.max(1500, VIDEO_FALLBACK_MS - elapsed)); } return; }
      schedule(Math.max(300, dur - elapsed));
    }
    function start() { if (started || takenOver || calm()) return; started = true; if (video) { video.preload = 'auto'; video.load(); } playBeat(0); }
    function takeOver(b) {                                                  // a person chose something: stop auto-advance for good
      takenOver = true; finished = false; clear(); ui();
      show(b);                                                              // show() rewinds the video when leaving story 1
      if (sceneOf(b) === 0 && video) { resetPlayer(video); if (!calm()) startPlayback(video, { restart: true }); }
    }
    interactionHooks.push((v) => { if (v === video) { takenOver = true; clear(); ui(); } });   // touching the video hands control to the person: no surprise scene change
    steps.forEach((s, i) => s.addEventListener('click', () => takeOver(i === 2 ? 2 : i)));
    subBtns.forEach((b, i) => b.addEventListener('click', () => takeOver(2 + i)));
    // ONE control for the sequence. It is "Pause" while auto-advancing, and becomes "Resume autoplay" once a person has chosen a story/view
    // (explicit selection stops auto-advance until they press it) or "Replay the sequence" after the single pass has finished.
    function ui() {
      if (!pauseBtn) return;
      const on = userPaused || takenOver || finished;
      const label = takenOver ? 'Resume autoplay' : finished ? 'Replay the sequence' : userPaused ? 'Resume the sequence' : 'Pause the sequence';
      pauseBtn.setAttribute('aria-pressed', String(on)); pauseBtn.setAttribute('aria-label', label); pauseBtn.title = label;
    }
    pauseBtn?.addEventListener('click', () => {
      if (takenOver || finished) {                                          // intentional resume: continue from where the person left the stage
        takenOver = false; userPaused = false; const again = finished; finished = false; ui();
        playBeat(again ? 0 : beat); return;
      }
      userPaused = !userPaused; ui();
      userPaused ? pauseNow() : resumeNow();
    });
    let ioFired = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { ioFired = true; inView = e.isIntersecting; if (inView) { started ? resumeNow() : start(); } else pauseNow(); }, { threshold: 0.4 }).observe(stageEl);
    }
    setTimeout(() => { if (ioFired) return; const r = stageEl.getBoundingClientRect(); inView = r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.3; if (inView) start(); }, 1200);
    document.addEventListener('visibilitychange', () => document.hidden ? pauseNow() : resumeNow());
    reduceMotion.addEventListener('change', () => { if (calm()) { pauseNow(); clear(); if (video) resetPlayer(video); } });
    show(0); ui();
    if (calm()) pauseBtn.hidden = true;                                     // nothing auto-plays, so nothing to pause
  }

  /* ---------- accessible tablists ---------- */
  function tablist(listEl, tabSel, { vertical = false, onSelect } = {}) {
    const items = [...listEl.querySelectorAll(`:scope > ${tabSel}`)];
    if (!items.length) return;
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft', nxt = vertical ? 'ArrowDown' : 'ArrowRight';
    let userSelected = false;
    function select(tab, focus) {
      items.forEach((t) => {
        const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { if (!on) stopVideosWithin(panel); panel.hidden = !on; }
      });
      if (focus) tab.focus();
      onSelect?.(tab, document.getElementById(tab.getAttribute('aria-controls')));
      const panel = document.getElementById(tab.getAttribute('aria-controls')), pv = panel && [...panel.querySelectorAll('video')].find((x) => x.getClientRects().length);
      if (pv && userSelected && !calm()) startPlayback(pv, { restart: true });     // an explicit choice starts that demo (never on page load)
    }
    items.forEach((t, i) => {
      t.addEventListener('click', () => { userSelected = true; select(t, false); });
      t.addEventListener('keydown', (e) => {
        if (![prev, nxt, 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === nxt ? 1 : -1) + items.length) % items.length;
        userSelected = true; select(items[n], true);
      });
    });
  }
  document.querySelectorAll('.persona-tabs').forEach((l) => tablist(l, '.persona-tab', { onSelect: (_, panel) => { document.querySelectorAll('.persona-panel').forEach((p) => { if (p !== panel) stopVideosWithin(p); }); } }));
  document.querySelectorAll('.case-list').forEach((l) => tablist(l, '.case', { vertical: true }));

})();
