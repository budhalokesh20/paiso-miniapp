import { h } from '../../jsx';
import { SubpageTopBar } from '../settings/SettingsParts';
export function SpinPage() {
    return h("section", { id: "sub-spin", className: "settings-subpage reward-page", "aria-labelledby": "spinPageTitle" },
        h(SubpageTopBar, { title: "Daily Spin", backLabel: "Back", onBack: () => window.closeRewards() }),
        h("div", { className: "screen-content reward-dialog-content reward-page-content" },
            h("h2", { id: "spinPageTitle" }, "Your daily chance to earn"),
            h("p", null, "Your reward is chosen securely when you spin."),
            h("div", { className: "reward-wheel", "aria-hidden": "true" }, "P"),
            h("p", { id: "spinRewardOptions" }),
            h("button", { id: "spinClaimButton", type: "button", className: "primary-btn", onClick: () => window.claimSpin() }, "Spin now"),
            h("p", { id: "spinRewardResult", role: "status", "aria-live": "polite" })));
}
