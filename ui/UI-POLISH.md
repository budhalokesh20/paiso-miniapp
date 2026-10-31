# Shared UI finishing

public/polish.css provides shared color, spacing, surface, typography and motion rules after the existing page styles. It covers Home, Tasks, task lists, Offers, Games, Invite, Settings, verification, withdrawals, check-in and notifications. Existing reference artwork and page structure remain in place. Fonts use the device system stack without a network font dependency.

Cards use consistent borders, radii and restrained shadows. Secondary screens and forms use readable text, larger buttons and clear focus states. Game categories with matching reference covers now use those covers in the full games grid; unknown games use a native vector game icon. Scrolling uses the browser's native touch momentum and contained overscroll, with no wheel/touch interception. Page transitions animate opacity and preserve the app-level detail layer. Reduced-motion preferences disable transitions and reward particles.

FeedbackToast.tsx provides success, warning, error and informational feedback with status icons, clear labels, a dismiss action and live-region announcements. Success/info messages last 4.5 seconds; warning/error messages last 6.5 seconds. Hover or keyboard focus pauses dismissal. Native manual popovers keep feedback above check-in dialogs without taking focus; older browsers use fixed-position feedback. App-owned action messages use consistent wording. Video rewards show processing until confirmed, and clipboard failures show an error rather than success.

Unchanged background refreshes preserve task buttons and payment option DOM nodes, avoiding lost focus and unnecessary rebuilding. The duplicate daily-claim refresh was removed. Notifications now have dialog semantics, contained keyboard focus, Escape dismissal and focus restoration.

Validation: full project build, frontend build and Chromium regression suite. Coverage includes seven viewport sizes, all main screens, Settings and Tasks detail pages, horizontal overflow, navigation clearance, native-dialog feedback visibility, four message types, focus-paused dismissal, clipboard rejection, mocked video confirmation, stable task/game/payment focus during polling, task Start/Verify, reward claiming, filters, reduced motion, empty and offline states. All browser requests use fixtures and a mocked video SDK; no live accounts, withdrawals or rewards are modified.

Open ui/preview/polish-review.html for the visual review. Screenshots contain test data.

## Personalized Home header

Home shows the current avatar and a Hey, first-name greeting from user data. The notification bell opens the existing notification dialog and shows unread counts up to 9+. The shared header is completely hidden on Tasks, Invite, Games, Offers and Settings, without reserving layout space. Back bars remain on detail pages. Search stays inside task lists; the Home withdrawal shortcut remains available. Browser checks cover greeting data, avatar navigation, unread-count clearing and header visibility across every tab.
