import { h } from '../../jsx';
import { SettingsProfile } from './SettingsProfile';
import { SettingRow, SettingsGroup } from './SettingsParts';
export function SettingsMenu() {
    return h("div", { className: "screen-content settings-content", id: "settings-menu-view" },
        h("div", { className: "settings-heading" },
            h("h1", null, "Settings"),
            h("p", null, "Manage your account and rewards.")),
        h(SettingsProfile, null),
        h(SettingsGroup, { title: "Account & Rewards", id: "settings-account-title" },
            h(SettingRow, { icon: "shield", title: "Profile & Verification", action: () => window.openSettingPage('sub-verify'), detail: h("span", { id: "verifyMenuBadge" }, "Unverified") }),
            h(SettingRow, { icon: "wallet", title: "Withdraw Rewards", action: () => window.openSettingPage('sub-withdraw') }),
            h(SettingRow, { icon: "tasks", title: "My Activity", action: () => window.openSettingPage('sub-history') }),
            h(SettingRow, { icon: "bell", title: "Notifications", action: () => window.openNotificationsModal(), detail: h("span", { id: "notifUnreadBadge", style: "display:none" }, "0") })),
        h(SettingsGroup, { title: "Help & Support", id: "settings-support-title" },
            h(SettingRow, { icon: "help", title: "Help Center", action: () => window.openSettingPage('sub-faq') }),
            h(SettingRow, { icon: "user", title: "Contact Support", action: () => window.openSettingPage('sub-support') }),
            h(SettingRow, { icon: "shield", title: "Privacy Information", action: () => window.openSettingPage('sub-privacy') }),
            h(SettingRow, { icon: "tasks", title: "Terms of Service", action: () => window.openSettingPage('sub-terms') })),
        h("div", { hidden: true },
            h("span", { id: "userIdText" }),
            h("span", { id: "verifyMenuSub" })));
}
