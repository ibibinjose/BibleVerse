# BibleVerse — Daily Scripture Companion (iOS & Android)

A Christian daily Scripture companion for iPhone and Android, built with Capacitor from one web codebase. **Everything is inside the app** — a reflective feed of named verses plus the complete Catholic Bible — so it works fully offline with no server, no account, and no tracking.

## The Bible inside

- **Full Catholic Bible, 73 books** — World English Bible Catholic Edition (modern English, public domain), in traditional Catholic book order, including the deuterocanonical books: Tobit, Judith, Wisdom, Sirach, Baruch, and 1–2 Maccabees, with the Greek portions of Esther and Daniel.
- 1,328 chapters · 35,379 verses, stored in `data/` as one JSON file per book (`data/bible/*.json` + `data/books.json`) and copied into both native apps.
- Bible tab: browse by Old / New Testament, open any chapter, tap a verse to copy or share, adjust text size, jump with Previous / Next (across book boundaries), and search the whole Bible — all on-device.
- Your place is remembered ("Continue reading"), as are likes, saves, and comments (on-device storage only).
- Reading works in airplane mode: on the web a service worker caches the shell, fonts and every Bible book; in the native apps the same files ship in the bundle, so nothing is ever fetched.

Verses in the Feed are short named cards ("Light in the Darkness", "Peace That Guards", …); the Bible tab is where the complete text lives.

## Logo, About, sharing

- **Logo:** a gold open book + ✦ star on near-black, drawn as [`assets/logo.svg`](assets/logo.svg). PNG sets are generated offline with `npm run icons` ([`scripts/make-icons.mjs`](scripts/make-icons.mjs), no external tools) — PWA icons/favicons in `assets/icons/`, the iOS AppIcon, and all Android launcher densities + adaptive foreground.
- **About:** Profile → "About this app" explains what's inside, the WEBC source, and the offline/private design, with share actions.
- **Share the app:** the top-bar paper-plane icon, Profile → "Share app", and About → "Share BibleVerse" all share an app invite (system share sheet where available, clipboard fallback). "Copy invite text" copies it without opening the sheet.

## Privacy & store submission

- **Privacy:** the app collects nothing — no account, no server, no analytics, no ads, no tracking. Full policy in [`privacy.html`](privacy.html) (host it as your public privacy URL) and in-app under Profile → Privacy Policy. iOS ships a [`PrivacyInfo.xcprivacy`](ios/App/App/PrivacyInfo.xcprivacy) manifest (no tracking, no collected data types).
- **Questionnaires:** copy-paste answers for Apple App Privacy and Google Play Data safety in [`store/privacy-answers.md`](store/privacy-answers.md) (both: no data collected or shared).
- **Category & listing:** App Store primary **Reference** (secondary Education), age **4+**; Google Play **Books & Reference**, rating **Everyone**. Descriptions, keywords, and the pre-submit checklist live in [`store/store-listing.md`](store/store-listing.md).

## Develop (web preview)

```bash
npm start          # builds www/ and serves it at http://127.0.0.1:5173
```

## Build the native apps

```bash
npm run sync       # rebuild www/ (app + Bible + fonts) and sync into ios/ + android/
npm run ios        # sync, then open the Xcode project
npm run android    # sync, then open the Android Studio project
```

- **iOS:** open `ios/App/App.xcodeproj` in Xcode, pick your team, run on a simulator or device. Bundle ID: `com.bibleverse.app`.
- **Android:** open `android/` in Android Studio (JDK 21, SDK 36) and run, or `cd android && ./gradlew assembleDebug` for a debug APK.

Regenerate the Bible data at any time with `npm run build:bible` (downloads the public-domain WEBC source once, validates 73 books / 1,328 chapters / 35,379 verses, and rewrites `data/`). Check it with `node scripts/verify-bible.mjs`.

Note: `scripts/cap-shim.cjs` lets the Capacitor CLI run in sandboxed shells where `os.userInfo()` is unavailable; it changes nothing about the apps themselves.
