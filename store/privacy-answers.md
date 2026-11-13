# BibleVerse — privacy questionnaire answers

Source of truth: the app collects nothing. No account, no server, no analytics,
no ads, no tracking, no third-party SDKs. Everything (likes, saves, comments,
reading position, text size) stays in on-device storage. Reference:
[privacy.html](../privacy.html), hosted at `https://bibleverse.app/privacy`.
Support: `https://bibleverse.app/support`.

## Apple App Store — App Privacy (App Store Connect)

| Question | Answer |
|---|---|
| Does this app collect data from this app? | **No** — select “No, we do not collect data from this app” |
| Is any data collected linked to the user’s identity? | N/A (no collection) |
| Is any data used for tracking purposes? | **No** (no IDFA, no cross-app/site tracking) |

Nothing further to declare: no data-type checkboxes, no purposes, no “privacy
nutrition label” entries. Keep `NSPrivacyTracking = false` in
[ios/App/App/PrivacyInfo.xcprivacy](../ios/App/App/PrivacyInfo.xcprivacy).

Do NOT add an `NSUserTrackingUsageDescription` — the app never requests tracking
permission. No other privacy usage-description keys are needed (no camera,
location, contacts, microphone, photos, or notifications used).

## Google Play — Data safety (Play Console → App content)

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | N/A — no data transmitted (only answerable if you declared collection) |
| Do you provide a way for users to request that their data is deleted? | N/A — nothing collected. (On-device likes/saves/comments vanish on uninstall or app-data clear; state this in review notes if asked.) |

- **Permissions:** the manifest declares only `INTERNET`, required by the
  Capacitor WebView container (the app loads its own bundled files through it).
  The app makes no network requests and sends data nowhere.
- **Target audience / content:** all ages, no user-generated content shared
  between users (comments/likes are private to the device), no ads, no
  in-app purchases.

## Reviewer notes (paste into either store if asked)

> BibleVerse is a fully offline app: the complete Bible text ships inside the
> bundle and the app makes no network requests. There is no login, no account,
> no analytics, and no tracking. Likes, saves, comments, and reading position
> are stored only on the device (localStorage) and can be verified in airplane
> mode. Privacy policy is available in-app (Profile → Privacy Policy) and at
> https://bibleverse.app/privacy. Support is at https://bibleverse.app/support
> and support@bibleverse.app. Android backup is disabled, so on-device notes
> are not uploaded with device backup.
