import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function HomeHero() {
    return h("section", { className: "hero-banner home-hero", "aria-labelledby": "home-hero-title" },
        h("span", { className: "reference-art hero-art", "aria-hidden": "true" }),
        h("div", { className: "hero-content" },
            h("h1", { id: "home-hero-title", className: "hero-title" },
                "Play",
                h("br", null),
                "Complete",
                h("br", null),
                h("span", { className: "cyan" }, "Earn Coins")),
            h("p", { className: "hero-sub" }, "Real Tasks. Real Rewards."),
            h("button", { type: "button", className: "hero-cta", onClick: () => window.showTab('tasks', 'all') },
                "Explore Now ",
                h(UiIcon, { name: "arrow", size: 14 }))),
        h("span", { className: "banner-dots", "aria-hidden": "true" },
            h("i", null),
            h("i", null),
            h("i", null)));
}
