(function() {
"use strict";

// --- src/client/jsx.tsx ---
const SVG_TAGS = new Set([
    'svg',
    'defs',
    'linearGradient',
    'stop',
    'symbol',
    'use',
    'path',
    'circle',
    'rect',
    'line',
    'polyline',
    'polygon',
    'g'
]);
function Fragment(props) {
    const frag = document.createDocumentFragment();
    appendChildren(frag, props.children || []);
    return frag;
}
function appendChildren(parent, children) {
    for (const child of children) {
        if (Array.isArray(child)) {
            appendChildren(parent, child);
        }
        else if (child instanceof Node) {
            parent.appendChild(child);
        }
        else if (child !== null && child !== undefined && child !== false && child !== true) {
            parent.appendChild(document.createTextNode(String(child)));
        }
    }
}
function h(tag, props, ...children) {
    if (typeof tag === 'function') {
        return tag({ ...(props || {}), children });
    }
    const isSvg = SVG_TAGS.has(tag);
    const el = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);
    if (props) {
        for (const [k, v] of Object.entries(props)) {
            if (v === undefined || v === null || v === false)
                continue;
            if (k === 'className' || k === 'class') {
                if (isSvg)
                    el.setAttribute('class', String(v));
                else
                    el.className = String(v);
            }
            else if (k === 'style' && typeof v === 'object') {
                Object.assign(el.style, v);
            }
            else if (k.startsWith('on') && typeof v === 'function') {
                const evt = k.slice(2).toLowerCase();
                el.addEventListener(evt, v);
            }
            else if (k === 'checked' && 'checked' in el) {
                el.checked = Boolean(v);
            }
            else if (k === 'selected' && 'selected' in el) {
                el.selected = Boolean(v);
            }
            else if (k === 'disabled' || k === 'readOnly' || k === 'readonly') {
                if (v)
                    el.setAttribute(k.toLowerCase(), '');
            }
            else if ((k === 'value' || k === 'defaultValue') && !isSvg && 'value' in el && tag !== 'select') {
                el.value = String(v);
            }
            else {
                el.setAttribute(k, String(v));
            }
        }
    }
    appendChildren(el, children);
    if (tag === 'select' && props && (props.value !== undefined || props.defaultValue !== undefined)) {
        el.value = String(props.value ?? props.defaultValue);
    }
    return el;
}

// --- src/client/components/Icons.tsx ---
function SvgSpriteDefs() {
    return (h("svg", { style: "display:none", "aria-hidden": "true" },
        h("defs", null,
            h("linearGradient", { id: "pCoinGrad", x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
                h("stop", { offset: "0%", "stop-color": "#FFE066" }),
                h("stop", { offset: "50%", "stop-color": "#F59E0B" }),
                h("stop", { offset: "100%", "stop-color": "#D97706" })),
            h("symbol", { id: "icon-p-coin", viewBox: "0 0 24 24" },
                h("circle", { cx: "12", cy: "12", r: "10.5", fill: "url(#pCoinGrad)", stroke: "#B45309", "stroke-width": "1" }),
                h("circle", { cx: "12", cy: "12", r: "8", fill: "none", stroke: "#FEF08A", "stroke-width": "1", opacity: "0.65" }),
                h("path", { d: "M9.5 16.5V7.5h3.3c1.9 0 3.1 1 3.1 2.7 0 1.7-1.2 2.8-3.1 2.8h-1.3v3.5H9.5zm2-5.1h1.1c.8 0 1.3-.4 1.3-1.2 0-.7-.5-1.1-1.3-1.1h-1.1v2.3z", fill: "#78350F" })),
            h("symbol", { id: "icon-gift", viewBox: "0 0 24 24" },
                h("path", { d: "M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                h("rect", { x: "2", y: "7", width: "20", height: "5", rx: "1", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                h("line", { x1: "12", y1: "22", x2: "12", y2: "7", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" }),
                h("path", { d: "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                h("path", { d: "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })),
            h("symbol", { id: "icon-clock", viewBox: "0 0 24 24" },
                h("circle", { cx: "12", cy: "12", r: "9", fill: "none", stroke: "currentColor", "stroke-width": "2" }),
                h("polyline", { points: "12 7 12 12 15.5 14", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })),
            h("symbol", { id: "icon-check-circle", viewBox: "0 0 24 24" },
                h("circle", { cx: "12", cy: "12", r: "9.5", fill: "none", stroke: "currentColor", "stroke-width": "2" }),
                h("polyline", { points: "16.5 9.5 10.8 15 7.5 11.8", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })),
            h("symbol", { id: "icon-blue-tick", viewBox: "0 0 24 24" },
                h("path", { d: "M12 1.8l2.45 1.85 3.05-.35.95 2.9 2.9.95-.35 3.05L22.85 12l-1.85 2.45.35 3.05-2.9.95-.95 2.9-3.05-.35L12 22.85l-2.45-1.85-3.05.35-.95-2.9-2.9-.95.35-3.05L1.15 12 3 9.55 2.65 6.5l2.9-.95.95-2.9 3.05.35L12 1.8z", fill: "#1D9BF0" }),
                h("polyline", { points: "16.2 9.2 10.8 14.6 7.8 11.6", fill: "none", stroke: "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })))));
}

// --- src/client/components/HomeView.tsx ---

function DayCheckBox(props) {
    return (h("div", { className: "day-box", id: `day-box-${props.day}`, "data-day": props.day },
        h("div", { className: "day-check" },
            h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
                h("polyline", { points: "20 6 9 17 4 12" }))),
        h("div", { className: "day-num" }, props.day),
        h("div", { className: "day-label" }, "Day")));
}
function HomeView() {
    return (h("section", { id: "tab-home", className: "app-screen active-screen" },
        h("div", { className: "screen-content" },
            h("header", { className: "app-header" },
                h("div", { className: "brand-wrap" },
                    h("img", { src: "/assets/logo.png", alt: "Paiso Logo", className: "brand-logo" }),
                    h("div", { className: "brand-text" },
                        h("h1", null, "Paiso"),
                        h("p", null,
                            "Small Tasks ",
                            h("span", { className: "dot" }, "\u2022"),
                            " Real Rewards"))),
                h("div", { className: "header-actions" },
                    h("button", { className: "bell-btn relative", onClick: () => window.openNotificationsModal(), "aria-label": "Notifications" },
                        h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }),
                            h("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
                        h("span", { id: "notifUnreadBadge", style: "display:none", className: "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm" }, "0")))),
            h("div", { className: "hero-banner" },
                h("div", { className: "hero-content" },
                    h("div", { className: "hero-tag" }, "EARN \u2022 PLAY \u2022 REDEEM"),
                    h("div", { className: "hero-title" },
                        "Complete Tasks",
                        h("br", null),
                        h("span", { className: "cyan" }, "Get Real"),
                        " ",
                        h("span", { className: "pink" }, "Rewards")),
                    h("div", { className: "hero-sub" }, "Simple tasks, big rewards!"),
                    h("button", { className: "hero-cta", onClick: () => window.showTab('tasks'), "aria-label": "Complete Tasks" },
                        h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
                            h("polyline", { points: "12 5 19 12 12 19" })))),
                h("img", { src: "/assets/hero-gift.png", alt: "Rewards Gift", className: "hero-art" })),
            h("div", { className: "search-box" },
                h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                    h("circle", { cx: "11", cy: "11", r: "8" }),
                    h("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })),
                h("input", { type: "text", id: "searchInput", placeholder: "Search tasks, games...", onInput: (e) => window.filterExplore(e.target.value) }),
                h("button", { type: "button", className: "search-clear", id: "searchClearBtn", onClick: () => window.clearSearch() },
                    h("svg", { viewBox: "0 0 24 24", width: "12", height: "12", fill: "none", stroke: "currentColor", "stroke-width": "2.5" },
                        h("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                        h("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))),
            h("div", { className: "daily-card", id: "dailyCard" },
                h("div", { className: "daily-top" },
                    h("div", { className: "daily-left" },
                        h("img", { src: "/assets/calendar.png", alt: "Calendar", className: "daily-cal-icon" }),
                        h("div", { style: { minWidth: '0' } },
                            h("div", { className: "daily-title" }, "Daily Check-in"),
                            h("div", { className: "daily-sub", id: "dailySubText" }, "7 day streak! Keep it going!"))),
                    h("div", { className: "streak-pill" },
                        h("img", { src: "/assets/flame.png", alt: "Streak", className: "streak-flame-icon" }),
                        h("span", { id: "streakDayText" }, "Day 1"))),
                h("div", { className: "days-grid", id: "daysGrid" },
                    h(DayCheckBox, { day: 1 }),
                    h(DayCheckBox, { day: 2 }),
                    h(DayCheckBox, { day: 3 }),
                    h(DayCheckBox, { day: 4 }),
                    h(DayCheckBox, { day: 5 }),
                    h(DayCheckBox, { day: 6 }),
                    h("div", { className: "day-box day-7", id: "day-box-7", "data-day": "7" },
                        h("img", { src: "/assets/gift-day7.png", alt: "Day 7 Gift", className: "day-gift" }),
                        h("div", { className: "day-num" }, "7"),
                        h("div", { className: "day-label" }, "Day"))),
                h("div", { className: "daily-claim-wrap" },
                    h("button", { type: "button", className: "daily-claim-btn", id: "dailyBtn", onClick: () => window.claimDaily() },
                        h("span", { className: "claim-btn-icon", id: "dailyBtnIcon" },
                            h("svg", { width: "16", height: "16" },
                                h("use", { href: "#icon-gift" }))),
                        h("span", { id: "dailyBtnText" }, "Claim Day 1 Bonus (+100)"),
                        h("svg", { className: "inline-coin", id: "dailyBtnCoin", width: "15", height: "15" },
                            h("use", { href: "#icon-p-coin" })))),
                h("div", { className: "claim-fx-layer", id: "claimFxLayer" })),
            h("div", { className: "section-head" },
                h("h2", null, "Explore & Earn"),
                h("button", { className: "view-all-btn", onClick: () => window.showTab('tasks', 'all') },
                    "View All",
                    h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" },
                        h("polyline", { points: "9 18 15 12 9 6" })))),
            h("div", { className: "explore-grid", id: "exploreGrid" },
                h("div", { className: "explore-card card-ads", "data-title": "watch ads earn coins video", id: "adBtn", onClick: () => window.watchAd() },
                    h("div", { className: "explore-icon-wrap" },
                        h("img", { src: "/assets/icon-ads.png", alt: "Watch Ads", className: "explore-icon" })),
                    h("div", { className: "explore-info" },
                        h("div", { className: "explore-title" }, "Watch Ads"),
                        h("div", { className: "explore-sub", id: "adCardSub" }, "Earn coins"))),
                h("div", { className: "explore-card card-tasks", "data-title": "complete tasks easy fast", onClick: () => window.showTab('tasks', 'all') },
                    h("div", { className: "explore-icon-wrap" },
                        h("img", { src: "/assets/icon-tasks.png", alt: "Complete Tasks", className: "explore-icon" })),
                    h("div", { className: "explore-info" },
                        h("div", { className: "explore-title" }, "Complete Tasks"),
                        h("div", { className: "explore-sub" }, "Easy & Fast"))),
                h("div", { className: "explore-card card-games", "data-title": "play and earn games more fun coins", onClick: () => window.showTab('tasks', 'play_game') },
                    h("div", { className: "explore-icon-wrap" },
                        h("img", { src: "/assets/icon-games.png", alt: "Play & Earn", className: "explore-icon" })),
                    h("div", { className: "explore-info" },
                        h("div", { className: "explore-title" }, "Play & Earn"),
                        h("div", { className: "explore-sub" }, "More Fun, Coins")))),
            h("div", { style: { display: 'none' } },
                h("span", { id: "adReward" }),
                h("span", { id: "adCount" }, "0"),
                h("span", { id: "adCap" }, "10"),
                h("span", { id: "dailyReward" })))));
}

// --- src/client/components/TasksView.tsx ---
function TasksView() {
    return (h("section", { id: "tab-tasks", className: "app-screen" },
        h("div", { className: "native-topbar" },
            h("h2", { className: "page-title" }, "Earn Tasks"),
            h("div", { className: "coin-pill" },
                h("svg", { width: "16", height: "16" },
                    h("use", { href: "#icon-p-coin" })),
                h("span", { id: "headerCoins" }, "0"))),
        h("div", { className: "screen-content space-y-3.5" },
            h("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar" },
                h("button", { className: "filter-chip active", "data-filter": "all", onClick: () => window.setTaskFilter('all') }, "All Tasks"),
                h("button", { className: "filter-chip", "data-filter": "app_task", onClick: () => window.setTaskFilter('app_task') }, "App Task"),
                h("button", { className: "filter-chip", "data-filter": "play_game", onClick: () => window.setTaskFilter('play_game') }, "Play Game"),
                h("button", { className: "filter-chip", "data-filter": "telegram_join", onClick: () => window.setTaskFilter('telegram_join') }, "Telegram"),
                h("button", { className: "filter-chip", "data-filter": "social_visit", onClick: () => window.setTaskFilter('social_visit') }, "Social & Web")),
            h("div", { id: "taskList", className: "space-y-2.5 pb-4" }))));
}

// --- src/client/components/FriendsView.tsx ---
function FriendsView() {
    return (h("section", { id: "tab-refer", className: "app-screen" },
        h("div", { className: "native-topbar" },
            h("h2", { className: "page-title flex items-center gap-2" },
                h("svg", { className: "title-icon w-5 h-5 shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                    h("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
                    h("circle", { cx: "9", cy: "7", r: "4" }),
                    h("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
                    h("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })),
                h("span", null, "Invite Friends"))),
        h("div", { className: "screen-content" },
            h("div", { className: "refer-hero flex items-center gap-3.5" },
                h("img", { src: "/assets/icon-friends.png", alt: "Invite Friends", className: "w-14 h-14 object-contain shrink-0" }),
                h("div", { className: "min-w-0" },
                    h("h3", { className: "flex items-center gap-1.5 flex-wrap" },
                        h("span", null, "Earn +500"),
                        h("svg", { width: "18", height: "18", className: "inline-block shrink-0" },
                            h("use", { href: "#icon-p-coin" })),
                        h("span", null, "/ Friend")),
                    h("p", null,
                        "Plus ",
                        h("b", null, "10% lifetime bonus"),
                        " on all tasks your friends complete!"))),
            h("div", { className: "stats-grid-2" },
                h("div", { className: "stat-box" },
                    h("div", { className: "num", id: "refCount" }, "0"),
                    h("div", { className: "lbl" }, "Friends Invited")),
                h("div", { className: "stat-box" },
                    h("div", { className: "num" }, "10%"),
                    h("div", { className: "lbl" }, "Lifetime Bonus"))),
            h("div", { className: "card" },
                h("b", { style: { display: 'block', fontSize: '14px' } }, "Your Referral Link"),
                h("input", { className: "form-input", id: "refLink", readOnly: true }),
                h("button", { className: "primary-btn btn-with-icon", onClick: () => window.copyRef() },
                    h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                        h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
                        h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })),
                    h("span", null, "Copy Invite Link")),
                h("button", { className: "ghost-btn btn-with-icon", style: { marginTop: '8px' }, onClick: () => window.shareRef() },
                    h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                        h("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
                        h("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })),
                    h("span", null, "Share on Telegram"))),
            h("div", { className: "section-subtitle" }, "Referral History"),
            h("div", { id: "refHistory" }))));
}

// --- src/client/components/SettingsView.tsx ---

const FAQ_STEPS = [
    {
        step: '1',
        title: 'Daily Check-in & Ads',
        desc: 'Claim your daily check-in every 24 hours and watch rewarded ads from the Home screen.'
    },
    {
        step: '2',
        title: 'Complete Tasks',
        desc: 'Open tasks, join the channel or stay for the required seconds, then tap Verify to receive coins.'
    },
    {
        step: '3',
        title: 'Unlock Eligibility',
        desc: 'Complete 3 Ads, 2 Tasks, and 2 Daily Check-ins to unlock withdrawals and referral bonuses.'
    },
    {
        step: '4',
        title: 'Withdraw Earnings',
        desc: 'Go to Settings → Withdrawal, select your payment method, enter your account ID, and submit.'
    }
];
const FAQ_LIST = [
    {
        q: 'How are coins converted to cash?',
        a: '100 Coins = NPR 1. The default minimum withdrawal is 10,000 Coins (NPR 100).'
    },
    {
        q: 'Why do completed tasks disappear?',
        a: 'Once a task is verified, it clears from your active list. Daily or resettable tasks appear again automatically when ready.'
    },
    {
        q: 'How does the referral reward work?',
        a: 'You receive +500 Coins when your invited friend completes 3 Ads, 2 Tasks, and 2 Check-ins, plus 10% of their task earnings.'
    },
    {
        q: 'How long do withdrawals take?',
        a: 'Withdrawals are reviewed within 24–48 hours. If rejected due to invalid details, your coins are refunded automatically.'
    }
];
const TERMS_SECTIONS = [
    {
        title: '1. One Account Per User',
        body: 'Each user may only use one Telegram account. Multiple accounts, bots, or self-referrals are not allowed.'
    },
    {
        title: '2. Task & Channel Rules',
        body: 'Rewards require genuine task completion. Leaving joined channels immediately after claiming may result in coin deduction.'
    },
    {
        title: '3. Referral Qualification',
        body: 'Referral bonuses apply only to active users who complete the required ads, tasks, and check-ins.'
    },
    {
        title: '4. Withdrawals & Account Accuracy',
        body: 'Payouts are processed via active methods for allowed countries. Please verify your wallet/account ID before submitting.'
    },
    {
        title: '5. Verification & Privacy',
        body: 'Details provided for profile verification are used only for account security and verification badge status.'
    },
    {
        title: '6. Fair Use Policy',
        body: 'Accounts abusing system bugs or automated tools may have withdrawals declined or access restricted.'
    }
];
function WithdrawSection() {
    return (h("div", { className: "bg-white border border-slate-200 rounded-xl p-4 space-y-4" },
        h("div", { className: "flex items-center justify-between pb-3 border-b border-slate-100" },
            h("div", null,
                h("span", { className: "text-[11px] font-semibold text-slate-400 block" }, "Balance"),
                h("div", { className: "flex items-center gap-1.5 mt-0.5" },
                    h("svg", { width: "18", height: "18", className: "shrink-0" },
                        h("use", { href: "#icon-p-coin" })),
                    h("span", { className: "text-lg font-extrabold text-slate-900", id: "wCoins" }, "0"),
                    h("span", { className: "text-xs font-bold text-slate-500" },
                        "(NPR ",
                        h("span", { id: "npr" }, "0.00"),
                        ")"))),
            h("div", { className: "text-right" },
                h("span", { className: "text-[11px] font-semibold text-slate-400 block" }, "Minimum"),
                h("b", { className: "text-xs font-extrabold text-slate-800" },
                    h("span", { id: "minW" }, "10,000"),
                    " Coins"))),
        h("div", null,
            h("div", { className: "text-xs font-bold text-slate-700 mb-2" }, "Method"),
            h("div", { className: "grid grid-cols-2 gap-2", id: "wMethodsGrid" }),
            h("input", { type: "hidden", id: "wMethod", value: "" })),
        h("div", null,
            h("div", { className: "text-xs font-bold text-slate-700 mb-1", id: "wAccountLabel" }, "Account ID"),
            h("input", { className: "w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600", id: "wAccount", placeholder: "Enter Account / Wallet ID" })),
        h("div", null,
            h("div", { className: "flex items-center justify-between mb-1" },
                h("span", { className: "text-xs font-bold text-slate-700" }, "Amount (Coins)"),
                h("button", { type: "button", className: "text-[11px] font-extrabold text-blue-600", onClick: () => window.setWithdrawAmount('MAX') }, "MAX")),
            h("input", { className: "w-full px-3 py-2 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600", id: "wAmount", type: "number", placeholder: "Enter coins amount", onInput: () => window.updateWithdrawPreview() }),
            h("div", { className: "flex items-center justify-between text-xs pt-2" },
                h("span", { className: "text-slate-400 font-medium" }, "Receive"),
                h("b", { className: "text-slate-900 font-extrabold", id: "wReceivePreview" }, "NPR 0.00"))),
        h("button", { type: "button", className: "w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg transition", onClick: () => window.withdraw() }, "Withdraw"),
        h("div", { className: "hidden" },
            h("span", { id: "coins" }, "0"),
            h("span", { id: "total" }, "0"),
            h("span", { id: "wAllowedCountriesBar" }),
            h("span", { id: "wqStatusBadge" }),
            h("span", { id: "wqAds" }),
            h("span", { id: "wqTasks" }),
            h("span", { id: "wqDaily" }))));
}
function SubpageTopBar(props) {
    return (h("div", { className: "native-subpage-bar" },
        h("button", { type: "button", className: "native-back-btn", onClick: () => window.closeSettingPage() },
            h("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" },
                h("polyline", { points: "15 18 9 12 15 6" })),
            h("span", null, "Settings")),
        h("h3", { className: "native-subpage-title" }, props.title),
        h("div", { style: { width: '72px' } })));
}
function SettingsView() {
    return (h("section", { id: "tab-wallet", className: "app-screen" },
        h("div", { className: "native-topbar settings-header-bar" },
            h("div", { className: "settings-header-user" },
                h("button", { type: "button", className: "settings-avatar-wrap", id: "settingsAvatarBtn", title: "Tap to change avatar", onClick: () => window.randomizeAvatar() },
                    h("div", { className: "settings-avatar-ring", id: "settingsAvatarBox" }),
                    h("span", { className: "settings-avatar-status" })),
                h("div", { className: "settings-user-meta" },
                    h("div", { className: "settings-user-name-row" },
                        h("span", { className: "settings-user-name", id: "settingsHeaderName" }, "Paiso User"),
                        h("span", { className: "blue-tick-badge", id: "settingsVerifiedTick", style: { display: 'none' }, title: "Verified Account" },
                            h("svg", { width: "18", height: "18" },
                                h("use", { href: "#icon-blue-tick" })))),
                    h("div", { className: "settings-user-handle", id: "settingsHeaderHandle" }, "@user"))),
            h("div", { className: "settings-header-badge" },
                h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                    h("circle", { cx: "12", cy: "12", r: "3" }),
                    h("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" })),
                h("span", null, "Settings"))),
        h("div", { className: "screen-content", id: "settings-menu-view" },
            h("div", { className: "settings-group-label" }, "ACCOUNT & WALLET"),
            h("div", { className: "settings-group-card" },
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-userid') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-blue" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }),
                                h("circle", { cx: "9", cy: "10", r: "2" }),
                                h("path", { d: "M15 8h2" }),
                                h("path", { d: "M15 12h2" }),
                                h("path", { d: "M7 16h10" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "User ID"),
                            h("div", { className: "settings-item-sub" },
                                "ID: #",
                                h("span", { id: "userIdText" }, "---")))),
                    h("span", { className: "settings-chevron" }, "\u203A")),
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-verify') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-sky" },
                            h("svg", { width: "20", height: "20" },
                                h("use", { href: "#icon-blue-tick" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "Verification"),
                            h("div", { className: "settings-item-sub", id: "verifyMenuSub" }, "Verify email & details for Blue Tick"))),
                    h("div", { className: "settings-row-right" },
                        h("span", { className: "verify-status-pill unverified", id: "verifyMenuBadge" }, "Unverified"),
                        h("span", { className: "settings-chevron" }, "\u203A"))),
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-history') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-amber" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "Transaction History"),
                            h("div", { className: "settings-item-sub" }, "Your withdrawal requests & status"))),
                    h("span", { className: "settings-chevron" }, "\u203A")),
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-withdraw') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-green" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("rect", { x: "2", y: "5", width: "20", height: "14", rx: "2" }),
                                h("line", { x1: "2", y1: "10", x2: "22", y2: "10" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "Withdrawal"),
                            h("div", { className: "settings-item-sub" }, "Redeem coins to eSewa, Khalti, USDT"))),
                    h("span", { className: "settings-chevron" }, "\u203A"))),
            h("div", { className: "settings-group-label", style: { marginTop: '18px' } }, "HELP & INFORMATION"),
            h("div", { className: "settings-group-card" },
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-support') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-purple" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "Support"),
                            h("div", { className: "settings-item-sub" }, "Get help with tasks or withdrawals"))),
                    h("span", { className: "settings-chevron" }, "\u203A")),
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-faq') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-teal" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("circle", { cx: "12", cy: "12", r: "10" }),
                                h("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
                                h("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "FAQ"),
                            h("div", { className: "settings-item-sub" }, "Frequently asked questions"))),
                    h("span", { className: "settings-chevron" }, "\u203A")),
                h("button", { type: "button", className: "settings-row", onClick: () => window.openSettingPage('sub-terms') },
                    h("div", { className: "settings-item-left" },
                        h("div", { className: "settings-icon-box icon-blue" },
                            h("svg", { width: "19", height: "19", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                                h("polyline", { points: "14 2 14 8 20 8" }),
                                h("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
                                h("line", { x1: "16", y1: "17", x2: "8", y2: "17" }))),
                        h("div", null,
                            h("div", { className: "settings-item-title" }, "Terms & Conditions"),
                            h("div", { className: "settings-item-sub" }, "Terms of use & withdrawal rules"))),
                    h("span", { className: "settings-chevron" }, "\u203A")))),
        h("div", { id: "sub-userid", className: "settings-subpage" },
            h(SubpageTopBar, { title: "User ID" }),
            h("div", { className: "screen-content" },
                h("div", { className: "card" },
                    h("div", { className: "uid-detail-row" },
                        h("span", { className: "small" }, "Account Name"),
                        h("b", { id: "uname" }, "User")),
                    h("div", { className: "uid-detail-row", style: { marginTop: '8px' } },
                        h("span", { className: "small" }, "Telegram User ID"),
                        h("b", { id: "uidFullText" }, "---")),
                    h("button", { type: "button", className: "primary-btn btn-with-icon", style: { marginTop: '16px' }, onClick: () => window.copyUserId() },
                        h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }),
                            h("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })),
                        h("span", null, "Copy User ID"))))),
        h("div", { id: "sub-verify", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Verification" }),
            h("div", { className: "screen-content" },
                h("div", { className: "card verify-done-card", id: "verifyDoneCard", style: { display: 'none' } },
                    h("div", { className: "verify-seal-wrap" },
                        h("svg", { width: "54", height: "54" },
                            h("use", { href: "#icon-blue-tick" }))),
                    h("h3", { className: "verify-done-title" }, "Verified Profile"),
                    h("p", { className: "verify-done-sub" }, "Your identity is verified. Blue Tick is active on your profile."),
                    h("div", { className: "verify-details-list" },
                        h("div", { className: "uid-detail-row" },
                            h("span", { className: "small" }, "Full Name"),
                            h("b", { id: "verifiedNameText" }, "---")),
                        h("div", { className: "uid-detail-row" },
                            h("span", { className: "small" }, "Email"),
                            h("b", { id: "verifiedEmailText" }, "---")),
                        h("div", { className: "uid-detail-row" },
                            h("span", { className: "small" }, "Date of Birth"),
                            h("b", { id: "verifiedDobText" }, "---")),
                        h("div", { className: "uid-detail-row" },
                            h("span", { className: "small" }, "Gender"),
                            h("b", { id: "verifiedGenderText" }, "---")))),
                h("div", { className: "card", id: "verifyFormCard" },
                    h("div", { className: "verify-banner-head" },
                        h("div", { className: "verify-banner-icon" },
                            h("svg", { width: "28", height: "28" },
                                h("use", { href: "#icon-blue-tick" }))),
                        h("div", null,
                            h("div", { className: "verify-banner-title" }, "Get Verified Blue Tick"),
                            h("div", { className: "verify-banner-sub" }, "Complete your profile details & confirm Telegram OTP"))),
                    h("div", { className: "verify-field-label" }, "Full Name"),
                    h("input", { className: "form-input", id: "vFullName", type: "text", placeholder: "Enter your full name" }),
                    h("div", { className: "verify-field-label" }, "Email Address (optional)"),
                    h("input", { className: "form-input", id: "vEmail", type: "email", placeholder: "you@example.com" }),
                    h("div", { className: "verify-field-label" }, "Date of Birth"),
                    h("input", { className: "form-input", id: "vDob", type: "date" }),
                    h("div", { className: "verify-field-label" }, "Gender"),
                    h("div", { className: "gender-pills" },
                        h("button", { type: "button", className: "gender-pill active", id: "genderMaleBtn", onClick: () => window.selectGender('Male') },
                            h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("circle", { cx: "10", cy: "14", r: "5" }),
                                h("line", { x1: "19", y1: "5", x2: "13.6", y2: "10.4" }),
                                h("polyline", { points: "15 5 19 5 19 9" })),
                            h("span", null, "Male")),
                        h("button", { type: "button", className: "gender-pill", id: "genderFemaleBtn", onClick: () => window.selectGender('Female') },
                            h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                                h("circle", { cx: "12", cy: "9", r: "5" }),
                                h("line", { x1: "12", y1: "14", x2: "12", y2: "21" }),
                                h("line", { x1: "9", y1: "18", x2: "15", y2: "18" })),
                            h("span", null, "Female"))),
                    h("input", { type: "hidden", id: "vGender", value: "Male" }),
                    h("button", { type: "button", className: "primary-btn btn-with-icon", id: "sendOtpBtn", onClick: () => window.sendVerifyOtp() },
                        h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
                            h("polyline", { points: "22,6 12,13 2,6" })),
                        h("span", { id: "sendOtpBtnText" }, "Send OTP to Telegram")),
                    h("div", { className: "verify-otp-box", id: "verifyOtpBox", style: { display: 'none' } },
                        h("div", { className: "verify-otp-divider" }),
                        h("div", { className: "verify-otp-info" },
                            "Enter the 6-digit verification code sent to ",
                            h("b", { id: "otpTargetEmail" }, "your Telegram chat")),
                        h("input", { className: "form-input otp-code-input", id: "vOtpInput", type: "text", maxLength: 6, placeholder: "Enter 6-digit OTP" }),
                        h("button", { type: "button", className: "primary-btn btn-with-icon verify-confirm-btn", id: "confirmOtpBtn", onClick: () => window.confirmVerifyOtp() },
                            h("svg", { width: "17", height: "17" },
                                h("use", { href: "#icon-blue-tick" })),
                            h("span", null, "Confirm OTP & Verify")))))),
        h("div", { id: "sub-history", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Transaction History" }),
            h("div", { className: "screen-content pb-6" },
                h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100", id: "wHistory" }))),
        h("div", { id: "sub-withdraw", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Withdrawal" }),
            h("div", { className: "screen-content space-y-4 pb-6" },
                h(WithdrawSection, null),
                h("div", null,
                    h("div", { className: "text-xs font-extrabold text-slate-700 mb-2 px-0.5" }, "Transaction History"),
                    h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100", id: "wWithdrawHistory" })))),
        h("div", { id: "sub-support", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Support" }),
            h("div", { className: "screen-content" },
                h("div", { className: "card" },
                    h("p", { className: "small", style: { lineHeight: '1.55', marginBottom: '14px' } }, "Need help with your account, tasks, or withdrawal request? Contact our official support team directly on Telegram."),
                    h("button", { type: "button", className: "primary-btn btn-with-icon", onClick: () => window.openSupport() },
                        h("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
                            h("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
                            h("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })),
                        h("span", null, "Contact Telegram Support"))))),
        h("div", { id: "sub-faq", className: "settings-subpage" },
            h(SubpageTopBar, { title: "FAQ" }),
            h("div", { className: "screen-content space-y-3 pb-6" },
                h("div", { className: "bg-white border border-slate-200 rounded-xl p-4" },
                    h("div", { className: "text-xs font-extrabold text-slate-900 mb-3" }, "How It Works"),
                    h("div", { className: "space-y-3" }, FAQ_STEPS.map((item) => (h("div", { className: "flex items-start gap-2.5" },
                        h("span", { className: "w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5" }, item.step),
                        h("div", null,
                            h("div", { className: "text-xs font-bold text-slate-900" }, item.title),
                            h("p", { className: "text-[11px] text-slate-500 leading-relaxed mt-0.5" }, item.desc))))))),
                h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100" }, FAQ_LIST.map((item) => (h("div", { className: "p-3.5" },
                    h("div", { className: "text-xs font-bold text-slate-900" }, item.q),
                    h("p", { className: "text-[11px] text-slate-500 leading-relaxed mt-1" }, item.a))))))),
        h("div", { id: "sub-terms", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Terms & Conditions" }),
            h("div", { className: "screen-content pb-6" },
                h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100" }, TERMS_SECTIONS.map((sec) => (h("div", { className: "p-3.5" },
                    h("div", { className: "text-xs font-bold text-slate-900" }, sec.title),
                    h("p", { className: "text-[11px] text-slate-500 leading-relaxed mt-1" }, sec.body)))))))));
}

// --- src/client/components/BottomNav.tsx ---
function BottomNav() {
    return (h("nav", { className: "bottom-nav" },
        h("button", { "data-tab": "home", className: "active", onClick: () => window.showTab('home') },
            h("svg", { viewBox: "0 0 24 24" },
                h("path", { d: "M12 3.2L3 10.5V20a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9.5L12 3.2z" })),
            h("span", null, "Home")),
        h("button", { "data-tab": "tasks", onClick: () => window.showTab('tasks', 'all') },
            h("svg", { viewBox: "0 0 24 24" },
                h("path", { d: "M16 4h-1.18A3 3 0 0 0 12 2a3 3 0 0 0-2.82 2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-4-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 14H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V7h2v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" })),
            h("span", null, "Tasks")),
        h("button", { "data-tab": "refer", onClick: () => window.showTab('refer') },
            h("svg", { viewBox: "0 0 24 24" },
                h("path", { d: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" })),
            h("span", null, "Friends")),
        h("button", { "data-tab": "wallet", onClick: () => window.showTab('wallet') },
            h("svg", { viewBox: "0 0 24 24" },
                h("path", { d: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" })),
            h("span", null, "Settings"))));
}

// --- src/client/app.tsx ---







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

})();
