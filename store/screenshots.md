# BibleVerse — screenshot plan

Capture these after `npm start` (phone frame) or from a simulator. Use a clean
install so likes and saves are empty, except one shot that shows a saved verse.
Do not include personal data, debug overlays, or the desktop side panel.

Suggested order, same scenes on every size:

1. **Daily Feed** — Home tab, first named verse card fully visible (title, verse, reference).
2. **Verse of the day** — the full-bleed verse card (top-bar + button).
3. **Bible** — a chapter open (for example John 1 or Psalm 23) with readable text.
4. **Search** — Discover or Bible search with a real result, for example “Psalm 23”.
5. **Feasts** — the calendar on a day that has a feast or saint.
6. **Profile** — About / Privacy entry points visible. Optional; not required for the minimum set.

Shots 1–3 are the minimum for both stores. 4–5 show the rest of the app.

## Apple App Store

The Xcode target includes iPhone and iPad (`TARGETED_DEVICE_FAMILY = 1,2`), so
App Store Connect requires both.

| Device | Size (px) | Notes |
|---|---|---|
| iPhone 6.9" (required) | 1320 × 2868 or 1290 × 2796 | iPhone 16 Pro Max class. Portrait. |
| iPhone 6.5" (required if you still support that class) | 1284 × 2778 or 1242 × 2688 | Upload if Connect asks for it. |
| iPad 13" (required) | 2064 × 2752 or 2048 × 2732 | Portrait. The layout shows the side column above 900px wide; crop to the app, not the desktop marketing column, or capture the full window if it looks intentional. |

- Format: PNG or JPEG, no alpha required, RGB.
- 3–10 screenshots per device size.
- No status-bar mock that disagrees with the real device clock if you capture from Simulator. Prefer Simulator captures so the status bar is the system one.

## Google Play

| Asset | Size | Required |
|---|---|---|
| Phone screenshots | 1080 × 1920 (9:16) recommended. Min short side 320px, max 3840px. | Yes, at least 2 |
| 7" tablet | 1200 × 1920 | Only if you opt into tablet |
| 10" tablet | 1600 × 2560 | Only if you opt into tablet |
| Feature graphic | 1024 × 500 | Yes |
| App icon | 512 × 512 | Yes — use `assets/icons/icon-512.png` |

Feature graphic: gold open book + star on near-black (`assets/logo.svg` colors),
the word “BibleVerse”, and the line “Every verse has a name.” No tiny text.
Play will not accept a screenshot as the feature graphic.

## How to capture

- iOS: Xcode → iPhone 16 Pro Max and iPad Pro 13" simulators, then Cmd-S in the Simulator.
- Android: Android Studio emulator, phone, 1080 × 1920, or `adb exec-out screencap -p`.
- Hide the demo clock if you screenshot the web preview; the in-app status bar is decorative and should not appear in store images. Capture the native app, where that bar is hidden.
