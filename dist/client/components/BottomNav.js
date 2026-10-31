import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';
export function BottomNav() {
    return h("nav", { className: "bottom-nav", "aria-label": "Main navigation" },
        h("div", { className: "bottom-nav-items" },
            h("button", { type: "button", "data-tab": "home", className: "active", "aria-current": "page", onClick: () => window.showTab('home') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "home" })),
                h("span", { className: "nav-label" }, "Home")),
            h("button", { type: "button", "data-tab": "tasks", onClick: () => window.showTab('tasks', 'all') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "tasks" })),
                h("span", { className: "nav-label" }, "Tasks")),
            h("button", { type: "button", className: "nav-reward", "aria-label": "Claim daily reward", onClick: () => { window.showTab('home'); window.openDailyCheckin(); } },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "gift" })),
                h("span", { className: "nav-label" }, "Rewards")),
            h("button", { type: "button", "data-tab": "refer", onClick: () => window.showTab('refer') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "friends" })),
                h("span", { className: "nav-label" }, "Invite")),
            h("button", { type: "button", "data-tab": "wallet", onClick: () => window.showTab('wallet') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "settings" })),
                h("span", { className: "nav-label" }, "Settings"))));
}
