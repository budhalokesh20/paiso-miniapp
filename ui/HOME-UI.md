# Modular Home screen

`src/client/components/HomeView.tsx` composes five independent sections from `components/home/`: HomeHero, DailyCheckIn, EarnShortcuts, InviteBanner, and FeaturedGames. Shared icons, header and game cards live in `components/shared/`.

`public/home.css` owns Home spacing, responsive layout and interaction styles. The layout uses a 12px section gap and 14px side padding on phones, with compact adjustments below 360px and two columns from 700px. Content scrolls inside the app viewport with bottom clearance above the navigation; it is not squeezed into one screen. Primary actions and header controls provide at least 44px touch targets. Reduced-motion preferences are respected.

The game renderer skips unchanged polling results so refreshes preserve the user's button focus and scroll position. Loading, empty and connection-error messages reserve space for the games section. `scripts/client-modules.js` is the common module list for both build commands.

Validation: TypeScript compilation and Chromium checks at 320×568, 360×640, 390×844, 480×800, 768×1024, 844×390 and 1280×800. Checks cover overlap, horizontal overflow, bottom navigation clearance, touch targets, polling stability, long game names, empty/offline states, reduced motion and the existing earning/navigation flows. Browser API responses are mocked.

Previews: `ui/preview/home-320.png`, `home-390.png`, `home-768.png`, and `home-844.png`.
