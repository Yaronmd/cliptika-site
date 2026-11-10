/* Cliptika site: product showcase (Menu Bar hero storyboard, Capture Stack, Smart Paste and Lens simulations).
   Every example is a deterministic synthetic fixture. Nothing here reads or writes the visitor's clipboard, calls a server or uses AI.
   The two panels reproduce Cliptika 0.6.0 (14) @ 03fc4ec: ActionLensView / LensView / CliptikaHUDHeader / KeyHintFooter /
   CliptikaSelectionStyle / CliptikaProLockBadge (layout, type, selection, preview rules) and ActionLensResolver /
   SmartPasteHierarchy / SmartPasteSequenceGroup / LensActionResolver (rows, order, short labels). See docs/SHOWCASE_SOURCE_AUDIT.md. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forceCalm = /[?&]motion=reduce\b/.test(location.search);
  const phoneQ = window.matchMedia('(max-width: 760px)');
  const phone = () => phoneQ.matches;
  const narrowQ = window.matchMedia('(max-width: 430px)');   // narrow phones: the story bar names the action alone (the panel shows its path)   // phones: the panel floats over the lower part of the window, as on a Mac, instead of below it
  const calm = () => forceCalm || reduce.matches || (navigator.connection && navigator.connection.saveData);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const onVisible = (el, cb, threshold = 0.35) => {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver((es) => es.forEach((e) => cb(e.isIntersecting)), { threshold }).observe(el);
  };

  /* ---------- the Cliptika mark (HaloMarkGeometry: ring r .40 / 318° +288°, echo r .255 / 150° +150°, core r .085) ---------- */
  const MARK = '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path class="mk-ring" d="M79.73 23.24A40 40 0 1 1 33.73 13.46"/><path class="mk-echo" d="M27.92 62.75A25.5 25.5 0 0 1 62.75 27.92"/><circle class="mk-core" cx="50" cy="50" r="8.5"/></svg>';

  /* ---------- SF Symbol stand-ins, drawn to the same 16 pt grid (names = the symbolName the app uses) ---------- */
  const txt = (t, extra = '') => `<text x="8" y="11.6" text-anchor="middle" class="gt"${extra}>${t}</text>`;
  const SYM = {
    'textformat': txt('Aa'),
    'textformat.size.larger': txt('A'),
    'textformat.size.smaller': txt('a'),
    'textformat.abc': txt('Abc', ' style="font-size:7.6px"'),
    'textformat.abc.dottedunderline': txt('Abc', ' style="font-size:7.6px"') + '<path d="M2.2 14.2h11.6" stroke-dasharray="1 1.3"/>',
    'keyboard': '<rect x="1.2" y="3.8" width="13.6" height="8.6" rx="1.8"/><path d="M3.8 6.6h.6M6.2 6.6h.6M8.6 6.6h.6M11 6.6h.6M3.8 8.6h.6M11 8.6h.6M5.4 10.4h5.2"/>',
    'character.bubble': '<path d="M8 2.2c3.6 0 6.3 2.2 6.3 5.1S11.6 12.4 8 12.4c-.7 0-1.3-.1-1.9-.2L3 14v-3C2.1 10.1 1.7 8.8 1.7 7.3 1.7 4.4 4.4 2.2 8 2.2z"/>' + '<path d="M5.8 9.4 8 4.8l2.2 4.6M6.5 8h3"/>',
    'curlybraces': '<path d="M5.6 2.4c-1.4 0-1.9.6-1.9 1.8v1.7c0 .9-.5 1.6-1.4 2.1.9.5 1.4 1.2 1.4 2.1v1.7c0 1.2.5 1.8 1.9 1.8M10.4 2.4c1.4 0 1.9.6 1.9 1.8v1.7c0 .9.5 1.6 1.4 2.1-.9.5-1.4 1.2-1.4 2.1v1.7c0 1.2-.5 1.8-1.9 1.8"/>',
    'curlybraces.square': '<rect x="1.6" y="1.6" width="12.8" height="12.8" rx="2.6"/><path d="M6.4 4.6c-.8 0-1.1.4-1.1 1v1c0 .5-.3.9-.8 1.2.5.3.8.7.8 1.2v1c0 .6.3 1 1.1 1M9.6 4.6c.8 0 1.1.4 1.1 1v1c0 .5.3.9.8 1.2-.5.3-.8.7-.8 1.2v1c0 .6-.3 1-1.1 1"/>',
    'link': '<path d="M6.9 9.1a2.7 2.7 0 0 0 3.8 0l2.4-2.4a2.7 2.7 0 0 0-3.8-3.8l-.9.9"/><path d="M9.1 6.9a2.7 2.7 0 0 0-3.8 0L2.9 9.3a2.7 2.7 0 0 0 3.8 3.8l.9-.9"/>',
    'link.badge.plus': '<path d="M6.2 8.6a2.5 2.5 0 0 0 3.5 0l2.2-2.2a2.5 2.5 0 0 0-3.5-3.5l-.8.8"/><path d="M8.2 6.4a2.5 2.5 0 0 0-3.5 0L2.5 8.6a2.5 2.5 0 0 0 3.5 3.5l.8-.8"/><path d="M12.6 10.4v4.2M10.5 12.5h4.2"/>',
    'network': '<circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c1.7 1.7 2.4 3.7 2.4 6S9.7 12.3 8 14C6.3 12.3 5.6 10.3 5.6 8S6.3 3.7 8 2"/>',
    'terminal': '<rect x="1.5" y="2.5" width="13" height="11" rx="2"/><path d="m4.4 6 2.1 2-2.1 2M8 10.4h3.6"/>',
    'chevron.left.slash.chevron.right': '<path d="M5 4.5 1.8 8 5 11.5M11 4.5 14.2 8 11 11.5M9.2 3.2 6.8 12.8"/>',
    'swift': '<path d="M13.6 10.2c.9-2.9-.3-6.1-3.2-8 1.4 2.1 1.6 4.6.7 6.4C8.8 7.2 5.8 5 3.4 2.8c1.5 2.1 3 3.8 4.4 5C6 7 4 5.6 2.4 4c1.9 3.1 4.7 6.1 8 7.2-2.4 1.2-5.3.9-8-.5 2.2 2 5 3 8 2.7 1.6-.2 2.6-1 3.4-.6.2-.9 0-1.9-.2-2.6z"/>',
    'percent': '<path d="M12.6 3.4 3.4 12.6"/><circle cx="4.6" cy="4.6" r="1.7"/><circle cx="11.4" cy="11.4" r="1.7"/>',
    'arrow.up.right.square': '<rect x="1.6" y="1.6" width="12.8" height="12.8" rx="2.6"/><path d="M6 10 10.2 5.8M6.6 5.6h3.8v3.8"/>',
    'arrow.up.arrow.down': '<path d="M5 13.2V2.8M2.2 5.6 5 2.8l2.8 2.8M11 2.8v10.4M8.2 10.4l2.8 2.8 2.8-2.8"/>',
    'line.3.horizontal.decrease': '<path d="M2 4.2h12M4.4 8h7.2M6.6 11.8h2.8"/>',
    'scissors': '<circle cx="4" cy="4.4" r="2"/><circle cx="4" cy="11.6" r="2"/><path d="M5.7 5.5 14 12.2M5.7 10.5 14 3.8"/>',
    'text.alignleft': '<path d="M2 3.5h12M2 6.5h8M2 9.5h12M2 12.5h7"/>',
    'photo': '<rect x="1.4" y="2.6" width="13.2" height="10.8" rx="2"/><circle cx="5.4" cy="6.2" r="1.3"/><path d="m2 12.2 3.8-3.6 2.6 2.4 2.1-1.8 3.5 3"/>',
    'rectangle.stack': '<rect x="1.6" y="5.6" width="12.8" height="8.4" rx="1.8"/><path d="M3.4 3.6h9.2M5 1.8h6"/>',
    'square.on.square': '<rect x="1.6" y="5" width="9.4" height="9.4" rx="2"/><path d="M5 3.4V3.2c0-.9.7-1.6 1.6-1.6h6.2c.9 0 1.6.7 1.6 1.6v6.2c0 .9-.7 1.6-1.6 1.6h-.2"/>',
    'checklist': '<path d="m1.8 4 1.3 1.3L5.6 2.8M1.8 10.4l1.3 1.3 2.5-2.5M7.8 4.2h6.4M7.8 10.6h6.4"/>',
    'slider.horizontal.3': '<path d="M1.8 3.6h12.4M1.8 8h12.4M1.8 12.4h12.4"/><circle cx="10.6" cy="3.6" r="1.5" class="gf"/><circle cx="5" cy="8" r="1.5" class="gf"/><circle cx="9" cy="12.4" r="1.5" class="gf"/>',
    'square.and.arrow.up': '<path d="M5.2 6.6H4c-.8 0-1.4.6-1.4 1.4v5c0 .8.6 1.4 1.4 1.4h8c.8 0 1.4-.6 1.4-1.4V8c0-.8-.6-1.4-1.4-1.4h-1.2M8 10V1.6M5.6 4 8 1.6 10.4 4"/>',
    'arrow.down.right.and.arrow.up.left': '<path d="M14 2 9.4 6.6M9.4 2.9v3.7h3.7M2 14l4.6-4.6M6.6 13.1V9.4H2.9"/>',
    'folder': '<path d="M1.6 4.3c0-.8.6-1.4 1.4-1.4h3.2l1.5 1.6h5.3c.8 0 1.4.6 1.4 1.4v6.4c0 .8-.6 1.4-1.4 1.4H3c-.8 0-1.4-.6-1.4-1.4z"/>',
    'calendar': '<rect x="1.8" y="2.8" width="12.4" height="11.4" rx="2"/><path d="M1.8 6.4h12.4M5 1.4v2.6M11 1.4v2.6"/>',
    'clock': '<circle cx="8" cy="8" r="6.2"/><path d="M8 4.4V8l2.4 1.6"/>',
    'calendar.badge.clock': '<path d="M8.2 14.2H3.8c-1.1 0-2-.9-2-2V4.8c0-1.1.9-2 2-2h8.4c1.1 0 2 .9 2 2v3M1.8 6.4h12.4M5 1.4v2.6M11 1.4v2.6"/><circle cx="12" cy="12" r="3"/><path d="M12 10.6V12l.9.7"/>',
    'number': '<path d="M6.2 1.8 4.8 14.2M11.2 1.8 9.8 14.2M2.6 5.4h11.2M2.2 10.6h11.2"/>',
    'clock.arrow.circlepath': '<path d="M2.4 8a5.6 5.6 0 1 0 1.7-4"/><path d="M1.8 1.8v2.8h2.8M8 5v3l2 1.4"/>',
    'doc.on.clipboard': '<path d="M5.4 3.2H4.2c-.8 0-1.4.6-1.4 1.4v8.6c0 .8.6 1.4 1.4 1.4h7.6c.8 0 1.4-.6 1.4-1.4V4.6c0-.8-.6-1.4-1.4-1.4h-1.2"/><rect x="5.4" y="1.8" width="5.2" height="2.6" rx="1"/><path d="M5.6 8h4.8M5.6 10.8h3.2"/>',
    'hammer': '<path d="M9.4 6.6 3.2 12.8a1.4 1.4 0 0 1-2-2l6.2-6.2"/><path d="m6.9 4.1 2.2-2.2 2.6.4 2.4 2.4-1.7 1.7-1.6-.6-1.2 1.2z"/>',
    'doc.badge.plus': '<path d="M9.2 14.2H4.2c-.8 0-1.4-.6-1.4-1.4V3.2c0-.8.6-1.4 1.4-1.4h4.6l3.6 3.6v3"/><path d="M8.8 1.8v3.6h3.6M12.4 10.6v4M10.4 12.6h4"/>',
    'lock.fill': '<rect x="3" y="7" width="10" height="7.4" rx="1.6" class="gf"/><path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2"/>',
    'chevron.right': '<path d="M6 3.2 10.8 8 6 12.8"/>',
    'chevron.left': '<path d="M10 3.2 5.2 8l4.8 4.8"/>',
    'chevron.down': '<path d="M3.2 6 8 10.8 12.8 6"/>',
    'magnifyingglass': '<circle cx="6.8" cy="6.8" r="4.6"/><path d="m10.2 10.2 4 4"/>',
    'gearshape': '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.5 3.5l1.3 1.3M11.2 11.2l1.3 1.3M3.5 12.5l1.3-1.3M11.2 4.8l1.3-1.3"/><circle cx="8" cy="8" r="4.6"/>',
    'power': '<path d="M8 1.8v6"/><path d="M4.6 4a5.6 5.6 0 1 0 6.8 0"/>',
    'viewfinder': '<path d="M1.8 5V3.4c0-.9.7-1.6 1.6-1.6H5M11 1.8h1.6c.9 0 1.6.7 1.6 1.6V5M14.2 11v1.6c0 .9-.7 1.6-1.6 1.6H11M5 14.2H3.4c-.9 0-1.6-.7-1.6-1.6V11"/>',
    'plus.viewfinder': '<path d="M1.8 5V3.4c0-.9.7-1.6 1.6-1.6H5M11 1.8h1.6c.9 0 1.6.7 1.6 1.6V5M14.2 11v1.6c0 .9-.7 1.6-1.6 1.6H11M5 14.2H3.4c-.9 0-1.6-.7-1.6-1.6V11M8 5.2v5.6M5.2 8h5.6"/>',
    'doc.text': '<path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5.2h3.5M6 8.2h4.4M6 10.8h4.4"/>',
    'doc': '<path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5.2h3.5"/>',
    'doc.plaintext': '<path d="M3.6 1.8h8.8v12.4H3.6z"/><path d="M5.8 5h4.4M5.8 7.6h4.4M5.8 10.2h3"/>',
    'square.stack.3d.up': '<path d="M8 2 14 5 8 8 2 5z"/><path d="m2 8 6 3 6-3M2 11l6 3 6-3"/>',
    'minus.circle': '<circle cx="8" cy="8" r="6.2"/><path d="M5 8h6"/>',
    'ellipsis.circle': '<circle cx="8" cy="8" r="6.2"/><circle cx="5.2" cy="8" r=".75" class="gf"/><circle cx="8" cy="8" r=".75" class="gf"/><circle cx="10.8" cy="8" r=".75" class="gf"/>',
    'folder.fill': '<path class="gf" d="M1.6 4.3c0-.8.6-1.4 1.4-1.4h3.2l1.5 1.6h5.3c.8 0 1.4.6 1.4 1.4v6.4c0 .8-.6 1.4-1.4 1.4H3c-.8 0-1.4-.6-1.4-1.4z"/>',
    'briefcase': '<rect x="1.8" y="4.6" width="12.4" height="9" rx="1.8"/><path d="M5.8 4.6V3.4c0-.7.5-1.2 1.2-1.2h2c.7 0 1.2.5 1.2 1.2v1.2M1.8 8.6h12.4"/>',
    'paintpalette': '<path d="M8 1.8c3.5 0 6.2 2.5 6.2 5.6 0 1.8-1.4 3-3 3h-1.4c-.8 0-1.3.7-1 1.4l.3.6c.4.9-.2 1.8-1.2 1.8-3.4 0-6.1-2.8-6.1-6.2S4.5 1.8 8 1.8z"/><circle cx="5" cy="7" r=".8" class="gf"/><circle cx="7.6" cy="4.6" r=".8" class="gf"/><circle cx="10.6" cy="5.6" r=".8" class="gf"/>',
    'checkmark.circle.fill': '<circle class="gf" cx="8" cy="8" r="6.6"/><path d="m5.2 8.2 1.9 1.9 3.8-4" stroke="#fff" stroke-width="1.6"/>'
  };
  const sym = (n, cls = 'sym') => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${SYM[n] || ''}</svg>`;
  const LOCK = `<span class="pro-lock">${sym('lock.fill', 'lk')}Pro</span>`;

  /* ---------- deterministic transforms, same semantics as HaloTextCaseConverter / HaloTextTransforms / HaloLineTools ---------- */
  const words = (s) => s.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  const T = {
    upper: (s) => s.toUpperCase(),
    lower: (s) => s.toLowerCase(),
    title: (s) => s.replace(/\S+/g, cap),                                   // whitespace-delimited, first letter up, rest down
    camel: (s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join(''),
    snake: (s) => words(s).map((w) => w.toLowerCase()).join('_'),
    kebab: (s) => words(s).map((w) => w.toLowerCase()).join('-'),
    dedupe: (s) => { const seen = new Set(); return s.split('\n').filter((l) => !seen.has(l) && seen.add(l)).join('\n'); },
    sort: (s) => s.split('\n').sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join('\n')   // HaloLineTools.sortLines: code-point order, case-sensitive
  };
  // US/ABC <-> Apple Hebrew key map (the layout pair 0.6.0 validates)
  const EN = "qwertyuiopasdfghjkl;zxcvbnm,./'", HE = "/'קראטוןםפשדגכעיחלךףזסבהנמצתץ.,";
  const toHe = (s) => [...s].map((c) => { const i = EN.indexOf(c.toLowerCase()); return i < 0 ? c : HE[i]; }).join('');
  const toEn = (s) => [...s].map((c) => { const i = HE.indexOf(c); return i < 0 ? c : EN[i]; }).join('');
  // US/ABC -> Russian (Apple "Russian" and "Russian – PC" type the same letters on these keys; read from macOS layout data)
  const ENL = 'qwertyuiopasdfghjklzxcvbnm', RU = 'йцукенгшщзфывапролдячсмить';
  const toRu = (s) => [...s].map((c) => { const i = ENL.indexOf(c); return i < 0 ? c : RU[i]; }).join('');

  /* ---------- row builders (titles are the app's short labels) ---------- */
  const caseGroup = (input) => ({
    t: 'Change Case & Naming', s: 'textformat',
    sub: [['UPPERCASE', 'textformat.size.larger', T.upper], ['lowercase', 'textformat.size.smaller', T.lower], ['Title Case', 'textformat', T.title],
      ['camelCase', 'textformat.abc', T.camel], ['snake_case', 'textformat.abc.dottedunderline', T.snake], ['kebab-case', 'textformat', T.kebab]]
      .filter(([, , f]) => f(input) !== input)                                 // no-op rows are never offered
      .map(([t, s, f]) => ({ t, s, out: f(input), n: t }))
  });
  const fixLayout = (input, dir, suggested) => ({
    t: 'Fix Keyboard Layout', s: 'keyboard', suggested,
    // one "To <layout>" row per enabled target layout (HaloLayoutVariantSelection.forwardRowLabel); preview subtitle = directionSubtitle
    sub: [dir === 'he' ? { t: 'To Hebrew', s: 'keyboard', out: toHe(input), fix: 'English → Hebrew', n: 'Hebrew' }
      : dir === 'ru' ? { t: 'To Russian', s: 'keyboard', out: toRu(input), fix: 'English → Russian', n: 'Russian' }
      : { t: 'To English', s: 'keyboard', out: toEn(input), fix: 'Hebrew → English', n: 'English' }]
  });
  const translate = (lang, out) => ({ t: `Translate to ${lang}`, s: 'character.bubble', pro: true, tr: out, n: lang });

  /* ---------- Smart Paste examples (order and grouping follow ActionLensResolver → SmartPasteHierarchy → SmartPasteOverflowLayout) ---------- */
  /* Each example tells one story: what was copied (input, tag) → the menu path the app offers (rows, script) → the pasted result.
     script ops: key = ⌥V opens the panel · sel n = move to row n · exec = open a family / run the action · wait = translation finishes.
     Row fields used by the storyboard (website presentation only): n = short result note, marks = strike the removed parts of the source. */
  const caseIn = 'invoice due date';
  const trIn = 'Thanks for the update. I’ll review the draft tonight and send comments tomorrow.';
  const trInHe = 'הפגישה עברה ליום חמישי בשעה 10:00.';
  const fixIn1 = 'akuo nv bang', fixIn2 = 'ghbdtn';
  const json = '{"name":"Cliptika","version":"0.6.0","pro":true,"tags":["clipboard","mac"],"id":42}';
  const jsonPretty = '{\n  "id" : 42,\n  "name" : "Cliptika",\n  "pro" : true,\n  "tags" : [\n    "clipboard",\n    "mac"\n  ],\n  "version" : "0.6.0"\n}';
  const jsonMin = '{"id":42,"name":"Cliptika","pro":true,"tags":["clipboard","mac"],"version":"0.6.0"}';
  // Clean URL (HaloSmartLinks): drops utm_* and known click IDs, keeps functional parameters such as q
  const urlBase = 'https://shop.example.com/search?q=mac%20mini', urlTrack = '&utm_source=mail&utm_campaign=fall', url = urlBase + urlTrack;
  // HaloLineTools.removeDuplicateLines: exact lines, first occurrence kept, order preserved
  const lines = '  Ship release notes\nUpdate screenshots\nArchive old builds\nUpdate screenshots\nReview pricing copy\nArchive old builds';
  const lineMarks = lines.split('\n').map((l, i, all) => (all.indexOf(l) < i ? `<del>${esc(l)}</del>` : esc(l))).join('\n');
  const trimLines = (s) => s.split('\n').map((l) => l.trim()).join('\n');
  const textRows = (input, dir, suggested, lang, tr) => [caseGroup(input), fixLayout(input, dir, suggested), translate(lang, tr)];
  const caseRows = textRows(caseIn, 'he', false, 'Spanish', 'fecha de vencimiento de la factura');

  const SP = [
    { id: 'json', tab: 'JSON & Developer', pro: true, cap: 'Compact JSON becomes readable, key-sorted JSON. JSON actions are Pro.',
      samples: [{ input: json, kind: 'JSON', tag: 'JSON', video: true, doc: { app: 'config.json — Editor', mono: true, before: '', after: '' },
        rows: [{ t: 'JSON Pretty', s: 'curlybraces', pro: true, out: jsonPretty, n: 'Pretty JSON' }, { t: 'JSON Minify', s: 'curlybraces.square', pro: true, out: jsonMin }],
        script: [['key'], ['exec']] }] },
    { id: 'case', tab: 'Case & Naming', cap: 'Pick a shape for code, files or headings. Changes that would do nothing are never offered.',
      samples: [{ input: caseIn, doc: { app: 'invoices.ts — Editor', mono: true, before: 'let ', after: ' = parseDate(row.due)' },
        rows: caseRows, script: [['key'], ['exec'], ['sel', 2], ['exec']] }] },
    { id: 'translate', tab: 'Translate', pro: true, cap: 'Translates into the language set in Settings and previews it first. macOS 15 or later; Pro.',
      samples: [
        { label: 'English → Spanish', tag: 'English', input: trIn, doc: { app: 'Re: Draft — Mail', before: 'Hola Lucía,\n\n', after: '\n\nSaludos,\nDana' },
          rows: textRows(trIn, 'he', false, 'Spanish', 'Gracias por la actualización. Revisaré el borrador esta noche y enviaré comentarios mañana.'),
          script: [['key'], ['sel', 2], ['exec'], ['wait'], ['exec']] },
        { label: 'Hebrew → English', tag: 'Hebrew', input: trInHe, rtlIn: true, doc: { app: 'Team — Messages', chat: 'Any news on the review?', before: '', after: '' },
          rows: textRows(trInHe, 'en', false, 'English', 'The meeting moved to Thursday at 10:00.'),
          script: [['key'], ['sel', 2], ['exec'], ['wait'], ['exec']] }] },
    { id: 'layout', tab: 'Fix Keyboard Layout', cap: 'Same keys, right letters. Works with compatible keyboard layouts added to your Mac, including Hebrew, Russian, French, German, and more.',
      samples: [
        { label: 'English keys → Hebrew', tag: 'English keys', input: fixIn1, doc: { app: 'Noa — Messages', chat: 'מה קורה? 🙂', before: '', after: '' },
          rows: textRows(fixIn1, 'he', true, 'Spanish'), start: 1, script: [['key'], ['exec'], ['exec']] },
        // U.S. + Russian enabled: "To Russian", no "Suggested" (the detector is calibrated for English ↔ Hebrew only)
        { label: 'English keys → Russian', tag: 'English keys', input: fixIn2, doc: { app: 'Alexei — Messages', chat: 'Ты на связи? 🙂', before: '', after: '' },
          rows: textRows(fixIn2, 'ru', false, 'Spanish'), script: [['key'], ['sel', 1], ['exec'], ['exec']] }] },
    { id: 'lines', tab: 'Lines & Cleanup', cap: 'Formatted lines from a web page: trim, sort, dedupe or paste plain. When more than seven actions fit, the rest wait under More Actions.',
      samples: [{ input: lines, tag: '6 lines', mark: lineMarks, doc: { app: 'Release — Notes', before: 'Release tasks\n\n', after: '' },
        rows: [{ t: 'Trim', s: 'text.alignleft', out: lines.trim() }, { t: 'Trim Lines', s: 'scissors', out: trimLines(lines) },
          { t: 'Sort Lines', s: 'arrow.up.arrow.down', out: T.sort(lines) }, { t: 'Dedupe Lines', s: 'line.3.horizontal.decrease', out: T.dedupe(lines), n: 'Cleaned list', marks: true },
          { t: 'Paste Plain', s: 'doc.plaintext', out: lines }, fixLayout(lines, 'he', false),
          { t: 'More Actions', s: 'ellipsis.circle', more: true, sub: [caseGroup(lines), translate('Spanish')] }],
        script: [['key'], ['sel', 3], ['exec']] }] },
    { id: 'links', tab: 'Links & URLs', cap: 'Remove tracking, make a Markdown link, or generate a GET request in five formats.',
      samples: [{ input: url, kind: 'URL', tag: 'URL', mark: `${esc(urlBase)}<del>${esc(urlTrack)}</del>`, doc: { app: 'Sam — Messages', chat: 'Which Mac mini did you mean?', before: '', after: '' },
        rows: [
          { t: 'Clean URL', s: 'link.badge.plus', out: urlBase, n: 'Clean URL', marks: true },
          { t: 'Markdown Link', s: 'link', out: `[shop.example.com](${url})` },
          { t: 'Generate GET', s: 'network', sub: [
            { t: 'cURL', s: 'terminal', out: `curl --request GET "${url}"` },
            { t: 'fetch', s: 'curlybraces', out: `const response = await fetch("${url}");\nconst data = await response.json();` },
            { t: 'Python', s: 'chevron.left.slash.chevron.right', out: `import requests\n\nresponse = requests.get("${url}")\ndata = response.json()` },
            { t: 'Swift', s: 'swift', out: `let url = URL(string: "${url}")!\nlet (data, response) = try await URLSession.shared.data(from: url)` },
            { t: 'Raw HTTP', s: 'network', out: `GET /search?q=mac%20mini${urlTrack} HTTP/1.1\nHost: shop.example.com` }] },
          { t: 'URL Encode', s: 'percent', out: url },
          { t: 'URL Decode', s: 'percent', out: url.replace('%20', ' ') },
          { t: 'Open URL', s: 'arrow.up.right.square', opens: 'Opens shop.example.com in your browser.' }],
        script: [['key'], ['exec']] }] },
    { id: 'images', tab: 'Images', cap: 'Copied screenshots in a row? Paste the latest, combined or separately, free for up to 3 images. Resizing and converting are Pro.',
      samples: [{ images: true, kind: 'Image · 1440 × 900', doc: { app: 'Design — Messages', chat: 'Can you send the checkout flow?', before: '', after: '' },
        group: { title: 'Recent Images', count: '3 images', rows: [
          { t: 'Paste Latest', s: 'photo', key: 'L', img: [3] },
          { t: 'Paste Combined', s: 'rectangle.stack', key: 'A', detail: 'one image', img: [1, 2, 3], combined: true, n: 'Combined' },
          { t: 'Paste Separately', s: 'square.on.square', key: 'S', detail: '3 images', img: [1, 2, 3] },
          { t: 'Choose Images…', s: 'checklist', key: 'C', opens: 'Lets you pick which recent images to paste.' },
          { t: 'Review & Edit…', s: 'slider.horizontal.3', key: 'R', opens: 'Opens the images in a Capture Stack to reorder them.' },
          { t: 'Export Latest…', s: 'square.and.arrow.up', key: 'E', opens: 'Saves the newest image with the Save panel.' },
          { t: 'Export Originals…', s: 'folder', key: 'O', opens: 'Saves the original images to a folder.' }] },
        rows: [{ t: 'Resize 50%', s: 'arrow.down.right.and.arrow.up.left', pro: true, dims: '720 × 450', img: [3] },
          { t: 'Max 1024px', s: 'arrow.down.right.and.arrow.up.left', pro: true, dims: '1024 × 640', img: [3] },
          { t: 'Max 512px', s: 'arrow.down.right.and.arrow.up.left', pro: true, dims: '512 × 320', img: [3] },
          { t: 'As JPEG', s: 'photo', pro: true, opens: 'Copies a JPEG file you can attach or upload.' },
          { t: 'As PNG', s: 'photo', pro: true, opens: 'Copies a PNG file you can attach or upload.' }],
        start: 1, script: [['key'], ['exec']] }] }
  ];

  /* ---------- Lens examples (LensActionResolver / LensQuickInsert) ---------- */
  const qiRoot = (dt, rc, dev) => [{ t: 'Date & Time', s: 'calendar', sub: dt || [] }, { t: 'Recent Clipboard', s: 'doc.on.clipboard', sub: rc || [] }, { t: 'Developer', s: 'hammer', pro: true, sub: dev || [] }];
  const DT = [{ t: 'Insert Date', s: 'calendar', out: 'Nov 9, 2026' }, { t: 'Insert Time', s: 'clock', out: '9:41 AM' },
    { t: 'Insert Date & Time', s: 'calendar.badge.clock', out: 'Nov 9, 2026 at 9:41 AM' }, { t: 'ISO Timestamp', s: 'number', out: '2026-11-09T07:41:00Z' }];
  const RC = [{ t: '#48213 shipped today — tracking 1Z 999 AA1…', s: 'doc.on.clipboard', out: '#48213 shipped today — tracking 1Z 999 AA1 01 2345 6784' },
    { t: 'https://ci.example.com/run/4821', s: 'doc.on.clipboard', out: 'https://ci.example.com/run/4821' },
    { t: 'Kickoff: Tuesday 10:00 · Room 4', s: 'doc.on.clipboard', out: 'Kickoff: Tuesday 10:00 · Room 4' }];
  const DEV = [{ t: 'UUID', s: 'number', pro: true, out: '9F2C6B1E-4A7D-4E21-B8C3-5D0E7A1F3B92' }, { t: 'Unix Timestamp', s: 'clock.arrow.circlepath', pro: true, out: '1794217260' }];
  // Lens actions that do not type text report what they did (website presentation), never a fake paste
  const LENS = [
    { id: 'qi', tab: 'Quick Insert', cap: 'Cursor in any text field, ⌥A, Date & Time. Formats follow your Mac’s language and region.',
      samples: [{ ctx: ['Context', 'Cursor in a Mail reply'], doc: { app: 'Signed contract — Mail', before: 'Hi Dana,\n\nThe signed copy arrived on ', after: '. I’ll file it today.' },
        rows: qiRoot(DT, RC, DEV), script: [['key'], ['exec'], ['exec']] }] },
    { id: 'recent', tab: 'Recent Clipboard', cap: 'Your recent text clips, right at the cursor.',
      samples: [{ ctx: ['Context', 'Cursor in a support reply'], doc: { app: 'Order #48213 — Support', before: 'Thanks for your patience. Your order ', after: '' },
        rows: qiRoot(DT, RC, DEV), start: 1, script: [['key'], ['exec'], ['exec']] }] },
    { id: 'files', tab: 'Files & Folders', cap: 'Copy a file in Finder (⌘C), then ⌥A within 15 seconds: its path, Reveal, or act on its folder.',
      samples: [{ ctx: ['Copied', 'Q4-report.pdf in Finder'], finder: true, label2: 'Copied File · Q4-report.pdf', groups: [['Copied File', 2], ['This Folder', 3]],
        rows: [{ t: 'Copy Path', s: 'doc.on.clipboard', toast: 'Clipboard now holds /Users/you/Documents/Reports/Q4-report.pdf', res: 'Copied · Path' }, { t: 'Reveal File', s: 'folder', toast: 'Finder reveals Q4-report.pdf', res: 'Shown in Finder' },
          { t: 'New File', s: 'doc.badge.plus', toast: 'A new file is created in Reports', res: 'File created' }, { t: 'Copy Folder Path', s: 'doc.on.clipboard', toast: 'Clipboard now holds /Users/you/Documents/Reports', res: 'Copied · Folder path' },
          { t: 'Open Terminal Here', s: 'terminal', pro: true, toast: 'Terminal opens in ~/Documents/Reports', res: 'Terminal opened' }],
        script: [['key'], ['exec']] }] },
    { id: 'dev', tab: 'Developer', pro: true, cap: 'A fresh UUID or the current Unix timestamp at the cursor. Developer actions are Pro.',
      samples: [{ ctx: ['Context', 'Cursor in fixtures.ts'], doc: { app: 'fixtures.ts — Editor', mono: true, before: 'const order = {\n  id: "', after: '",\n  status: "open",\n};' },
        rows: qiRoot(DT, RC, DEV), start: 2, script: [['key'], ['exec'], ['exec']] }] }
  ];

  const shot = (n) => `<span class="mini-shot ms${n}"><b>${['', 'Pricing', 'Checkout', 'Receipt'][n]}</b><i></i><i></i></span>`;
  const clip = (s, n = 240) => (s.length > n ? s.slice(0, n) + '…' : s);
  const isHe = (s) => /[֐-׿]/.test(s);

  /* ---------- one engine for both panels; menu levels are a path (primary → More Actions → family) ---------- */
  /* Smart Paste and Lens sit side by side, but only one of them ever animates: the one the visitor last touched.
     The other is paused in place (its last result kept, its panel on the demonstrated action), never reset or emptied. */
  const coordinator = { all: [], active: null,
    activate(d) { if (this.active && this.active !== d) this.active.pause(); this.active = d; this.all.forEach((x) => x.root.classList.toggle('is-active', x === d)); } };

  /* Storyboard pacing (ms, the wait BEFORE each scripted step). Automatic playback only; manual input always acts at once.
     Source on screen before ⌥V 1500 · a menu read before the first move 900 · each further move 600 · the chosen action held
     1500 before it runs (the last 260 show a press) · a family that just opened (its preview showing) 1600 · translation 1100
     then 2400 to read it · the result then stays until the visitor or Replay changes it. */
  const PACE = { key: 1500, firstMove: 900, move: 600, dwell: 1500, family: 1600, translate: 1100, read: 2400, press: 260 };
  const TRANSLATE_BUSY = 900;
  const ICON = {
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9M11 3.5v9"/></svg>',
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.6 8z"/></svg>',
    replay: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7"/><path d="M2.6 2.2v2.9h2.9"/></svg>'
  };

  function Demo(root, data, kind) {
    const lens = kind === 'lens';
    const TITLE = lens ? 'Cliptika Lens' : 'Smart Paste', KEY = lens ? 'A' : 'V';
    const tabsEl = $('[data-demo-tabs]', root), body = $('[data-demo-body]', root), capEl = $('[data-demo-cap]', root), extra = $('[data-demo-extra]', root);
    let cat = 0, sample = 0, open = true, path = [], sel = 0, tr = {}, played = false;
    // playback: mode idle | playing | paused; steps = [[delay, op, fn]]; stage src | act | res (the three-step story bar)
    let mode = 'idle', steps = [], pos = 0, timer = null, reTimer = null, syncing = false;
    let stage = 'act', actText = '', resText = '';

    tabsEl.innerHTML = data.map((c, i) => `<button class="sc-tab" role="tab" type="button" id="${kind}-tab-${c.id}" aria-selected="${i === 0}" aria-controls="${kind}-panel" tabindex="${i ? -1 : 0}">${esc(c.tab)}${c.pro ? ' <span class="pro">Pro</span>' : ''}</button>`).join('');
    const tabs = $$('.sc-tab', tabsEl);
    body.id = `${kind}-panel`; body.setAttribute('role', 'tabpanel');

    const S = () => data[cat].samples[sample];
    const node = () => path.reduce((rows, i) => rows[i].sub, S().rows);           // rows of the open level
    const parent = () => path.length ? path.slice(0, -1).reduce((rows, i) => rows[i].sub, S().rows)[path[path.length - 1]] : null;
    const group = () => (!path.length && S().group ? S().group.rows : []);
    const list = () => [...group(), ...node()];
    const cur = () => list()[sel];
    const scene = () => $('[data-scene]', body);

    function build() {
      const c = data[cat], s = S();
      body.innerHTML = `
        <div class="dscene${lens ? ' dscene-lens' : ''}${c.samples.length > 1 ? ' has-switch' : ''}" data-scene data-stage="${stage}">
          ${c.samples.length > 1 ? `<div class="sample-switch" role="group" aria-label="Examples">${c.samples.map((x, i) => `<button type="button" data-sample="${i}" aria-pressed="${i === sample}">${esc(x.label)}</button>`).join('')}</div>` : ''}
          ${sourceStrip(s)}
          ${s.finder ? finderWin() : docWin(s.doc)}
          <div class="hud${lens ? ' hud-lens' : ''}" data-hud role="dialog" aria-label="${TITLE} (interactive demo)" tabindex="-1"></div>
          <div class="vkeys vkeys--bc" data-keys aria-hidden="true"><span class="vk">⌥</span><span class="vk">${KEY}</span><span class="vk-label">${TITLE}</span></div>
          <button class="reopen" type="button" data-reopen hidden><kbd>⌥${KEY}</kbd> ${TITLE}</button>
          <div class="story" data-story>
            <ol class="demo-steps" aria-label="Demo steps (website presentation)">
              <li data-st="src"><b>1</b><span>${esc(lens ? s.ctx[0] : 'Copied')}</span></li>
              <li data-st="act"><b>2</b><span data-act></span></li>
              <li data-st="res"><b>3</b><span data-res></span></li>
            </ol>
            <button type="button" class="story-play" data-play></button>
            <span class="sr-only" aria-live="polite" data-live></span>
          </div>
        </div>
        <div class="sp-real" data-real-slot hidden></div>`;
      capEl.textContent = c.cap;
      extra.innerHTML = s.video ? '<button class="real-rec" type="button" data-real aria-expanded="false">Real recording</button>' : '';
      $$('[data-sample]', body).forEach((b) => b.addEventListener('click', () => { stop(); sample = +b.dataset.sample; reset(); if (calm()) settle(); else demoOnce(); }));
      const real = $('[data-real]', extra); if (real) real.addEventListener('click', () => toggleReal(real));
      $('[data-reopen]', body).addEventListener('click', () => { stop(); reopen(); });
      $('[data-play]', body).addEventListener('click', onPlay);
      $('[data-hud]', body).addEventListener('keydown', keys);
      scene().addEventListener('keydown', (e) => { if (e.altKey && e.code === `Key${KEY}`) { e.preventDefault(); stop(); reopen(); } });
      fitPanel();
      paint(); story();
    }
    /* Stage A: what was copied (Smart Paste) or where the cursor is (Lens). <del> parts are struck through only once a result
       that removed them is on screen (Clean URL, Dedupe Lines). */
    function sourceStrip(s) {
      if (lens) return `<div class="clipstrip is-ctx"><span class="clip-l">${esc(s.ctx[0])}</span><span class="clip-t">${esc(s.ctx[1])}</span></div>`;
      if (s.images) return `<div class="clipstrip is-imgs"><span class="clip-l">Copied</span><span class="clip-imgs">${[1, 2, 3].map(shot).join('')}</span><span class="clip-t">3 screenshots, one after another</span></div>`;
      const multi = s.input.includes('\n');
      const text = s.mark || esc(multi ? s.input : s.input.trim());
      return `<div class="clipstrip${multi ? ' is-multi' : ''}${!multi && s.input.trim().length > 30 ? ' is-long' : ''}"><span class="clip-l">Copied</span>${s.tag ? `<span class="clip-tag">${esc(s.tag)}</span>` : ''}<span class="clip-t${s.doc && s.doc.mono ? ' mono' : ''}${multi ? ' is-lines' : ''}"${s.rtlIn ? ' dir="rtl"' : ''}>${text}</span></div>`;
    }
    function docWin(d) {
      const chat = d.chat != null;
      return `<div class="appwin${chat ? ' is-chat' : ''}${d.term ? ' is-term' : ''}"><div class="appwin-bar"><i></i><i></i><i></i><span>${esc(d.app)}</span></div>
        ${chat ? `<div class="chat"><p class="bubble"${isHe(d.chat) ? ' dir="rtl"' : ''}>${esc(d.chat)}</p></div><div class="compose"><span class="ins" data-ins></span><span class="caret"></span></div>`
          : `<pre class="doc${d.mono ? ' mono' : ''}">${esc(d.before)}<span class="ins" data-ins></span><span class="caret"></span>${esc(d.after)}</pre>`}</div>`;
    }
    function finderWin() {
      return `<div class="appwin is-finder"><div class="appwin-bar"><i></i><i></i><i></i><span>Reports</span></div><div class="files">
        <div class="f"><span class="fi pdf"></span>Q3-report.pdf</div><div class="f is-sel"><span class="fi pdf"></span>Q4-report.pdf</div><div class="f"><span class="fi xls"></span>forecast.numbers</div><div class="f"><span class="fi dir"></span>Archive</div></div>
        <div class="res-callout" data-toast aria-live="polite"><span class="clip-l">Result</span><span data-toast-t></span></div></div>`;
    }

    /* panel markup, mirroring the SwiftUI view tree */
    function header() {
      const s = S(), p = parent();
      const second = p ? '' : lens ? s.label2 || '' : s.kind || '';
      const crumb = p && !lens ? `<span class="crumb">${sym('chevron.left', 'cv')}${esc(p.t)}</span>` : '';
      return `<div class="hud-h"><div class="hud-h1">${MARK}<span>${TITLE}</span>${crumb}</div>${second ? `<div class="hud-h2">${esc(second)}</div>` : ''}</div>
        ${p && lens ? `<button type="button" class="lens-crumb" data-back>${sym('chevron.left', 'cv')}${esc(p.t)}</button>` : ''}`;
    }
    function row(r, i, label) {
      const on = i === sel;
      if (r.key) {   // Recent Images row (SequenceRowView)
        return `<button type="button" class="row seq${on ? ' is-sel' : ''}" data-i="${i}" aria-current="${on}"><span class="lk-key">${r.key}</span>${sym(r.s)}<span class="rt">${esc(r.t)}</span>${r.detail ? `<span class="rd">${esc(r.detail)}</span>` : ''}</button>`;
      }
      return `<button type="button" class="row${on ? ' is-sel' : ''}${r.pro ? ' is-locked' : ''}" data-i="${i}" aria-current="${on}"${r.sub ? ' aria-haspopup="menu"' : ''}>
        <span class="rn">${label}</span>${sym(r.s)}<span class="rt"${isHe(r.t) ? ' dir="auto"' : ''}>${esc(r.t)}</span>
        ${r.suggested && !path.length ? '<span class="sug">Suggested</span>' : ''}${r.more ? `<span class="rd">${r.sub.length}</span>` : ''}${r.pro ? LOCK : ''}${r.sub ? sym('chevron.right', 'chev') : ''}</button>`;
    }
    function rowsHTML() {
      const s = S(), g = group(), a = node();
      let h = '';
      if (g.length) h += `<div class="seq-group"><div class="seq-h"><span>${esc(s.group.title)}</span><em>${esc(s.group.count)}</em></div>${g.map((r, i) => row(r, i)).join('')}</div><hr>`;
      if (lens && !path.length && s.groups) {
        let i = 0; s.groups.forEach(([name, n]) => { h += `<p class="sec-h">${esc(name)}</p>${a.slice(i, i + n).map((r, j) => row(r, i + j, i + j + 1)).join('')}`; i += n; });
      } else if (!a.length) {
        h += '<p class="empty">Nothing to insert yet</p>';
      } else {
        h += a.map((r, j) => row(r, g.length + j, j + 1)).join('');
      }
      return `<div class="rows">${h}</div>`;
    }
    function previewHTML() {
      if (lens) return '';
      const s = S(), r = cur(), reserve = !!s.images && !path.length;
      const placeholder = '<div class="prev"><hr><p class="prev-t">Preview</p><p class="prev-x mono ph">No preview for this action</p></div>';
      if (!r || r.sub || r.key || r.opens) return reserve ? placeholder : '';
      if (r.dims) return `<div class="prev"><hr><p class="prev-t">Preview</p><p class="prev-x mono">${r.dims}</p></div>`;
      if (r.fix) {
        return `<div class="prev"><hr><p class="prev-t">Preview</p><div class="cmp"><span>Before</span><p class="dim"${isHe(s.input) ? ' dir="rtl"' : ''}>${esc(clip(s.input))}</p></div>
          <div class="cmp is-after"><span>After</span><p${isHe(r.out) ? ' dir="rtl"' : ''}>${esc(clip(r.out))}</p></div><p class="prev-note">${r.fix}</p></div>`;
      }
      if (r.tr !== undefined) {
        const st = tr[r.t];
        if (st === 'ready' && r.tr) return `<div class="prev"><hr><p class="prev-t">Preview · Translation</p><p class="prev-x mono clamp4">${esc(clip(r.tr))}</p></div>`;
        return `<div class="prev"><hr><div class="prev-row"><p class="prev-t">Preview</p>${st === 'busy' ? '<span class="busy"><i></i>Translating…</span>' : ''}</div>
          ${st === 'busy' ? '<p class="prev-note">Original (shown until the translation is ready):</p>' : ''}<p class="prev-x mono dim clamp4"${s.rtlIn ? ' dir="rtl"' : ''}>${esc(clip(s.input))}</p></div>`;
      }
      if (r.out != null) return `<div class="prev"><hr><p class="prev-t">Preview</p><p class="prev-x mono clamp4">${esc(clip(r.out))}</p></div>`;
      return reserve ? placeholder : '';
    }
    function verb() {
      const r = cur(); if (!r) return null;
      if (r.sub) return 'Open';
      if (lens) return 'Run';
      if (r.key) return /Review/.test(r.t) ? 'Review' : /Choose/.test(r.t) ? 'Choose' : /Export/.test(r.t) ? 'Export' : 'Paste';
      if (r.tr !== undefined) return tr[r.t] === 'ready' ? 'Paste' : tr[r.t] === 'busy' ? null : 'Translate';
      return 'Paste';
    }
    function footer() {
      const v = verb();
      return `<div class="hints">${v ? `<button type="button" data-go><b>↩</b>${v}</button>` : ''}<span><b>1–9</b>Choose</span><button type="button" class="esc" data-back><b>esc</b>${path.length ? 'Back' : 'Close'}</button></div>`;
    }

    /* the menu path of a row, in the app's own labels: "Fix Keyboard Layout › To Hebrew", "Recent Images › Paste Combined" */
    function actionLabel(r) {
      const names = []; let rows = S().rows;
      path.forEach((i) => { names.push(rows[i].t); rows = rows[i].sub; });
      if (r && r.key && !path.length) names.push(S().group.title);
      if (r) names.push(r.t);
      return names.join(' › ');
    }
    /* the story bar: 1 Copied/Context → 2 the action → 3 the result; website presentation, outside the app windows */
    function story() {
      const bar = $('[data-story]', body); if (!bar) return;
      const k = ['src', 'act', 'res'].indexOf(stage);
      $$('li', bar).forEach((li, i) => { li.classList.toggle('is-on', i === k); li.classList.toggle('is-done', i < k); });
      $('[data-act]', bar).textContent = (stage === 'res' || narrowQ.matches) && actText ? actText.split(' › ').pop() : actText || `⌥${KEY} ${TITLE}`;   // finished: the action's own name, so the result reads in full
      $('[data-res]', bar).textContent = resText || (lens ? 'Result' : 'Pasted');
      scene().dataset.stage = stage;
      const btn = $('[data-play]', bar), m = mode === 'playing' ? 'pause' : mode === 'paused' ? 'play' : 'replay';
      const word = { pause: 'Pause', play: 'Resume', replay: 'Replay' }[m];
      btn.innerHTML = `${ICON[m]}<span>${word}</span>`;
      btn.setAttribute('aria-label', `${word} the ${TITLE} demo`);
    }
    function setStage(st) {
      const changed = st !== stage; stage = st; story();
      if (!changed || syncing) return;
      const live = $('[data-live]', body), s = S();
      if (live) live.textContent = st === 'src' ? `Step 1 of 3. ${lens ? s.ctx.join(': ') : `Copied: ${s.images ? '3 screenshots' : s.input}`}` : st === 'act' ? `Step 2 of 3. ${TITLE}` : `Step 3 of 3. ${actText}: ${resText}`;
    }

    /* Smart Paste opens down-right of the pointer, beside the window; text in the window keeps clear of the panel */
    function fitPanel() {
      const sc = scene(), win = $('.appwin', body), hud = $('[data-hud]', body); if (!sc || !win || lens) return;
      const absolute = getComputedStyle(hud).position === 'absolute' && !phone();
      const ov = absolute ? Math.max(0, win.getBoundingClientRect().right - (sc.getBoundingClientRect().right - hud.offsetWidth)) : 0;
      sc.style.setProperty('--hud-ov', `${Math.round(ov)}px`);
    }
    function panelTop() {
      const win = $('.appwin', body), at = $('[data-ins]', body) || $('.f.is-sel', body), sc = scene();
      if (!win) return 0;
      const y = at ? at.getBoundingClientRect().top - sc.getBoundingClientRect().top + 30 : win.offsetTop + 64;
      return Math.round(Math.max(win.offsetTop + 52, Math.min(y, win.offsetTop + (lens ? 76 : 118))));
    }
    function paint(focus) {
      const hud = $('[data-hud]', body);
      hud.classList.toggle('is-open', open);
      $('[data-reopen]', body).hidden = open;
      if (!open) return;
      const hadFocus = body.contains(document.activeElement);       // read before the rows are replaced
      hud.innerHTML = header() + rowsHTML() + previewHTML() + footer();
      $$('.row', hud).forEach((b) => {
        const i = +b.dataset.i;
        b.addEventListener('mouseenter', () => { if (mode !== 'playing' && sel !== i) { sel = i; if (stage === 'res') setStage('act'); paint(); } });   // hover selects, as in the app
        b.addEventListener('click', () => { stop(); sel = i; execute(); });                                                                       // click = select + run
      });
      $$('[data-back]', hud).forEach((b) => b.addEventListener('click', () => { stop(); back(); }));
      const go = $('[data-go]', hud); if (go) go.addEventListener('click', () => { stop(); execute(); });
      if (focus && hadFocus) hud.focus({ preventScroll: true });
      if (stage === 'act') { actText = actionLabel(cur()); story(); }
      // the panel sits beside the window, and a tall one (Recent Images) rises instead of running into the story bar
      if (phone()) hud.style.top = `${panelTop()}px`;
      else if (lens) hud.style.top = '';
      else if (getComputedStyle(hud).position === 'absolute') {
        const win = $('.appwin', body), bar = $('[data-story]', body);
        hud.style.top = `${win.offsetTop}px`;
        const room = bar.offsetTop - 8, h = hud.offsetHeight;
        // only Recent Images (12 rows) is taller than the stage: it rises to the top and, if still too tall, is drawn a few % smaller
        hud.style.setProperty('--fit', h > room ? Math.max(0.88, room / h).toFixed(3) : '1');
        if (hud.offsetTop + h > room) hud.style.top = `${Math.max(0, room - Math.min(h, room))}px`;
      }
    }

    /* Stage C: the result lands where the visitor's cursor was, and stays highlighted */
    function insert(content, html) {
      if (S().finder) { const t = $('[data-toast]', body); $('[data-toast-t]', t).textContent = content; t.classList.add('is-shown'); flash(t); return; }
      const ins = $('[data-ins]', body); if (!ins) return;
      if (html) ins.innerHTML = html; else { ins.textContent = content; ins.dir = isHe(content) ? 'rtl' : 'auto'; }
      ins.classList.add('is-result'); flash(ins);
    }
    function clearResult() {
      const ins = $('[data-ins]', body); if (ins) { ins.textContent = ''; ins.classList.remove('is-result', 'flash'); }
      const t = $('[data-toast]', body); if (t) t.classList.remove('is-shown', 'flash');
      const n = $('.hud-note', body); if (n) n.classList.remove('flash');
      const sc = scene(); if (sc) sc.classList.remove('show-marks');
    }
    function flash(el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
    function dismiss(afterRun) {   // the panel closes after a paste, as in the app; after a manual try it comes back for the next one
      clearTimeout(reTimer);
      // phones: the panel is part of the page flow, so after a run it stays on the chosen action right under the result
      if (afterRun && getComputedStyle($('[data-hud]', body)).position !== 'absolute') { paint(); return; }
      open = false; path = []; tr = {}; paint();
      if (mode !== 'playing' && !syncing && !(afterRun && phone())) reTimer = setTimeout(() => { if (!open) reopen(true); }, calm() ? 0 : 3000);
    }
    function note(text) {
      let n = $('.hud-note', body);
      if (!n) { n = document.createElement('p'); n.className = 'hud-note'; n.setAttribute('aria-live', 'polite'); scene().appendChild(n); }
      n.textContent = text; flash(n);
    }
    function finish(r) {
      actText = actionLabel(r);
      resText = r.res || (lens ? (r.toast ? 'Result' : 'Inserted') : 'Pasted') + (r.n ? ` · ${r.n}` : '');
      scene().classList.toggle('show-marks', !!r.marks);
      setStage('res');
    }

    function execute() {
      const r = cur(); if (!r) return;
      if (r.sub) { path = [...path, node().indexOf(r)]; sel = 0; paint(true); return; }
      if (r.tr !== undefined) {
        if (!r.tr) { note('The translation appears in the preview first.'); return; }
        if (tr[r.t] === 'ready') { finish(r); insert(r.tr); dismiss(true); return; }
        if (tr[r.t] === 'busy') return;
        if (syncing) { tr[r.t] = 'ready'; paint(); return; }
        tr[r.t] = 'busy'; paint(true);
        setTimeout(() => { tr[r.t] = 'ready'; if (open) paint(true); }, calm() ? 0 : TRANSLATE_BUSY);
        return;
      }
      if (r.opens) { note(`In the app: ${r.opens}`); return; }
      if (r.toast) { finish(r); insert(r.toast); dismiss(true); return; }
      if (r.img) {
        finish(r);
        insert('', r.combined ? `<span class="out-imgs is-combined">${r.img.map(shot).join('')}</span>` : `<span class="out-imgs">${r.img.map(shot).join('')}</span>${r.dims ? `<small class="out-note">${r.dims}</small>` : ''}`);
        dismiss(true); return;
      }
      if (r.out != null) { finish(r); insert(r.out); dismiss(true); return; }
      note('The app shows the exact result in the preview.');
    }
    function back() { if (path.length) { const from = path.pop(); sel = (path.length ? 0 : group().length) + from; paint(true); } else dismiss(); }
    function reopen(quiet) {
      clearTimeout(reTimer);
      const k = $('[data-keys]', body); if (k && !calm() && !quiet && !syncing) { k.classList.add('is-on'); setTimeout(() => k.classList.remove('is-on'), 1100); }
      open = true; path = []; tr = {}; sel = S().start || 0;
      if (!quiet) setStage('act');
      paint(true);
    }
    function keys(e) {
      if (e.key === 'Tab' || e.key === 'Shift') return;
      stop();                                                       // any key in the panel is the visitor's: autoplay ends first
      const n = list().length; let handled = true;
      if (stage === 'res' && /^Arrow(Up|Down)$/.test(e.key)) setStage('act');
      if (e.key === 'ArrowDown') { sel = (sel + 1) % n; paint(true); }
      else if (e.key === 'ArrowUp') { sel = (sel - 1 + n) % n; paint(true); }
      else if (e.key === 'ArrowRight') { if (cur() && cur().sub) execute(); }
      else if (e.key === 'ArrowLeft') { if (path.length) back(); }
      else if (e.key === 'Escape') back();
      else if (e.key === 'Enter') execute();
      else if (/^[1-9]$/.test(e.key)) { const i = group().length + (+e.key - 1); if (i < n) { sel = i; execute(); } }
      else if (!lens && /^[a-z]$/i.test(e.key) && !path.length) { const i = group().findIndex((r) => r.key === e.key.toUpperCase()); if (i >= 0) { sel = i; execute(); } else handled = false; }
      else handled = false;
      if (handled) e.preventDefault();
    }

    function toggleReal(btn) {
      const slot = $('[data-real-slot]', body), show = slot.hidden;
      slot.hidden = !show; scene().hidden = show;
      btn.setAttribute('aria-expanded', String(show)); btn.textContent = show ? 'Interactive demo' : 'Real recording';
      if (show && !slot.firstChild) {
        slot.innerHTML = '<div class="vclip"><div class="vframe"><video muted playsinline controls preload="metadata" poster="assets/images/frames/poster-smart-paste-json-pretty.jpg" aria-label="Real recording: one-line JSON formatted with JSON Pretty"><source src="assets/video/production/smart-paste-json-pretty.mp4?v=20261020b" type="video/mp4"></video></div></div><p class="real-cap">Authentic recording (0.4): copy one-line JSON, press ⌥V, choose JSON Pretty.</p>';
      }
      if (!show) { const v = $('video', slot); if (v) v.pause(); }
      stop();
    }

    function reset() { halt(); mode = 'idle'; clearTimeout(reTimer); open = true; path = []; tr = {}; sel = S().start || 0; stage = 'act'; actText = ''; resText = ''; build(); }
    function selectTab(i, focus) {
      cat = i; sample = 0;
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      if (focus) tabs[i].focus({ preventScroll: true });
      const row = tabs[i].parentElement; if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: Math.max(0, tabs[i].offsetLeft - row.offsetLeft - 24), behavior: calm() ? 'auto' : 'smooth' });
      reset();
    }
    { const row = tabs[0].parentElement, end = () => row.classList.toggle('is-end', row.scrollLeft + row.clientWidth >= row.scrollWidth - 4);
      row.addEventListener('scroll', end, { passive: true }); new ResizeObserver(end).observe(row); }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => { coordinator.activate(self); selectTab(i); if (calm()) settle(); else demoOnce(); });
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (d == null) return;
        e.preventDefault();
        selectTab(d === -99 ? 0 : d === 99 ? tabs.length - 1 : (i + d + tabs.length) % tabs.length, true);
        settle();
      });
    });

    /* ---------- playback: Source → Action → Result, paced for reading; any interaction hands control to the visitor ---------- */
    function timeline(s) {
      const out = [], ops = s.script || [];
      ops.forEach((op, i) => {
        const prev = ops[i - 1] ? ops[i - 1][0] : null, kind0 = op[0];
        if (kind0 === 'key') out.push([PACE.key, op, () => reopen()]);
        else if (kind0 === 'sel') out.push([prev === 'sel' ? PACE.move : PACE.firstMove, op, () => { sel = op[1]; paint(); }]);
        else if (kind0 === 'wait') out.push([PACE.translate, op, () => { const r = cur(); if (r && r.tr !== undefined) { tr[r.t] = 'ready'; paint(); } }]);
        else {
          const hold = prev === 'wait' ? PACE.read : prev === 'exec' ? PACE.family : PACE.dwell;
          out.push([hold - PACE.press, ['press'], () => { const b = $('.hud .row.is-sel', body); if (b) b.classList.add('is-press'); }]);
          out.push([PACE.press, op, () => execute()]);
        }
      });
      return out;
    }
    function halt() { clearTimeout(timer); timer = null; }
    function stop() { halt(); if (mode !== 'idle') { mode = 'idle'; story(); } }
    function run() {
      if (mode !== 'playing') return;
      if (pos >= steps.length) { mode = 'idle'; story(); return; }        // the result stays; Replay starts again
      timer = setTimeout(() => { timer = null; const st = steps[pos++]; st[2](); run(); }, steps[pos][0]);
    }
    /* phones: the panel sits in the page flow, so reserve the height of its tallest state in this example before playing */
    function reserveHud() {
      const hud = $('[data-hud]', body), win = $('.appwin', body); hud.style.minHeight = ''; if (win) win.style.minHeight = '';
      if (!body.offsetParent) return;
      const ph = phone();
      if (getComputedStyle(hud).position === 'absolute' && !ph) return;
      const was = syncing; syncing = true;
      open = true; path = []; tr = {}; sel = S().start || 0; paint();
      let max = hud.offsetHeight;
      timeline(S()).forEach(([, op, fn]) => {
        if (op[0] === 'press') return;
        const r = open ? cur() : null;   // a translation is tallest while it is still "Translating…"
        if (op[0] === 'exec' && r && r.tr !== undefined && tr[r.t] !== 'ready') { tr[r.t] = 'busy'; paint(); max = Math.max(max, hud.offsetHeight); delete tr[r.t]; }
        fn(); if (open) { paint(); max = Math.max(max, hud.offsetHeight); }
      });
      if (ph && win) { win.style.minHeight = `${Math.ceil(panelTop() - win.offsetTop + max + (lens ? 8 : 14))}px`; scene().style.setProperty('--win-bottom', `${win.offsetTop + win.offsetHeight}px`); }
      else hud.style.minHeight = `${max}px`;
      clearResult(); syncing = was;
    }
    function begin() {   // Stage A: the source alone, panel closed, nothing else moving
      halt(); clearTimeout(reTimer); clearResult();
      const k = $('[data-keys]', body); if (k) k.classList.remove('is-on');
      reserveHud();
      open = false; path = []; tr = {}; sel = S().start || 0; actText = ''; resText = '';
      paint(); setStage('src');
      steps = timeline(S()); pos = 0;
    }
    function demoOnce(user) {
      if (calm() && !user) { settle(); return; }
      begin(); mode = 'playing'; story(); run();
    }
    function onPlay() {
      coordinator.activate(self);
      if (mode === 'playing') { halt(); mode = 'paused'; story(); return; }                  // freeze exactly here
      if (mode === 'paused') { mode = 'playing'; story(); run(); return; }
      demoOnce(true);                                                                         // Replay (also under reduced motion: the visitor asked)
    }
    /* the finished storyboard without animation: source, the panel on the demonstrated action (its preview showing) and the
       result in place. Used at rest, for reduced motion and when a running card is paused by the other card or the viewport. */
    function settle() {
      syncing = true; begin();
      let fin = null;
      steps.forEach(([, op, fn]) => {
        if (op[0] === 'press') return;
        if (op[0] === 'exec') { const r = cur(); if (r && !r.sub && !r.opens) fin = { path: [...path], sel, tr: { ...tr } }; }
        fn();
      });
      syncing = false; clearTimeout(reTimer); mode = 'idle';
      const k = $('[data-keys]', body); if (k) k.classList.remove('is-on');
      open = !phone();
      if (fin) { path = fin.path; sel = fin.sel; tr = fin.tr; }
      paint(); story();
    }
    function pause() {   // another card became active, or this one left the viewport
      const k = $('[data-keys]', body); if (k) k.classList.remove('is-on');
      if (mode === 'playing' || mode === 'paused') settle();
    }
    const self = { root, pause, get playing() { return mode === 'playing'; } };
    coordinator.all.push(self);
    // any real interaction with a card makes it the active one (the other pauses where it is)
    ['pointerdown', 'keydown', 'focusin'].forEach((ev) => root.addEventListener(ev, () => { if (coordinator.active !== self) coordinator.activate(self); }));
    // off screen: stop and settle; nothing restarts on its own when it comes back
    onVisible(root, (v) => {
      if (!v) { if (mode === 'playing') pause(); return; }
      if (!played) {
        played = true;
        if (lens || calm() || (coordinator.active && coordinator.active !== self && coordinator.active.playing)) return;   // Lens rests until touched
        coordinator.activate(self); demoOnce();
      }
    }, 0.45);
    let rz = null;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const h = $('[data-hud]', body); if (h && getComputedStyle(h).position === 'absolute' && !phone()) h.style.minHeight = ''; fitPanel(); if (open) paint(); }, 150); });
    phoneQ.addEventListener('change', () => { if (mode === 'idle') settle(); else { halt(); settle(); } });
    selectTab(0);
    settle();

    /* deterministic test hook (tests/demo-states.html): runs one example's script synchronously and records every state */
    const snap = (label) => {
      const ins = $('[data-ins]', body), toast = $('[data-toast-t]', body), hud = $('[data-hud]', body), r = open ? cur() : null;
      let result = toast && toast.textContent ? toast.textContent : ins ? ins.textContent : '';
      if (ins && ins.querySelector('.mini-shot')) result = `[${ins.querySelectorAll('.mini-shot').length} images${ins.querySelector('.is-combined') ? ', combined' : ''}]`;
      return { step: label, stage, open, selected: r ? actionLabel(r) : null, preview: open ? ($('.prev', hud) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim() : '',
        result, bar: $$('.story li', body).map((li) => `${li.classList.contains('is-on') ? '>' : li.classList.contains('is-done') ? '✓' : ' '}${li.textContent.trim()}`).join(' | '),
        struck: scene().classList.contains('show-marks') ? $$('.clipstrip del', body).map((d) => d.textContent) : [] };
    };
    return Object.assign(self, {
      kind, categories: data.map((c) => ({ id: c.id, tab: c.tab, samples: c.samples.map((x) => x.label || c.tab) })),
      trace(ci, si) {
        coordinator.activate(self); selectTab(ci); sample = si; reset(); syncing = true; begin();
        const states = [snap('source')], timing = steps.map(([d, op]) => [op.join(' '), d]);
        steps.forEach(([, op, fn]) => { if (op[0] === 'press') return; fn(); states.push(snap(op.join(' '))); });
        syncing = false; clearTimeout(reTimer); settle();
        return { states, timing };
      }
    });
  }

  /* ---------- hero: the real menu bar window (HaloMenuView), with sample data ---------- */
  function hero() {
    const root = $('[data-hero]'); if (!root) return;
    if (/[?&]menubarIcon=color\b/.test(location.search)) { const ic = $('.hm-icon', root); if (ic) ic.classList.add('is-color'); }   // owner reference only, not the shipping look
    const vp = $('[data-hm-viewport]', root), cv = $('[data-hm-canvas]', root), cap = $('[data-hm-caption]', root), cursor = $('[data-hm-cursor]', root);
    $$('[data-sym]', root).forEach((el) => { el.outerHTML = sym(el.dataset.sym, `sym ${el.className}`.trim()); });
    const QA = [['viewfinder', 'Screenshot'], ['doc.badge.plus', 'New File'], ['doc.on.clipboard', 'Full Path'], ['terminal', 'Terminal']];
    $('[data-qa]', root).innerHTML = QA.map(([s, l]) => `<button type="button" class="qa-b">${sym(s, 'qa-g')}<span>${l}</span></button>`).join('');
    const COLS = [['Commands', 5, 'indigo', 'terminal', [['git pull --rebase origin main', 'text'], ['npm run build && npm run preview', 'text'], ['ssh deploy@staging.example.com', 'text'], ['docker compose up -d', 'text'], ['tail -f /var/log/app.log', 'text']]],
      ['Client — Acme', 3, 'green', 'briefcase', [['https://acme.example.com/brief', 'link'], ['Acme brand guide v3', 'text'], ['Image · 1600×1000', 'image']]],
      ['Design tokens', 3, 'orange', 'paintpalette', [['#1F6FEB', 'text'], ['Spacing: 4 · 8 · 12 · 16 · 24', 'text'], ['font-family: "SF Pro Text"', 'text']]]];
    const PINS = [['Support Email Template', 'text'], ['Brand Colors', 'text'], ['Standup Agenda', 'text']];
    const RECENT = [['git status --short', 'text'], ['https://ci.example.com/run/4821', 'link'], ['Image · 1440×900', 'image'], ['…/Reports/Q4-report.pdf', 'file'], ['Kickoff: Tuesday 10:00 · Room 4', 'text']];
    const TYPE = { text: 'doc.plaintext', link: 'link', file: 'doc', image: 'photo' };   // ClipboardContentType.symbolName
    const item = (t, k, i) => `<button type="button" class="mrow" data-copy="${i}">${sym(TYPE[k] || 'doc.plaintext', 'mt')}<span class="mtx">${esc(t)}</span><span class="ok">${sym('checkmark.circle.fill', 'okg')}</span></button>`;
    $('[data-cols]', root).innerHTML = COLS.map(([n, c, col, icon], i) => `<button type="button" class="mrow col" data-col="${i}"><span class="fold c-${col}">${sym(icon, 'mt')}</span><span class="mtx">${esc(n)}</span><em>${c}</em></button>`).join('');
    $('[data-pins]', root).innerHTML = PINS.map(([t, k], i) => item(t, k, `p${i}`)).join('');
    $('[data-recent]', root).innerHTML = RECENT.map(([t, k], i) => item(t, k, `r${i}`)).join('');
    const main = $('[data-pop-main]', root), browser = $('[data-pop-browser]', root);
    function openCol(i) {
      const [n, c, col, icon, items] = COLS[i];
      browser.innerHTML = `<button type="button" class="b-back" data-bback>${sym('chevron.left', 'cv')}<span class="fold c-${col}">${sym(icon, 'mt')}</span><b>${esc(n)}</b><em>${c}</em></button>${items.map(([t, k], j) => item(t, k, `c${j}`)).join('')}<p class="b-foot">Open in History <b>⌘O</b></p>`;
      main.hidden = true; browser.hidden = false; cap.textContent = `${n}: click an item to copy it.`;
      $('[data-bback]', browser).addEventListener('click', closeCol); wireCopy(browser);
    }
    function closeCol() { browser.hidden = true; main.hidden = false; cap.textContent = 'Everything you copy and save, one click away in the menu bar.'; }
    function copied(btn) { btn.classList.remove('is-copied'); void btn.offsetWidth; btn.classList.add('is-copied'); setTimeout(() => btn.classList.remove('is-copied'), 1100); cap.textContent = `Copied “${btn.querySelector('.mtx').textContent}”. The window stays open.`; }
    function wireCopy(scope) { $$('[data-copy]', scope).forEach((b) => b.addEventListener('click', () => { stopAuto(); copied(b); })); }
    $$('[data-col]', root).forEach((b) => b.addEventListener('click', () => { stopAuto(); openCol(+b.dataset.col); }));
    $('[data-col-toggle]', root).addEventListener('click', (e) => { const b = e.currentTarget, x = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', String(x)); $('[data-cols]', root).hidden = !x; stopAuto(); });
    wireCopy(main);
    $('[data-pop]', root).addEventListener('keydown', (e) => { if (e.key === 'Escape' && !browser.hidden) { e.preventDefault(); closeCol(); } });
    // scale the 660 × 700 scene to its column; phones frame the window itself
    const fit = () => {
      const w = vp.clientWidth, narrow = w < 540, sw = narrow ? 352 : 660, s = Math.min(1, w / sw);
      cv.style.setProperty('--s', s); cv.style.setProperty('--ox', narrow ? '-296px' : '0px');
      vp.style.height = `${(narrow ? 448 : 700) * s}px`;   // phones: the top of the menu (search, Quick Actions, Collections, Pinned) and a soft crop
      vp.classList.toggle('is-cropped', narrow);
    };
    new ResizeObserver(fit).observe(vp); fit();
    // one quiet pass: open a Collection, copy a saved command, go back
    let auto = [];
    const stopAuto = () => { auto.forEach(clearTimeout); auto = []; cursor.classList.remove('is-on'); };
    const at = (ms, fn) => auto.push(setTimeout(fn, ms));
    const point = (el) => { const r = el.getBoundingClientRect(), c = cv.getBoundingClientRect(), s = parseFloat(cv.style.getPropertyValue('--s')) || 1; cursor.style.transform = `translate(${(r.left - c.left) / s + r.width / s * 0.55}px,${(r.top - c.top) / s + r.height / s * 0.55}px)`; };
    let ran = false;
    onVisible(root, (v) => {
      if (!v || ran || calm()) return; ran = true;
      cursor.classList.add('is-on');
      const col = $('[data-col="0"]', root);
      at(900, () => point(col));
      at(1700, () => { col.classList.add('is-hot'); });
      at(2000, () => { col.classList.remove('is-hot'); openCol(0); });
      at(2700, () => point($('[data-copy="c2"]', browser)));
      at(3500, () => { const b = $('[data-copy="c2"]', browser); b.classList.add('is-hot'); copied(b); });
      at(5600, () => { $('[data-copy="c2"]', browser) && $('[data-copy="c2"]', browser).classList.remove('is-hot'); closeCol(); cursor.classList.remove('is-on'); });
    }, 0.4);
  }

  /* ---------- Capture Stack review window (CaptureStackPanelView) ---------- */
  function captureStack() {
    const root = $('[data-cs]'); if (!root) return;
    $$('[data-sym]', root).forEach((el) => { el.outerHTML = sym(el.dataset.sym, `sym ${el.className}`.trim()); });
    const demo = $('.cs-demo', root), list = $('[data-cs-list]', root), count = $('[data-cs-count]', root), out = $('[data-cs-out]', root), outL = $('[data-cs-out-l]', root), say = $('[data-cs-caption]', root), btns = $$('[data-cs-step]', root);
    const SHOTS = [[1, '9:41:08 AM'], [2, '9:41:31 AM'], [3, '9:42:02 AM']];
    const rowHTML = ([n, time], i, selected) => `<div class="csr${selected ? ' is-sel' : ''}"><span class="csr-n">${i + 1}</span><span class="csr-t">${shot(n)}</span><span class="csr-m"><b>${time}</b><small>1440 × 900</small></span>${sym('minus.circle', 'csr-x')}</div>`;
    const combined = () => `<span class="out-imgs is-combined">${[1, 3, 2].map(shot).join('')}</span>`;
    // CaptureStackPanelView @ 03fc4ec: "Copy Combined Image" (↩) puts the image on the clipboard and reports
    // "Combined image copied · Ready to paste with ⌘V" (CaptureStackPresentation). Nothing is pasted by the window itself.
    const STEPS = [
      { rows: [0], label: 'Clipboard', out: () => shot(1), say: 'Take a screenshot as usual. On its own, it is simply on your clipboard, ready to paste.' },
      { rows: [0, 1, 2], label: 'Clipboard', out: () => shot(3), say: 'Keep capturing. Each screenshot joins the Stack in order, and the originals stay in Clipboard History.' },
      { rows: [0, 2, 1], sel: 1, label: 'Clipboard', out: () => shot(3), say: 'Review the order. Select a screenshot and move it with ⌥↑ or ⌥↓ (or drag it), or remove it.' },
      { rows: [0, 2, 1], press: true, label: 'Clipboard', out: combined, done: true, say: 'Copy Combined Image (↩) puts one tall image on your clipboard, ready to paste anywhere with ⌘V. Or Copy Separately (⇧⌘C), Save… (⌘S) or Export Originals… (⇧⌘E).' }
    ];
    /* automatic playback is instructional (≈16.5 s); a click on a step shows that step's finished state at once.
       [wait before this frame (ms), step, partial state] */
    const FRAMES = [
      [0, 0, {}],                                                                           // Capture   3.0 s
      [3000, 1, { rows: [0, 1], out: () => shot(2) }],                                      // Collect   4.0 s: one at a time
      [1800, 1, {}],
      [2200, 2, { rows: [0, 1, 2], sel: 2 }],                                               // Review    4.0 s: the original order first
      [1800, 2, {}],
      [2200, 3, { press: true, label: 'Clipboard', out: () => shot(3), done: false }],      // Combine   5.0 s: the press, then the result
      [1000, 3, {}]
    ];
    const HOLD = 4000;
    let step = 0, timer = null, mode = 'idle', frame = 0, offscreen = false;
    const rowsByKey = {};
    function renderRows(order, selected) {
      const before = {}; Object.entries(rowsByKey).forEach(([k, el]) => { if (el.isConnected) before[k] = el.getBoundingClientRect().top; });
      Object.keys(rowsByKey).forEach((k) => { if (!order.includes(+k)) { rowsByKey[k].remove(); delete rowsByKey[k]; } });
      order.forEach((r, i) => {
        let el = rowsByKey[r];
        if (!el) { const t = document.createElement('div'); t.innerHTML = rowHTML(SHOTS[r], i, false); el = t.firstElementChild; el.classList.add('is-new'); setTimeout(() => el.classList.remove('is-new'), 600); rowsByKey[r] = el; }
        el.querySelector('.csr-n').textContent = i + 1;
        el.classList.toggle('is-sel', selected === i);
        list.appendChild(el);
      });
      if (calm()) return;
      order.forEach((r) => {      // FLIP: rows that already existed glide to their new place
        const el = rowsByKey[r]; if (before[r] == null) return;
        const dy = before[r] - el.getBoundingClientRect().top; if (!dy) return;
        el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`;
        requestAnimationFrame(() => { el.style.transition = 'transform .45s cubic-bezier(.22,.7,.2,1)'; el.style.transform = ''; });
      });
    }
    const status = $('[data-cs-status]', root), play = $('[data-cs-play]', root);
    let started = false;   // set by the first autoplay or by any manual choice, which autoplay then never overrides
    function show(k, focus, partial) {
      step = k; const st = { ...STEPS[k], ...(partial || {}) };
      demo.dataset.step = k;
      renderRows(st.rows, st.sel);
      count.textContent = `${st.rows.length} of 3 screenshots`;
      const outKey = `${k}:${st.rows.length}:${st.done ? 1 : 0}`;
      if (outL.textContent !== st.label || out.dataset.k !== outKey) { outL.textContent = st.label; out.innerHTML = st.out(); out.dataset.k = outKey; }
      say.textContent = st.say;
      $('[data-cs-copy]', root).classList.toggle('is-pressed', !!st.press && !st.done);
      status.hidden = !st.done; demo.classList.toggle('is-done', !!st.done);
      btns.forEach((x, i) => { x.setAttribute('aria-selected', String(i === k)); x.tabIndex = i === k ? 0 : -1; });
      if (focus) btns[k].focus();
    }
    function bar() {
      const m = mode === 'playing' ? 'pause' : mode === 'paused' ? 'play' : 'replay', word = { pause: 'Pause', play: 'Resume', replay: 'Replay' }[m];
      play.innerHTML = `${ICON[m]}<span>${word}</span>`; play.setAttribute('aria-label', `${word} the Capture Stack demo`);
    }
    function tick() {
      clearTimeout(timer);
      if (mode !== 'playing' || offscreen) return;
      if (frame >= FRAMES.length) { timer = setTimeout(() => { mode = 'idle'; bar(); }, HOLD); return; }
      const [wait, k, partial] = FRAMES[frame];
      timer = setTimeout(() => { frame += 1; show(k, false, partial); tick(); }, wait);
    }
    function start() { started = true; coordinator.activate(self); frame = 0; mode = 'playing'; bar(); tick(); }
    function stopAuto() { clearTimeout(timer); mode = 'idle'; bar(); }
    const self = { root, get playing() { return mode === 'playing'; }, pause() { if (mode === 'playing') { clearTimeout(timer); mode = 'paused'; bar(); } } };
    coordinator.all.push(self);
    play.addEventListener('click', () => {
      if (mode === 'playing') { self.pause(); return; }
      if (mode === 'paused') { coordinator.activate(self); mode = 'playing'; bar(); tick(); return; }
      start();
    });
    btns.forEach((x, i) => {
      x.addEventListener('click', () => { started = true; coordinator.activate(self); stopAuto(); show(i); });   // manual: the finished step, at once
      x.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -9, End: 9 }[e.key]; if (d == null) return; e.preventDefault(); started = true; stopAuto(); show(d === -9 ? 0 : d === 9 ? 3 : (i + d + 4) % 4, true); });
    });
    onVisible(root, (v) => {
      offscreen = !v;
      if (!v) { clearTimeout(timer); return; }
      if (!started && !calm()) { if (coordinator.active && coordinator.active !== self && coordinator.active.playing) return; started = true; start(); return; }
      if (mode === 'playing') tick();   // carries on from the same frame when it comes back into view
    }, 0.5);
    // the caption keeps the height of the longest one, so the steps below never jump
    const reserveSay = () => { say.style.minHeight = ''; const was = say.textContent; let m = 0; STEPS.forEach((x) => { say.textContent = x.say; m = Math.max(m, say.offsetHeight); }); say.textContent = was; say.style.minHeight = `${m}px`; };
    show(3); bar();
    if (!calm()) show(0);
    reserveSay(); let rs = null; window.addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(reserveSay, 150); });
  }

  /* the hero and Capture Stack stay interactive demos by owner decision: no static-capture swap */
  $$('[data-mark]').forEach((el) => { el.innerHTML = MARK; });
  hero();
  captureStack();
  window.__cliptikaDemos = $$('[data-demo]').map((el) => Demo(el, el.dataset.demo === 'lens' ? LENS : SP, el.dataset.demo));   // read by tests/demo-states.html
})();
