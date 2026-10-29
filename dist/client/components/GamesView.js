import { h } from '../jsx';
export function GamesView() {
    return (h("div", { id: "exploreGames", className: "games-page" },
        h("div", { className: "page-heading" },
            h("h1", null, "Games"),
            h("p", null, "Find your next favorite game")),
        h("div", { id: "gamesGrid", className: "games-grid" })));
}
export function GameModal() {
    return (h("div", { id: "gameModal", className: "fixed inset-0 z-[120] hidden flex-col bg-slate-950" },
        h("div", { className: "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 text-white" },
            h("div", { id: "activeGameTitle", className: "truncate text-sm font-bold" }, "Game"),
            h("button", { type: "button", onClick: () => window.closeGame(), "aria-label": "Close game", className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20" }, "\u00D7")),
        h("iframe", { id: "gameFrame", title: "Paiso game", sandbox: "allow-scripts", allow: "fullscreen; gamepad; autoplay", allowFullScreen: true, referrerPolicy: "no-referrer", className: "min-h-0 w-full flex-1 border-0 bg-white" })));
}
