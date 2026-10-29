import { h } from '../jsx';
import { HomeHero } from './home/HomeHero';
import { DailyCheckIn } from './home/DailyCheckIn';
import { EarnShortcuts } from './home/EarnShortcuts';
import { InviteBanner } from './home/InviteBanner';
import { FeaturedGames } from './home/FeaturedGames';
export function HomeView() {
    return (h("section", { id: "tab-home", className: "app-screen home-screen active-screen", "aria-label": "Home" },
        h("div", { className: "screen-content home-layout" },
            h(HomeHero, null),
            h(DailyCheckIn, null),
            h(EarnShortcuts, null),
            h(InviteBanner, null),
            h(FeaturedGames, null))));
}
