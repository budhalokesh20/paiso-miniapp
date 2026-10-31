import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
const TASK_CATEGORIES = [
    { title: 'Watch Videos', description: 'Watch short videos and earn coins', filter: 'video', art: 'video' },
    { title: 'Play Games', description: 'Play games and earn coins', filter: 'play_game', art: 'games' },
    { title: 'Complete Offers', description: 'Try new apps and earn coins', filter: 'app_task', art: 'offers' },
];
export function TaskCategories() {
    return h("section", { className: "tasks-categories", "aria-labelledby": "task-categories-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "task-categories-title" }, "Task Categories"),
            h("button", { type: "button", className: "view-all-btn", onClick: () => window.openTaskList('all') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { className: "task-category-list" }, TASK_CATEGORIES.map(category => h("button", { type: "button", className: 'task-category category-' + category.art, onClick: () => window.openTaskList(category.filter) },
            h("span", { className: 'task-reference-art category-icon icon-' + category.art, "aria-hidden": "true" }),
            h("span", { className: "category-copy" },
                h("b", null, category.title),
                h("span", null, category.description)),
            h("span", { className: 'task-reference-art category-decoration decoration-' + category.art, "aria-hidden": "true" })))));
}
