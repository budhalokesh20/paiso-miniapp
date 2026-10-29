import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function HomeHero() {
    return (h("section", { className: "hero-banner home-hero", "aria-labelledby": "home-hero-title" },
        h("div", { className: "hero-content" },
            h("h1", { id: "home-hero-title", className: "hero-title" },
                "Play, Complete",
                h("br", null),
                h("span", { className: "cyan" }, "Earn Rewards")),
            h("p", { className: "hero-sub" }, "Real Tasks. Real Payouts."),
            h("button", { type: "button", className: "hero-cta", onClick: () => window.showTab('tasks', 'all') },
                "Explore Now ",
                h(UiIcon, { name: "arrow", size: 14 })))));
}
