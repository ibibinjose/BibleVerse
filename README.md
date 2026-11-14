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

- **Privacy:** the app collects nothing — no account, no server, no analytics, no ads, no tracking. Full policy in [`privacy.html`](privacy.html), served at `/privacy`, and in-app under Profile → Privacy Policy. Support is [`support.html`](support.html) at `/support`. iOS ships a [`PrivacyInfo.xcprivacy`](ios/App/App/PrivacyInfo.xcprivacy) manifest (no tracking, no collected data types).
- **Questionnaires:** copy-paste answers for Apple App Privacy and Google Play Data safety in [`store/privacy-answers.md`](store/privacy-answers.md) (both: no data collected or shared).
- **Category & listing:** App Store primary **Reference** (secondary Education), age **4+**; Google Play **Books & Reference**, rating **Everyone**. Descriptions, keywords, the screenshot plan, and the pre-submit checklist live in [`store/`](store/).

## Develop (web preview)

```bash
npm start          # builds www/ and serves it at http://127.0.0.1:5173
```

`/privacy` and `/support` are the public pages the stores ask for. Unknown paths serve `index.html`, same as Cloudflare Pages.

## Host on Cloudflare Pages (free)

The product plan, including Plus pricing and what stays free, is in [`docs/PRODUCT_PLAN.md`](docs/PRODUCT_PLAN.md). Purchases stay off until `plusEnabled` is true in `site.json`.

The public origin lives in [`site.json`](site.json) (`url`). The build stamps it into canonical links, Open Graph and Twitter cards, the sitemap, and the share invite. It is `https://bibleverse-bg9.pages.dev` until you attach a custom domain — change that one value, then rebuild.

The site is static. `npm run build` copies the web app into `www/` (no env vars). Deploy that folder to Pages:

```bash
npm run deploy
# npm run build && wrangler pages deploy www --project-name bibleverse
```

Wrangler needs `CLOUDFLARE_API_TOKEN` (Account / Cloudflare Pages / Edit) and `CLOUDFLARE_ACCOUNT_ID` in the environment. The running site needs no secrets. In the Pages dashboard, the build command is `npm run build` and the output directory is `www`. There is no `404.html`, so Pages serves `index.html` for unknown paths. `privacy.html` and `support.html` are also available at `/privacy` and `/support`.

Point `bibleverse.app` at the Pages project when you are ready. Custom domains on the free plan do not require Workers Paid, KV, or D1. This app uses none of those.

## What you still do by hand for the stores

The repo cannot create these accounts or upload the binaries.

1. **Apple Developer Program** (paid membership) and **Google Play Console** (one-time registration). Confirm the Xcode development team already in the project is the team you will ship with.
2. **Mailbox** `support@bibleverse.app`, and DNS for `bibleverse.app` so the privacy and support URLs above resolve.
3. **Cloudflare:** create an API token and set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then `npm run deploy`. Enter the live URLs in both consoles.
4. **Android upload key:** create a keystore and add these GitHub Actions secrets (values never go in git): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Without them, CI still builds an unsigned release AAB. Play requires the signed one. Enroll in Play App Signing.
5. **iOS signing:** CI archives with code signing off. To upload, sign in Xcode (or add `APPLE_TEAM_ID`, `APPLE_CERTIFICATE_P12_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_PROVISIONING_PROFILE_BASE64`). App Store Connect also needs an API key if you upload from CI later: `APPSTORE_API_KEY_ID`, `APPSTORE_API_ISSUER_ID`, `APPSTORE_API_PRIVATE_KEY`.
6. **Screenshots and questionnaires:** follow [`store/screenshots.md`](store/screenshots.md) and paste the answers in [`store/privacy-answers.md`](store/privacy-answers.md). Upload the signed AAB and the signed iOS build yourself.

Bundle id is `com.bibleverse.app` on both platforms. Keep it unless you have not created the store listings yet and deliberately want a different id.

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
