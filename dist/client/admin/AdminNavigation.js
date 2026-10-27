import { h, Fragment } from '../jsx';
const items = [
    { id: 'dashboard', label: 'Overview', icon: '⌂' },
    { id: 'users', label: 'Users', icon: '◉' },
    { id: 'withdrawal', label: 'Payouts', icon: '↗' },
    { id: 'tasks', label: 'Tasks', icon: '▤' },
    { id: 'games', label: 'Games', icon: 'games' },
    { id: 'transactions', label: 'Transactions', icon: '⇄' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
];
function AdminGameIcon() {
    return (h("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
        h("path", { d: "M7 8h10a4 4 0 0 1 3.8 2.8l1.1 3.4a3 3 0 0 1-4.6 3.3l-2.1-1.4H8.8l-2.1 1.4a3 3 0 0 1-4.6-3.3l1.1-3.4A4 4 0 0 1 7 8Z" }),
        h("path", { d: "M7 11v4m-2-2h4m7-.5h.01M18 14.5h.01" })));
}
function NavIcon(props) {
    return props.item.id === 'games' ? h(AdminGameIcon, null) : h("span", null, props.item.icon);
}
export function AdminNavigation(props) {
    return (h(Fragment, null,
        h("aside", { className: "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex" },
            h("div", { className: "flex items-center gap-3 px-2 pb-8" },
                h("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-black text-white" }, "P"),
                h("div", null,
                    h("div", { className: "text-sm font-extrabold tracking-tight text-slate-900" }, "Paiso"),
                    h("div", { className: "mt-0.5 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400" }, "Admin workspace"))),
            h("div", { className: "px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400" }, "Workspace"),
            h("nav", { className: "flex flex-col gap-1.5" }, items.map((item) => {
                const active = props.activeTab === item.id;
                return (h("button", { type: "button", "data-admintab": item.id, "aria-current": active ? 'page' : undefined, onClick: () => props.onSelect(item.id), className: 'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ' + (active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900') },
                    h("span", { className: 'flex h-8 w-8 items-center justify-center rounded-lg text-base ' + (active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500') },
                        h(NavIcon, { item: item })),
                    item.label));
            })),
            h("div", { className: "mt-auto rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4" },
                h("div", { className: "text-xs font-bold text-emerald-900" }, "Paiso Control Center"),
                h("p", { className: "mt-1 text-[11px] leading-5 text-emerald-800/70" }, "Members, tasks, games and payouts."))),
        h("nav", { className: "fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(15,23,42,.06)] backdrop-blur lg:hidden" }, items.map((item) => {
            const active = props.activeTab === item.id;
            return (h("button", { type: "button", "data-admintab": item.id, "aria-current": active ? 'page' : undefined, onClick: () => props.onSelect(item.id), className: 'flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold ' + (active ? 'text-emerald-800' : 'text-slate-500') },
                h("span", { className: 'flex h-7 w-8 items-center justify-center rounded-lg text-base ' + (active ? 'bg-emerald-50' : '') },
                    h(NavIcon, { item: item })),
                h("span", null, item.label)));
        }))));
}
