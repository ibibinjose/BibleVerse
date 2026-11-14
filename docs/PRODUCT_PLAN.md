# BibleVerse product plan

BibleVerse is a private, offline Catholic Scripture companion: a named daily verse, the full World English Bible Catholic Edition, and the feast calendar. The free product stays complete enough to pray with. Plus pays for what costs money to keep running.

## Who it is for

- Catholics and other Christians who want a short daily Scripture habit on their phone.
- People who read the Bible offline, on a train or in a church with poor signal, and do not want an account.
- Readers who already use the feast calendar and want the next step (a plan, a note, a card to send to family).

The Instagram-style chrome (follow buttons, invented like counts, a fake “3” badge) speaks to a social feed. The people who stay are here for a verse, not a network. The habit should feel like a prayer book that happens to be on a phone.

## Core loop

1. Open the app. Today’s named verse is the first thing on screen, with the streak beside it.
2. Read it, save it as a favourite, or share it as a card.
3. If there is more time, continue the Bible chapter or look up the day’s feast.
4. Tomorrow the streak asks for one more day. Missing a day resets the count. Nothing is uploaded.

That loop has to work in airplane mode. Favourites, highlights, the streak, and the share card all stay in on-device storage.

## Retention, in the order to build them

| Feature | Why it brings people back | Phase |
|---|---|---|
| Daily streak | One honest reason to open the app tomorrow. | Now |
| Favourites | A personal list beats an infinite feed. | Now (the save control, renamed and kept) |
| Share-as-image verse card | The verse leaves the app and pulls someone else in. | Now |
| Search | Already on Discover, the Bible, and feasts. Keep it; do not hide it behind Plus. | Already shipped |
| Highlights | Mark a line in the reader without writing an essay. | Now |
| Notes | A private note on a favourite verse. Local only. | Next |
| Reminders | A local notification at a chosen time. No server. Needs a native permission prompt and must stay optional. | Next |
| Reading plans | 7, 30, and liturgical-season plans. This is the clearest Plus benefit. | Plus |
| Home-screen widget | Today’s verse and the streak on the iOS and Android home screen. Native work, not a web widget. | Later |
| Sync | Favourites and the streak on a second device. Ongoing cost, so it belongs in Plus. | Plus |

Search is not missing. Discover searches the named verses, the Bible tab searches the full text, and Feasts searches the calendar. What is missing is one box that can answer “Psalm 23” from the home screen. That is a later polish, not a blocker.

## Monetisation

The audience is praying. The free Bible, the daily verse, search, favourites, highlights, the streak, and offline reading stay free. Charging for the text of a public-domain Bible would be the wrong trade.

### Options

| Model | Fit | Why it wins or loses |
|---|---|---|
| **BibleVerse Plus subscription** (recommended) | Reading plans, audio, extra card themes, sync. | Recurring revenue matches ongoing costs. A generous free tier keeps the ministry honest. |
| One-time supporter unlock | A single “thank you” purchase that unlocks themes. | Simple, but it cannot fund audio or plans for long. Keep it as a later add-on, not the engine. |
| Tip jar / donations | A voluntary gift with no feature gate. | Kind, and unpredictable. Fine as a profile link later. It will not pay for a reading-plan editor. |
| Ads | A banner or a rewarded video between verses. | Do not do this. Ads break a prayer, they contradict the privacy promise, and a small devotional audience pays poorly per impression. |

### Recommended model

**Freemium subscription, annual plan first.** Sell it as BibleVerse Plus.

Free forever:

- Full Catholic Bible, daily named verse, search, favourites, highlights, streak, one share-card style, offline use.

Plus:

- Guided reading plans
- Audio of the daily verse and of a chapter
- Extra card themes
- Sync of favourites, highlights, and the streak

Suggested prices, before store tax and the store’s commission:

| | Monthly | Annual (show this first) |
|---|---|---|
| United States | US $4.99 | US $39.99 (about US $3.33 a month) |
| Australia | A $7.99 | A $59.99 (about A $5.00 a month) |

Offer a 7-day trial on the annual plan only. Do not discount the free Bible.

### How the money is collected

- **iOS and Android:** RevenueCat on its free tier (no monthly fee until tracked revenue passes their free allowance). RevenueCat talks to App Store Connect and Play Billing. The app never sees a card number.
- **Web PWA:** Stripe Checkout, or Paddle if you would rather not handle GST yourself. The browser is allowed to take a web payment. The installed iOS and Android apps are not.

Config names, with empty values until you create the accounts, live in `site.json`:

- `plusEnabled` — must stay `false` until a real key exists. The paywall screen is in the app so you can read it; the purchase button does not call a payment API while this is false.
- `revenueCatAppleApiKey`
- `revenueCatGoogleApiKey`
- `revenueCatWebApiKey`
- `revenueCatEntitlementId` — `plus`
- `analyticsToken` — Cloudflare Web Analytics site token. Empty means the beacon is not added. That product does not use cookies.

`plus.js` is the only place that decides whether a purchase may be attempted. A future native build would call RevenueCat’s `Purchases.configure({ apiKey })` and then purchase the current offering for entitlement `plus`. That call is not wired to a live SDK in this phase.

### Store rules that change the design

- Apple’s App Store Review Guideline 3.1.1: digital features used inside the iOS app are In-App Purchases. A reading plan, audio, and sync qualify.
- Do not put a button in the iOS app that sends someone to a website to pay for those features. Anti-steering rules still restrict that, aside from a specific External Link entitlement or a storefront rule you have confirmed for your account. The safe build is: iPhone purchases go through Apple, Android purchases go through Google, and only the website offers Stripe or Paddle.
- Google Play’s payments policy matches that split for digital goods.
- The website can sell Plus with Stripe. If someone buys on the web, they do not automatically unlock the iOS app unless you later sync the entitlement (RevenueCat can do that once you connect Stripe). Until then, say so on the paywall.
- Donations that do not unlock features are a different product. If you add them, keep them out of the Plus purchase flow so review does not treat the tip as a hidden digital unlock.

## KPIs

Track these before spending on ads. Cloudflare Web Analytics can cover page views without cookies. The habit numbers below are on-device until you choose a cookieless product analytics tool. Do not add a cookie banner for a tool you do not need.

- Day-1, day-7, and day-30 retention
- Share of daily openers who view today’s verse
- Median streak and the share of people who reach 7 days
- Verse cards shared or saved per weekly active person
- Favourites added per weekly active person
- Annual-trial start rate, once Plus is for sale
- Trial-to-paid conversion
- Monthly churn of annual and monthly plans, separately
- Proceeds after Apple and Google’s commission (MRR)
- Refund rate

A healthy early signal is day-7 retention and a 7-day streak, not revenue. Turn on purchases only after the daily loop is something people repeat.
