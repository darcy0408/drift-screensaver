# DRIFT mobile — Capacitor shell for both stores

The root web files are the source of truth. `node sync-www.mjs` copies them into
`www/`, and CI (`.github/workflows/mobile-build.yml`) generates the native
Android/iOS projects fresh on every run — nothing platform-specific is committed.

## Get a build

Push anything touching `mobile/` (or run the **mobile-build** workflow manually from
the Actions tab). Artifacts on the run page:

| Artifact | What it is |
|---|---|
| `drift-android-debug-apk` | Sideload this on any Android phone to test today (Settings → allow installs from your browser/files app) |
| `drift-android-release-aab-unsigned` | Upload target for Play Console (Play App Signing signs it for you) |
| `drift-ios-app-unsigned` | Proof the iOS build compiles; App Store submission needs a signed archive (below) |

## Publish to Google Play (account: $25 one-time — you have this)

1. [Play Console](https://play.google.com/console) → Create app → name **DRIFT — Ambient Atlas**.
2. Use **Play App Signing** (default) — Google manages the release key, so the unsigned AAB from CI needs only an upload key. Easiest path: Play Console accepts your first AAB and enrolls signing automatically; if it demands a signed upload, generate an upload keystore once (`keytool -genkeypair`) and we wire it into CI as secrets (`ANDROID_KEYSTORE_B64`, passwords) — ask Claude to add the signing step.
3. Store listing, content rating questionnaire (entertainment/reference), privacy policy URL (the app stores nothing server-side — a paragraph on the GitHub Pages site works).
4. Internal testing track first → promote to production.

## Publish to the App Store (Apple Developer $99/yr — you have this)

Signing can't run on Windows; CI's macOS runner does it with your credentials:

1. [App Store Connect](https://appstoreconnect.apple.com) → register bundle ID `io.github.darcy0408.drift` and create the app.
2. Create an **App Store Connect API key** (Users and Access → Integrations) and add repo secrets: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` (the key file's contents), plus a distribution certificate — ask Claude to extend the workflow with the signed-archive + TestFlight upload job (fastlane or `xcodebuild -exportArchive`); the unsigned job proves everything else already compiles.
3. TestFlight first. For review, note the app is an interactive atlas (search, time machine, case files, live data) — not a bare website wrapper; that addresses guideline 4.2.

## Updating the apps

Store builds bundle the web files at build time — a `git push` updates the website
and the Windows .scr immediately, but phones get changes only when you rebuild and
resubmit (Play review is usually hours, Apple a day or two). If Android resubmission
becomes a chore, a TWA (Trusted Web Activity) variant can auto-track the live site —
ask Claude; it needs a `.well-known/assetlinks.json` on the `darcy0408.github.io` origin.

## Before a big audience

Click-to-identify and Deep Field use OpenStreetMap's free Nominatim geocoder, which
forbids heavy app traffic. Fine for testing and small numbers; before marketing
pushes, swap in a proxy or a commercial geocoding tier.
