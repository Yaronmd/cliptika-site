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

## Reference demo standard (first used by the JSON Pretty clip)
- Source MOV is never modified; the web clip is a crop of the real footage, same playback speed, constant 30 fps, H.264 high, no audio, `+faststart`.
- Crop to the UI that matters (text, real menu with its shadow, real result); keep VS Code banners/tab bars out of frame by cropping, never by editing pixels.
- ~1.5 s of lead-in, real menu visible long enough to read, final result held ≈2 s; 6–8 s total.
- `data-cues` timing is measured on the exported MP4 (first menu frame minus ~2 frames), not on the source.
- The control sits below the footage so it never covers real UI; overlay bottom-left, clear of menu and result.
