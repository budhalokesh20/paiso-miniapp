import { h } from '../jsx';
import { QuickTasks } from './home/QuickTasks';
import { TaskHero } from './tasks/TaskHero';
import { TaskCategories } from './tasks/TaskCategories';
export function TasksView() {
    return h("section", { id: "tab-tasks", className: "app-screen tasks-screen", "aria-label": "Tasks" },
        h("div", { className: "screen-content tasks-layout" },
            h("div", { className: "tasks-heading" },
                h("h1", null, "Tasks"),
                h("p", null, "Complete simple tasks and earn coins")),
            h(TaskHero, null),
            h(QuickTasks, { variant: "tasks" }),
            h(TaskCategories, null),
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
