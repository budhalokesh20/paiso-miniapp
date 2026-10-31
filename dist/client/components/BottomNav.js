import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';
export function BottomNav() {
    return h("nav", { className: "bottom-nav", "aria-label": "Main navigation" },
        h("div", { className: "bottom-nav-items" },
            h("span", { className: "nav-active-pill", "aria-hidden": "true" }),
            h("button", { type: "button", "data-tab": "home", "aria-label": "Home", className: "active", "aria-current": "page", onClick: () => window.showTab('home') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "home" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Home")),
            h("button", { type: "button", "data-tab": "tasks", "aria-label": "Tasks", onClick: () => window.showTab('tasks', 'all') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "tasks" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Tasks")),
            h("button", { type: "button", "data-tab": "refer", "aria-label": "Invite", onClick: () => window.showTab('refer') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "friends" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Invite")),
            h("button", { type: "button", "data-tab": "wallet", "aria-label": "Settings", onClick: () => window.showTab('wallet') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "settings" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Settings"))),
        h("button", { type: "button", className: "nav-reward", "aria-label": "Claim daily reward", title: "Daily rewards", onClick: () => { window.showTab('home'); window.openDailyCheckin(); } },
            h("span", { className: "nav-icon" },
                h(UiIcon, { name: "gift" }))));
}
