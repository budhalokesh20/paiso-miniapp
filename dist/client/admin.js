import { h } from './jsx';
let adminKey = sessionStorage.getItem('paiso_admin_key') || '8990374489';
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
    if (r.status === 403) {
        throw new Error('Invalid Admin Key');
    }
    return r.json();
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
        h("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" },
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Total Users"),
                h("div", { className: "text-2xl font-extrabold text-slate-900 mt-1" }, s.totalUsers)),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Verified Users"),
                h("div", { className: "text-2xl font-extrabold text-sky-600 mt-1" }, s.verifiedUsers)),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Pending Withdraw"),
                h("div", { className: "text-2xl font-extrabold text-amber-600 mt-1" }, s.pendingWithdrawals)),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Pending NPR"),
                h("div", { className: "text-2xl font-extrabold text-slate-900 mt-1" },
                    "Rs ",
                    s.pendingNpr)),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Total Paid"),
                h("div", { className: "text-2xl font-extrabold text-[#16A34A] mt-1" },
                    "Rs ",
                    s.paidNpr)),
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Active Tasks"),
                h("div", { className: "text-2xl font-extrabold text-slate-900 mt-1" }, s.tasks.length))),
        h("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5" },
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-5" },
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
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-5" },
                h("div", { className: "flex items-center justify-between mb-3" },
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Withdrawal Configuration"),
                    h("button", { type: "button", onClick: () => {
                            switchAdminTab('withdrawal');
                            toggleWithdrawSettingsModal(true);
                        }, className: "text-xs font-bold text-[#16A34A] hover:underline" }, "Configure")),
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
    return (h("div", { className: "bg-white border border-slate-200 rounded-xl p-5" },
        h("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
            h("h2", { className: "text-base font-extrabold text-slate-900" },
                "User Management (",
                filtered.length,
                ")"),
            h("div", { className: "flex items-center gap-2.5" },
                h("input", { type: "text", value: userSearchQuery, onInput: (e) => filterAdminUsers(e.target.value), placeholder: "Search user, ID, email...", className: "w-60 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" }),
                h("button", { type: "button", onClick: () => openUserForm(), className: "px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition" }, "+ Add User"))),
        showUserEditor ? (h("div", { className: "mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl" },
            h("div", { className: "flex items-center justify-between mb-3" },
                h("h3", { className: "text-xs font-extrabold uppercase text-slate-700" }, editUser ? `Edit User #${editUser.id}` : 'Create New User'),
                h("button", { type: "button", onClick: () => closeUserForm(), className: "text-xs font-bold text-slate-400 hover:text-slate-700" }, "\u2715 Close")),
            h("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs" },
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "User ID"),
                    h("input", { id: "crudUserId", type: "text", value: editUser ? editUser.id : '', disabled: Boolean(editUser), placeholder: "e.g. 9812345", className: "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Full Name"),
                    h("input", { id: "crudUserName", type: "text", value: editUser ? editUser.name : '', placeholder: "Full Name", className: "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Username"),
                    h("input", { id: "crudUserHandle", type: "text", value: editUser ? editUser.username : '', placeholder: "username", className: "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Coins Balance"),
                    h("input", { id: "crudUserCoins", type: "number", value: editUser ? editUser.coins : 0, className: "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Email"),
                    h("input", { id: "crudUserEmail", type: "email", value: editUser ? editUser.email : '', placeholder: "user@mail.com", className: "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg" })),
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "Ads / Check-ins"),
                    h("div", { className: "grid grid-cols-2 gap-1.5" },
                        h("input", { id: "crudUserAds", type: "number", value: editUser ? editUser.adsDone : 0, title: "Ads Done", className: "w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" }),
                        h("input", { id: "crudUserDaily", type: "number", value: editUser ? editUser.dailyDone : 0, title: "Daily Check-ins", className: "w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg" }))),
                h("div", { className: "flex flex-col justify-end" },
                    h("label", { className: "inline-flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 cursor-pointer" },
                        h("input", { id: "crudUserVerified", type: "checkbox", checked: Boolean(editUser?.verified), className: "rounded" }),
                        h("span", null, "Blue Tick Verified")),
                    h("button", { type: "button", onClick: () => saveUserCrud(), className: "w-full py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-lg" }, editUser ? 'Update User' : 'Create User'))))) : null,
        h("div", { className: "overflow-x-auto" },
            h("table", { className: "w-full text-left border-collapse text-xs" },
                h("thead", null,
                    h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                        h("th", { className: "py-2.5 px-3" }, "User"),
                        h("th", { className: "py-2.5 px-3" }, "Blue Tick"),
                        h("th", { className: "py-2.5 px-3" }, "Qualification"),
                        h("th", { className: "py-2.5 px-3" }, "Coins"),
                        h("th", { className: "py-2.5 px-3" }, "Referrals"),
                        h("th", { className: "py-2.5 px-3 text-right" }, "CRUD Actions"))),
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
        h("div", { className: "bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4" },
            h("div", { className: "flex flex-wrap items-center gap-6" },
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" },
                        "Active Methods (",
                        activeMethods.length,
                        ")"),
                    h("div", { className: "flex flex-wrap items-center gap-1.5 mt-1" }, activeMethods.length ? (activeMethods.map((m) => (h("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold" },
                        m.logo ? (h("img", { src: m.logo, className: "w-4 h-4 rounded object-contain bg-white" })) : (h("span", { className: "w-4 h-4 rounded bg-slate-300 text-[10px] flex items-center justify-center font-extrabold" }, m.name.slice(0, 1).toUpperCase())),
                        h("span", null, m.name))))) : (h("span", { className: "text-xs font-bold text-amber-600" }, "No methods added")))),
                h("div", { className: "h-8 w-px bg-slate-200 hidden sm:block" }),
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" }, "Minimum Payout"),
                    h("div", { className: "text-sm font-extrabold text-slate-900 mt-0.5" },
                        s.settings.minWithdrawCoins.toLocaleString(),
                        " Coins",
                        ' ',
                        h("span", { className: "text-xs font-semibold text-slate-500" },
                            "(NPR ",
                            (s.settings.minWithdrawCoins / (s.settings.coinPerNpr || 100)).toFixed(0),
                            ")"))),
                h("div", { className: "h-8 w-px bg-slate-200 hidden sm:block" }),
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" },
                        "Allowed Countries (",
                        activeCountries.length,
                        ")"),
                    h("div", { className: "flex flex-wrap items-center gap-1.5 mt-1" }, activeCountries.length ? (activeCountries.map((c) => (h("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold" },
                        c.flag ? h("img", { src: c.flag, className: "w-4 h-3 object-cover rounded-sm" }) : null,
                        h("span", null, c.name))))) : (h("span", { className: "text-xs font-bold text-slate-400" }, "All Countries"))))),
            h("div", { className: "flex items-center gap-2" },
                h("button", { type: "button", onClick: () => openWithdrawForm(), className: "px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition" }, "+ Manual Withdrawal"),
                h("button", { type: "button", onClick: () => toggleWithdrawSettingsModal(), className: `px-4 py-2 rounded-lg border text-xs font-extrabold flex items-center gap-2 transition ${showWithdrawSettings
                        ? 'bg-[#16A34A] border-[#16A34A] text-white'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-[#16A34A] hover:text-white'}` },
                    h("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                        h("circle", { cx: "12", cy: "12", r: "3" }),
                        h("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })),
                    h("span", null, showWithdrawSettings ? 'Close Settings' : 'Withdrawal Settings')))),
        showWithdrawSettings ? (h("div", { className: "bg-white border-2 border-[#16A34A] rounded-xl p-5 shadow-sm space-y-6" },
            h("div", { className: "flex items-center justify-between border-b border-slate-100 pb-3" },
                h("div", null,
                    h("h3", { className: "text-sm font-extrabold text-slate-900" }, "Withdrawal Configuration"),
                    h("p", { className: "text-xs text-slate-500" }, "Manage custom payout methods (logo & name), minimum withdrawal limit, and allowed countries. Changes save automatically.")),
                h("button", { type: "button", onClick: () => toggleWithdrawSettingsModal(false), className: "px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700" }, "\u2715 Done")),
            h("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4" },
                h("div", { className: "text-xs font-extrabold uppercase text-slate-800 mb-3" }, "1. Minimum Withdrawal & Conversion Rate"),
                h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs" },
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-500 mb-1" }, "Minimum Withdraw (Coins)"),
                        h("input", { id: "setMinCoins", type: "number", value: draftSettings.minWithdrawCoins, className: "w-full px-3 py-2 font-extrabold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] font-bold text-slate-500 mb-1" }, "Coins per NPR 1"),
                        h("input", { id: "setCoinRate", type: "number", value: draftSettings.coinPerNpr, className: "w-full px-3 py-2 font-extrabold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("button", { type: "button", onClick: () => saveWithdrawSettings(), className: "px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-lg transition" }, "Save Limit & Rate"))),
            h("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5" },
                h("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4" },
                    h("div", null,
                        h("div", { className: "flex items-center justify-between mb-3" },
                            h("span", { className: "text-xs font-extrabold uppercase text-slate-800" },
                                "2. Custom Payout Methods (",
                                draftSettings.methods.length,
                                ")"),
                            h("span", { className: "text-[11px] text-slate-500 font-semibold" }, "Custom Logo & Name")),
                        h("div", { className: "space-y-2 mb-4 max-h-56 overflow-y-auto pr-1" }, draftSettings.methods.length ? (draftSettings.methods.map((m) => (h("div", { className: `flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-white ${m.enabled !== false ? 'border-slate-200' : 'border-slate-200 opacity-50'}` },
                            h("div", { className: "flex items-center gap-3 min-w-0" },
                                m.logo ? (h("img", { src: m.logo, className: "w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 shrink-0" })) : (h("div", { className: "w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm shrink-0" }, m.name.slice(0, 1).toUpperCase())),
                                h("div", { className: "min-w-0" },
                                    h("div", { className: "text-xs font-extrabold text-slate-900 truncate" }, m.name),
                                    h("div", { className: "text-[11px] text-slate-500 truncate" },
                                        m.country && m.country !== 'All' ? m.country : 'All Countries',
                                        " \u2022",
                                        ' ',
                                        m.placeholder || `Enter ${m.name} ID`))),
                            h("div", { className: "flex items-center gap-1.5 shrink-0" },
                                h("button", { type: "button", onClick: () => toggleCustomMethod(m.id), className: `px-2.5 py-1 rounded-md text-[11px] font-bold ${m.enabled !== false
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200 text-slate-600'}` }, m.enabled !== false ? 'Active' : 'Disabled'),
                                h("button", { type: "button", onClick: () => removeCustomMethod(m.id), className: "px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold" }, "Delete")))))) : (h("div", { className: "py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200" }, "No withdrawal methods added yet. Add one below!")))),
                    h("div", { className: "bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 text-xs" },
                        h("div", { className: "font-extrabold text-slate-800" }, "Add New Payout Method"),
                        h("div", { className: "flex items-center gap-3" },
                            h("label", { title: "Click to upload logo image", className: "w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#16A34A] bg-slate-50 flex flex-col items-center justify-center cursor-pointer shrink-0 overflow-hidden" },
                                h("img", { id: "newMethodLogoPreview", src: uploadedMethodLogoData || '', className: `w-full h-full object-contain p-1 ${uploadedMethodLogoData ? '' : 'hidden'}` }),
                                h("span", { id: "newMethodLogoPlaceholder", className: `text-[10px] font-bold text-slate-400 text-center leading-tight px-1 ${uploadedMethodLogoData ? 'hidden' : ''}` }, "Upload Logo"),
                                h("input", { type: "file", accept: "image/*", onChange: (e) => handleMethodLogoUpload(e.target), className: "hidden" })),
                            h("div", { className: "flex-1 space-y-2" },
                                h("input", { id: "newMethodName", type: "text", placeholder: "Method Name (e.g. eSewa, Khalti, UPI, PayPal)", className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" }),
                                h("input", { id: "newMethodLogoUrl", type: "text", placeholder: "Or paste Logo Image URL here...", onInput: (e) => previewMethodLogoUrl(e.target.value), className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" }))),
                        h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2" },
                            h("select", { id: "newMethodCountry", className: "px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold" },
                                h("option", { value: "All" }, "All Allowed Countries"),
                                draftSettings.countries.map((c) => (h("option", { value: c.name }, c.name)))),
                            h("input", { id: "newMethodPlaceholder", type: "text", placeholder: "Input Hint (e.g. Enter Wallet ID)", className: "px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" })),
                        h("button", { type: "button", onClick: () => addCustomMethod(), className: "w-full py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-lg transition" }, "+ Add & Save Method"))),
                h("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4" },
                    h("div", null,
                        h("div", { className: "flex items-center justify-between mb-2" },
                            h("span", { className: "text-xs font-extrabold uppercase text-slate-800" },
                                "3. Allowed Countries (",
                                draftSettings.countries.length,
                                ")"),
                            h("span", { className: "text-[11px] text-slate-500 font-semibold" }, "Live Country API")),
                        h("div", { className: "bg-white border border-slate-200 rounded-xl p-3 mb-3 min-h-[54px] flex flex-wrap items-center gap-2" }, draftSettings.countries.length ? (draftSettings.countries.map((c) => (h("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-[#16A34A] text-emerald-950 text-xs font-bold" },
                            c.flag ? h("img", { src: c.flag, className: "w-4 h-3 object-cover rounded-sm" }) : null,
                            h("span", null, c.name),
                            h("button", { type: "button", onClick: () => removeAllowedCountry(c.code), className: "ml-1 text-red-500 hover:text-red-700 font-extrabold" }, "\u2715"))))) : (h("span", { className: "text-xs text-slate-400" }, "No country restriction (or select allowed countries below)"))),
                        h("div", { className: "mb-2" },
                            h("input", { id: "countrySearchInput", type: "text", value: countryApiQuery, onInput: (e) => filterCountryApiSearch(e.target.value), placeholder: "Type country name to search (e.g. Nepal, India, Bangladesh, USA)...", className: "w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-semibold focus:outline-none focus:border-[#16A34A]" })),
                        h("div", { id: "countryApiResultsList", className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1" }, renderCountryApiListNodes(countryApiQuery))))))) : null,
        showWithdrawEditor ? (h("div", { className: "p-4 bg-white border border-slate-200 rounded-xl" },
            h("div", { className: "flex items-center justify-between mb-3" },
                h("h3", { className: "text-xs font-extrabold uppercase text-slate-700" }, editW ? `Edit Withdrawal ${editW.id}` : 'Create Manual Withdrawal'),
                h("button", { type: "button", onClick: () => closeWithdrawForm(), className: "text-xs font-bold text-slate-400 hover:text-slate-700" }, "\u2715 Close")),
            h("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs" },
                h("div", null,
                    h("label", { className: "block text-[11px] text-slate-500 font-semibold mb-1" }, "User ID"),
                    h("input", { id: "crudWUserId", type: "text", value: editW ? editW.userId : '', disabled: Boolean(editW), placeholder: "User ID", className: "w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg" })),
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
        h("div", { className: "bg-white border border-slate-200 rounded-xl p-5" },
            h("h2", { className: "text-base font-extrabold text-slate-900 mb-3" },
                "Pending Withdrawal Requests (",
                pending.length,
                ")"),
            h("div", { className: "overflow-x-auto" },
                h("table", { className: "w-full text-left border-collapse text-xs" },
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
        h("div", { className: "bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4" },
            h("div", { className: "flex flex-wrap items-center gap-6" },
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" }, "Total Tasks"),
                    h("div", { className: "text-base font-extrabold text-slate-900 mt-0.5" },
                        s.tasks.length,
                        " Tasks")),
                h("div", { className: "h-8 w-px bg-slate-200 hidden sm:block" }),
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" }, "Categories"),
                    h("div", { className: "flex flex-wrap items-center gap-1.5 mt-1 text-xs font-bold" },
                        h("span", { className: "px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200" },
                            "App Task: ",
                            appTasksCount),
                        h("span", { className: "px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200" },
                            "Play Game: ",
                            gameTasksCount),
                        h("span", { className: "px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200" },
                            "Telegram: ",
                            tgTasksCount),
                        h("span", { className: "px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200" },
                            "Social/Web: ",
                            socialTasksCount))),
                h("div", { className: "h-8 w-px bg-slate-200 hidden sm:block" }),
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" }, "Auto-Resetting"),
                    h("div", { className: "text-sm font-extrabold text-emerald-700 mt-0.5" },
                        repeatableCount,
                        " Repeatable")),
                h("div", { className: "h-8 w-px bg-slate-200 hidden sm:block" }),
                h("div", null,
                    h("div", { className: "text-[11px] font-bold uppercase text-slate-400" }, "Active Completions"),
                    h("div", { className: "text-sm font-extrabold text-slate-900 mt-0.5" },
                        totalActiveClaims,
                        " Claims"))),
            h("div", { className: "flex items-center gap-2" },
                h("button", { type: "button", onClick: () => resetAllTasksClaims(), className: "px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition" },
                    h("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.3", "stroke-linecap": "round", "stroke-linejoin": "round" },
                        h("polyline", { points: "23 4 23 10 17 10" }),
                        h("polyline", { points: "1 20 1 14 7 14" }),
                        h("path", { d: "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" })),
                    h("span", null, "Reset All Tasks Claims")))),
        h("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5" },
            h("div", { className: "bg-white border border-slate-200 rounded-xl p-5 h-fit" },
                h("div", { className: "flex items-center justify-between pb-3 mb-4 border-b border-slate-100" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" }, editTask ? `Edit Task` : 'Create New Task'),
                        h("p", { className: "text-[11px] text-slate-500" }, editTask ? `Editing ID: ${editTask.id}` : 'Add a one-time or repeatable task')),
                    h("button", { type: "button", onClick: () => clearTaskFormInputs(), className: "px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600" }, editTask ? 'Cancel Edit' : 'Reset Form')),
                h("div", { className: "space-y-3.5 text-xs" },
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Task Title"),
                        h("input", { id: "newTaskTitle", type: "text", value: editTask ? editTask.title : '', placeholder: "e.g. Join Official Telegram Channel", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-[#16A34A]" })),
                    h("div", { className: "grid grid-cols-2 gap-2.5" },
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Task Type"),
                            h("select", { id: "newTaskType", value: editTask?.type || 'app_task', className: "w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" },
                                h("option", { value: "app_task" }, "App Task"),
                                h("option", { value: "play_game" }, "Play Game"),
                                h("option", { value: "social_visit" }, "Social / Web Visit"),
                                h("option", { value: "telegram_join" }, "Telegram Join"))),
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Reset Frequency"),
                            h("select", { id: "newTaskResetHours", value: String(editTask?.resetHours || 0), className: "w-full px-2.5 py-2 bg-emerald-50/60 border border-emerald-200 text-emerald-950 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" },
                                h("option", { value: "0" }, "One-Time Only"),
                                h("option", { value: "24" }, "Daily (Every 24h)"),
                                h("option", { value: "12" }, "Every 12 Hours"),
                                h("option", { value: "6" }, "Every 6 Hours"),
                                h("option", { value: "1" }, "Every 1 Hour")))),
                    h("div", { className: "grid grid-cols-2 gap-2.5" },
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Reward (Coins)"),
                            h("input", { id: "newTaskReward", type: "number", value: editTask ? editTask.reward : 200, className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]" })),
                        h("div", null,
                            h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Verify Timer (Sec)"),
                            h("input", { id: "newTaskWait", type: "number", value: editTask ? editTask.waitSeconds || 15 : 15, className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]" }))),
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Task Destination URL"),
                        h("input", { id: "newTaskUrl", type: "text", value: editTask ? editTask.url : '', placeholder: "https://t.me/... or https://youtube.com/...", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("div", null,
                        h("label", { className: "block text-[11px] text-slate-600 font-bold mb-1" }, "Telegram @Channel (For Telegram Join)"),
                        h("input", { id: "newTaskTarget", type: "text", value: editTask ? editTask.target : '', placeholder: "@yourchannel (optional for web tasks)", className: "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]" })),
                    h("button", { type: "button", onClick: () => saveTaskCrud(), className: "w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold py-2.5 rounded-lg transition" }, editTask ? 'Save Task Changes' : '+ Create Task'))),
            h("div", { className: "lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5" },
                h("div", { className: "flex items-center justify-between pb-3 mb-3 border-b border-slate-100" },
                    h("div", null,
                        h("h2", { className: "text-sm font-extrabold text-slate-900" },
                            "Active Tasks (",
                            s.tasks.length,
                            ")"),
                        h("p", { className: "text-[11px] text-slate-500" }, "Click \"Reset\" on any task to clear user completions so everyone can do it again."))),
                h("div", { className: "overflow-x-auto" },
                    h("table", { className: "w-full text-left border-collapse text-xs" },
                        h("thead", null,
                            h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                                h("th", { className: "py-2.5 px-3" }, "Task Details"),
                                h("th", { className: "py-2.5 px-3" }, "Type & Timer"),
                                h("th", { className: "py-2.5 px-3" }, "Reset Mode"),
                                h("th", { className: "py-2.5 px-3" }, "Reward"),
                                h("th", { className: "py-2.5 px-3" }, "Done By"),
                                h("th", { className: "py-2.5 px-3 text-right" }, "Actions"))),
                        h("tbody", { className: "divide-y divide-slate-100" }, s.tasks.length ? (s.tasks.map((t) => {
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
function TransactionsTabView(props) {
    const { s } = props;
    const q = txSearchQuery.trim().toLowerCase();
    const list = s.recentWithdrawals.filter((w) => {
        if (txStatusFilter !== 'all' && w.status !== txStatusFilter)
            return false;
        if (!q)
            return true;
        return (w.id.toLowerCase().includes(q) ||
            (w.username || '').toLowerCase().includes(q) ||
            w.userId.toLowerCase().includes(q) ||
            w.account.toLowerCase().includes(q) ||
            w.method.toLowerCase().includes(q));
    });
    const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
    const methodOptions = draftSettings.methods.length
        ? draftSettings.methods.map((m) => m.name)
        : ['Custom'];
    return (h("div", { className: "bg-white border border-slate-200 rounded-xl p-5" },
        h("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
            h("h2", { className: "text-base font-extrabold text-slate-900" },
                "Transactions (",
                list.length,
                ")"),
            h("div", { className: "flex flex-wrap items-center gap-2" },
                ['all', 'pending', 'paid', 'rejected'].map((st) => (h("button", { type: "button", onClick: () => setTxFilter(st), className: `px-2.5 py-1 rounded-md text-xs font-bold uppercase ${txStatusFilter === st ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'}` }, st))),
                h("input", { type: "text", value: txSearchQuery, onInput: (e) => filterTxSearch(e.target.value), placeholder: "Search TX, user, account...", className: "px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg" }),
                h("button", { type: "button", onClick: () => openWithdrawForm(), className: "px-3 py-1.5 bg-[#16A34A] text-white text-xs font-bold rounded-lg" }, "+ Add TX"))),
        showWithdrawEditor ? (h("div", { className: "mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl" },
            h("div", { className: "flex items-center justify-between mb-3" },
                h("h3", { className: "text-xs font-extrabold uppercase text-slate-700" }, editW ? `Edit Transaction ${editW.id}` : 'Create Transaction'),
                h("button", { type: "button", onClick: () => closeWithdrawForm(), className: "text-xs font-bold text-slate-400 hover:text-slate-700" }, "\u2715 Close")),
            h("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs" },
                h("input", { id: "crudWUserId", type: "text", value: editW ? editW.userId : '', disabled: Boolean(editW), placeholder: "User ID", className: "px-3 py-1.5 bg-white border border-slate-200 rounded-lg" }),
                h("select", { id: "crudWMethod", value: editW?.method || methodOptions[0], className: "px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" }, methodOptions.map((m) => (h("option", { value: m, selected: editW?.method === m }, m)))),
                h("input", { id: "crudWAccount", type: "text", value: editW ? editW.account : '', placeholder: "Account ID", className: "px-3 py-1.5 bg-white border border-slate-200 rounded-lg" }),
                h("input", { id: "crudWCoins", type: "number", value: editW ? editW.coins : 10000, className: "px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" }),
                h("div", { className: "flex gap-2" },
                    h("select", { id: "crudWStatus", value: editW?.status || 'pending', className: "flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" },
                        h("option", { value: "pending" }, "pending"),
                        h("option", { value: "paid" }, "paid"),
                        h("option", { value: "rejected" }, "rejected")),
                    h("button", { type: "button", onClick: () => saveWithdrawCrud(), className: "px-4 py-1.5 bg-[#16A34A] text-white font-bold rounded-lg" }, "Save"))))) : null,
        h("div", { className: "overflow-x-auto" },
            h("table", { className: "w-full text-left border-collapse text-xs" },
                h("thead", null,
                    h("tr", { className: "border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]" },
                        h("th", { className: "py-2.5 px-3" }, "TX ID"),
                        h("th", { className: "py-2.5 px-3" }, "User"),
                        h("th", { className: "py-2.5 px-3" }, "Method / Account"),
                        h("th", { className: "py-2.5 px-3" }, "Amount"),
                        h("th", { className: "py-2.5 px-3" }, "Status"),
                        h("th", { className: "py-2.5 px-3 text-right" }, "CRUD Actions"))),
                h("tbody", { className: "divide-y divide-slate-100" }, list.length ? (list.map((w) => (h("tr", { className: "hover:bg-slate-50" },
                    h("td", { className: "py-3 px-3" },
                        h("div", { className: "font-bold text-slate-900" }, w.id),
                        h("div", { className: "text-[11px] text-slate-400" }, new Date(w.at).toLocaleString())),
                    h("td", { className: "py-3 px-3" },
                        "@",
                        w.username || w.userId,
                        " ",
                        h("span", { className: "text-slate-400" },
                            "(#",
                            w.userId,
                            ")")),
                    h("td", { className: "py-3 px-3" },
                        h("b", null, w.method),
                        ": ",
                        h("span", { className: "font-mono" }, w.account)),
                    h("td", { className: "py-3 px-3 font-extrabold text-slate-900" },
                        w.coins.toLocaleString(),
                        " (NPR ",
                        w.npr,
                        ")"),
                    h("td", { className: "py-3 px-3" },
                        h("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${w.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : w.status === 'rejected'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-amber-50 text-amber-700'}` }, w.status)),
                    h("td", { className: "py-3 px-3 text-right space-x-1.5 whitespace-nowrap" },
                        h("button", { type: "button", onClick: () => openWithdrawForm(w.id), className: "px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]" }, "Edit"),
                        h("button", { type: "button", onClick: () => deleteWithdrawCrud(w.id), className: "px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[11px]" }, "Delete")))))) : (h("tr", null,
                    h("td", { colSpan: "6", className: "py-8 text-center text-slate-400" }, "No transactions found"))))))));
}
function AdminApp() {
    return (h("div", { className: "w-screen h-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans" },
        h("div", { id: "adminToast", className: "hidden" }),
        h("header", { className: "w-full bg-white border-b border-slate-200 shrink-0 z-20" },
            h("div", { className: "w-full px-6 h-14 flex items-center justify-between" },
                h("div", { className: "flex items-center gap-3" },
                    h("div", { className: "w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-extrabold text-sm" }, "P"),
                    h("span", { className: "text-base font-extrabold tracking-tight text-slate-900" }, "Paiso Admin")),
                h("div", { className: "flex items-center gap-2.5" },
                    h("button", { type: "button", onClick: () => openAdminNotifModal('all'), className: "px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md flex items-center gap-1.5 transition" },
                        h("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
                            h("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
                        h("span", null, "Send Notification")),
                    h("button", { type: "button", onClick: () => refreshAdmin(), className: "px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-md transition" }, "Refresh"),
                    h("button", { type: "button", onClick: () => adminLogout(), className: "px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-md transition" }, "Logout"))),
            h("div", { className: "w-full px-6 flex items-center gap-8 overflow-x-auto border-t border-slate-100" },
                h("button", { type: "button", "data-admintab": "dashboard", onClick: () => switchAdminTab('dashboard'), className: "admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-[#16A34A] text-slate-900" }, "Dashboard"),
                h("button", { type: "button", "data-admintab": "users", onClick: () => switchAdminTab('users'), className: "admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900" }, "User Management"),
                h("button", { type: "button", "data-admintab": "withdrawal", onClick: () => switchAdminTab('withdrawal'), className: "admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900" }, "Withdrawal"),
                h("button", { type: "button", "data-admintab": "tasks", onClick: () => switchAdminTab('tasks'), className: "admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900" }, "Task Management"),
                h("button", { type: "button", "data-admintab": "transactions", onClick: () => switchAdminTab('transactions'), className: "admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900" }, "Transaction"))),
        h("div", { id: "adminLoginSection", className: "flex-1 flex items-center justify-center px-4 hidden" },
            h("div", { className: "w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm" },
                h("h2", { className: "text-lg font-extrabold text-slate-900 mb-1" }, "Admin Login"),
                h("p", { className: "text-xs text-slate-500 mb-4" }, "Enter your Admin ID to continue."),
                h("input", { id: "adminKeyInput", type: "password", defaultValue: adminKey, placeholder: "Admin ID", className: "w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A] mb-3" }),
                h("button", { type: "button", onClick: () => adminLogin(), className: "w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase py-2.5 rounded-lg transition" }, "Login"),
                h("div", { id: "adminLoginErr", className: "text-xs text-red-600 font-semibold mt-2" }))),
        h("main", { id: "adminMainWorkspace", className: "flex-1 w-full overflow-y-auto px-6 py-5" },
            h("div", { id: "adminTabView", className: "w-full h-full" })),
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
    document.querySelectorAll('.admin-tab-btn').forEach((btn) => {
        const isAct = btn.dataset.admintab === activeTab;
        btn.className = `admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 ${isAct ? 'border-[#16A34A] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`;
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
    else
        viewNode = h(TransactionsTabView, { s: data });
    container.replaceChildren(viewNode);
}
async function refreshAdmin() {
    try {
        if (!apiCountries.length) {
            loadCountriesFromApi();
        }
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
function switchAdminTab(tab) {
    activeTab = tab;
    renderActiveTab();
}
function toggleWithdrawSettingsModal(show) {
    showWithdrawSettings = typeof show === 'boolean' ? show : !showWithdrawSettings;
    if (showWithdrawSettings && !apiCountries.length) {
        loadCountriesFromApi().then(() => renderActiveTab());
    }
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
    const id = document.getElementById('crudUserId')?.value.trim() || '';
    const name = document.getElementById('crudUserName')?.value.trim() || 'User';
    const username = document.getElementById('crudUserHandle')?.value.trim() || '';
    const coins = +(document.getElementById('crudUserCoins')?.value || 0);
    const email = document.getElementById('crudUserEmail')?.value.trim() || '';
    const adsDone = +(document.getElementById('crudUserAds')?.value || 0);
    const dailyDone = +(document.getElementById('crudUserDaily')?.value || 0);
    const verified = Boolean(document.getElementById('crudUserVerified')?.checked);
    if (editingUserId) {
        await adminApi(`/api/admin/user/${editingUserId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, username, coins, email, adsDone, dailyDone, verified })
        });
        notify(`Updated user #${editingUserId}`);
    }
    else {
        if (!id) {
            notify('Enter a User ID', true);
            return;
        }
        await adminApi('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({ id, name, username, coins, email, verified })
        });
        notify(`Created user #${id}`);
    }
    showUserEditor = false;
    editingUserId = null;
    await refreshAdmin();
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
    editingWithdrawId = withdrawId || null;
    showWithdrawEditor = true;
    renderActiveTab();
}
function closeWithdrawForm() {
    editingWithdrawId = null;
    showWithdrawEditor = false;
    renderActiveTab();
}
async function saveWithdrawCrud() {
    const userId = document.getElementById('crudWUserId')?.value.trim() || '';
    const method = document.getElementById('crudWMethod')?.value || 'Custom';
    const account = document.getElementById('crudWAccount')?.value.trim() || '';
    const coins = +(document.getElementById('crudWCoins')?.value || 10000);
    const status = document.getElementById('crudWStatus')?.value || 'pending';
    if (editingWithdrawId) {
        await adminApi(`/api/admin/withdraw/${editingWithdrawId}`, {
            method: 'PUT',
            body: JSON.stringify({ method, account, coins, status })
        });
        notify(`Updated ${editingWithdrawId}`);
    }
    else {
        if (!userId || !account) {
            notify('Enter User ID and Account', true);
            return;
        }
        await adminApi('/api/admin/withdrawals', {
            method: 'POST',
            body: JSON.stringify({ userId, method, account, coins, status })
        });
        notify('Withdrawal created');
    }
    showWithdrawEditor = false;
    editingWithdrawId = null;
    await refreshAdmin();
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
