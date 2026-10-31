import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';
export function GamesView() {
    return (h("div", { id: "exploreGames", className: "games-page" },
        h("div", { className: "games-heading" },
            h("div", null,
                h("span", { className: "games-eyebrow" }, "YOUR GAME LOUNGE"),
                h("h1", null,
                    "Find your next",
                    h("br", null),
                    h("span", null, "favorite game.")),
                h("p", null, "Take a break and discover something fun.")),
            h("span", { className: "games-heading-icon", "aria-hidden": "true" },
                h(UiIcon, { name: "game", size: 38 }))),
        h("div", { className: "games-toolbar" },
            h("div", null,
                h("h2", null, "Explore games"),
                h("p", { id: "gameCount", "aria-live": "polite" }, "Loading games\u2026"))),
        h("label", { className: "games-search" },
            h(UiIcon, { name: "search", size: 19 }),
            h("input", { type: "search", "aria-label": "Search games", placeholder: "Search games", onInput: (e) => window.searchGames(e.target.value) })),
        h("div", { className: "games-filters", "aria-label": "Game price filters" },
            h("button", { type: "button", "data-game-filter": "all", className: "active", "aria-pressed": "true", onClick: () => window.filterGames('all') }, "All games"),
            h("button", { type: "button", "data-game-filter": "free", "aria-pressed": "false", onClick: () => window.filterGames('free') }, "Free"),
            h("button", { type: "button", "data-game-filter": "paid", "aria-pressed": "false", onClick: () => window.filterGames('paid') }, "Coins")),
        h("div", { id: "gamesGrid", className: "games-grid" }),
        h("section", { className: "game-history", id: "gameHistorySection", hidden: true },
            h("h2", null, "Recently played"),
            h("div", { id: "gameHistory" }))));
}
export function GameModal() {
    return (h("div", { id: "gameModal", className: "fixed inset-0 z-[120] hidden flex-col bg-slate-950" },
        h("div", { className: "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 text-white" },
            h("div", { id: "activeGameTitle", className: "truncate text-sm font-bold" }, "Game"),
            h("button", { type: "button", onClick: () => window.closeGame(), "aria-label": "Close game", className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20" }, "\u00D7")),
        h("iframe", { id: "gameFrame", title: "Paiso game", sandbox: "allow-scripts", allow: "fullscreen; gamepad; autoplay", allowFullScreen: true, referrerPolicy: "no-referrer", className: "min-h-0 w-full flex-1 border-0 bg-white" })));
}
