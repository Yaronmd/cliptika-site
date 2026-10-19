# Cliptika site media manifest (updated 2026-10-20, 0.4.0 pre-release)

| Slot | File(s) | Source | Status |
|---|---|---|---|
| History | `images/{light,dark}/b-clipboard-history.png` | Candidate B (`403275a`) media build, synthetic data, clptikatest | authentic, accepted |
| Collections | `images/{light,dark}/b-collection-research.png` | same | authentic, accepted |
| Pins | `images/{light,dark}/b-pins-and-collections.png` | same | authentic, accepted |
| Smart Paste (Title Case) | `video/production/smart-paste-transform.mp4`, hero screenshot | 0.4.0 RC1 recording (2026-10-09), real UI | authentic; to be re-recorded on the release build when approved |
| Smart Paste translation | `video/production/smart-paste-translation.mp4` | 0.4.0 RC1 recording | authentic |
| Capture | `video/production/capture-messages.mp4` | 0.4.0 RC1 recording | authentic |
| Lens | `images/{light,dark}/lens-finder-context-close.png` | 0.4.0 RC1 still | authentic still; a Copy -> Lens video from the validated build replaces it only if the single capture attempt succeeds |

Not used (archive): `video/production/lens-finder.mp4`, `lens-quick-insert.mp4` (RC1, pre-Candidate-B Finder-context flow).
Copy rules: no claim that the app is publicly available; no Projects / Automations / Workflows marketing; no GitHub link.

## Preview redesign (branch `preview/hero-story-personas`) — where each asset is used
- Hero sequence (one paced pass, then rests): 1 History screenshot (B) -> 2 Smart Paste Title Case recording (RC1, real) -> 3 Pins + Collections screenshot (B).
- "Made for the way you work": Developers = Lens still; Creators = Pins screenshot; Researchers = Research Collection screenshot; Everyday = History screenshot. No simulated UI anywhere.
- "A closer look" tabs: Smart Paste (translation + Title Case recordings), Pins & Collections (2 screenshots), Lens (still), Capture (RC1 recording).
- Pro labels follow the verified Candidate B capability matrix (JSON, translation, region capture, Extract Text, image transforms, Open Terminal Here are Pro).
- Known caveats to resolve with new media: the Lens still is an RC1 image (header reads "Selected File"; Candidate B copied-file Lens may word this differently); the Capture recording shows a third-party website (lego.com) - consider replacing it with neutral content.
