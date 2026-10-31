import { h } from '../../jsx';
import { UiIcon } from './UiIcon';
export function AppHeader() {
    return h("header", { className: "app-header home-header" },
        h("button", { type: "button", className: "home-identity", onClick: () => window.showTab('wallet'), "aria-label": "Your profile" },
            h("span", { className: "profile-avatar-art home-avatar", "aria-hidden": "true" }),
            h("span", { className: "home-greeting", id: "homeGreeting" }, "Hey, there")),
        h("div", { className: "header-actions" },
            h("button", { type: "button", id: "homeNotificationsBtn", className: "header-icon home-notifications", "aria-label": "Notifications", onClick: () => window.openNotificationsModal() },
                h(UiIcon, { name: "bell", size: 21 }),
                h("span", { id: "homeUnreadBadge", className: "home-unread-badge", style: "display:none", "aria-hidden": "true" })),
            h("button", { type: "button", className: "header-icon", "aria-label": "Withdraw rewards", onClick: () => { window.showTab('wallet'); window.openSettingPage('sub-withdraw'); } },
                h(UiIcon, { name: "crown", size: 21 }))));
}
