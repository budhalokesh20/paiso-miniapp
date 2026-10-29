# Paiso user app UI

Rebuilt from `ui/user side app.png`: emerald accents, compact cards, shared brand header, seven-day check-in, six earning shortcuts, Tasks, Invite, Settings, Games, Offers, and withdrawal styling. The center gift button takes the user to the daily claim card.

All balances, tasks, games, referral counts, rewards, and payout methods continue to come from the existing API. Special Offers displays available app tasks; Surveys searches the current task catalog. Game tiles use consistent illustrated cover art because the current game API has no thumbnail field. Reference-only features with no implementation, such as theme switching and logout, are not shown as inactive controls.

Generated assets: `public/assets/paiso-{hero,invite,icons,gift,avatar}-v2.webp`. Five production images total approximately 275 KiB, 97% smaller than their original PNGs. Full-resolution PNGs are preserved under `ui/generated/`. Exact built-in imagegen prompts are in `ui/ASSET-PROMPTS.md`.

## Build

Run `npm install` and `npm run build:app` (or `npm run build` for the whole project). Tailwind utilities now compile locally through `scripts/build-css.js`; the user app does not rely on the Tailwind CDN or remote fonts. The existing Telegram and ad SDK integrations remain.

## Verification

TypeScript build and Chromium UI checks passed at widths 320, 360, 390, 430 and 768px. Checks cover task search/filter/start/verify, daily check-in, referral copy, withdrawal navigation, notifications, game launch from Home, horizontal overflow, missing images, and JavaScript errors.

`scripts/verify-ui.cjs` starts a temporary local static server and mocks API responses; it does not modify real accounts. It requires Playwright and Chromium. Set `PAISO_PLAYWRIGHT` to an existing Playwright package path and `PAISO_CHROMIUM` to an existing Chromium executable if they are not installed normally. Run with `node scripts/verify-ui.cjs`.

Preview screenshots in `ui/preview/` use test fixtures (including sample balances and games). Actual app content depends on the live account and published tasks/games. The original reference combines several phone screens and is partially cropped; exact pixel equality across different viewport sizes and live content is not claimed.
