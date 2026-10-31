import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function SubpageTopBar(props) {
    return (h("div", { className: "native-subpage-bar" },
        h("button", { type: "button", className: "native-back-btn", "aria-label": props.backLabel || 'Back to Settings', onClick: () => props.onBack ? props.onBack() : window.closeSettingPage() },
            h("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" },
                h("polyline", { points: "15 18 9 12 15 6" })),
            h("span", null, props.backLabel || 'Settings')),
        h("h3", { className: "native-subpage-title" }, props.title),
        h("div", { style: { width: '72px' } })));
}
export function SettingRow({ icon, title, action, detail }) {
    return h("button", { type: "button", className: "settings-row", onClick: action },
        h("span", { className: 'settings-row-icon setting-icon-' + icon },
            h(UiIcon, { name: icon, size: 22 })),
        h("span", { className: "settings-item-title" }, title),
        h("span", { className: "settings-row-right" },
            detail ? h("span", { className: "settings-detail" }, detail) : null,
            h(UiIcon, { name: "chevron", size: 17 })));
}
export function SettingsGroup({ title, id, children }) {
    return h("section", { className: "settings-group", "aria-labelledby": id },
        h("h2", { className: "settings-group-label", id: id }, title),
        h("div", { className: "settings-group-card" }, children));
}
