import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function InviteBanner() {
    return (h("button", { type: "button", className: "invite-strip home-invite", onClick: () => window.showTab('refer') },
        h("span", { className: "invite-people" },
            h(UiIcon, { name: "friends", size: 38 })),
        h("span", { className: "invite-copy" },
            h("b", null, "Invite Friends"),
            h("small", null, "Get extra rewards when your friends join!")),
        h("img", { src: "/assets/paiso-gift-v2.webp", alt: "", width: "56", height: "56", decoding: "async" })));
}
