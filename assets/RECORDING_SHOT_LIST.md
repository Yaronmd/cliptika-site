# Cliptika 0.5.0 — owner recording shot list (approved preview design)

Baseline: `preview/hero-story-personas` @ `b02b7d7`. The site is **not media-complete** until the P0/P1 clips exist.
Record on the 0.5.0 Build 12 app, synthetic content only, silent, light appearance. Do not mock up UI.

## Spec
Fixed region at 2x, no desktop clutter, H.264 MP4 no audio 24-30 fps, <= ~1.2 MB per 10 s, framed like the existing `.vplayer` clips
(same crop as `smart-paste-hero.mp4`). Provide a poster frame (1100 px JPEG) per clip in `assets/images/frames/`.
Keyboard cues: add `data-cues` timestamps measured in the final file (see README "Keyboard-shortcut overlay"); only default shortcuts that are pressed in the recording.

## Existing media on this design
| Slot | Current presentation | Verdict |
|---|---|---|
| Hero scene 1 Smart Paste | real video `smart-paste-hero.mp4` | keep (0.4.0 recording, flow unchanged) |
| Hero scene 2 Capture | text `.how` card (no footage) | **needs video** (see P0-1) |
| Hero scene 3 Save & find | real stills (Pins, Collections, History) | keep; refresh later (P2) |
| Developers: JSON Pretty | real video `smart-paste-json-pretty.mp4` (~4.97 s) | keep |
| Everyday: Title Case | real still + before/after | keep |
| Tools: Extract Text, Pick Color, Command Palette | text `.how` cards | **need video** (P1) |
| Tools: Lens | text `.how` card | **needs video** (P0-2) |
| Tools: Capture Stack (new) | text `.how` card | **needs video** (P0-1) |
Unused archive clips: `capture-messages.mp4`, `lens-finder.mp4`, `lens-quick-insert.mp4`, `smart-paste-transform.mp4`, `smart-paste-translation.mp4` (0.4.0 RC1). They are not shown on this design.

## P0
**P0-1 `capture-stack-combined.mp4` (8-12 s):** start a Stack, take 3 screenshots of synthetic windows, reorder one in the Stack panel, press Copy Combined Image (↩), paste into Messages/Notes: one combined image. Used for Tools > Capture Stack and as hero scene 2 candidate.
**P0-2 `capture-stack-separate.mp4` (8-10 s):** with 3 images, Copy Separately (⇧⌘C) and paste into an app that accepts several images (say which); then Export Originals (⇧⌘E) and show the files in Finder.
**P0-3 `lens-quick-insert.mp4` (6-8 s):** in a text editor press ⌥A, choose Date & Time, pick a format; then Recent Clipboard. Plus a Lens file-actions clip or still: copy a file in Finder, press ⌥A.

## P1
**P1-1 `smart-paste-recent-images.mp4` (8-10 s):** copy 3 images, ⌥V, Recent Images, Paste All.
**P1-2 `extract-text.mp4` (6-8 s):** ⌥Space, Extract Text, drag over text in a slide, paste (Pro).
**P1-3 `pick-color.mp4` (5-6 s):** ⌥⇧C, click a pixel in the loupe, paste the HEX.
**P1-4 `command-palette.mp4` (5-6 s):** ⌥Space, type "color", Return.
**P1-5 `menu-bar-shortcut-legend.mp4` (6 s):** open the Menu Bar popover, hover the Smart Paste and Lens hints, show the card, Esc.

## P2
Area capture (⌥⇧S) clip for the Capture hero scene if P0-1 is not used; refreshed 0.5 stills of History, Collections and Pins (light/dark, 1500x1063); a 0.5 Smart Paste Title Case re-record.

## Integration
Each clip uses the existing `.vplayer` component (poster, Play/Replay button, plays once, lazy `preload="none"`, keyboard cues). Replace the matching `.how` card; do not add placeholder cards.
