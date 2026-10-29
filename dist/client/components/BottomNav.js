import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';
export function BottomNav() {
    return h("nav", { className: "bottom-nav", "aria-label": "Main navigation" },
        h("button", { "data-tab": "home", className: "active", "aria-current": "page", onClick: () => window.showTab('home') },
            h(UiIcon, { name: "home" }),
            h("span", null, "Home")),
        h("button", { "data-tab": "tasks", onClick: () => window.showTab('tasks', 'all') },
            h(UiIcon, { name: "tasks" }),
            h("span", null, "Tasks")),
        h("button", { className: "nav-reward", "aria-label": "Claim daily reward", onClick: () => { window.showTab('home'); document.getElementById('dailyCard')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); document.getElementById('dailyBtn')?.focus({ preventScroll: true }); } },
            h("span", null,
                h("svg", { viewBox: "0 0 24 24", width: "25", height: "25" },
                    h("use", { href: "#icon-gift" })))),
        h("button", { "data-tab": "refer", onClick: () => window.showTab('refer') },
            h(UiIcon, { name: "friends" }),
            h("span", null, "Invite")),
        h("button", { "data-tab": "wallet", onClick: () => window.showTab('wallet') },
            h(UiIcon, { name: "settings" }),
            h("span", null, "Settings")));
}
