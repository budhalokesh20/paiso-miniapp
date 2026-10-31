import { h } from '../jsx';
import { SettingsMenu } from './settings/SettingsMenu';
import { SettingsAccountPages } from './settings/SettingsAccountPages';
import { SettingsWithdrawalPages } from './settings/SettingsWithdrawalPages';
import { SettingsHelpPages } from './settings/SettingsHelpPages';
export function SettingsView() {
    return h("section", { id: "tab-wallet", className: "app-screen settings-screen", "aria-label": "Settings" },
        h(SettingsMenu, null));
}
export function SettingsOverlays({ children }) {
    return h("div", { id: "settingsLayer", className: "settings-screen settings-overlay-layer", onKeyDown: (event) => {
            if (event.key === 'Escape')
                window.closeSettingPage();
        } },
        h(SettingsAccountPages, null),
        h(SettingsWithdrawalPages, null),
        h(SettingsHelpPages, null),
        children);
}
