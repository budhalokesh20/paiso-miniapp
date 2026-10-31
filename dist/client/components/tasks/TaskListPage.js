import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function TaskListPage() {
    const filters = [{ id: 'all', label: 'All' }, { id: 'video', label: 'Video' }, { id: 'app_task', label: 'Apps' }, { id: 'play_game', label: 'Games' }, { id: 'social_visit', label: 'Web' }, { id: 'telegram_join', label: 'Social' }, { id: 'done', label: 'Done' }];
    return h("section", { id: "sub-task-list", className: "settings-subpage task-detail-page", "aria-labelledby": "task-list-title" },
        h("div", { className: "native-subpage-bar" },
            h("button", { type: "button", className: "native-back-btn", "aria-label": "Back to Tasks", onClick: () => window.closeSettingPage() },
                h(UiIcon, { name: "chevron", size: 20 })),
            h("h1", { className: "native-subpage-title", id: "task-list-title" }, "All Tasks"),
            h("div", null)),
        h("div", { className: "screen-content" },
            h("label", { className: "task-search search-open" },
                h(UiIcon, { name: "search", size: 18 }),
                h("input", { id: "taskSearchInput", type: "search", "aria-label": "Search tasks", placeholder: "Search tasks", onInput: (event) => window.filterTasks(event.target.value) })),
            h("div", { className: "filter-bar", "aria-label": "Task categories" }, filters.map(filter => h("button", { type: "button", className: 'filter-chip' + (filter.id === 'all' ? ' active' : ''), "data-filter": filter.id, onClick: () => window.setTaskFilter(filter.id) }, filter.label))),
            h("div", { id: "taskList", className: "task-list", "aria-live": "polite" })));
}
