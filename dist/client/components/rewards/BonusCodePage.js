import { h } from '../../jsx';
import { SubpageTopBar } from '../settings/SettingsParts';
export function BonusCodePage() {
    return h("section", { id: "sub-bonus", className: "settings-subpage reward-page", "aria-labelledby": "bonusPageTitle" },
        h(SubpageTopBar, { title: "Bonus Code", backLabel: "Back", onBack: () => window.closeRewards() }),
        h("div", { className: "screen-content reward-dialog-content reward-page-content" },
            h("h2", { id: "bonusPageTitle" }, "Redeem your bonus"),
            h("p", null, "Enter a code published by Paiso to add P points to your balance."),
            h("form", { id: "bonusCodePanel", onSubmit: (event) => { event.preventDefault(); void window.redeemBonus(); } },
                h("label", { for: "bonusCodeInput" }, "Bonus code"),
                h("input", { id: "bonusCodeInput", required: true, maxLength: 40, autoComplete: "off", placeholder: "Enter your code" }),
                h("button", { id: "bonusRedeemButton", className: "primary-btn", type: "submit" }, "Redeem points")),
            h("p", { id: "bonusRewardResult", role: "status", "aria-live": "polite" })));
}
