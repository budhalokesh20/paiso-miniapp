import { h } from '../../jsx';
import { UiIcon } from './UiIcon';
export function AppHeader() {
    return h("header", { className: "app-header" },
        h("button", { className: "brand-wrap", onClick: () => window.showTab('home'), "aria-label": "Paiso home" },
            h("svg", { className: "paiso-symbol", viewBox: "0 0 32 40", "aria-hidden": "true" },
                h("defs", null,
                    h("linearGradient", { id: "brandGreen", x1: "0", y1: "0", x2: "1", y2: "1" },
                        h("stop", { offset: "0%", "stop-color": "#24e7a6" }),
                        h("stop", { offset: "100%", "stop-color": "#008a69" }))),
                h("path", { d: "M7 5h12a9 9 0 0 1 0 18H9v10", fill: "none", stroke: "url(#brandGreen)", "stroke-width": "8", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                h("path", { d: "M7 5h9", fill: "none", stroke: "#2bdfa3", "stroke-width": "8", "stroke-linecap": "round" })),
            h("span", { className: "brand-name" }, "Paiso")),
        h("div", { className: "header-actions" },
            h("button", { className: "header-icon", "aria-label": "Search tasks", onClick: () => { window.showTab('tasks'); const field = document.getElementById('taskSearchInput'); field?.closest('.task-search')?.classList.add('search-open'); field?.focus(); } },
                h(UiIcon, { name: "search", size: 18 })),
            h("button", { className: "header-icon", "aria-label": "Withdraw rewards", onClick: () => { window.showTab('wallet'); window.openSettingPage('sub-withdraw'); } },
                h(UiIcon, { name: "crown", size: 20 })),
            h("button", { className: "header-avatar", "aria-label": "Your profile", onClick: () => window.showTab('wallet') },
                h("span", { className: "profile-avatar-art" }, "P"),
                h("span", { className: "avatar-dot" }))));
}
