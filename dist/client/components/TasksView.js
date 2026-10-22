import { h } from '../jsx';
export function TasksView() {
    return (h("section", { id: "tab-tasks", className: "app-screen" },
        h("div", { className: "native-topbar" },
            h("h2", { className: "page-title" }, "Tasks"),
            h("div", { className: "coin-pill" },
                h("svg", { width: "16", height: "16" },
                    h("use", { href: "#icon-p-coin" })),
                h("span", { id: "headerCoins" }, "0"))),
        h("div", { className: "screen-content" },
            h("div", { className: "filter-bar" },
                h("button", { className: "filter-chip active", "data-filter": "all", onClick: () => window.setTaskFilter('all') }, "All"),
                h("button", { className: "filter-chip", "data-filter": "telegram_join", onClick: () => window.setTaskFilter('telegram_join') }, "Telegram"),
                h("button", { className: "filter-chip", "data-filter": "social_visit", onClick: () => window.setTaskFilter('social_visit') }, "Social"),
                h("button", { className: "filter-chip", "data-filter": "done", onClick: () => window.setTaskFilter('done') }, "Completed")),
            h("div", { id: "taskList", className: "tasks-list-wrap" }))));
}
