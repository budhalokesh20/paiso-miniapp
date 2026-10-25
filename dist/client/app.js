import { h } from './jsx';
import { SvgSpriteDefs } from './components/Icons';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { FriendsView } from './components/FriendsView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
function NotificationModal() {
    return (h("div", { id: "notifModal", className: "fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-[2px] hidden items-end sm:items-center justify-center p-0 sm:p-4", onClick: (e) => {
            if (e.target.id === 'notifModal')
                closeNotificationsModal();
        } },
        h("div", { className: "w-full max-w-[440px] max-h-[82vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100" },
            h("div", { className: "px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70" },
                h("div", { className: "flex items-center gap-2.5" },
                    h("div", { className: "w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs" },
                        h("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
                            h("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }))),
                    h("div", null,
                        h("h3", { className: "text-sm font-extrabold text-slate-900 leading-tight" }, "Notifications"),
                        h("p", { className: "text-[11px] text-slate-500 font-medium", id: "notifSubHeader" }, "Activity & Admin updates"))),
                h("div", { className: "flex items-center gap-1.5" },
                    h("button", { type: "button", onClick: () => clearAllNotifications(), className: "px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition" }, "Clear All"),
                    h("button", { type: "button", onClick: () => closeNotificationsModal(), className: "w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center transition" }, "\u2715"))),
            h("div", { id: "notifList", className: "flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#F8FAFC]" }))));
}
function PaisoApp() {
    return (h("div", { className: "app-shell" },
        h(SvgSpriteDefs, null),
        h("div", { className: "toast", id: "toast" }),
        h(NotificationModal, null),
        h("main", { className: "app-viewport" },
            h(HomeView, null),
            h(TasksView, null),
            h(FriendsView, null),
            h(SettingsView, null)),
        h(BottomNav, null)));
}
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
const initData = tg?.initData || '';
let state = null;
let currentTaskFilter = 'all';
let AdController = null;
let toastTimer;
let dailyCountdownTimer;
let lastTopNotifId = null;
const activeTimers = {};
const COIN_SVG = `<svg width="14" height="14" style="vertical-align:-2px"><use href="#icon-p-coin"/></svg>`;
const DUMMY_AVATARS = [
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av1)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#60A5FA"/><circle cx="32" cy="27" r="11" fill="#FDE68A"/><path d="M21 25c0-7 5-12 11-12s11 5 11 12v3H21v-3z" fill="#1E293B"/><path d="M18 27a14 14 0 0 1 28 0" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/><rect x="15" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><rect x="44" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><circle cx="28" cy="28" r="1.6" fill="#0F172A"/><circle cx="36" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2 1.8 5 1.8 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#6D28D9"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av2)"/><path d="M13 58c3-12 10-17 19-17s16 5 19 17" fill="#F43F5E"/><circle cx="32" cy="27" r="11" fill="#FED7AA"/><path d="M20 22c2-6 7-9 12-9s10 3 12 9c-4-2-8-2-12-2s-8 0-12 2z" fill="#311042"/><rect x="22" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><rect x="33" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><line x1="31" y1="26.5" x2="33" y2="26.5" stroke="#0F172A" stroke-width="2"/><path d="M29 33.5c2 1.4 4.5 1.4 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av3)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#064E3B"/><circle cx="32" cy="29" r="10.5" fill="#FDE68A"/><polygon points="21,20 25,12 32,17 39,12 43,20" fill="#FBBF24" stroke="#F59E0B" stroke-width="1"/><circle cx="28.5" cy="28.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28.5" r="1.6" fill="#0F172A"/><path d="M29 34c2 1.6 4.5 1.6 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#EA580C"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av4)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#1E293B"/><circle cx="32" cy="28" r="10.5" fill="#FFEDD5"/><path d="M21 23c0-6 5-10 11-10s11 4 11 10H21z" fill="#2563EB"/><rect x="19" y="21" width="28" height="3.5" rx="1.7" fill="#1D4ED8"/><circle cx="28.5" cy="28" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2.2 1.6 4.8 1.6 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#0E7490"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av5)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#0F172A"/><circle cx="32" cy="27" r="11" fill="#1E293B"/><rect x="22" y="23" width="20" height="7" rx="3.5" fill="#FDE68A"/><circle cx="28" cy="26.5" r="1.7" fill="#0F172A"/><circle cx="36" cy="26.5" r="1.7" fill="#0F172A"/><path d="M21 20h22" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EC4899"/><stop offset="100%" stop-color="#BE185D"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av6)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#FBCFE8"/><path d="M19 30c0-9 6-15 13-15s13 6 13 15c0 4-1 8-3 10H22c-2-2-3-6-3-10z" fill="#4C1D95"/><circle cx="32" cy="28" r="10" fill="#FDE68A"/><circle cx="28.5" cy="27.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="27.5" r="1.6" fill="#0F172A"/><path d="M29 32.5c2 1.6 4.5 1.6 6 0" fill="none" stroke="#E11D48" stroke-width="1.8" stroke-linecap="round"/></svg>`
];
let currentAvatarIndex = Math.floor(Math.random() * DUMMY_AVATARS.length);
function renderDummyAvatar(idx = currentAvatarIndex) {
    const box = $('settingsAvatarBox');
    if (box) {
        box.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
    }
}
function randomizeAvatar() {
    tg?.HapticFeedback?.impactOccurred?.('light');
    currentAvatarIndex = (currentAvatarIndex + 1 + Math.floor(Math.random() * (DUMMY_AVATARS.length - 1))) % DUMMY_AVATARS.length;
    renderDummyAvatar(currentAvatarIndex);
}
function TaskSvgIcon({ task }) {
    if (task.type === 'app_task') {
        return (h("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "#4F46E5", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" },
            h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }),
            h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }),
            h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" }),
            h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" })));
    }
    if (task.type === 'play_game') {
        return (h("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "#7C3AED", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" },
            h("line", { x1: "6", y1: "12", x2: "10", y2: "12" }),
            h("line", { x1: "8", y1: "10", x2: "8", y2: "14" }),
            h("line", { x1: "15", y1: "13", x2: "15.01", y2: "13" }),
            h("line", { x1: "18", y1: "11", x2: "18.01", y2: "11" }),
            h("rect", { x: "2", y: "6", width: "20", height: "12", rx: "4" })));
    }
    if (task.type === 'telegram_join') {
        return (h("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "#0284C7", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" },
            h("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
            h("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })));
    }
    if (task.url.includes('youtube.com') || task.url.includes('youtu.be')) {
        return (h("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "#DC2626", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" },
            h("rect", { x: "2", y: "4", width: "20", height: "16", rx: "4" }),
            h("polygon", { points: "10 9 15 12 10 15 10 9", fill: "#DC2626" })));
    }
    return (h("svg", { width: "21", height: "21", viewBox: "0 0 24 24", fill: "none", stroke: "#2563EB", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("circle", { cx: "12", cy: "12", r: "10" }),
        h("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
        h("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })));
}
function $(id) {
    return document.getElementById(id);
}
function setText(id, text) {
    const el = $(id);
    if (el)
        el.textContent = String(text);
}
function toast(msg, type = 'success') {
    const t = $('toast');
    if (!t)
        return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    if (toastTimer)
        window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        t.className = 'toast';
    }, 3200);
    tg?.HapticFeedback?.notificationOccurred(type);
}
async function api(path, opts = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-init-data': initData,
        ...(opts.headers || {})
    };
    const r = await fetch(path, { ...opts, headers });
    return r.json();
}
function showTab(name, taskFilter) {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const tabs = ['home', 'tasks', 'refer', 'wallet'];
    tabs.forEach((t) => {
        const sec = $(`tab-${t}`);
        if (sec) {
            sec.classList.toggle('active-screen', t === name);
        }
    });
    document.querySelectorAll('nav.bottom-nav button').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.tab === name);
    });
    if (name === 'tasks' && taskFilter) {
        setTaskFilter(taskFilter);
    }
    if (name === 'wallet') {
        closeSettingPage();
    }
}
function openSettingPage(subId) {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const page = $(subId);
    if (page) {
        page.classList.add('open');
    }
}
function closeSettingPage() {
    tg?.HapticFeedback?.impactOccurred?.('light');
    document.querySelectorAll('.settings-subpage').forEach((el) => {
        el.classList.remove('open');
    });
}
function copyUserId() {
    const uid = state?.user?.id || '';
    if (!uid)
        return;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(uid).then(() => toast(`User ID (${uid}) copied!`));
    }
    else {
        toast(`User ID: ${uid}`);
    }
}
function openSupport() {
    const supportUrl = 'https://t.me/onlineearnlokesh';
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(supportUrl);
    }
    else {
        window.open(supportUrl, '_blank');
    }
}
function filterExplore(query) {
    const term = (query || '').trim().toLowerCase();
    const clearBtn = $('searchClearBtn');
    if (clearBtn)
        clearBtn.style.display = term ? 'inline-flex' : 'none';
    document.querySelectorAll('#exploreGrid .explore-card').forEach((card) => {
        const titleData = (card.dataset.title || '').toLowerCase();
        card.style.display = !term || titleData.includes(term) ? 'flex' : 'none';
    });
}
function clearSearch() {
    const input = $('searchInput');
    if (input) {
        input.value = '';
        filterExplore('');
        input.focus();
    }
}
function setTaskFilter(filter) {
    currentTaskFilter = filter;
    document.querySelectorAll('.filter-chip').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}
function selectMethod(method) {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const select = $('wMethod');
    if (select)
        select.value = method;
    document.querySelectorAll('#wMethodsGrid button').forEach((btn) => {
        const isAct = btn.dataset.method === method;
        btn.className = `flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${isAct
            ? 'bg-blue-50/70 border-blue-600 text-slate-900'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`;
    });
    const acc = $('wAccount');
    const lbl = $('wAccountLabel');
    const customObj = state?.withdrawSettings?.methods?.find((m) => m.name === method);
    if (lbl)
        lbl.textContent = `${method} Account / ID`;
    if (acc)
        acc.placeholder = customObj?.placeholder || `Enter ${method} ID / Account`;
}
function renderWithdrawMethodsAndCountries() {
    const grid = $('wMethodsGrid');
    const cBar = $('wAllowedCountriesBar');
    const methods = (state?.withdrawSettings?.methods || []).filter((m) => m.enabled !== false);
    const countries = state?.withdrawSettings?.countries || [];
    if (cBar) {
        if (countries.length) {
            cBar.replaceChildren(h("div", { className: "flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100" },
                h("span", { className: "text-[11px] font-bold text-slate-400 mr-1" }, "Regions:"),
                countries.map((c) => (h("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold" },
                    c.flag ? h("img", { src: c.flag, alt: c.name, className: "w-3.5 h-2.5 object-cover rounded-xs" }) : null,
                    h("span", null, c.name))))));
        }
        else {
            cBar.replaceChildren();
        }
    }
    if (!grid)
        return;
    if (!methods.length) {
        grid.replaceChildren(h("div", { className: "col-span-full text-center text-xs text-slate-400 py-3" }, "No payout methods enabled"));
        return;
    }
    const currentVal = $('wMethod')?.value || '';
    const selectedName = methods.some((m) => m.name === currentVal) ? currentVal : methods[0].name;
    grid.replaceChildren(...methods.map((m) => {
        const isAct = m.name === selectedName;
        return (h("button", { type: "button", "data-method": m.name, onClick: () => selectMethod(m.name), className: `flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${isAct
                ? 'bg-blue-50/70 border-blue-600 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}` },
            m.logo ? (h("img", { src: m.logo, alt: m.name, className: "w-6 h-6 rounded object-contain shrink-0" })) : (h("div", { className: "w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0" }, m.name.slice(0, 1).toUpperCase())),
            h("span", { className: "text-xs font-bold truncate" }, m.name)));
    }));
    selectMethod(selectedName);
}
function updateWithdrawPreview() {
    const amtEl = $('wAmount');
    const previewEl = $('wReceivePreview');
    if (!amtEl || !previewEl)
        return;
    const coins = Math.max(0, Math.floor(+(amtEl.value || 0)));
    const rate = state?.coinPerNpr || 100;
    const npr = (coins / rate).toFixed(2);
    previewEl.textContent = `NPR ${npr}`;
}
function setWithdrawAmount(val) {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const amtEl = $('wAmount');
    if (!amtEl)
        return;
    const maxCoins = state?.user?.coins || 0;
    const target = val === 'MAX' ? maxCoins : val;
    amtEl.value = String(target);
    updateWithdrawPreview();
}
function formatDuration(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
function renderDailyCheckin() {
    if (!state)
        return;
    const streak = state.dailyStreak || 0;
    const canDaily = state.canDaily;
    const targetDay = canDaily ? (streak % 7) + 1 : streak || 1;
    const nextReward = targetDay === 7 ? state.dailyBonus * 2 : state.dailyBonus;
    setText('streakDayText', `Day ${targetDay}`);
    for (let d = 1; d <= 7; d++) {
        const box = $(`day-box-${d}`);
        if (!box)
            continue;
        box.classList.remove('ready-today', 'upcoming');
        const isClaimed = d <= streak;
        const isTodayTarget = canDaily && d === targetDay;
        if (isTodayTarget) {
            box.classList.add('ready-today');
        }
        else if (!isClaimed && d !== 7) {
            box.classList.add('upcoming');
        }
    }
    const btn = $('dailyBtn');
    const btnIcon = $('dailyBtnIcon');
    const btnText = $('dailyBtnText');
    const btnCoin = $('dailyBtnCoin');
    const subText = $('dailySubText');
    if (dailyCountdownTimer) {
        window.clearInterval(dailyCountdownTimer);
        dailyCountdownTimer = undefined;
    }
    if (canDaily) {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('claimed-state');
        }
        if (btnIcon)
            btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-gift"/></svg>`;
        if (btnText)
            btnText.textContent = `Claim Day ${targetDay} Bonus (+${nextReward})`;
        if (btnCoin)
            btnCoin.style.display = 'inline-block';
        if (subText)
            subText.textContent = `7 day streak! Keep it going!`;
    }
    else {
        if (btn) {
            btn.disabled = true;
            btn.classList.add('claimed-state');
        }
        if (btnIcon)
            btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-clock"/></svg>`;
        if (btnCoin)
            btnCoin.style.display = 'none';
        const updateTimer = () => {
            if (!state)
                return;
            const rem = (state.nextDailyAt || 0) - Date.now();
            if (rem <= 0) {
                if (dailyCountdownTimer)
                    window.clearInterval(dailyCountdownTimer);
                state.canDaily = true;
                renderDailyCheckin();
                return;
            }
            const formatted = formatDuration(rem);
            if (btnText)
                btnText.textContent = `Claimed • Next in ${formatted}`;
            if (subText)
                subText.textContent = `Next check-in unlocks in ${formatted}`;
        };
        updateTimer();
        dailyCountdownTimer = window.setInterval(updateTimer, 1000);
    }
}
function triggerClaimAnimation(claimedDay, reward) {
    tg?.HapticFeedback?.impactOccurred?.('heavy');
    const dayBox = $(`day-box-${claimedDay}`);
    if (dayBox) {
        dayBox.classList.remove('claimed-anim');
        void dayBox.offsetWidth;
        dayBox.classList.add('claimed-anim');
    }
    const fxLayer = $('claimFxLayer');
    if (!fxLayer)
        return;
    fxLayer.innerHTML = '';
    const starSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l2.6 6.8L21 12l-6.4 3.2L12 22l-2.6-6.8L3 12l6.4-3.2L12 2z"/></svg>`;
    const coinSvg = `<svg width="20" height="20"><use href="#icon-p-coin"/></svg>`;
    for (let i = 0; i < 14; i++) {
        const p = document.createElement('span');
        p.className = 'claim-particle';
        p.innerHTML = i % 2 === 0 ? coinSvg : starSvg;
        const startX = 25 + Math.random() * 50;
        const tx = (Math.random() - 0.5) * 190;
        const ty = -55 - Math.random() * 95;
        const rot = (Math.random() - 0.5) * 260;
        p.style.left = `${startX}%`;
        p.style.bottom = `28px`;
        p.style.setProperty('--tx', `${tx}px`);
        p.style.setProperty('--ty', `${ty}px`);
        p.style.setProperty('--rot', `${rot}deg`);
        fxLayer.appendChild(p);
    }
    const badge = document.createElement('div');
    badge.className = 'claim-float-badge';
    badge.innerHTML = `<svg width="16" height="16" style="vertical-align:-3px;margin-right:4px"><use href="#icon-check-circle"/></svg>Day ${claimedDay} Claimed! +${reward} ${COIN_SVG}`;
    fxLayer.appendChild(badge);
    window.setTimeout(() => {
        fxLayer.innerHTML = '';
    }, 1400);
}
function renderReferralsAndQualification() {
    if (!state)
        return;
    const q = state.qualification;
    if (q) {
        setText('wqAds', `${Math.min(q.adsDone, q.adsReq)}/${q.adsReq}`);
        setText('wqTasks', `${Math.min(q.tasksDone, q.tasksReq)}/${q.tasksReq}`);
        setText('wqDaily', `${Math.min(q.dailyDone, q.dailyReq)}/${q.dailyReq}`);
        $('wqPillAds')?.classList.toggle('done', q.adsDone >= q.adsReq);
        $('wqPillTasks')?.classList.toggle('done', q.tasksDone >= q.tasksReq);
        $('wqPillDaily')?.classList.toggle('done', q.dailyDone >= q.dailyReq);
        const badge = $('wqStatusBadge');
        if (badge) {
            badge.textContent = q.qualified ? 'Unlocked & Eligible' : 'In Progress';
            badge.className = `wq-badge ${q.qualified ? 'unlocked' : 'locked'}`;
        }
    }
    const hist = state.referralHistory || [];
    const refHistEl = $('refHistory');
    if (refHistEl) {
        if (!hist.length) {
            refHistEl.replaceChildren(h("div", { className: "empty-state" },
                h("div", { className: "empty-title" }, "No referrals yet"),
                h("div", { className: "small" }, "Share your invite link above to start earning!")));
        }
        else {
            refHistEl.replaceChildren(...hist.map((r) => {
                const uLabel = r.name + (r.username ? ` (@${r.username})` : '');
                const dateStr = r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : '';
                return (h("div", { className: "ref-hist-card" },
                    h("div", { className: "ref-hist-top" },
                        h("div", null,
                            h("div", { className: "ref-user-name" }, uLabel),
                            h("div", { className: "small" },
                                "Joined ",
                                dateStr)),
                        h("span", { className: `status-badge ${r.qualified ? 'status-paid' : 'status-pending'}` }, r.qualified ? `+${r.bonusCoins} CREDITED` : 'PENDING'))));
            }));
        }
    }
}
function getTaskIconBoxClass(task) {
    if (task.type === 'app_task')
        return 'bg-indigo-50 border-indigo-200/80 text-indigo-600';
    if (task.type === 'play_game')
        return 'bg-violet-50 border-violet-200/80 text-violet-600';
    if (task.type === 'telegram_join')
        return 'bg-sky-50 border-sky-200/80 text-sky-600';
    if (task.url.includes('youtube.com') || task.url.includes('youtu.be'))
        return 'bg-red-50 border-red-200/80 text-red-600';
    return 'bg-blue-50 border-blue-200/80 text-blue-600';
}
function renderTasks() {
    const listEl = $('taskList');
    if (!listEl || !state)
        return;
    const allTasks = state.tasks || [];
    const availableTasks = allTasks.filter((t) => !t.done);
    const completedCount = allTasks.filter((t) => Boolean(t.done)).length;
    const totalAvailableReward = availableTasks.reduce((sum, t) => sum + (t.reward || 0), 0);
    const availAppCount = availableTasks.filter((t) => t.type === 'app_task').length;
    const availGameCount = availableTasks.filter((t) => t.type === 'play_game').length;
    setText('tasksAvailableBadge', `${availableTasks.length} Left`);
    setText('tasksTotalRewardText', `+${totalAvailableReward.toLocaleString()}`);
    setText('tasksDoneCountText', `${completedCount}/${allTasks.length}`);
    setText('appTaskCountText', availAppCount > 0 ? `${availAppCount} Available` : 'Try apps & earn');
    setText('playGameCountText', availGameCount > 0 ? `${availGameCount} Available` : 'Play & win coins');
    const appQuickCard = $('quickCardAppTask');
    const gameQuickCard = $('quickCardPlayGame');
    if (appQuickCard) {
        appQuickCard.className = `flex items-center gap-3 p-3 rounded-2xl border text-left transition active:scale-[0.98] ${currentTaskFilter === 'app_task'
            ? 'bg-indigo-100/80 border-indigo-500 ring-2 ring-indigo-500/20'
            : 'bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border-indigo-200/80'}`;
    }
    if (gameQuickCard) {
        gameQuickCard.className = `flex items-center gap-3 p-3 rounded-2xl border text-left transition active:scale-[0.98] ${currentTaskFilter === 'play_game'
            ? 'bg-violet-100/80 border-violet-500 ring-2 ring-violet-500/20'
            : 'bg-gradient-to-br from-violet-50/90 to-purple-50/60 border-violet-200/80'}`;
    }
    const filtered = availableTasks.filter((t) => {
        if (currentTaskFilter === 'telegram_join')
            return t.type === 'telegram_join';
        if (currentTaskFilter === 'social_visit')
            return t.type === 'social_visit';
        if (currentTaskFilter === 'app_task')
            return t.type === 'app_task';
        if (currentTaskFilter === 'play_game')
            return t.type === 'play_game';
        return true;
    });
    if (!filtered.length) {
        listEl.replaceChildren(h("div", { className: "bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-2xs my-2" },
            h("div", { className: "w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3" },
                h("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.4" },
                    h("polyline", { points: "20 6 9 17 4 12" }))),
            h("div", { className: "text-sm font-extrabold text-slate-900" }, "All Tasks Completed!"),
            h("div", { className: "text-xs text-slate-500 mt-1 leading-relaxed" }, "You have completed all available tasks in this category. New or repeatable tasks will appear here when ready!")));
        return;
    }
    listEl.replaceChildren(...filtered.map((t) => {
        const waitRemaining = activeTimers[t.id] || 0;
        const iconBoxClass = getTaskIconBoxClass(t);
        const resetHours = +(t.resetHours || 0);
        const repeatLabel = resetHours === 24 ? 'Daily' : resetHours > 0 ? `${resetHours}h` : '';
        const categoryLabel = t.type === 'app_task'
            ? 'App Task'
            : t.type === 'play_game'
                ? 'Play Game'
                : t.type === 'telegram_join'
                    ? 'Telegram'
                    : 'Social';
        const timerHint = t.type === 'telegram_join'
            ? 'Join to verify'
            : t.type === 'play_game'
                ? `Play ${t.waitSeconds || 30}s`
                : `${t.waitSeconds || 15}s visit`;
        const openBtnLabel = t.type === 'play_game'
            ? 'Play'
            : t.type === 'app_task'
                ? 'Open App'
                : t.type === 'telegram_join'
                    ? 'Join'
                    : 'Open';
        return (h("div", { className: "bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3 transition" },
            h("div", { className: "flex items-center gap-3 min-w-0" },
                h("div", { className: `w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconBoxClass}` },
                    h(TaskSvgIcon, { task: t })),
                h("div", { className: "min-w-0" },
                    h("div", { className: "text-[13px] font-extrabold text-slate-900 truncate" }, t.title),
                    h("div", { className: "flex flex-wrap items-center gap-1.5 mt-1" },
                        h("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-extrabold" },
                            h("svg", { width: "12", height: "12" },
                                h("use", { href: "#icon-p-coin" })),
                            h("span", null,
                                "+",
                                t.reward)),
                        h("span", { className: "px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold" }, categoryLabel),
                        h("span", { className: "text-[10px] font-semibold text-slate-400" },
                            "\u2022 ",
                            timerHint),
                        repeatLabel ? (h("span", { className: "px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold uppercase" }, repeatLabel)) : null))),
            h("div", { className: "flex items-center gap-1.5 shrink-0" },
                h("button", { type: "button", className: "px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition", onClick: () => doTask(t.id, t.url) }, openBtnLabel),
                h("button", { type: "button", id: `verify-${t.id}`, disabled: waitRemaining > 0, onClick: () => claimTask(t.id), className: `px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition ${waitRemaining > 0
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-xs'}` }, waitRemaining > 0 ? `${waitRemaining}s` : 'Verify'))));
    }));
}
function formatTimeAgo(iso) {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 45)
        return 'Just now';
    if (diffSec < 3600)
        return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400)
        return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
}
function NotifTypeIcon({ type }) {
    if (type === 'task') {
        return (h("div", { className: "w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0" },
            h("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.3" },
                h("polyline", { points: "20 6 9 17 4 12" }))));
    }
    if (type === 'reward') {
        return (h("div", { className: "w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0" },
            h("svg", { width: "18", height: "18" },
                h("use", { href: "#icon-gift" }))));
    }
    if (type === 'withdraw') {
        return (h("div", { className: "w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0" },
            h("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2" },
                h("rect", { x: "2", y: "5", width: "20", height: "14", rx: "2" }),
                h("line", { x1: "2", y1: "10", x2: "22", y2: "10" }))));
    }
    if (type === 'admin') {
        return (h("div", { className: "w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0" },
            h("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2" },
                h("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
                h("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }))));
    }
    return (h("div", { className: "w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0" },
        h("svg", { width: "18", height: "18" },
            h("use", { href: "#icon-blue-tick" }))));
}
function renderNotifications() {
    const list = state?.notifications || [];
    const unread = state?.unreadCount || 0;
    const badge = $('notifUnreadBadge');
    if (badge) {
        if (unread > 0) {
            badge.style.display = 'flex';
            badge.textContent = unread > 9 ? '9+' : String(unread);
        }
        else {
            badge.style.display = 'none';
        }
    }
    const subHeader = $('notifSubHeader');
    if (subHeader) {
        subHeader.textContent = unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up';
    }
    if (list.length > 0) {
        const newest = list[0];
        if (lastTopNotifId !== null && newest.id !== lastTopNotifId && !newest.read) {
            toast(`${newest.title}: ${newest.message}`, 'success');
        }
        lastTopNotifId = newest.id;
    }
    else if (lastTopNotifId === null) {
        lastTopNotifId = '';
    }
    const listEl = $('notifList');
    if (!listEl)
        return;
    if (!list.length) {
        listEl.replaceChildren(h("div", { className: "py-12 text-center" },
            h("div", { className: "text-sm font-extrabold text-slate-700 mb-1" }, "No notifications yet"),
            h("div", { className: "text-xs text-slate-400" }, "Task verifications, rewards, and Admin messages will appear here.")));
        return;
    }
    listEl.replaceChildren(...list.map((n) => (h("div", { className: `p-3.5 rounded-2xl border transition flex items-start gap-3 ${n.read ? 'bg-white border-slate-100' : 'bg-blue-50/60 border-blue-200 shadow-2xs'}` },
        h(NotifTypeIcon, { type: n.type }),
        h("div", { className: "flex-1 min-w-0" },
            h("div", { className: "flex items-center justify-between gap-2" },
                h("span", { className: "text-xs font-extrabold text-slate-900 truncate" }, n.title),
                h("span", { className: "text-[10px] font-semibold text-slate-400 shrink-0" }, formatTimeAgo(n.createdAt))),
            h("p", { className: "text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed" }, n.message),
            h("div", { className: "flex items-center gap-2 mt-1.5" },
                n.coins ? (h("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold" },
                    h("svg", { width: "11", height: "11" },
                        h("use", { href: "#icon-p-coin" })),
                    h("span", null,
                        "+",
                        n.coins,
                        " Coins"))) : null,
                n.type === 'admin' ? (h("span", { className: "px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold" }, "Admin Broadcast")) : null)),
        !n.read ? h("span", { className: "w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" }) : null))));
}
function openNotificationsModal() {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const modal = $('notifModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    if ((state?.unreadCount || 0) > 0) {
        markAllNotificationsRead();
    }
}
function closeNotificationsModal() {
    const modal = $('notifModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
async function markAllNotificationsRead() {
    try {
        const r = await api('/api/notifications/read', { method: 'POST', body: '{}' });
        if (state && r.notifications) {
            state.notifications = r.notifications;
            state.unreadCount = r.unreadCount;
            renderNotifications();
        }
    }
    catch { }
}
async function clearAllNotifications() {
    try {
        const r = await api('/api/notifications', { method: 'DELETE' });
        if (state && r.notifications) {
            state.notifications = r.notifications;
            state.unreadCount = r.unreadCount;
            renderNotifications();
        }
        toast('Notifications cleared', 'success');
    }
    catch { }
}
function startTaskCountdown(taskId, seconds) {
    if (activeTimers[taskId])
        return;
    activeTimers[taskId] = seconds;
    renderTasks();
    const interval = window.setInterval(() => {
        activeTimers[taskId] -= 1;
        const btn = $(`verify-${taskId}`);
        if (activeTimers[taskId] <= 0) {
            delete activeTimers[taskId];
            window.clearInterval(interval);
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Verify';
            }
            renderTasks();
        }
        else if (btn) {
            btn.disabled = true;
            btn.textContent = `${activeTimers[taskId]}s`;
        }
    }, 1000);
}
async function load() {
    try {
        state = await api('/api/me');
    }
    catch {
        return;
    }
    if (!state || state.error) {
        if (state?.error)
            toast(state.error, 'error');
        return;
    }
    const u = state.user;
    const fullName = u.verification?.fullName || u.first_name || u.username || 'Paiso User';
    const displayName = fullName + (u.username ? ` (@${u.username})` : '');
    setText('uname', displayName);
    setText('settingsHeaderName', fullName);
    setText('settingsHeaderHandle', u.username ? `@${u.username}` : `ID: #${u.id}`);
    renderDummyAvatar();
    renderVerificationState(u);
    setText('userIdText', u.id);
    setText('uidFullText', `#${u.id}`);
    setText('coins', u.coins.toLocaleString());
    setText('wCoins', u.coins.toLocaleString());
    setText('headerCoins', u.coins.toLocaleString());
    setText('npr', (u.coins / state.coinPerNpr).toFixed(2));
    setText('total', u.totalEarned.toLocaleString());
    setText('dailyReward', `+${state.dailyBonus}`);
    renderDailyCheckin();
    if (state.ads) {
        setText('adReward', `+${state.ads.reward}`);
        setText('adCount', state.ads.watchedToday);
        setText('adCap', state.ads.dailyCap);
        const adSub = $('adCardSub');
        if (adSub) {
            adSub.textContent =
                state.ads.watchedToday > 0
                    ? `${state.ads.watchedToday}/${state.ads.dailyCap} watched`
                    : 'Earn coins';
        }
    }
    setText('refCount', u.referrals);
    const refInput = $('refLink');
    if (refInput)
        refInput.value = state.refLink;
    setText('minW', state.minWithdrawCoins.toLocaleString());
    renderReferralsAndQualification();
    renderWithdrawMethodsAndCountries();
    renderTasks();
    renderNotifications();
    try {
        const hData = await api('/api/my-withdrawals');
        const withdrawals = hData.withdrawals || [];
        const coinNotifs = (state.notifications || []).filter((n) => (n.coins || 0) > 0 && n.type !== 'withdraw');
        const renderWithdrawNodes = () => {
            if (!withdrawals.length) {
                return [
                    h("div", { className: "p-4 text-center text-xs text-slate-400" }, "No withdrawal transactions yet.")
                ];
            }
            return withdrawals.map((w) => (h("div", { className: "p-3.5 flex items-center justify-between gap-3" },
                h("div", null,
                    h("div", { className: "text-xs font-bold text-slate-900" },
                        w.method,
                        " ",
                        h("span", { className: "text-slate-400 font-medium" },
                            "\u2022 ",
                            w.account)),
                    h("div", { className: "text-[11px] text-slate-400 mt-0.5" },
                        w.id,
                        " \u2022 ",
                        new Date(w.at).toLocaleDateString())),
                h("div", { className: "text-right shrink-0" },
                    h("div", { className: "text-xs font-extrabold text-slate-900 flex items-center justify-end gap-1" },
                        h("span", null,
                            "-",
                            w.coins.toLocaleString()),
                        h("svg", { width: "13", height: "13", className: "inline-block" },
                            h("use", { href: "#icon-p-coin" }))),
                    h("span", { className: `status-badge status-${w.status}` }, w.status.toUpperCase())))));
        };
        const renderFullTxNodes = () => {
            const items = [...renderWithdrawNodes()];
            if (!withdrawals.length && coinNotifs.length) {
                items.length = 0;
            }
            coinNotifs.forEach((n) => {
                items.push(h("div", { className: "p-3.5 flex items-center justify-between gap-3" },
                    h("div", { className: "min-w-0" },
                        h("div", { className: "text-xs font-bold text-slate-900 truncate" }, n.title),
                        h("div", { className: "text-[11px] text-slate-400 mt-0.5" },
                            new Date(n.createdAt).toLocaleDateString(),
                            " \u2022 ",
                            n.type.toUpperCase())),
                    h("div", { className: "text-right shrink-0" },
                        h("div", { className: "text-xs font-extrabold text-emerald-600 flex items-center justify-end gap-1" },
                            h("span", null,
                                "+",
                                (n.coins || 0).toLocaleString()),
                            h("svg", { width: "13", height: "13", className: "inline-block" },
                                h("use", { href: "#icon-p-coin" }))),
                        h("span", { className: "status-badge status-paid" }, "CREDITED"))));
            });
            if (!items.length) {
                return [
                    h("div", { className: "p-4 text-center text-xs text-slate-400" }, "No transactions yet.")
                ];
            }
            return items;
        };
        const wHist = $('wHistory');
        if (wHist) {
            wHist.replaceChildren(...renderFullTxNodes());
        }
        const wPageHist = $('wWithdrawHistory');
        if (wPageHist) {
            wPageHist.replaceChildren(...renderWithdrawNodes());
        }
    }
    catch { }
}
function doTask(id, url) {
    if (tg?.openLink) {
        tg.openLink(url);
    }
    else {
        window.open(url, '_blank');
    }
    claimTask(id);
}
async function claimTask(id) {
    const r = await api('/api/task/claim', {
        method: 'POST',
        body: JSON.stringify({ taskId: id })
    });
    if (r.ok) {
        toast(`+${r.reward} coins credited!`, 'success');
        await load();
    }
    else if (r.started && r.waitSeconds) {
        toast(r.error || `Wait ${r.waitSeconds}s before verifying`, 'warning');
        startTaskCountdown(id, r.waitSeconds);
    }
    else {
        toast(r.error || 'Could not verify task', 'warning');
    }
}
async function watchAd() {
    if (!window.Adsgram || !state?.ads?.blockId) {
        toast('Ads ajhai ready chhaina', 'warning');
        return;
    }
    if (state.ads.watchedToday >= state.ads.dailyCap) {
        toast('Aaja ko ad limit sakiyo!', 'warning');
        return;
    }
    const before = state.ads.watchedToday || 0;
    try {
        if (!AdController) {
            AdController = window.Adsgram.init({ blockId: String(state.ads.blockId) });
        }
        const result = await AdController.show();
        if (result && result.done === false) {
            toast('Ad pura here matra coins milchha', 'warning');
            return;
        }
        toast('Ad sakiyo! Coins credit hudai chha…', 'success');
        for (let i = 0; i < 4; i++) {
            await new Promise((r) => window.setTimeout(r, 3000));
            await load();
            if ((state.ads?.watchedToday || 0) > before) {
                toast(`+${state.ads.reward} coins milyo!`, 'success');
                return;
            }
        }
        toast('Coins kei chhin ma balance ma aauchha', 'success');
    }
    catch {
        toast('Ahile ad uplabdha chhaina, pachhi try gara', 'warning');
    }
}
async function claimDaily() {
    const r = await api('/api/daily', {
        method: 'POST',
        body: '{}'
    });
    if (r.ok) {
        const claimedDay = r.dailyStreak || 1;
        const reward = r.reward || 100;
        triggerClaimAnimation(claimedDay, reward);
        toast(`Day ${claimedDay} Check-in: +${reward} coins milyo!`, 'success');
    }
    else {
        toast(r.error || 'Aaja ko bonus liyi sakyo', 'warning');
    }
    await load();
}
function copyRef() {
    const input = $('refLink');
    if (!input)
        return;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(input.value).then(() => toast('Referral link copy bhayo!'));
    }
    else {
        input.select();
        document.execCommand('copy');
        toast('Referral link copy bhayo!');
    }
}
function shareRef() {
    const input = $('refLink');
    const link = input ? input.value : '';
    const shareUrl = 'https://t.me/share/url?url=' +
        encodeURIComponent(link) +
        '&text=' +
        encodeURIComponent('Paiso app bata simple tasks garera real rewards kamaau!');
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
    }
    else {
        window.open(shareUrl, '_blank');
    }
}
function renderVerificationState(u) {
    const isVerified = Boolean(u.verified && u.verification?.verified);
    const tickEl = $('settingsVerifiedTick');
    if (tickEl) {
        tickEl.style.display = isVerified ? 'inline-flex' : 'none';
    }
    const menuBadge = $('verifyMenuBadge');
    const menuSub = $('verifyMenuSub');
    if (menuBadge) {
        menuBadge.textContent = isVerified ? 'Verified' : 'Unverified';
        menuBadge.className = `verify-status-pill ${isVerified ? 'verified' : 'unverified'}`;
    }
    if (menuSub) {
        menuSub.textContent = isVerified
            ? `${u.verification?.email || 'Verified'} • Blue Tick Active`
            : 'Verify your details for Blue Tick';
    }
    const doneCard = $('verifyDoneCard');
    const formCard = $('verifyFormCard');
    if (doneCard && formCard) {
        doneCard.style.display = isVerified ? 'block' : 'none';
        formCard.style.display = isVerified ? 'none' : 'block';
    }
    if (isVerified && u.verification) {
        setText('verifiedNameText', u.verification.fullName);
        setText('verifiedEmailText', u.verification.email || 'Not provided');
        setText('verifiedDobText', u.verification.dob);
        setText('verifiedGenderText', u.verification.gender);
    }
    else {
        const nameInput = $('vFullName');
        if (nameInput && !nameInput.value && u.first_name && u.first_name !== 'Dev User') {
            nameInput.value = u.first_name;
        }
    }
}
function selectGender(gender) {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const input = $('vGender');
    if (input)
        input.value = gender;
    $('genderMaleBtn')?.classList.toggle('active', gender === 'Male');
    $('genderFemaleBtn')?.classList.toggle('active', gender === 'Female');
}
async function sendVerifyOtp() {
    const fullName = $('vFullName')?.value.trim() || '';
    const email = $('vEmail')?.value.trim() || '';
    const dob = $('vDob')?.value.trim() || '';
    const gender = ($('vGender')?.value || 'Male');
    if (fullName.length < 2) {
        toast('Full Name halnuहोस्', 'warning');
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast('Valid Email Address halnuहोस्', 'warning');
        return;
    }
    if (!dob) {
        toast('Date of Birth छान्नुहोस्', 'warning');
        return;
    }
    const btn = $('sendOtpBtn');
    if (btn)
        btn.disabled = true;
    setText('sendOtpBtnText', 'Sending OTP...');
    try {
        const r = await api('/api/verify/send-otp', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, dob, gender })
        });
        if (!r.ok) {
            toast(r.error || 'Failed to send OTP', 'error');
            return;
        }
        setText('otpTargetEmail', 'your Telegram chat');
        const otpBox = $('verifyOtpBox');
        if (otpBox)
            otpBox.style.display = 'block';
        await load();
        toast(r.message || 'Verification OTP sent to your Telegram chat!', 'success');
    }
    finally {
        if (btn)
            btn.disabled = false;
        setText('sendOtpBtnText', 'Resend OTP to Telegram');
    }
}
async function confirmVerifyOtp() {
    const otp = $('vOtpInput')?.value.trim() || '';
    if (otp.length !== 6) {
        toast('6-digit OTP code halnuहोस्', 'warning');
        return;
    }
    const btn = $('confirmOtpBtn');
    if (btn)
        btn.disabled = true;
    try {
        const r = await api('/api/verify/confirm-otp', {
            method: 'POST',
            body: JSON.stringify({ otp })
        });
        if (!r.ok) {
            toast(r.error || 'Invalid OTP code', 'error');
            return;
        }
        toast('Profile Verified! Blue Tick activated!', 'success');
        await load();
    }
    finally {
        if (btn)
            btn.disabled = false;
    }
}
async function withdraw() {
    const methodEl = $('wMethod');
    const accEl = $('wAccount');
    const amtEl = $('wAmount');
    if (!methodEl || !accEl || !amtEl)
        return;
    const r = await api('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify({
            method: methodEl.value,
            account: accEl.value.trim(),
            amountCoins: amtEl.value
        })
    });
    if (r.ok) {
        toast('Withdraw request gayo! Admin le 1-2 din ma approve garcha', 'success');
        accEl.value = '';
        amtEl.value = '';
    }
    else {
        toast(r.error || 'Withdraw request failed', 'error');
    }
    await load();
}
window.showTab = showTab;
window.filterExplore = filterExplore;
window.clearSearch = clearSearch;
window.setTaskFilter = setTaskFilter;
window.selectMethod = selectMethod;
window.setWithdrawAmount = setWithdrawAmount;
window.updateWithdrawPreview = updateWithdrawPreview;
window.openSettingPage = openSettingPage;
window.closeSettingPage = closeSettingPage;
window.copyUserId = copyUserId;
window.openSupport = openSupport;
window.randomizeAvatar = randomizeAvatar;
window.selectGender = selectGender;
window.sendVerifyOtp = sendVerifyOtp;
window.confirmVerifyOtp = confirmVerifyOtp;
window.doTask = doTask;
window.claimTask = claimTask;
window.watchAd = watchAd;
window.claimDaily = claimDaily;
window.copyRef = copyRef;
window.shareRef = shareRef;
window.withdraw = withdraw;
window.openNotificationsModal = openNotificationsModal;
window.closeNotificationsModal = closeNotificationsModal;
window.markAllNotificationsRead = markAllNotificationsRead;
window.clearAllNotifications = clearAllNotifications;
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = '';
        root.appendChild(h(PaisoApp, null));
    }
    renderDummyAvatar();
    load();
    window.setInterval(() => {
        load();
    }, 8000);
});
