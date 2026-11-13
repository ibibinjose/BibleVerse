# BibleVerse — store listing metadata

Bundle ID `com.bibleverse.app` · version `1.0.0` · (1). Replace every `TODO`
before submitting.

## Categories

| Store | Category |
|---|---|
| Apple App Store (primary) | **Reference** |
| Apple App Store (secondary) | Education |
| Google Play | **Books & Reference** |

## Age / content ratings

| Store | Rating | Basis |
|---|---|---|
| Apple (age rating questionnaire) | **4+** — no objectionable content, no user-shared content, no web access, no gambling | Bible text; all interaction is private to the device |
| Google Play (content rating questionnaire) | **Everyone** | Same basis; no ads, no IAP, no social features |

## URLs and contacts

Host the static site on Cloudflare Pages (`npm run deploy`). Pages serves
`privacy.html` at `/privacy` and `support.html` at `/support`.

- Privacy policy URL (required by both stores): `https://bibleverse.app/privacy`
- Support URL (required by both stores): `https://bibleverse.app/support`
- Support email: `support@bibleverse.app` (must be a mailbox you actually read)
- Marketing URL (optional): `https://bibleverse.app/`

The bundle id stays `com.bibleverse.app`. It is already the iOS bundle id and
the Android applicationId, and the Xcode project already has a development team.
`me.bibleverse.app` would also be valid, but changing it before the first
upload means new provisioning profiles and a new Play application id.

## Apple search

- Keywords (≤ 100 chars): `bible,catholic,verse,webc,offline,scripture,devotional`
- Subtitle (≤ 30 chars): `Every verse has a name.`

## Descriptions

Short (Play, ≤ 80 chars):

```text
Daily Bible verses + the full Catholic Bible (73 books), offline.
```

Full (both stores):

```text
BibleVerse is a Christian companion for daily Scripture that works fully offline.

A VERSE A DAY TO PRAY WITH — short named verses ("Light in the Darkness",
"Peace That Guards") you can save, reflect on, and share.

THE WHOLE CATHOLIC BIBLE — all 73 books of the Catholic Bible in modern
English (World English Bible Catholic Edition, public domain) live inside the
app: browse by Old / New Testament, search all 35,379 verses by word, book, or
reference (e.g. "shepherd", "Psalm 23", "John 3:16"), copy or share any verse,
adjust text size, and pick up with Continue reading.

PRIVATE BY DESIGN — no account, no server, no ads, no tracking. Saves,
reflections, and your reading place stay on your device only.

A verse a day, and the whole Bible when you need it. Works in airplane mode —
no connection needed, ever.
```

## Review checklist

- [ ] `https://bibleverse.app/privacy` and `https://bibleverse.app/support` are live and entered in both consoles
- [ ] `support@bibleverse.app` is a real, monitored mailbox
- [ ] Screenshots: see [screenshots.md](screenshots.md) (feed, Bible reader, verse card, plus iPad if you keep iPad support)
- [ ] Apple: App Privacy = “No data collected”, 4+, Reference/Education
- [ ] Play: Data safety = “No data collected or shared”, Everyone, Books & Reference
- [ ] Test in airplane mode with no login before submitting (see reviewer notes in
      [privacy-answers.md](privacy-answers.md))
