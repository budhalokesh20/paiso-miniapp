import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function SettingsProfile() {
    return h("button", { type: "button", className: "settings-profile", onClick: () => window.openSettingPage('sub-userid'), "aria-label": "View account details" },
        h("span", { className: "settings-avatar-ring", id: "settingsAvatarBox", "aria-hidden": "true" }),
        h("span", { className: "profile-details" },
            h("span", { className: "profile-name-line" },
                h("b", { id: "settingsHeaderName" }, "Paiso User"),
                h("span", { id: "settingsVerifiedTick", style: "display:none" },
                    h("svg", { width: "18", height: "18" },
                        h("use", { href: "#icon-blue-tick" })))),
            h("span", { id: "settingsHeaderHandle" }, "Your Telegram account"),
            h("small", null, "View account details")),
        h(UiIcon, { name: "chevron", size: 20 }));
}
