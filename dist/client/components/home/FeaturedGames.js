import { h } from '../../jsx';
import { EarnIcon } from '../shared/EarnIcon';
import { UiIcon } from '../shared/UiIcon';
import { GameCard } from '../shared/GameCard';
export function FeaturedGames() {
    return (h("section", { className: "home-featured", "aria-labelledby": "featured-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "featured-title" },
                h("span", { className: "popular-icon", "aria-hidden": "true" }),
                "Popular Games"),
            h("button", { type: "button", className: "view-all-btn", onClick: () => window.showTab('games') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { id: "featuredGames", className: "featured-games", "aria-busy": "true" },
            h("div", { className: "home-games-placeholder", role: "status" },
                h(EarnIcon, { index: 2 }),
                h("span", null, "Loading your next adventure\u2026")))));
}
export function updateFeaturedGames(games, pendingId) {
    const grid = document.getElementById('featuredGames');
    if (!grid)
        return;
    grid.setAttribute('aria-busy', 'false');
    grid.replaceChildren(...(games.length ? games.slice(0, 4).map(game => (h(GameCard, { game: game, compact: true, pending: pendingId === game.id }))) : [
        h("button", { type: "button", className: "games-empty-link", onClick: () => window.showTab('games') },
            h(EarnIcon, { index: 2 }),
            h("span", null,
                h("b", null, "Your next adventure awaits"),
                h("small", null, "New games are on the way")),
            h(UiIcon, { name: "chevron" }))
    ]));
}
export function showFeaturedGamesError() {
    const grid = document.getElementById('featuredGames');
    if (!grid)
        return;
    grid.setAttribute('aria-busy', 'false');
    grid.replaceChildren(h("p", { className: "home-games-placeholder", role: "status" }, "Connecting to your games. Please check your connection."));
}
