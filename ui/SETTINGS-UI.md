# Settings UI

SettingsView contains SettingsMenu. SettingsOverlays mounts SettingsAccountPages, SettingsWithdrawalPages and SettingsHelpPages directly under the app shell, outside the scrolling tab. SettingsProfile and SettingsParts provide the profile card, reusable menu rows, groups and subpage header. All modules are registered in scripts/client-modules.js for both build commands.

The menu keeps eight distinct actions: Profile & Verification, Withdraw Rewards, Withdrawal History, Notifications, Help Center, Contact Support, Privacy Information and Terms of Service. The profile card opens account details and Copy User ID. Duplicate Edit Profile and privacy entries, the non-selectable Language page, random avatar switching, the version row and redundant Share shortcut were removed from Settings. Referral sharing remains available from Invite.

public/settings.css scopes the design to Settings: 16px menu labels, at least 66px rows, 14px body copy, 16px form inputs and 44–48px controls. Groups wrap on small screens, content scrolls above navigation and reduced motion is respected. Verification/withdrawal fields now have associated labels. Existing backend field IDs and actions are preserved.

Validation: TypeScript frontend build and Chromium UI suite. Tests check the eight actions, all seven linked subpages at 320/390/768 widths, readable rows, no horizontal overflow, form labels, coin conversion, payment methods, return navigation and existing Home/task/reward flows. API responses are mocked; no live withdrawals or verification requests are submitted.

Preview: ui/preview/settings-390.png. Form previews: settings-sub-verify.png and settings-sub-withdraw.png.

## Full-page navigation fix

Detail pages fill the app shell from top to bottom, independently of the menu scroll position. They use an absolute overlay layer outside the tab viewport; active tabs no longer create transformed containing blocks. Opening a detail page resets its scroll, makes the background inactive and focuses Back. Back or Escape restores the originating control without moving the menu. Main tab navigation starts at the top. Tests reproduce the old vertical offset and assert full-height bounds, top positioning after menu scroll, fresh scroll on reopen, background inactivity and Escape/focus restoration at 320/390/768 widths.
