import { h } from '../jsx';
import { HomeHero } from './home/HomeHero';
import { QuickTasks } from './home/QuickTasks';
import { EarnShortcuts } from './home/EarnShortcuts';
import { FeaturedGames } from './home/FeaturedGames';
export function HomeView() {
    return (h("section", { id: "tab-home", className: "app-screen home-screen active-screen", "aria-label": "Home" },
        h("div", { className: "screen-content home-layout" },
            h(HomeHero, null),
            h(QuickTasks, null),
            h(EarnShortcuts, null),
            h(FeaturedGames, null))));
}
