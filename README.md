# Cliptika Site

Public support and privacy pages for Cliptika.

## Keyboard-shortcut overlay for demo videos

Any `.vplayer` can carry per-video cues:

```html
<div class="vplayer" data-vplayer data-cues='[{"t":0.55,"d":1.35,"keys":["⌥","V"],"label":"Smart Paste","pos":"bl"}]'>
```

- `t` = second of the key press **in that exact file** (re-measure after any trim/re-encode), `d` = seconds to show it, `keys` = tokens
  (modifiers are re-ordered ⌃⌥⇧⌘ automatically; words like `Space`, glyphs like `↩ ⎋ ⇥ ⌫ ↑ ↓ ← →`), `label` optional, `pos` = `bl|br|tl|tr|bc`.
- The overlay is derived from `video.currentTime` every frame, so Replay / Pause / Resume / seek / switching demos cannot desync it.
- It is `aria-hidden`; the shortcuts are exposed as a visually hidden sentence linked with `aria-describedby`.
- Authoring: open the page with `?cuedebug=1`, click the video frame, and use `,` / `.` to step one frame; set `t` about one frame before the UI first reacts.
- Only use shortcuts that ship as defaults (see `KEYBOARD_OVERLAY_STORYBOARDS.md` in the screens folder) and that are actually pressed in the recording.
