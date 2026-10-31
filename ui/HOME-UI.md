# Home screen reference implementation

Reference: `ui/home.png`. The phone frame and system status bar belong to the mockup; the app implements the screen inside it.

`HomeView.tsx` composes HomeHero, QuickTasks, EarnShortcuts and FeaturedGames. `public/home.css` preserves the mobile reference, with its scale capped by `--reference-unit`. `public/responsive.css` expands the shell to the full viewport and arranges sections in two columns from 760px. Mobile keeps three quick cards, two earn columns and four popular game columns; wider screens use a two-column popular games grid. Short viewports scroll above the navigation, which reserves its own space. Reduced-motion preferences and safe-area insets are supported.

`public/assets/home-reference.webp` is the supplied reference optimized as a 245 KB artwork atlas. CSS background regions select its illustrations, including shared icon fallbacks after the older icon sheet was removed. Headings, descriptions, buttons and game names are real DOM elements. No generated replacement artwork is used for this revision.

Daily Check-in opens a native dialog with the existing seven-day reward flow. Daily Bonus uses the same daily reward endpoint; both disable after a claim. Daily Spin launches a published game with Spin/Wheel in its title, or explains that it is unavailable. The backend has no separate daily spin or bonus payout. Popular Games uses actual API games and prices; matching titles use reference covers and other games use the existing game icon. Empty and offline states remain visible. Mock preview games do not seed or change the live database.

Validation: full npm build and Chromium checks at 320×568, 360×640, 390×844, 480×800, 768×1024, 844×390 and 1280×800. Browser tests mock API responses and cover overflow, section overlap, dock clearance, grid columns, polling stability, reduced motion, dialog focus/Escape, single daily reward, unavailable spin, paid game prices, game launch, task search/start/verify, withdrawal navigation, referral copying, notifications and empty/offline states.

Previews: `ui/preview/home-390.png`, `home-320.png`, `home-768.png`, `home-844.png`. Run `node scripts/verify-ui.cjs` with Playwright installed, or set PAISO_PLAYWRIGHT and PAISO_CHROMIUM to local package/browser paths.
