import { h } from './jsx';
import { AdminNavigation } from './admin/AdminNavigation';
import { AdminStatCard } from './admin/AdminStatCard';
import { AdminUserEditor } from './admin/AdminUserEditor';
let adminKey = sessionStorage.getItem('paiso_admin_key') || '';
let isRefreshing = false;
let isSavingUser = false;
let activeTab = 'dashboard';
let data = null;
let apiCountries = [];
let countryApiQuery = '';
let uploadedMethodLogoData = '';
let showWithdrawSettings = false;
let userSearchQuery = '';
let showUserEditor = false;
let editingUserId = null;
let editingTaskId = null;
let editingGameId = null;
let taskCategoryFilter = 'all';
let showWithdrawEditor = false;
let editingWithdrawId = null;
let txStatusFilter = 'all';
let txSearchQuery = '';
let draftSettings = {
    methods: [],
    allowedMethods: [],
    minWithdrawCoins: 10000,
    coinPerNpr: 100,
    countries: [],
    allowedCountries: [],
    requireQualification: true
};
function notify(msg, isErr = false) {
    const el = document.getElementById('adminToast');
    if (!el)
        return;
    el.textContent = msg;
    el.className = `fixed top-4 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-bold ${isErr ? 'bg-red-600 text-white' : 'bg-[#16A34A] text-white'}`;
    setTimeout(() => {
        el.className = 'hidden';
    }, 2600);
}
async function adminApi(path, opts = {}) {
    const r = await fetch(path, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            'x-admin-id': adminKey,
            ...(opts.headers || {})
        }
    });
    const body = await r.json().catch(() => ({}));
    if (r.status === 403)
        throw new Error('Invalid admin ID');
    if (!r.ok)
        throw new Error(body?.error || body?.message || 'Request failed (' + r.status + ')');
    return body;
}
async function loadCountriesFromApi() {
    try {
        const r = await fetch('/api/countries');
        const j = (await r.json());
        if (Array.isArray(j.countries) && j.countries.length) {
            apiCountries = j.countries;
        }
    }
    catch { }
}
function DashboardTabView(props) {
    const { s } = props;
    const pending = s.recentWithdrawals.filter((w) => w.status === 'pending').slice(0, 6);
    const activeMethods = (s.settings.methods || []).filter((m) => m.enabled !== false);
    const countries = s.settings.countries || [];
    return (h("div", { className: "space-y-6" },
        h("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7" },
            h(AdminStatCard, { label: "Total users", value: s.totalUsers.toLocaleString(), detail: "Registered members" }),
            h(AdminStatCard, { label: "Verified", value: s.verifiedUsers.toLocaleString(), detail: "Verified members", tone: "blue" }),
            h(AdminStatCard, { label: "Pending payouts", value: s.pendingWithdrawals.toLocaleString(), detail: "Needs review", tone: "amber" }),
            h(AdminStatCard, { label: "Pending value", value: 'Rs ' + s.pendingNpr.toLocaleString(), detail: "Awaiting approval", tone: "amber" }),
            h(AdminStatCard, { label: "Paid out", value: 'Rs ' + s.paidNpr.toLocaleString(), detail: "Completed payouts", tone: "green" }),
            h(AdminStatCard, { label: "Active tasks", value: s.tasks.length.toLocaleString(), detail: "Available in app" }),
            h(AdminStatCard, { label: "Game coins", value: (s.gameCoinsCollected || 0).toLocaleString(), detail: `${(s.gameStarts || 0).toLocaleString()} starts`, tone: "green" })),
        h("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5" },
            h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
                h("div", { className: "flex items-center justify-between mb-3" },
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Pending Withdrawals"),
                    h("button", { type: "button", onClick: () => switchAdminTab('withdrawal'), className: "text-xs font-bold text-[#16A34A] hover:underline" }, "Manage All")),
                h("div", { className: "divide-y divide-slate-100 text-xs" }, pending.length ? (pending.map((w) => (h("div", { className: "py-2.5 flex items-center justify-between" },
                    h("div", null,
                        h("span", { className: "font-bold text-slate-900" },
                            "@",
                            w.username || w.userId),
                        h("span", { className: "text-slate-400 ml-1" },
                            "(",
                            w.method,
                            ": ",
                            w.account,
                            ")")),
                    h("div", { className: "flex items-center gap-2" },
                        h("span", { className: "font-extrabold text-slate-900" },
                            "NPR ",
                            w.npr),
                        h("button", { type: "button", onClick: () => decideWithdraw(w.id, 'paid'), className: "px-2 py-0.5 bg-[#16A34A] text-white font-bold rounded text-[11px]" }, "Approve")))))) : (h("div", { className: "py-8 text-center text-slate-400" }, "No pending withdrawals")))),
            h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
                h("div", { className: "flex items-center justify-between mb-3" },
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Withdrawal Configuration"),
                    h("button", { type: "button", onClick: () => switchAdminTab('settings'), className: "text-xs font-bold text-[#16A34A] hover:underline" }, "Settings")),
                h("div", { className: "space-y-2.5 text-xs" },
                    h("div", { className: "flex justify-between py-2 border-b border-slate-100" },
                        h("span", { className: "text-slate-500" }, "Custom Methods"),
                        h("div", { className: "flex flex-wrap gap-1.5 justify-end" }, activeMethods.length ? (activeMethods.map((m) => (h("span", { className: "inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800" },
                            m.logo ? h("img", { src: m.logo, className: "w-3.5 h-3.5 rounded object-contain" }) : null,
                            h("span", null, m.name))))) : (h("span", { className: "text-slate-400" }, "None")))),
                    h("div", { className: "flex justify-between py-2 border-b border-slate-100" },
                        h("span", { className: "text-slate-500" }, "Minimum Withdrawal"),
                        h("b", { className: "text-slate-900" },
                            s.settings.minWithdrawCoins.toLocaleString(),
                            " Coins (NPR",
                            ' ',
                            (s.settings.minWithdrawCoins / s.settings.coinPerNpr).toFixed(0),
                            ")")),
                    h("div", { className: "flex justify-between py-2" },
                        h("span", { className: "text-slate-500" }, "Allowed Countries"),
                        h("div", { className: "flex flex-wrap gap-1.5 justify-end" }, countries.length ? (countries.map((c) => (h("span", { className: "inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800" },
                            c.flag ? h("img", { src: c.flag, className: "w-4 h-3 object-cover rounded-sm" }) : null,
                            h("span", null, c.name))))) : (h("span", { className: "text-slate-400" }, "None")))))))));
}
function UsersTabView(props) {
    const { s } = props;
    const q = userSearchQuery.trim().toLowerCase();
    const filtered = s.users.filter((u) => !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q));
    const editUser = editingUserId ? s.users.find((u) => u.id === editingUserId) : null;
    if (showUserEditor)
        return h(AdminUserEditor, { user: editUser || null, saving: isSavingUser, onBack: closeUserForm, onSave: saveUserCrud });
    return (h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
        h("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
            h("h2", { className: "text-base font-extrabold text-slate-900" },
                "User Management (",
                filtered.length,
                ")"),
            h("div", { className: "flex items-center gap-2.5" },
                h("input", { type: "text", value: userSearchQuery, onInput: (e) => filterAdminUsers(e.target.value), placeholder: "Search name, username, ID or email...", className: "w-60 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" }),
                h("button", { type: "button", onClick: () => openUserForm(), className: "px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition" }, "+ Add User"))),
        h("div", { className: "overflow-x-auto" },
            h("table", { className: "w-full min-w-[760px] border-collapse text-left text-xs" },
                h("thead", null,
                    h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                        h("th", { className: "py-2.5 px-3" }, "User"),
                        h("th", { className: "py-2.5 px-3" }, "Blue Tick"),
                        h("th", { className: "py-2.5 px-3" }, "Qualification"),
                        h("th", { className: "py-2.5 px-3" }, "Coins"),
                        h("th", { className: "py-2.5 px-3" }, "Referrals"),
                        h("th", { className: "py-2.5 px-3 text-right" }, "Actions"))),
                h("tbody", { className: "divide-y divide-slate-100" }, filtered.length ? (filtered.map((u) => (h("tr", { className: "hover:bg-slate-50" },
                    h("td", { className: "py-3 px-3" },
                        h("div", { className: "font-bold text-slate-900 flex items-center gap-1" },
                            h("span", null, u.name),
                            u.verified ? (h("span", { className: "w-4 h-4 rounded-full bg-[#1D9BF0] text-white text-[10px] inline-flex items-center justify-center" }, "\u2713")) : null),
                        h("div", { className: "text-[11px] text-slate-400" },
                            "#",
                            u.id,
                            " ",
                            u.username ? `• @${u.username}` : ''),
                        u.email ? h("div", { className: "text-[11px] text-slate-500" }, u.email) : null),
                    h("td", { className: "py-3 px-3" },
                        h("button", { type: "button", onClick: () => toggleUserVerify(u.id), className: `px-2.5 py-1 rounded text-[11px] font-bold ${u.verified
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-600'}` }, u.verified ? 'Verified' : 'Unverified')),
                    h("td", { className: "py-3 px-3" },
                        h("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${u.qualified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}` }, u.qualified ? 'Qualified' : `${u.adsDone}/3A • ${u.tasksDone}/2T • ${u.dailyDone}/2D`)),
                    h("td", { className: "py-3 px-3 font-extrabold text-slate-900" }, u.coins.toLocaleString()),
                    h("td", { className: "py-3 px-3 font-semibold text-slate-700" }, u.referrals),
                    h("td", { className: "py-3 px-3 text-right space-x-1.5 whitespace-nowrap" },
                        h("button", { type: "button", onClick: () => quickAdjustCoins(u.id, u.coins), className: "px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[11px]", title: "Add or deduct coins" }, "+/- Coins"),
                        h("button", { type: "button", onClick: () => openAdminNotifModal(u.id), className: "px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[11px]" }, "Notify"),
                        h("button", { type: "button", onClick: () => openUserForm(u.id), className: "px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]" }, "Edit"),
                        h("button", { type: "button", onClick: () => deleteUser(u.id), className: "px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[11px]" }, "Delete")))))) : (h("tr", null,
                    h("td", { colSpan: "6", className: "py-8 text-center text-slate-400" }, "No users found"))))))));
}
function renderCountryApiListNodes(query) {
    const cq = query.trim().toLowerCase();
    const matching = apiCountries
        .filter((c) => !draftSettings.countries.some((dc) => dc.code === c.code) &&
        (!cq || c.name.toLowerCase().includes(cq) || c.code.toLowerCase().includes(cq)))
        .slice(0, 30);
    if (!matching.length) {
        return [
            h("div", { className: "col-span-full py-6 text-center text-xs text-slate-400" }, "No matching countries found")
        ];
    }
    return matching.map((c) => (h("button", { type: "button", onClick: () => addCountryFromApi(c.code), className: "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-[#16A34A] hover:bg-emerald-50/50 transition text-left" },
        h("div", { className: "flex items-center gap-2 min-w-0" },
            h("img", { src: c.flag, className: "w-5 h-3.5 object-cover rounded-sm border border-slate-200 shrink-0" }),
            h("span", { className: "text-xs font-bold text-slate-800 truncate" }, c.name)),
        h("span", { className: "text-[11px] font-extrabold text-[#16A34A] shrink-0" }, "+ Add"))));
}
function WithdrawalTabView(props) {
    const { s } = props;
    const pending = s.recentWithdrawals.filter((w) => w.status === 'pending');
    const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
    const methodOptions = draftSettings.methods.length
        ? draftSettings.methods.map((m) => m.name)
        : ['Custom'];
    const activeMethods = (s.settings.methods || []).filter((m) => m.enabled !== false);
    const activeCountries = s.settings.countries || [];
    return (h("div", { className: "space-y-4" },
        h("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4" },
            h(AdminStatCard, { label: "Pending requests", value: s.pendingWithdrawals.toLocaleString(), detail: "Waiting for review", tone: "amber" }),
            h(AdminStatCard, { label: "Pending value", value: 'Rs ' + s.pendingNpr.toLocaleString(), detail: "Ready to process", tone: "amber" }),
            h(AdminStatCard, { label: "Paid requests", value: s.paidWithdrawals.toLocaleString(), detail: "Completed payouts", tone: "green" }),
            h(AdminStatCard, { label: "Total paid", value: 'Rs ' + s.paidNpr.toLocaleString(), detail: "Successfully sent", tone: "green" })),
        h("div", null,
            h("h2", { className: "text-lg font-extrabold tracking-tight text-slate-950" }, "Payout requests"),
            h("p", { className: "mt-1 text-sm text-slate-500" }, "Review and process pending requests.")),
        showWithdrawEditor ? (h("div", { className: "p-4 bg-white border border-slate-200 rounded-xl" },
            h("div", { className: "flex items-center justify-between mb-3" },
                h("h3", { className: "text-sm font-bold text-slate-900" }, "Edit payout"),
                h("button", { type: "button", onClick: () => closeWithdrawForm(), className: "text-xs font-bold text-slate-400 hover:text-slate-700" }, "\u2715 Close")),
            h("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs" },
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "User ID"),
                    h("input", { id: "crudWUserId", type: "text", value: editW ? editW.userId : '', disabled: true, placeholder: "User ID", className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Method"),
                    h("select", { id: "crudWMethod", value: editW?.method || methodOptions[0], className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" }, methodOptions.map((m) => (h("option", { value: m, selected: editW?.method === m }, m))))),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Account / Wallet ID"),
                    h("input", { id: "crudWAccount", type: "text", value: editW ? editW.account : '', placeholder: "Account ID", className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Coins Amount"),
                    h("input", { id: "crudWCoins", type: "number", value: editW ? editW.coins : 10000, className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" })),
                h("div", { className: "flex items-end gap-2" },
                    h("div", { className: "flex-1" },
                        h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Status"),
                        h("select", { id: "crudWStatus", value: editW?.status || 'pending', className: "w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold" },
                            h("option", { value: "pending" }, "pending"),
                            h("option", { value: "paid" }, "paid"),
                            h("option", { value: "rejected" }, "rejected"))),
                    h("button", { type: "button", onClick: () => saveWithdrawCrud(), className: "px-4 py-1.5 bg-[#16A34A] text-white font-bold rounded-lg" }, "Save"))))) : null,
        h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
            h("h2", { className: "text-base font-extrabold text-slate-900 mb-3" },
                "Pending Withdrawal Requests (",
                pending.length,
                ")"),
            h("div", { className: "overflow-x-auto" },
                h("table", { className: "w-full min-w-[760px] border-collapse text-left text-xs" },
                    h("thead", null,
                        h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                            h("th", { className: "py-2.5 px-3" }, "ID"),
                            h("th", { className: "py-2.5 px-3" }, "User"),
                            h("th", { className: "py-2.5 px-3" }, "Method & Account"),
                            h("th", { className: "py-2.5 px-3" }, "Amount"),
                            h("th", { className: "py-2.5 px-3 text-right" }, "Action"))),
                    h("tbody", { className: "divide-y divide-slate-100" }, pending.length ? (pending.map((w) => (h("tr", { className: "hover:bg-slate-50" },
                        h("td", { className: "py-3 px-3 font-bold text-slate-900" }, w.id),
                        h("td", { className: "py-3 px-3" },
                            "@",
                            w.username || w.userId),
                        h("td", { className: "py-3 px-3" },
                            h("b", null, w.method),
                            ": ",
                            h("span", { className: "font-mono" }, w.account)),
                        h("td", { className: "py-3 px-3 font-extrabold text-slate-900" },
                            w.coins.toLocaleString(),
                            " (NPR ",
                            w.npr,
                            ")"),
                        h("td", { className: "py-3 px-3 text-right space-x-1.5 whitespace-nowrap" },
                            h("button", { type: "button", onClick: () => decideWithdraw(w.id, 'paid'), className: "px-3 py-1 bg-[#16A34A] text-white font-bold rounded-md text-xs" }, "Approve"),
                            h("button", { type: "button", onClick: () => decideWithdraw(w.id, 'reject'), className: "px-3 py-1 bg-amber-500 text-white font-bold rounded-md text-xs" }, "Reject"),
                            h("button", { type: "button", onClick: () => openWithdrawForm(w.id), className: "px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-md text-xs" }, "Edit"),
                            h("button", { type: "button", onClick: () => deleteWithdrawCrud(w.id), className: "px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-md text-xs" }, "Delete")))))) : (h("tr", null,
                        h("td", { colSpan: "5", className: "py-8 text-center text-slate-400" }, "No pending withdrawals")))))))));
}
function formatResetBadge(hours) {
    const h = +(hours || 0);
    if (h <= 0)
        return 'One-Time';
    if (h === 24)
        return 'Daily (24h)';
    return `Every ${h}h`;
}
function TasksTabView(props) {
    const { s } = props;
    const editTask = editingTaskId ? s.tasks.find((t) => t.id === editingTaskId) : null;
    const tgTasksCount = s.tasks.filter((t) => t.type === 'telegram_join').length;
    const socialTasksCount = s.tasks.filter((t) => t.type === 'social_visit').length;
    const appTasksCount = s.tasks.filter((t) => t.type === 'app_task').length;
    const gameTasksCount = s.tasks.filter((t) => t.type === 'play_game').length;
    const repeatableCount = s.tasks.filter((t) => (t.resetHours || 0) > 0).length;
    const totalActiveClaims = s.tasks.reduce((sum, t) => sum + (t.claimsCount || 0), 0);
    return (h("div", { className: "space-y-4" },
        h("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3" },
            h(AdminStatCard, { label: "Tasks", value: s.tasks.length.toLocaleString(), detail: "Published" }),
            h(AdminStatCard, { label: "Repeatable", value: repeatableCount.toLocaleString(), detail: "Scheduled reset", tone: "blue" }),
            h(AdminStatCard, { label: "Completions", value: totalActiveClaims.toLocaleString(), detail: "Current total", tone: "green" })),
        h("div", { className: "flex justify-end" },
            h("button", { type: "button", onClick: () => resetAllTasksClaims(), className: "rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100" }, "Reset all completions")),
        h("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5" },
            h("div", { className: "h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
                h("div", { className: "flex items-center justify-between pb-3 mb-4 border-b border-slate-100" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" }, editTask ? `Edit Task` : 'New task'),
                        h("p", { className: "text-[11px] text-slate-500" }, editTask ? `Editing ID: ${editTask.id}` : 'Create task')),
                    h("button", { type: "button", onClick: () => clearTaskFormInputs(), className: "px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600" }, editTask ? 'Cancel Edit' : 'Reset Form')),
                h("div", { className: "space-y-3.5 text-xs" },
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Title"),
                        h("input", { id: "newTaskTitle", type: "text", value: editTask ? editTask.title : '', placeholder: "e.g. Join Official Telegram Channel", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-[#16A34A]" })),
                    h("div", { className: "grid grid-cols-2 gap-2.5" },
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Type"),
                            h("select", { id: "newTaskType", value: editTask?.type || 'app_task', className: "w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" },
                                h("option", { value: "app_task" }, "App Task"),
                                h("option", { value: "play_game" }, "Play Game"),
                                h("option", { value: "social_visit" }, "Social / Web Visit"),
                                h("option", { value: "telegram_join" }, "Telegram Join"))),
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Reset"),
                            h("select", { id: "newTaskResetHours", value: String(editTask?.resetHours || 0), className: "w-full px-2.5 py-2 bg-emerald-50/60 border border-emerald-200 text-emerald-950 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" },
                                h("option", { value: "0" }, "One-Time Only"),
                                h("option", { value: "24" }, "Daily (Every 24h)"),
                                h("option", { value: "12" }, "Every 12 Hours"),
                                h("option", { value: "6" }, "Every 6 Hours"),
                                h("option", { value: "1" }, "Every 1 Hour")))),
                    h("div", { className: "grid grid-cols-2 gap-2.5" },
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Reward"),
                            h("input", { id: "newTaskReward", type: "number", value: editTask ? editTask.reward : 200, className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]" })),
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Wait (sec)"),
                            h("input", { id: "newTaskWait", type: "number", value: editTask ? editTask.waitSeconds || 15 : 15, className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" }))),
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Destination URL"),
                        h("input", { id: "newTaskUrl", type: "text", value: editTask ? editTask.url : '', placeholder: "https://t.me/... or https://youtube.com/...", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Telegram target"),
                        h("input", { id: "newTaskTarget", type: "text", value: editTask ? editTask.target : '', placeholder: "@yourchannel (optional for web tasks)", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("button", { type: "button", onClick: () => saveTaskCrud(), className: "w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800" }, editTask ? 'Save changes' : '+ Create Task'))),
            h("div", { className: "lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
                h("div", { className: "flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" },
                            "Tasks (",
                            s.tasks.length,
                            ")")),
                    h("div", { className: "flex flex-wrap items-center gap-1.5" },
                        h("button", { type: "button", onClick: () => setTaskCategoryFilter('all'), className: `px-2.5 py-1 rounded-md text-xs font-bold transition ${taskCategoryFilter === 'all'
                                ? 'bg-[#16A34A] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}` },
                            "All (",
                            s.tasks.length,
                            ")"),
                        h("button", { type: "button", onClick: () => setTaskCategoryFilter('app_task'), className: `px-2.5 py-1 rounded-md text-xs font-bold transition ${taskCategoryFilter === 'app_task'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}` },
                            "App (",
                            appTasksCount,
                            ")"),
                        h("button", { type: "button", onClick: () => setTaskCategoryFilter('play_game'), className: `px-2.5 py-1 rounded-md text-xs font-bold transition ${taskCategoryFilter === 'play_game'
                                ? 'bg-violet-600 text-white shadow-xs'
                                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}` },
                            "Games (",
                            gameTasksCount,
                            ")"),
                        h("button", { type: "button", onClick: () => setTaskCategoryFilter('telegram_join'), className: `px-2.5 py-1 rounded-md text-xs font-bold transition ${taskCategoryFilter === 'telegram_join'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}` },
                            "Telegram (",
                            tgTasksCount,
                            ")"),
                        h("button", { type: "button", onClick: () => setTaskCategoryFilter('social_visit'), className: `px-2.5 py-1 rounded-md text-xs font-bold transition ${taskCategoryFilter === 'social_visit'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}` },
                            "Social (",
                            socialTasksCount,
                            ")"))),
                h("div", { className: "overflow-x-auto" },
                    h("table", { className: "w-full min-w-[760px] border-collapse text-left text-xs" },
                        h("thead", null,
                            h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                                h("th", { className: "py-2.5 px-3" }, "Task Details"),
                                h("th", { className: "py-2.5 px-3" }, "Type & Timer"),
                                h("th", { className: "py-2.5 px-3" }, "Reset Mode"),
                                h("th", { className: "py-2.5 px-3" }, "Reward"),
                                h("th", { className: "py-2.5 px-3" }, "Done By"),
                                h("th", { className: "py-2.5 px-3 text-right" }, "Actions"))),
                        h("tbody", { className: "divide-y divide-slate-100" }, s.tasks
                            .filter((t) => taskCategoryFilter === 'all' || t.type === taskCategoryFilter)
                            .length ? (s.tasks
                            .filter((t) => taskCategoryFilter === 'all' || t.type === taskCategoryFilter)
                            .map((t) => {
                            const isTg = t.type === 'telegram_join';
                            const isApp = t.type === 'app_task';
                            const isGame = t.type === 'play_game';
                            const isRepeatable = (t.resetHours || 0) > 0;
                            const typeBadgeClass = isApp
                                ? 'bg-indigo-50 text-indigo-700'
                                : isGame
                                    ? 'bg-violet-50 text-violet-700'
                                    : isTg
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'bg-blue-50 text-blue-700';
                            const typeBadgeText = isApp
                                ? `App Task (${t.waitSeconds || 20}s)`
                                : isGame
                                    ? `Play Game (${t.waitSeconds || 30}s)`
                                    : isTg
                                        ? 'Telegram'
                                        : `Social (${t.waitSeconds || 15}s)`;
                            return (h("tr", { className: "hover:bg-slate-50/80" },
                                h("td", { className: "py-3 px-3" },
                                    h("div", { className: "font-extrabold text-slate-900" }, t.title),
                                    h("a", { href: t.url, target: "_blank", className: "text-[11px] text-blue-600 hover:underline truncate block max-w-[240px]" }, t.url)),
                                h("td", { className: "py-3 px-3 whitespace-nowrap" },
                                    h("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold ${typeBadgeClass}` }, typeBadgeText)),
                                h("td", { className: "py-3 px-3 whitespace-nowrap" },
                                    h("span", { className: `px-2 py-0.5 rounded text-[11px] font-bold ${isRepeatable
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-600'}` }, formatResetBadge(t.resetHours))),
                                h("td", { className: "py-3 px-3 font-extrabold text-[#16A34A] whitespace-nowrap" },
                                    "+",
                                    t.reward),
                                h("td", { className: "py-3 px-3 whitespace-nowrap" },
                                    h("span", { className: "font-bold text-slate-700" }, t.claimsCount || 0),
                                    ' ',
                                    h("span", { className: "text-[11px] text-slate-400" }, "users")),
                                h("td", { className: "py-3 px-3 text-right space-x-1.5 whitespace-nowrap" },
                                    h("button", { type: "button", onClick: () => resetSingleTaskClaims(t.id, t.title), title: "Reset completions so all users can complete this task again", className: "px-2.5 py-1 bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-200 font-bold rounded text-[11px] transition" }, "Reset"),
                                    h("button", { type: "button", onClick: () => editTaskForm(t.id), className: "px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]" }, "Edit"),
                                    h("button", { type: "button", onClick: () => deleteTask(t.id), className: "px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[11px]" }, "Delete"))));
                        })) : (h("tr", null,
                            h("td", { colSpan: "6", className: "py-8 text-center text-slate-400" }, "No tasks created yet"))))))))));
}
function RewardsAdmin({ s }) {
    const spin = s.spinSettings || { enabled: true, cooldownMs: 86400000, rewards: [5, 10, 20, 50] };
    const field = 'block w-full rounded-xl border border-slate-200 p-3 text-sm';
    const submit = async (event, bonus) => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('button[type=submit]');
        if (button.disabled)
            return;
        button.disabled = true;
        const data = new FormData(form);
        try {
            const payload = bonus ? { code: String(data.get('code')), points: Number(data.get('points')), maxUses: Number(data.get('maxUses')), expiresAt: data.get('expiresAt') ? new Date(String(data.get('expiresAt'))).getTime() : null } : { enabled: data.get('enabled') === 'on', cooldownMs: Number(data.get('hours')) * 3600000, rewards: String(data.get('rewards')).split(',').map(value => Number(value.trim())) };
            await adminApi(bonus ? '/api/admin/rewards/codes' : '/api/admin/rewards/spin', { method: bonus ? 'POST' : 'PUT', body: JSON.stringify(payload) });
            notify(bonus ? 'Bonus code created' : 'Spin settings saved');
            await refreshAdmin();
        }
        catch (error) {
            notify(error.message, true);
            button.disabled = false;
        }
    };
    return h("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 space-y-4" },
        h("h2", { className: "text-lg font-bold" }, "Spin & bonus rewards"),
        h("div", { className: "grid gap-5 md:grid-cols-2" },
            h("form", { className: "space-y-3", onSubmit: (e) => void submit(e, false) },
                h("h3", { className: "font-bold" }, "Daily Spin"),
                h("label", { className: "block" },
                    h("input", { type: "checkbox", name: "enabled", checked: spin.enabled }),
                    " Enable spins"),
                h("label", { className: "block" },
                    "Cooldown hours",
                    h("input", { className: field, type: "number", name: "hours", min: "0.016667", max: "720", step: "any", required: true, value: spin.cooldownMs / 3600000 })),
                h("label", { className: "block" },
                    "Possible P points (comma separated)",
                    h("input", { className: field, name: "rewards", required: true, value: spin.rewards.join(', ') })),
                h("p", { className: "text-xs text-slate-500" }, "Each listed entry has the same probability. Repeat a value to increase its probability."),
                h("button", { type: "submit", className: "rounded-xl bg-emerald-700 px-4 py-3 text-white font-bold" }, "Save spin settings")),
            h("form", { className: "space-y-3", onSubmit: (e) => void submit(e, true) },
                h("h3", { className: "font-bold" }, "Create bonus code"),
                h("label", { className: "block" },
                    "Code",
                    h("input", { className: field, name: "code", minLength: 4, maxLength: 40, required: true, pattern: "[A-Za-z0-9-]+" })),
                h("label", { className: "block" },
                    "P points",
                    h("input", { className: field, name: "points", type: "number", min: "1", max: "1000000", defaultValue: "100", required: true })),
                h("label", { className: "block" },
                    "Total redemptions",
                    h("input", { className: field, name: "maxUses", type: "number", min: "1", max: "1000000", defaultValue: "100", required: true })),
                h("label", { className: "block" },
                    "Expiry (optional)",
                    h("input", { className: field, name: "expiresAt", type: "datetime-local" })),
                h("p", { className: "text-xs text-slate-500" }, "Each user can redeem a code once."),
                h("button", { type: "submit", className: "rounded-xl bg-emerald-700 px-4 py-3 text-white font-bold" }, "Create code"))),
        h("div", { className: "space-y-2" }, (s.rewardCodes || []).map(code => h("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3" },
            h("div", null,
                h("b", null, code.code),
                h("p", { className: "text-sm" },
                    code.points,
                    " P \u00B7 ",
                    code.uses,
                    "/",
                    code.maxUses,
                    " uses \u00B7 ",
                    code.expiresAt ? new Date(code.expiresAt).toLocaleString() : 'No expiry')),
            h("button", { type: "button", className: "rounded-lg border p-2", onClick: async (event) => { const button = event.currentTarget; button.disabled = true; try {
                    await adminApi('/api/admin/rewards/codes/' + encodeURIComponent(code.code), { method: 'PUT', body: JSON.stringify({ enabled: !code.enabled }) });
                    await refreshAdmin();
                }
                catch (error) {
                    notify(error.message, true);
                    button.disabled = false;
                } } }, code.enabled ? 'Pause' : 'Enable')))));
}
function GamesTabView(props) {
    const games = props.s.games || [];
    const editGame = editingGameId ? games.find((game) => game.id === editingGameId) : null;
    return (h("div", { className: "space-y-5" },
        h(RewardsAdmin, { s: props.s }),
        h("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3" },
            h(AdminStatCard, { label: "Published games", value: games.filter((g) => g.enabled).length.toLocaleString(), detail: `${games.length} total` }),
            h(AdminStatCard, { label: "Game starts", value: (props.s.gameStarts || 0).toLocaleString(), detail: "Paid and free starts", tone: "blue" }),
            h(AdminStatCard, { label: "Coins collected", value: (props.s.gameCoinsCollected || 0).toLocaleString(), detail: "Spent to start games", tone: "green" })),
        h("div", { className: "grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(300px,380px)_1fr]" },
            h("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" },
                h("div", { className: "mb-4 flex items-center justify-between gap-3" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" }, editGame ? 'Edit game' : 'Add a game'),
                        h("p", { className: "mt-1 text-xs text-slate-500" }, "Add a secure iframe game URL.")),
                    editGame ? h("button", { type: "button", onClick: () => clearGameForm(), className: "rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600" }, "Cancel") : null),
                h("div", { className: "space-y-3.5" },
                    h("label", { className: "block text-xs font-bold text-slate-700" },
                        "Game title",
                        h("input", { id: "gameTitle", maxLength: 60, value: editGame?.title || '', placeholder: "e.g. Gem Runner", className: "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" })),
                    h("label", { className: "block text-xs font-bold text-slate-700" },
                        "Short description ",
                        h("span", { className: "font-medium text-slate-400" }, "(optional)"),
                        h("textarea", { id: "gameDescription", maxLength: 240, rows: 3, value: editGame?.description || '', placeholder: "Tell players what to expect", className: "mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" })),
                    h("label", { className: "block text-xs font-bold text-slate-700" },
                        "Coins per start",
                        h("input", { id: "gamePrice", type: "number", min: "0", max: "100000", step: "1", value: editGame ? editGame.priceCoins : 10, className: "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" }),
                        h("span", { className: "mt-1 block text-[11px] font-medium text-slate-400" }, "Set 0 for a free game. Coins are charged on each start.")),
                    h("label", { className: "block text-xs font-bold text-slate-700" },
                        "Game iframe URL",
                        h("input", { id: "gameUrl", type: "url", value: editGame?.url || '', maxLength: 2000, placeholder: "https://games.example.com/embed/...", className: "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" }),
                        h("span", { className: "mt-1 block text-[11px] font-medium text-slate-400" }, "Use an HTTPS embed URL. Paste the iframe source URL, not HTML code.")),
                    h("div", { className: "rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-4 text-amber-800" }, "Game providers must allow iframe embedding. The game opens in a sandboxed player."),
                    h("button", { type: "button", onClick: () => saveGameCrud(), className: "w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-800" }, editGame ? 'Save game' : 'Publish game'))),
            h("section", { className: "space-y-3" },
                h("div", { className: "flex items-end justify-between gap-3" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" }, "Game library"),
                        h("p", { className: "mt-1 text-xs text-slate-500" }, "Iframe games and coin usage.")),
                    h("span", { className: "text-xs font-bold text-slate-500" },
                        games.length,
                        " games")),
                games.length ? games.map((game) => (h("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" },
                    h("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                        h("div", { className: "flex min-w-0 items-start gap-3" },
                            h("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50" },
                                h("img", { src: "/assets/icon-games.png", alt: "", className: "h-6 w-6 object-contain" })),
                            h("div", { className: "min-w-0" },
                                h("div", { className: "flex flex-wrap items-center gap-2" },
                                    h("h3", { className: "truncate text-sm font-extrabold text-slate-900" }, game.title),
                                    h("span", { className: 'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (game.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500') }, game.enabled ? 'Live' : 'Paused')),
                                h("p", { className: "mt-1 line-clamp-2 text-xs text-slate-500" }, game.description || 'No description'),
                                h("div", { className: "mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600" },
                                    h("span", null, game.priceCoins ? `${game.priceCoins.toLocaleString()} coins / start` : 'Free'),
                                    h("span", null,
                                        game.plays.toLocaleString(),
                                        " plays"),
                                    h("span", null,
                                        game.coinsCollected.toLocaleString(),
                                        " coins collected")))),
                        h("div", { className: "flex shrink-0 flex-wrap gap-1.5" },
                            h("button", { type: "button", onClick: () => editGameForm(game.id), className: "rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50" }, "Edit"),
                            h("button", { type: "button", onClick: () => setGameEnabled(game.id, !game.enabled), className: "rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100" }, game.enabled ? 'Pause' : 'Publish'),
                            h("button", { type: "button", onClick: () => deleteGame(game.id, game.title), className: "rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100" }, "Delete")))))) : h("div", { className: "rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center" },
                    h("div", { className: "text-sm font-bold text-slate-800" }, "No games published"),
                    h("p", { className: "mt-1 text-xs text-slate-500" }, "Add an iframe game URL to make it available in Explore."))))));
}
function TransactionsTabView(props) {
    const { s } = props;
    const q = txSearchQuery.trim().toLowerCase();
    const list = s.recentWithdrawals.filter((w) => {
        if (txStatusFilter !== 'all' && w.status !== txStatusFilter)
            return false;
        if (!q)
            return true;
        return w.id.toLowerCase().includes(q) ||
            (w.username || '').toLowerCase().includes(q) ||
            w.userId.toLowerCase().includes(q) ||
            w.account.toLowerCase().includes(q) ||
            w.method.toLowerCase().includes(q);
    });
    const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
    const methodOptions = draftSettings.methods.length ? draftSettings.methods.map((m) => m.name) : ['Custom'];
    return (h("div", { className: "space-y-4" },
        h("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4" },
            h(AdminStatCard, { label: "Pending", value: s.pendingWithdrawals.toLocaleString(), detail: "Requests", tone: "amber" }),
            h(AdminStatCard, { label: "Paid", value: s.paidWithdrawals.toLocaleString(), detail: "Requests", tone: "green" }),
            h(AdminStatCard, { label: "Rejected", value: s.rejectedWithdrawals.toLocaleString(), detail: "Requests" }),
            h(AdminStatCard, { label: "Paid total", value: 'Rs ' + s.paidNpr.toLocaleString(), detail: "NPR", tone: "green" })),
        h("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" },
            h("div", { className: "flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between" },
                h("h2", { className: "text-sm font-extrabold text-slate-900" },
                    "Recent transactions ",
                    h("span", { className: "font-medium text-slate-400" },
                        "(",
                        list.length,
                        ")")),
                h("div", { className: "flex flex-col gap-2 sm:flex-row" },
                    h("div", { className: "flex flex-wrap gap-1.5" }, ['all', 'pending', 'paid', 'rejected'].map((st) => (h("button", { type: "button", onClick: () => setTxFilter(st), className: 'rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ' + (txStatusFilter === st ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') }, st)))),
                    h("input", { type: "search", id: "txSearchInput", value: txSearchQuery, onInput: (e) => filterTxSearch(e.target.value), placeholder: "Search transactions", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:w-52" }))),
            showWithdrawEditor ? (h("div", { className: "my-4 rounded-xl border border-slate-200 bg-slate-50 p-4" },
                h("div", { className: "mb-3 flex items-center justify-between" },
                    h("h3", { className: "text-sm font-bold text-slate-900" }, "Edit payout"),
                    h("button", { type: "button", onClick: () => closeWithdrawForm(), className: "rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200" }, "Cancel")),
                h("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5" },
                    h("label", { className: "text-xs font-semibold text-slate-600" },
                        "User ID",
                        h("input", { id: "crudWUserId", type: "text", value: editW?.userId || '', disabled: true, className: "mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm" })),
                    h("label", { className: "text-xs font-semibold text-slate-600" },
                        "Method",
                        h("select", { id: "crudWMethod", value: editW?.method || methodOptions[0], className: "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" }, methodOptions.map((m) => h("option", { value: m }, m)))),
                    h("label", { className: "text-xs font-semibold text-slate-600" },
                        "Account",
                        h("input", { id: "crudWAccount", type: "text", value: editW?.account || '', className: "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" })),
                    h("label", { className: "text-xs font-semibold text-slate-600" },
                        "Coins",
                        h("input", { id: "crudWCoins", type: "number", value: editW?.coins || 0, className: "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" })),
                    h("div", { className: "flex items-end gap-2" },
                        h("select", { id: "crudWStatus", value: editW?.status || 'pending', className: "min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" },
                            h("option", { value: "pending" }, "Pending"),
                            h("option", { value: "paid" }, "Paid"),
                            h("option", { value: "rejected" }, "Rejected")),
                        h("button", { type: "button", onClick: () => saveWithdrawCrud(), className: "rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800" }, "Save"))))) : null,
            h("div", { className: "overflow-x-auto pt-3" },
                h("table", { className: "w-full min-w-[760px] border-collapse text-left text-xs" },
                    h("thead", null,
                        h("tr", { className: "border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-400" },
                            h("th", { className: "px-3 py-2.5" }, "Transaction"),
                            h("th", { className: "px-3 py-2.5" }, "User"),
                            h("th", { className: "px-3 py-2.5" }, "Method / account"),
                            h("th", { className: "px-3 py-2.5" }, "Amount"),
                            h("th", { className: "px-3 py-2.5" }, "Status"),
                            h("th", { className: "px-3 py-2.5 text-right" }, "Actions"))),
                    h("tbody", { className: "divide-y divide-slate-100" }, list.length ? list.map((w) => (h("tr", { className: "transition hover:bg-slate-50" },
                        h("td", { className: "px-3 py-3" },
                            h("div", { className: "font-bold text-slate-900" }, w.id),
                            h("div", { className: "mt-1 text-[10px] text-slate-400" }, new Date(w.at).toLocaleString())),
                        h("td", { className: "px-3 py-3" },
                            h("div", { className: "font-semibold text-slate-800" },
                                "@",
                                w.username || w.userId),
                            h("div", { className: "mt-1 text-[10px] text-slate-400" },
                                "ID ",
                                w.userId)),
                        h("td", { className: "px-3 py-3" },
                            h("div", { className: "font-semibold text-slate-800" }, w.method),
                            h("div", { className: "mt-1 max-w-48 truncate font-mono text-[10px] text-slate-500" }, w.account)),
                        h("td", { className: "px-3 py-3 font-bold text-slate-900" },
                            w.coins.toLocaleString(),
                            " coins",
                            h("div", { className: "mt-1 text-[10px] font-medium text-slate-400" },
                                "NPR ",
                                w.npr.toLocaleString())),
                        h("td", { className: "px-3 py-3" },
                            h("span", { className: 'rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ' + (w.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : w.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700') }, w.status)),
                        h("td", { className: "space-x-1.5 whitespace-nowrap px-3 py-3 text-right" },
                            h("button", { type: "button", onClick: () => openWithdrawForm(w.id), className: "rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200" }, "Edit"),
                            h("button", { type: "button", onClick: () => deleteWithdrawCrud(w.id), className: "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50" }, "Delete"))))) : h("tr", null,
                        h("td", { colSpan: "6", className: "px-3 py-12 text-center text-sm text-slate-400" }, "No transactions found"))))))));
}
function SettingsTabView(props) {
    const reqQual = draftSettings.requireQualification !== false;
    const methods = draftSettings.methods || [];
    const countries = draftSettings.countries || [];
    return (h("div", { className: "space-y-6 max-w-6xl mx-auto pb-12" },
        h("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" },
            h("div", null,
                h("h2", { className: "text-xl font-extrabold text-slate-900 tracking-tight" }, "Settings"),
                h("p", { className: "text-xs text-slate-500 mt-0.5" }, "Payout rules, methods and country access.")),
            h("div", { className: "flex items-center gap-2" },
                h("button", { type: "button", onClick: () => saveWithdrawSettings(), className: "px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold rounded-lg shadow-sm transition" }, "Save Changes"))),
        h("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4" },
                h("div", { className: "flex items-center gap-2" },
                    h("span", { className: "w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-extrabold text-sm" }, "\u20B9"),
                    h("div", null,
                        h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Exchange & Minimums"),
                        h("p", { className: "text-[11px] text-slate-400" }, "Payout limits and coin conversion"))),
                h("div", { className: "space-y-3 text-xs" },
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Minimum payout (coins)"),
                        h("input", { id: "setMinCoins", type: "number", defaultValue: String(draftSettings.minWithdrawCoins), placeholder: "10000", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Coin rate (coins per NPR)"),
                        h("input", { id: "setCoinRate", type: "number", defaultValue: String(draftSettings.coinPerNpr), placeholder: "100", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#16A34A]" })))),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4" },
                h("div", { className: "flex items-center gap-2" },
                    h("span", { className: "w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm" }, "\uD83D\uDEE1\uFE0F"),
                    h("div", null,
                        h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Payout eligibility"))),
                h("div", { className: "p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3" },
                    h("div", { className: "flex items-start justify-between gap-3" },
                        h("div", null,
                            h("div", { className: "text-xs font-extrabold text-slate-900" }, "Require 15 ads + 1 referral")),
                        h("button", { type: "button", onClick: () => toggleQualificationReq(), className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${reqQual ? 'bg-[#16A34A]' : 'bg-slate-300'}`, title: "Toggle qualification requirement" },
                            h("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${reqQual ? 'translate-x-5' : 'translate-x-0'}` }))),
                    h("div", { className: "pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]" },
                        h("span", { className: "font-semibold text-slate-500" }, "Qualification Status:"),
                        h("span", { className: `font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${reqQual ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}` }, reqQual ? 'Enabled' : 'Disabled'))))),
        h("div", { className: "bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5" },
            h("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2" },
                h("div", null,
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Payment methods")),
                h("span", { className: "text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start" },
                    methods.length,
                    " methods")),
            h("div", { className: "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3" },
                h("div", { className: "text-xs font-extrabold text-slate-800 uppercase tracking-wide" }, "Add method"),
                h("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs" },
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Method name"),
                        h("input", { id: "newMethodName", type: "text", placeholder: "e.g. eSewa, Khalti, UPI", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Country"),
                        h("select", { id: "newMethodCountry", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" },
                            h("option", { value: "All" }, "All Countries"),
                            countries.map((c) => (h("option", { value: c.name },
                                c.name,
                                " (",
                                c.code,
                                ")"))))),
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Account label"),
                        h("input", { id: "newMethodPlaceholder", type: "text", placeholder: "e.g. Enter Phone / Account ID", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Logo"),
                        h("div", { className: "flex gap-2 items-center" },
                            h("input", { id: "newMethodLogoUrl", type: "text", placeholder: "https://... or upload", onInput: (e) => previewMethodLogoUrl(e.target.value), className: "flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#16A34A]" }),
                            h("label", { className: "cursor-pointer px-2.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold shrink-0" },
                                "\uD83D\uDCC1",
                                h("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => handleMethodLogoUpload(e.target) })),
                            h("div", { className: "w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden" },
                                h("img", { id: "newMethodLogoPreview", className: "w-full h-full object-contain hidden" }),
                                h("span", { id: "newMethodLogoPlaceholder", className: "text-[10px] text-slate-400 font-bold" }, "Logo"))))),
                h("div", { className: "flex justify-end pt-1" },
                    h("button", { type: "button", onClick: () => addCustomMethod(), className: "px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition" }, "+ Add method"))),
            h("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" }, methods.length ? (methods.map((m) => (h("div", { className: `p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${m.enabled !== false
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'}` },
                h("div", { className: "flex items-center gap-3 min-w-0" },
                    h("div", { className: "w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" }, m.logo ? (h("img", { src: m.logo, alt: m.name, className: "w-full h-full object-contain p-1" })) : (h("span", { className: "text-xs font-extrabold text-slate-500" }, m.name.slice(0, 2).toUpperCase()))),
                    h("div", { className: "min-w-0" },
                        h("div", { className: "flex items-center gap-2" },
                            h("span", { className: "text-xs font-extrabold text-slate-900 truncate" }, m.name),
                            h("span", { className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0" }, m.country || 'All')),
                        h("div", { className: "text-[11px] text-slate-400 truncate mt-0.5 font-mono" }, m.placeholder))),
                h("div", { className: "flex items-center gap-1.5 shrink-0" },
                    h("button", { type: "button", onClick: () => toggleCustomMethod(m.id), className: `px-2 py-1 rounded text-[11px] font-bold ${m.enabled !== false
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}` }, m.enabled !== false ? 'Active' : 'Disabled'),
                    h("button", { type: "button", onClick: () => removeCustomMethod(m.id), className: "p-1 rounded text-red-500 hover:bg-red-50", title: "Remove method" }, "\u2715")))))) : (h("div", { className: "col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200" }, "No payment methods yet.")))),
        h("div", { className: "bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4" },
            h("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2" },
                h("div", null,
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Allowed countries")),
                h("span", { className: "text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start" }, countries.length ? `${countries.length} countries whitelisted` : 'Worldwide (All Countries)')),
            h("div", null,
                h("div", { className: "text-xs font-bold text-slate-700 mb-2" }, "Allowed countries"),
                h("div", { className: "flex flex-wrap gap-2" }, countries.length ? (countries.map((c) => (h("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800" },
                    c.flag ? h("img", { src: c.flag, className: "w-4 h-3 object-cover rounded-sm" }) : null,
                    h("span", null, c.name),
                    h("span", { className: "text-[10px] text-slate-400 font-mono" },
                        "(",
                        c.code,
                        ")"),
                    h("button", { type: "button", onClick: () => removeAllowedCountry(c.code), className: "ml-1 text-slate-400 hover:text-red-600 font-bold" }, "\u2715"))))) : (h("span", { className: "text-xs font-semibold text-slate-400 italic" }, "No country restriction active \u2014 users from any country can withdraw.")))),
            h("div", { className: "pt-3 border-t border-slate-100 space-y-3" },
                h("div", { className: "flex items-center justify-between" },
                    h("span", { className: "text-xs font-bold text-slate-700" }, "Add countries")),
                h("input", { type: "text", placeholder: "Search country", onInput: (e) => filterCountryApiSearch(e.target.value), className: "w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#16A34A]" }),
                h("div", { id: "countryApiResultsList", className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1" }, renderCountryApiListNodes(countryApiQuery))))));
}
function AdminApp() {
    return (h("div", { className: "min-h-screen bg-slate-50 font-sans text-slate-900 lg:flex" },
        h("div", { id: "adminToast", className: "hidden" }),
        h(AdminNavigation, { activeTab: activeTab, onSelect: switchAdminTab }),
        h("div", { className: "min-w-0 flex-1 lg:pl-64" },
            h("header", { className: "sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur" },
                h("div", { className: "mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8" },
                    h("div", { className: "flex min-w-0 items-center gap-3" },
                        h("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-black text-white lg:hidden" }, "P"),
                        h("div", null,
                            h("p", { className: "hidden text-[10px] font-bold uppercase tracking-[.15em] text-slate-400 sm:block" }, "Paiso workspace"),
                            h("h1", { className: "text-lg font-extrabold tracking-tight text-slate-950" }, activeTab === 'dashboard' ? 'Overview' : activeTab === 'withdrawal' ? 'Payouts' : activeTab === 'transactions' ? 'Transactions' : activeTab === 'users' ? 'Users' : activeTab === 'tasks' ? 'Tasks' : activeTab === 'games' ? 'Games' : 'Settings')),
                        h("span", { className: "hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 md:inline-flex" },
                            h("span", { className: 'h-2 w-2 rounded-full ' + (data?.dbMode === 'postgres' ? 'bg-emerald-500' : 'bg-slate-400') }),
                            data?.dbMode === 'postgres' ? 'Database connected' : 'Local data')),
                    h("div", { className: "flex shrink-0 items-center gap-2" },
                        h("button", { type: "button", onClick: () => openAdminNotifModal('all'), className: "inline-flex rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:px-3.5 sm:text-xs" }, "Notify"),
                        h("button", { id: "adminRefreshButton", type: "button", onClick: () => refreshAdmin(), className: "rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" }, "Refresh"),
                        h("button", { type: "button", onClick: () => adminLogout(), className: "rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" }, "Logout")))),
            h("div", { id: "adminLoginSection", className: "hidden flex min-h-[calc(100dvh-76px)] items-center justify-center px-4 py-10" },
                h("div", { className: "w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[.04] sm:p-9" },
                    h("h2", { className: "text-2xl font-extrabold tracking-tight text-slate-950" }, "Admin Login"),
                    h("p", { className: "mt-2 text-sm leading-6 text-slate-500" }, "Enter your Admin ID to continue."),
                    h("input", { id: "adminKeyInput", type: "password", defaultValue: adminKey, placeholder: "Admin ID", onKeyDown: (e) => {
                            if (e.key === 'Enter')
                                adminLogin();
                        }, className: "mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" }),
                    h("button", { type: "button", onClick: () => adminLogin(), className: "mt-3 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800" }, "Login"),
                    h("div", { id: "adminLoginErr", className: "text-xs text-red-600 font-semibold mt-2" }))),
            h("main", { id: "adminMainWorkspace", className: "min-h-[calc(100dvh-76px)] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8" },
                h("div", { id: "adminTabView", className: "w-full h-full" }))),
        h("div", { id: "adminNotifModal", className: "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] hidden items-center justify-center p-4", onClick: (e) => {
                if (e.target.id === 'adminNotifModal')
                    closeAdminNotifModal();
            } },
            h("div", { className: "w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]" },
                h("div", { className: "px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50" },
                    h("div", null,
                        h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Send Notification & Activity Log"),
                        h("p", { className: "text-xs text-slate-500" }, "Broadcast a message (with optional bonus coins) to all users or a specific user.")),
                    h("button", { type: "button", onClick: () => closeAdminNotifModal(), className: "px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-700 text-xs font-bold" }, "\u2715 Close")),
                h("div", { className: "p-5 overflow-y-auto space-y-5 text-xs" },
                    h("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3" },
                        h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                            h("div", null,
                                h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Recipient (Target User ID or 'all')"),
                                h("input", { id: "adminNotifTarget", type: "text", defaultValue: "all", placeholder: "all (for everyone) or User ID e.g. 999001", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" })),
                            h("div", null,
                                h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Optional Gift Coins (0 for none)"),
                                h("input", { id: "adminNotifCoins", type: "number", defaultValue: "0", placeholder: "0", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]" }))),
                        h("div", null,
                            h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Notification Title"),
                            h("input", { id: "adminNotifTitle", type: "text", placeholder: "e.g. New High-Reward Task Added! or Special Bonus", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" })),
                        h("div", null,
                            h("label", { className: "block text-[11px] font-bold text-slate-600 mb-1" }, "Notification Message"),
                            h("textarea", { id: "adminNotifMessage", rows: 2, placeholder: "Write the notification message that users will see in their app...", className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#16A34A]" })),
                        h("button", { type: "button", onClick: () => sendAdminNotification(), className: "w-full py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-lg transition" }, "Send Notification Now")),
                    h("div", null,
                        h("div", { className: "text-xs font-extrabold uppercase text-slate-700 mb-2" }, "Recent Notifications & Activity Log"),
                        h("div", { id: "adminNotifHistoryList", className: "space-y-2 max-h-60 overflow-y-auto pr-1" })))))));
}
function renderActiveTab() {
    const container = document.getElementById('adminTabView');
    if (!container || !data)
        return;
    document.querySelectorAll('[data-admintab]').forEach((btn) => {
        const isActive = btn.dataset.admintab === activeTab;
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
        btn.classList.toggle('bg-emerald-50', isActive && !!btn.closest('aside'));
        btn.classList.toggle('text-emerald-800', isActive);
        btn.classList.toggle('text-slate-500', !isActive);
        const isDesktopNav = !!btn.closest('aside');
        const icon = btn.querySelector('span');
        if (icon) {
            icon.classList.toggle('bg-emerald-100', isActive && isDesktopNav);
            icon.classList.toggle('bg-slate-100', !isActive && isDesktopNav);
            icon.classList.toggle('bg-emerald-50', isActive && !isDesktopNav);
            icon.classList.toggle('text-emerald-800', isActive && isDesktopNav);
            icon.classList.toggle('text-slate-500', !isActive && isDesktopNav);
        }
    });
    let viewNode;
    if (activeTab === 'dashboard')
        viewNode = h(DashboardTabView, { s: data });
    else if (activeTab === 'users')
        viewNode = h(UsersTabView, { s: data });
    else if (activeTab === 'withdrawal')
        viewNode = h(WithdrawalTabView, { s: data });
    else if (activeTab === 'tasks')
        viewNode = h(TasksTabView, { s: data });
    else if (activeTab === 'games')
        viewNode = h(GamesTabView, { s: data });
    else if (activeTab === 'settings')
        viewNode = h(SettingsTabView, { s: data });
    else
        viewNode = h(TransactionsTabView, { s: data });
    const focused = document.activeElement;
    const focusId = focused?.id;
    const selectionStart = focused && (focused.type === 'text' || focused.type === 'search') ? focused.selectionStart : null;
    const selectionEnd = focused && (focused.type === 'text' || focused.type === 'search') ? focused.selectionEnd : null;
    container.replaceChildren(viewNode);
    if (focusId) {
        const next = document.getElementById(focusId);
        if (next && !next.disabled) {
            next.focus({ preventScroll: true });
            if (selectionStart !== null && selectionEnd !== null)
                next.setSelectionRange(selectionStart, selectionEnd);
        }
    }
}
async function refreshAdmin() {
    if (isRefreshing)
        return;
    isRefreshing = true;
    const refreshButton = document.getElementById('adminRefreshButton');
    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = 'Refreshing…';
    }
    try {
        if (!apiCountries.length)
            loadCountriesFromApi();
        const s = await adminApi('/api/admin/stats');
        data = s;
        draftSettings = {
            methods: Array.isArray(s.settings.methods) ? s.settings.methods.map((m) => ({ ...m })) : [],
            allowedMethods: [...(s.settings.allowedMethods || [])],
            minWithdrawCoins: s.settings.minWithdrawCoins || 10000,
            coinPerNpr: s.settings.coinPerNpr || 100,
            countries: Array.isArray(s.settings.countries) ? s.settings.countries.map((c) => ({ ...c })) : [],
            allowedCountries: [...(s.settings.allowedCountries || [])],
            requireQualification: s.settings.requireQualification !== false
        };
        document.getElementById('adminLoginSection')?.classList.add('hidden');
        document.getElementById('adminMainWorkspace')?.classList.remove('hidden');
        renderActiveTab();
    }
    catch (e) {
        document.getElementById('adminMainWorkspace')?.classList.add('hidden');
        document.getElementById('adminLoginSection')?.classList.remove('hidden');
        const errEl = document.getElementById('adminLoginErr');
        if (errEl)
            errEl.textContent = e.message;
    }
    finally {
        isRefreshing = false;
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = 'Refresh';
        }
    }
}
async function adminLogin() {
    const inp = document.getElementById('adminKeyInput');
    if (inp && inp.value.trim()) {
        adminKey = inp.value.trim();
        sessionStorage.setItem('paiso_admin_key', adminKey);
    }
    await refreshAdmin();
}
function adminLogout() {
    sessionStorage.removeItem('paiso_admin_key');
    adminKey = '';
    location.reload();
}
function clearGameForm() {
    editingGameId = null;
    renderActiveTab();
}
function editGameForm(id) {
    editingGameId = id;
    renderActiveTab();
    document.getElementById('gameTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
async function saveGameCrud() {
    const title = document.getElementById('gameTitle')?.value.trim() || '';
    const description = document.getElementById('gameDescription')?.value.trim() || '';
    const url = document.getElementById('gameUrl')?.value.trim() || '';
    const priceCoins = Number(document.getElementById('gamePrice')?.value);
    if (title.length < 2 || title.length > 60)
        return notify('Game title must be 2–60 characters', true);
    if (description.length > 240)
        return notify('Description must be 240 characters or less', true);
    if (!Number.isSafeInteger(priceCoins) || priceCoins < 0 || priceCoins > 100000)
        return notify('Price must be a whole number from 0 to 100,000', true);
    try {
        if (new URL(url).protocol !== 'https:')
            return notify('Game URL must use HTTPS', true);
    }
    catch {
        return notify('Enter a valid game iframe URL', true);
    }
    const payload = { title, description, url, priceCoins };
    try {
        if (editingGameId) {
            await adminApi(`/api/admin/games/${encodeURIComponent(editingGameId)}`, { method: 'PUT', body: JSON.stringify(payload) });
            notify('Game updated');
        }
        else {
            await adminApi('/api/admin/games', { method: 'POST', body: JSON.stringify(payload) });
            notify('Game published');
        }
        editingGameId = null;
        await refreshAdmin();
    }
    catch (e) {
        notify(e.message || 'Could not save game', true);
    }
}
async function setGameEnabled(id, enabled) {
    try {
        await adminApi(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ enabled }) });
        notify(enabled ? 'Game published' : 'Game paused');
        await refreshAdmin();
    }
    catch (e) {
        notify(e.message || 'Could not update game', true);
    }
}
async function deleteGame(id, title) {
    if (!confirm(`Remove “${title}” from the app? Past play totals will stay in reports.`))
        return;
    try {
        await adminApi(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (editingGameId === id)
            clearGameForm();
        notify('Game deleted');
        await refreshAdmin();
    }
    catch (e) {
        notify(e.message || 'Could not delete game', true);
    }
}
function switchAdminTab(tab) {
    activeTab = tab;
    renderActiveTab();
}
function previewMethodLogoUrl(url) {
    const trimmed = url.trim();
    uploadedMethodLogoData = trimmed;
    const img = document.getElementById('newMethodLogoPreview');
    const ph = document.getElementById('newMethodLogoPlaceholder');
    if (img && ph) {
        if (trimmed) {
            img.src = trimmed;
            img.classList.remove('hidden');
            ph.classList.add('hidden');
        }
        else {
            img.src = '';
            img.classList.add('hidden');
            ph.classList.remove('hidden');
        }
    }
}
function handleMethodLogoUpload(input) {
    const file = input.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        uploadedMethodLogoData = String(reader.result || '');
        const urlInp = document.getElementById('newMethodLogoUrl');
        if (urlInp)
            urlInp.value = uploadedMethodLogoData;
        previewMethodLogoUrl(uploadedMethodLogoData);
        notify('Logo image ready');
    };
    reader.readAsDataURL(file);
}
async function persistDraftSettings(msg) {
    const minInput = document.getElementById('setMinCoins');
    const rateInput = document.getElementById('setCoinRate');
    if (minInput && minInput.value)
        draftSettings.minWithdrawCoins = Math.max(100, +minInput.value);
    if (rateInput && rateInput.value)
        draftSettings.coinPerNpr = Math.max(1, +rateInput.value);
    await adminApi('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(draftSettings)
    });
    if (data) {
        data.settings = {
            ...data.settings,
            methods: draftSettings.methods.map((m) => ({ ...m })),
            minWithdrawCoins: draftSettings.minWithdrawCoins,
            coinPerNpr: draftSettings.coinPerNpr,
            countries: draftSettings.countries.map((c) => ({ ...c }))
        };
    }
    notify(msg);
    renderActiveTab();
}
async function addCustomMethod() {
    const name = document.getElementById('newMethodName')?.value.trim() || '';
    const logo = document.getElementById('newMethodLogoUrl')?.value.trim() ||
        uploadedMethodLogoData ||
        '';
    const country = document.getElementById('newMethodCountry')?.value || 'All';
    const placeholder = document.getElementById('newMethodPlaceholder')?.value.trim() ||
        `Enter ${name} ID / Account`;
    if (!name) {
        notify('Please enter Method Name (e.g. eSewa, UPI)', true);
        return;
    }
    draftSettings.methods.push({
        id: 'm_' + Date.now(),
        name,
        logo,
        placeholder,
        country,
        enabled: true
    });
    uploadedMethodLogoData = '';
    await persistDraftSettings(`Added method: ${name}`);
}
async function toggleCustomMethod(id) {
    const item = draftSettings.methods.find((m) => m.id === id);
    if (item) {
        item.enabled = item.enabled === false ? true : false;
        await persistDraftSettings(`${item.name} ${item.enabled ? ' enabled' : ' disabled'}`);
    }
}
async function removeCustomMethod(id) {
    draftSettings.methods = draftSettings.methods.filter((m) => m.id !== id);
    await persistDraftSettings('Method removed');
}
function filterCountryApiSearch(q) {
    countryApiQuery = q;
    const listEl = document.getElementById('countryApiResultsList');
    if (listEl) {
        listEl.replaceChildren(...renderCountryApiListNodes(q));
    }
}
async function addCountryFromApi(code) {
    const found = apiCountries.find((c) => c.code === code);
    if (!found)
        return;
    if (!draftSettings.countries.some((c) => c.code === found.code)) {
        draftSettings.countries.push({ ...found });
    }
    await persistDraftSettings(`Added country: ${found.name}`);
}
async function removeAllowedCountry(code) {
    draftSettings.countries = draftSettings.countries.filter((c) => c.code !== code);
    await persistDraftSettings('Country removed');
}
async function saveWithdrawSettings() {
    await persistDraftSettings('Minimum withdrawal & rate saved');
}
function setTaskCategoryFilter(cat) {
    taskCategoryFilter = cat;
    renderActiveTab();
}
function quickAdjustCoins(userId, currentCoins) {
    const input = prompt(`Adjust coins for User #${userId} (Current: ${currentCoins.toLocaleString()} Coins):\n\nEnter amount to add (e.g. 500) or subtract (e.g. -200):`, '500');
    if (!input)
        return;
    const delta = parseInt(input, 10);
    if (isNaN(delta) || delta === 0)
        return;
    adminApi(`/api/admin/user/${userId}/coins`, {
        method: 'POST',
        body: JSON.stringify({ delta })
    })
        .then(() => {
        notify(`Updated balance for #${userId} (${delta > 0 ? '+' : ''}${delta.toLocaleString()} Coins)`);
        refreshAdmin();
    })
        .catch((e) => notify(e.message, true));
}
function toggleQualificationReq() {
    draftSettings.requireQualification = !draftSettings.requireQualification;
    persistDraftSettings(`User qualification requirement ${draftSettings.requireQualification ? 'Enabled' : 'Disabled'}`);
}
function filterAdminUsers(q) {
    userSearchQuery = q;
    renderActiveTab();
}
function openUserForm(userId) {
    editingUserId = userId || null;
    showUserEditor = true;
    renderActiveTab();
}
function closeUserForm() {
    editingUserId = null;
    showUserEditor = false;
    renderActiveTab();
}
async function saveUserCrud() {
    if (isSavingUser)
        return;
    const id = document.getElementById('crudUserId')?.value.trim() || '';
    const name = document.getElementById('crudUserName')?.value.trim() || '';
    const username = document.getElementById('crudUserHandle')?.value.trim() || '';
    const coins = Number(document.getElementById('crudUserCoins')?.value || 0);
    const email = document.getElementById('crudUserEmail')?.value.trim() || '';
    const adsDone = Number(document.getElementById('crudUserAds')?.value || 0);
    const dailyDone = Number(document.getElementById('crudUserDaily')?.value || 0);
    const verified = Boolean(document.getElementById('crudUserVerified')?.checked);
    if (!editingUserId && !id) {
        notify('Enter a User ID', true);
        return;
    }
    if (!name) {
        notify('Enter the user name', true);
        return;
    }
    if (![coins, adsDone, dailyDone].every((value) => Number.isFinite(value) && value >= 0)) {
        notify('Balance and activity values must be zero or more', true);
        return;
    }
    isSavingUser = true;
    renderActiveTab();
    try {
        if (editingUserId) {
            await adminApi('/api/admin/user/' + encodeURIComponent(editingUserId), {
                method: 'PUT',
                body: JSON.stringify({ name, username, coins, email, adsDone, dailyDone, verified })
            });
            notify('User updated');
        }
        else {
            await adminApi('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ id, name, username, coins, email, verified })
            });
            notify('User created');
        }
        showUserEditor = false;
        editingUserId = null;
        await refreshAdmin();
    }
    catch (e) {
        notify(e.message || 'Could not save user', true);
    }
    finally {
        isSavingUser = false;
        if (showUserEditor)
            renderActiveTab();
    }
}
async function toggleUserVerify(userId) {
    await adminApi(`/api/admin/user/${userId}/verify`, { method: 'POST' });
    notify(`Updated verification for #${userId}`);
    await refreshAdmin();
}
async function deleteUser(userId) {
    if (!confirm(`Delete user #${userId}?`))
        return;
    await adminApi(`/api/admin/user/${userId}`, { method: 'DELETE' });
    notify(`Deleted #${userId}`);
    await refreshAdmin();
}
function editTaskForm(taskId) {
    editingTaskId = taskId;
    renderActiveTab();
}
function resetTaskForm() {
    editingTaskId = null;
    renderActiveTab();
}
function clearTaskFormInputs() {
    editingTaskId = null;
    renderActiveTab();
    const titleEl = document.getElementById('newTaskTitle');
    const urlEl = document.getElementById('newTaskUrl');
    const targetEl = document.getElementById('newTaskTarget');
    const rewardEl = document.getElementById('newTaskReward');
    const waitEl = document.getElementById('newTaskWait');
    const resetEl = document.getElementById('newTaskResetHours');
    if (titleEl)
        titleEl.value = '';
    if (urlEl)
        urlEl.value = '';
    if (targetEl)
        targetEl.value = '';
    if (rewardEl)
        rewardEl.value = '200';
    if (waitEl)
        waitEl.value = '15';
    if (resetEl)
        resetEl.value = '0';
}
async function saveTaskCrud() {
    const title = document.getElementById('newTaskTitle')?.value.trim() || '';
    const type = document.getElementById('newTaskType')?.value || 'social_visit';
    const reward = +(document.getElementById('newTaskReward')?.value || 200);
    const waitSeconds = +(document.getElementById('newTaskWait')?.value || 15);
    const resetHours = +(document.getElementById('newTaskResetHours')?.value || 0);
    const url = document.getElementById('newTaskUrl')?.value.trim() || '';
    const target = document.getElementById('newTaskTarget')?.value.trim() || url;
    if (!title || !url) {
        notify('Enter Title and URL', true);
        return;
    }
    if (editingTaskId) {
        await adminApi(`/api/admin/tasks/${editingTaskId}`, {
            method: 'PUT',
            body: JSON.stringify({ title, type, reward, waitSeconds, resetHours, url, target })
        });
        notify('Task updated');
        editingTaskId = null;
    }
    else {
        await adminApi('/api/admin/tasks', {
            method: 'POST',
            body: JSON.stringify({ title, type, reward, waitSeconds, resetHours, url, target })
        });
        notify('Task created');
    }
    await refreshAdmin();
}
async function resetSingleTaskClaims(id, title) {
    await adminApi(`/api/admin/tasks/${id}/reset`, { method: 'POST', body: '{}' });
    notify(`Reset completions for "${title}" — users can complete it again!`);
    await refreshAdmin();
}
async function resetAllTasksClaims() {
    if (!confirm('Reset completions for ALL tasks? All users will be able to complete every task again.'))
        return;
    await adminApi('/api/admin/tasks/reset-all', { method: 'POST', body: '{}' });
    notify('All tasks reset! Users can complete all tasks again.');
    await refreshAdmin();
}
async function deleteTask(id) {
    await adminApi(`/api/admin/tasks/${id}`, { method: 'DELETE' });
    if (editingTaskId === id)
        editingTaskId = null;
    notify('Task deleted');
    await refreshAdmin();
}
function openWithdrawForm(withdrawId) {
    editingWithdrawId = withdrawId;
    showWithdrawEditor = true;
    renderActiveTab();
}
function closeWithdrawForm() {
    editingWithdrawId = null;
    showWithdrawEditor = false;
    renderActiveTab();
}
async function saveWithdrawCrud() {
    if (!editingWithdrawId)
        return;
    const method = document.getElementById('crudWMethod')?.value || 'Custom';
    const account = document.getElementById('crudWAccount')?.value.trim() || '';
    const coins = Number(document.getElementById('crudWCoins')?.value || 0);
    const status = document.getElementById('crudWStatus')?.value || 'pending';
    if (!account || !Number.isFinite(coins) || coins <= 0) {
        notify('Enter a valid account and payout amount', true);
        return;
    }
    try {
        await adminApi('/api/admin/withdraw/' + encodeURIComponent(editingWithdrawId), {
            method: 'PUT',
            body: JSON.stringify({ method, account, coins, status })
        });
        notify('Payout updated');
        showWithdrawEditor = false;
        editingWithdrawId = null;
        await refreshAdmin();
    }
    catch (e) {
        notify(e.message || 'Could not update payout', true);
    }
}
async function decideWithdraw(id, action) {
    await adminApi(`/api/admin/withdraw/${id}`, {
        method: 'POST',
        body: JSON.stringify({ action })
    });
    notify(action === 'paid' ? `Approved ${id}` : `Rejected ${id}`);
    await refreshAdmin();
}
async function deleteWithdrawCrud(id) {
    if (!confirm(`Delete transaction ${id}?`))
        return;
    await adminApi(`/api/admin/withdraw/${id}`, { method: 'DELETE' });
    notify(`Deleted ${id}`);
    await refreshAdmin();
}
function setTxFilter(status) {
    txStatusFilter = status;
    renderActiveTab();
}
function filterTxSearch(q) {
    txSearchQuery = q;
    renderActiveTab();
}
function renderAdminNotifHistory() {
    const listEl = document.getElementById('adminNotifHistoryList');
    if (!listEl)
        return;
    const list = data?.notifications || [];
    if (!list.length) {
        listEl.replaceChildren(h("div", { className: "py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200" }, "No notifications in history yet"));
        return;
    }
    listEl.replaceChildren(...list.map((n) => (h("div", { className: "flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200" },
        h("div", { className: "min-w-0" },
            h("div", { className: "flex items-center gap-2" },
                h("span", { className: "text-xs font-extrabold text-slate-900 truncate" }, n.title),
                h("span", { className: "px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600" }, n.userId === 'all' ? 'All Users' : `User #${n.userId}`),
                h("span", { className: "px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase" }, n.type),
                n.coins ? (h("span", { className: "text-[10px] font-extrabold text-[#16A34A]" },
                    "+",
                    n.coins,
                    " Coins")) : null),
            h("div", { className: "text-[11px] text-slate-600 mt-0.5 truncate" }, n.message)),
        h("button", { type: "button", onClick: () => deleteAdminNotif(n.id), className: "px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold shrink-0" }, "Delete")))));
}
function openAdminNotifModal(targetUserId = 'all') {
    const modal = document.getElementById('adminNotifModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    const targetInput = document.getElementById('adminNotifTarget');
    if (targetInput)
        targetInput.value = targetUserId;
    renderAdminNotifHistory();
}
function closeAdminNotifModal() {
    const modal = document.getElementById('adminNotifModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
async function sendAdminNotification() {
    const userId = document.getElementById('adminNotifTarget')?.value.trim() || 'all';
    const title = document.getElementById('adminNotifTitle')?.value.trim() || '';
    const message = document.getElementById('adminNotifMessage')?.value.trim() || '';
    const coins = Math.max(0, Math.floor(+(document.getElementById('adminNotifCoins')?.value || 0)));
    if (!title || !message) {
        notify('Please enter both Title and Message', true);
        return;
    }
    await adminApi('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ userId, title, message, coins })
    });
    const titleEl = document.getElementById('adminNotifTitle');
    const msgEl = document.getElementById('adminNotifMessage');
    const coinsEl = document.getElementById('adminNotifCoins');
    if (titleEl)
        titleEl.value = '';
    if (msgEl)
        msgEl.value = '';
    if (coinsEl)
        coinsEl.value = '0';
    notify(userId === 'all' ? 'Notification broadcasted to all users!' : `Notification sent to #${userId}!`);
    await refreshAdmin();
    renderAdminNotifHistory();
}
async function deleteAdminNotif(id) {
    await adminApi(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    notify('Notification removed');
    await refreshAdmin();
    renderAdminNotifHistory();
}
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('admin-root');
    if (root) {
        root.replaceChildren(h(AdminApp, null));
    }
    loadCountriesFromApi();
    refreshAdmin();
});
