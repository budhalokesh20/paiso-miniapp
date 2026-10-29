import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';
export function TasksView() {
    const filters = [{ id: 'all', label: 'All' }, { id: 'video', label: 'Video' }, { id: 'app_task', label: 'Apps' }, { id: 'play_game', label: 'Games' }, { id: 'social_visit', label: 'Web' }, { id: 'telegram_join', label: 'Social' }, { id: 'done', label: 'Done' }];
    return h("section", { id: "tab-tasks", className: "app-screen" },
        h("div", { className: "screen-content" },
            h("div", { className: "page-heading" },
                h("h1", null, "All Tasks"),
                h("p", null, "Complete tasks and earn rewards")),
            h("label", { className: "task-search" },
                h(UiIcon, { name: "search", size: 17 }),
                h("input", { id: "taskSearchInput", type: "search", "aria-label": "Search tasks", placeholder: "Search tasks", onInput: (event) => window.filterTasks(event.target.value) })),
            h("div", { className: "filter-bar" }, filters.map(filter => h("button", { className: `filter-chip${filter.id === 'all' ? ' active' : ''}`, "data-filter": filter.id, onClick: () => window.setTaskFilter(filter.id) }, filter.label))),
            h("div", { id: "taskList", className: "task-list", "aria-live": "polite" }),
            h("span", { id: "headerCoins", hidden: true })));
}
export function OffersView() {
    return h("section", { id: "tab-offers", className: "app-screen" },
        h("div", { className: "screen-content" },
            h("div", { className: "page-heading" },
                h("h1", null, "Special Offers"),
                h("p", null, "Discover apps and earn rewards")),
            h("div", { id: "offerList", className: "task-list" })));
}
