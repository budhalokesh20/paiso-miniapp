import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function QuickTasks({ variant = 'home' }) {
    const tasksVariant = variant === 'tasks';
    const titleId = tasksVariant ? 'tasks-quick-title' : 'quick-title';
    const items = [
        { title: 'Daily Check-in', copy: 'Claim daily reward', action: () => window.openDailyCheckin(), label: 'Check In', art: 'checkin' },
        { title: 'Daily Spin', copy: 'Spin & win coins!', action: () => window.openDailySpin(), label: 'Spin Now', art: 'spin' },
        { title: 'Bonus Code', copy: 'Enter code, earn points', action: () => window.openBonusCode(), label: 'Enter Code', art: 'bonus' },
    ];
    return h("section", { className: tasksVariant ? "tasks-quick home-quick" : "home-quick", "aria-labelledby": titleId },
        h("div", { className: "section-head" },
            h("h2", { id: titleId }, "Quick Tasks"),
            !tasksVariant ? h("button", { className: "view-all-btn", onClick: () => window.openDailyCheckin() },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 })) : null),
        h("div", { className: "quick-grid" }, items.map(item => h("article", { className: 'quick-card quick-' + item.art },
            h("span", { className: 'reference-art quick-art art-' + item.art, "aria-hidden": "true" }),
            h("h3", null, item.title),
            h("p", null, item.copy),
            h("button", { type: "button", id: item.art === 'bonus' ? (tasksVariant ? 'tasksBonusBtn' : 'quickBonusBtn') : undefined, onClick: item.action },
                h("span", { id: item.art === 'bonus' ? (tasksVariant ? 'tasksBonusText' : 'quickBonusText') : undefined }, item.label),
                !tasksVariant ? h(UiIcon, { name: "arrow", size: 14 }) : null)))));
}
