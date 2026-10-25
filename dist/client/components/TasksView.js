import { h } from '../jsx';
export function TasksView() {
    return (h("section", { id: "tab-tasks", className: "app-screen" },
        h("div", { className: "native-topbar" },
            h("h2", { className: "page-title" }, "Earn Tasks"),
            h("div", { className: "coin-pill" },
                h("svg", { width: "16", height: "16" },
                    h("use", { href: "#icon-p-coin" })),
                h("span", { id: "headerCoins" }, "0"))),
        h("div", { className: "screen-content space-y-3.5" },
            h("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar" },
                h("button", { className: "filter-chip active", "data-filter": "all", onClick: () => window.setTaskFilter('all') }, "All Tasks"),
                h("button", { className: "filter-chip", "data-filter": "app_task", onClick: () => window.setTaskFilter('app_task') }, "App Task"),
                h("button", { className: "filter-chip", "data-filter": "play_game", onClick: () => window.setTaskFilter('play_game') }, "Play Game"),
                h("button", { className: "filter-chip", "data-filter": "telegram_join", onClick: () => window.setTaskFilter('telegram_join') }, "Telegram"),
                h("button", { className: "filter-chip", "data-filter": "social_visit", onClick: () => window.setTaskFilter('social_visit') }, "Social & Web")),
            h("div", { id: "taskList", className: "space-y-2.5 pb-4" }))));
}
