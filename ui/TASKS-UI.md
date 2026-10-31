# Tasks reference UI

Reference: ui/task.png. TasksView composes TaskHero, the shared QuickTasks component and TaskCategories. The layout uses the supplied banner and illustrations from public/assets/task-reference.webp, a 194 KB optimized atlas. Text, labels, buttons and controls are live HTML. Phone hardware and system status elements from the mockup are excluded.

Watch Videos, Play Games and Complete Offers open actual backend tasks filtered by video, play_game and app_task. View All includes web/social/completed tasks. TaskListPage mounts in the existing app-level detail layer, fills the app from the top and uses independent scrolling. Back and Escape return to the category screen. Search is available inside View All and each category list. No fake tasks, rewards or progress are added.

Daily Check-in, Daily Spin and Bonus Code reuse the Home actions. Spin and code redemption have separate backend endpoints, with limits controlled from Admin → Games. Check-in retains its own daily reward endpoint. See ui/REWARDS.md.

public/tasks.css owns the mobile reference layout and task list styling, with three quick cards at every width and stacked category banners on phones. public/responsive.css adds a two-column hero/quick-task layout and three category columns from 760px, inside the full viewport shell. The shared header is shown only on Home; search remains available in View All. Existing Home, Settings and Offers behavior is preserved.

Validation: TypeScript frontend build and Chromium UI tests at 320×568, 390×844, 768×1024 and 844×390 for the new landing and category lists, plus the existing seven Home sizes and Settings checks. Tests cover overflow, navigation clearance, category filters, full-height detail page placement after scrolling, View All, Check-in, shared bonus state, search, task Start/Verify and return navigation. API responses are fixtures; the tests do not submit live tasks or rewards.

Previews: ui/preview/tasks-390.png, tasks-320.png, tasks-768.png, tasks-844.png and tasks-offers-list.png.
