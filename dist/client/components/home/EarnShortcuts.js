import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
const HOME_SHORTCUTS = [
    { title: 'Watch', description: 'Earn Coins', action: () => window.watchAd() },
    { title: 'Tasks', description: 'Complete & Earn', action: () => window.showTab('tasks', 'all') },
    { title: 'Games', description: 'Play & Earn', action: () => window.showTab('games') },
    { title: 'Offers', description: 'Special Offers', action: () => window.showTab('offers') },
];
export function EarnShortcuts() {
    return h("section", { className: "home-shortcuts", "aria-labelledby": "earn-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "earn-title" }, "Earn Coins"),
            h("button", { className: "view-all-btn", onClick: () => window.showTab('tasks', 'all') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { className: "explore-grid", id: "exploreGrid" }, HOME_SHORTCUTS.map((item, index) => (h("button", { type: "button", className: 'explore-card earn-tile earn-tile-' + index, "data-title": item.title + ' ' + item.description, id: index === 0 ? 'adBtn' : undefined, onClick: item.action },
            h("span", { className: 'reference-art tile-art art-earn-' + index, "aria-hidden": "true" }),
            h("span", { className: "earn-copy" },
                h("span", { className: "explore-title" }, item.title),
                h("span", { className: "explore-sub" }, item.description)),
            h("span", { className: "tile-arrow" },
                h(UiIcon, { name: "arrow", size: 21 })))))),
        h("div", { hidden: true },
            h("span", { id: "adCardSub" }),
            h("span", { id: "adReward" }),
            h("span", { id: "adCount" }, "0"),
            h("span", { id: "adCap" }, "10"),
            h("input", { id: "searchInput" }),
            h("button", { id: "searchClearBtn" })));
}
