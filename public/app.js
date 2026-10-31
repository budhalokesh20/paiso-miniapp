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
    return (h("svg", { style: "position:absolute;width:0;height:0;overflow:hidden", "aria-hidden": "true" },
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

// --- src/client/components/shared/UiIcon.tsx ---
function UiIcon({ name, size = 20 }) {
    const paths = {
        gift: 'M3 8h18v4H3V8M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
        game: 'M6 8h12c2 0 3 2 3 4l1 5c0 2-2 3-3 1l-3-3H8l-3 3c-1 2-3 1-3-1l1-5c0-2 1-4 3-4M7 10v4M5 12h4M16 11h.01M18 13h.01',
        search: 'M21 21l-5-5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
        crown: 'M3 6l4 4 5-7 5 7 4-4-2 13H5L3 6M6 15h12',
        home: 'M3 10l9-7 9 7v11h-6v-7H9v7H3V10',
        tasks: 'M9 5H5v16h14V5h-4M9 3h6v4H9V3M9 11h6M9 15h6',
        friends: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M16 4a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
        settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
        arrow: 'M5 12h14M14 7l5 5-5 5',
        lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10M12 14v3',
        bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4',
        user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
        help: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
        globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20',
        shield: 'M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4M8 12l3 3 5-6',
        share: 'M12 16V2M7 7l5-5 5 5M6 10H3v12h18V10h-3',
        wallet: 'M3 6h18v15H3V6M3 6V3h15M16 12h5v5h-5v-5',
        chevron: 'M9 5l7 7-7 7',
    };
    return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
        h("path", { d: paths[name] || paths.tasks }));
}

// --- src/client/components/shared/EarnIcon.tsx ---
function EarnIcon({ index }) {
    return h("span", { className: `earn-art earn-art-${index}`, "aria-hidden": "true" });
}

// --- src/client/components/shared/FeedbackToast.tsx ---

let feedbackTimer;
let feedbackExitTimer;
let feedbackRemaining = 0;
let feedbackDeadline = 0;
function pauseFeedback() {
    if (!feedbackTimer)
        return;
    if (feedbackTimer)
        window.clearTimeout(feedbackTimer);
    feedbackTimer = undefined;
    feedbackRemaining = Math.max(0, feedbackDeadline - Date.now());
}
function resumeFeedback() {
    const toast = document.getElementById('toast');
    if (!toast?.classList.contains('show') || feedbackTimer || toast.matches(':hover') || toast.contains(document.activeElement))
        return;
    feedbackDeadline = Date.now() + feedbackRemaining;
    feedbackTimer = window.setTimeout(dismissFeedback, feedbackRemaining);
}
function dismissFeedback() {
    const toast = document.getElementById('toast');
    if (feedbackTimer)
        window.clearTimeout(feedbackTimer);
    feedbackTimer = undefined;
    toast?.classList.remove('show');
    toast?.setAttribute('aria-hidden', 'true');
    feedbackExitTimer = window.setTimeout(() => {
        if (toast && typeof toast.hidePopover === 'function' && toast.matches(':popover-open'))
            toast.hidePopover();
    }, 180);
}
function FeedbackToast() {
    return h("div", { id: "toast", className: "feedback-toast", popover: "manual", role: "status", "aria-live": "polite", "aria-atomic": "true", "aria-hidden": "true", onMouseEnter: pauseFeedback, onMouseLeave: resumeFeedback, onFocusIn: pauseFeedback, onFocusOut: resumeFeedback },
        h("span", { id: "feedbackIcon", className: "feedback-icon", "aria-hidden": "true" }),
        h("div", { className: "feedback-copy" },
            h("strong", { id: "feedbackTitle" }),
            h("p", { id: "feedbackMessage" })),
        h("button", { type: "button", className: "feedback-dismiss", "aria-label": "Dismiss notification", onClick: dismissFeedback },
            h("svg", { viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true" },
                h("path", { d: "M6 6l12 12M18 6L6 18" }))));
}
function showFeedback(message, kind = 'success') {
    const toast = document.getElementById('toast');
    if (!toast)
        return;
    if (feedbackTimer)
        window.clearTimeout(feedbackTimer);
    if (feedbackExitTimer)
        window.clearTimeout(feedbackExitTimer);
    feedbackTimer = undefined;
    const dialog = document.querySelector('dialog[open]');
    const host = dialog || document.body;
    if (toast.parentElement !== host)
        host.append(toast);
    if (dialog)
        dialog.addEventListener('close', () => {
            if (toast.parentElement === dialog) {
                dismissFeedback();
                document.body.append(toast);
            }
        }, { once: true });
    const titles = { success: 'Success', warning: 'Please check', error: 'Something went wrong', info: 'Update' };
    const paths = { success: 'M6 12l4 4 8-8', warning: 'M12 7v6M12 17h.01', error: 'M8 8l8 8M16 8l-8 8', info: 'M12 11v6M12 7h.01' };
    document.getElementById('feedbackTitle').textContent = titles[kind];
    document.getElementById('feedbackMessage').textContent = message;
    document.getElementById('feedbackIcon').replaceChildren(h("svg", { viewBox: "0 0 24 24", width: "22", height: "22", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" },
        h("path", { d: paths[kind] })));
    toast.className = 'feedback-toast show ' + kind;
    toast.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');
    toast.setAttribute('aria-hidden', 'false');
    if (typeof toast.showPopover === 'function' && !toast.matches(':popover-open'))
        toast.showPopover();
    feedbackRemaining = kind === 'error' || kind === 'warning' ? 6500 : 4500;
    resumeFeedback();
}

// --- src/client/components/shared/AppHeader.tsx ---
function AppHeader() {
    return h("header", { className: "app-header home-header" },
        h("button", { type: "button", className: "home-identity", onClick: () => window.showTab('wallet'), "aria-label": "Your profile" },
            h("span", { className: "profile-avatar-art home-avatar", "aria-hidden": "true" }),
            h("span", { className: "home-greeting", id: "homeGreeting" }, "Hey, there")),
        h("div", { className: "header-actions" },
            h("button", { type: "button", id: "homeNotificationsBtn", className: "header-icon home-notifications", "aria-label": "Notifications", onClick: () => window.openNotificationsModal() },
                h(UiIcon, { name: "bell", size: 21 }),
                h("span", { id: "homeUnreadBadge", className: "home-unread-badge", style: "display:none", "aria-hidden": "true" })),
            h("button", { type: "button", className: "header-icon", "aria-label": "Withdraw rewards", onClick: () => { window.showTab('wallet'); window.openSettingPage('sub-withdraw'); } },
                h(UiIcon, { name: "crown", size: 21 }))));
}

// --- src/client/components/shared/GameCard.tsx ---
function GameCard({ game, compact = false, pending = false }) {
    const artworkIndex = /fruit/i.test(game.title) ? 0 : /car|rac(e|ing)/i.test(game.title) ? 1 : /puzzle|match/i.test(game.title) ? 2 : /bubble/i.test(game.title) ? 3 : -1;
    const price = game.priceCoins > 0 ? `${game.priceCoins.toLocaleString()} coins / play` : 'Free to play';
    return (h("button", { type: "button", className: compact ? 'featured-game' : 'game-card', onClick: () => window.playGame(game.id), disabled: pending, "aria-label": `${game.title}, ${price}` },
        h("span", { className: "game-cover" },
            artworkIndex >= 0 ? h("span", { className: 'reference-art popular-art art-game-' + artworkIndex, "aria-hidden": "true" }) : h("span", { className: "game-fallback" },
                h(UiIcon, { name: "game", size: 56 })),
            compact && game.priceCoins > 0 ? h("span", { className: "game-price" },
                game.priceCoins.toLocaleString(),
                " coins") : null),
        h("b", { title: game.title }, game.title),
        !compact ? h("small", null, price) : null,
        !compact ? h("span", { className: "game-play" }, pending ? 'Starting…' : 'Play Now') : null));
}

// --- src/client/components/home/HomeHero.tsx ---
function HomeHero() {
    return h("section", { className: "hero-banner home-hero", "aria-labelledby": "home-hero-title" },
        h("span", { className: "reference-art hero-art", "aria-hidden": "true" }),
        h("div", { className: "hero-content" },
            h("h1", { id: "home-hero-title", className: "hero-title" },
                "Play",
                h("br", null),
                "Complete",
                h("br", null),
                h("span", { className: "cyan" }, "Earn Coins")),
            h("p", { className: "hero-sub" }, "Real Tasks. Real Rewards."),
            h("button", { type: "button", className: "hero-cta", onClick: () => window.showTab('tasks', 'all') },
                "Explore Now ",
                h(UiIcon, { name: "arrow", size: 14 }))),
        h("span", { className: "banner-dots", "aria-hidden": "true" },
            h("i", null),
            h("i", null),
            h("i", null)));
}

// --- src/client/components/home/QuickTasks.tsx ---
function QuickTasks({ variant = 'home' }) {
    const tasksVariant = variant === 'tasks';
    const titleId = tasksVariant ? 'tasks-quick-title' : 'quick-title';
    const items = [
        { title: 'Daily Check-in', copy: 'Claim daily reward', action: () => window.openDailyCheckin(), label: 'Check In', art: 'checkin' },
        { title: 'Daily Spin', copy: 'Spin & win coins!', action: () => window.openDailySpin(), label: 'Spin Now', art: 'spin' },
        { title: 'Daily Bonus', copy: 'Claim free rewards!', action: () => window.claimDaily(), label: 'Claim Now', art: 'bonus' },
    ];
    return h("section", { className: tasksVariant ? "tasks-quick home-quick" : "home-quick", "aria-labelledby": titleId },
        h("div", { className: "section-head" },
            h("h2", { id: titleId }, "Quick Tasks"),
            !tasksVariant ? h("button", { className: "view-all-btn", onClick: () => window.openDailyCheckin() },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 })) : null),
        h("div", { className: "quick-grid" }, items.map(item => h("article", { className: 'quick-card quick-' + item.art },
            h("span", { className: 'reference-art quick-art art-' + item.art, "aria-hidden": "true" }),
            h("h3", null, item.title),
            h("p", null, item.copy),
            h("button", { type: "button", id: item.art === 'bonus' ? (tasksVariant ? 'tasksBonusBtn' : 'quickBonusBtn') : undefined, "data-daily-bonus": item.art === 'bonus' ? '' : undefined, onClick: item.action },
                h("span", { id: item.art === 'bonus' ? (tasksVariant ? 'tasksBonusText' : 'quickBonusText') : undefined, "data-daily-label": item.art === 'bonus' ? '' : undefined }, item.label),
                !tasksVariant ? h(UiIcon, { name: "arrow", size: 14 }) : null)))));
}

// --- src/client/components/home/DailyCheckIn.tsx ---


function CheckInDay({ day }) {
    return (h("div", { className: `day-box upcoming${day === 7 ? ' day-7' : ''}`, id: `day-box-${day}`, "data-day": day },
        h("div", { className: "day-tile" }, day === 7 ? (h("img", { src: "/assets/paiso-gift-v2.webp", alt: "Bonus gift", className: "day-gift", width: "32", height: "32" })) : (h("span", null,
            h("span", { className: "day-check", "aria-hidden": "true" },
                h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
                    h("polyline", { points: "20 6 9 17 4 12" }))),
            h("span", { className: "day-lock" },
                h(UiIcon, { name: "lock", size: 15 }))))),
        h("div", { className: "day-label" },
            "Day ",
            day)));
}
function DailyCheckIn() {
    return (h("section", { className: "daily-card home-checkin", id: "dailyCard", "aria-labelledby": "daily-title" },
        h("div", { className: "daily-top" },
            h("div", { className: "daily-left" },
                h("span", { className: "daily-flame", "aria-hidden": "true" }, "\uD83D\uDD25"),
                h("div", { className: "daily-copy" },
                    h("h2", { className: "daily-title", id: "daily-title" }, "Daily Check-in"),
                    h("p", { className: "daily-sub", id: "dailySubText" }, "Check in daily to keep your streak!"))),
            h("span", { className: "streak-pill", id: "streakDayText" }, "Day 1")),
        h("div", { className: "days-grid", id: "daysGrid" }, [1, 2, 3, 4, 5, 6, 7].map(day => h(CheckInDay, { day: day }))),
        h("div", { className: "daily-claim-wrap" },
            h("button", { type: "button", className: "daily-claim-btn", id: "dailyBtn", onClick: () => window.claimDaily() },
                h("span", { id: "dailyBtnIcon" },
                    h("svg", { width: "19", height: "19" },
                        h("use", { href: "#icon-gift" }))),
                h("span", { id: "dailyBtnText" }, "Claim Today"),
                h("svg", { id: "dailyBtnCoin", width: "15", height: "15" },
                    h("use", { href: "#icon-p-coin" })))),
        h("div", { className: "claim-fx-layer", id: "claimFxLayer", "aria-hidden": "true" }),
        h("span", { id: "dailyReward", hidden: true })));
}
function DailyCheckInModal() {
    return h("dialog", { id: "dailyCheckinModal", className: "home-checkin-dialog", "aria-labelledby": "daily-title", onClick: (event) => { if (event.target === event.currentTarget)
            window.closeDailyCheckin(); } },
        h("div", { className: "checkin-dialog-content" },
            h("button", { className: "checkin-close", "aria-label": "Close daily check-in", onClick: () => window.closeDailyCheckin() }, "\u00D7"),
            h(DailyCheckIn, null),
            h("p", { className: "checkin-note" }, "Your daily check-in includes today's bonus.")));
}

// --- src/client/components/home/EarnShortcuts.tsx ---


const HOME_SHORTCUTS = [
    { title: 'Watch', description: 'Earn Coins', action: () => window.watchAd() },
    { title: 'Tasks', description: 'Complete & Earn', action: () => window.showTab('tasks', 'all') },
    { title: 'Games', description: 'Play & Earn', action: () => window.showTab('games') },
    { title: 'Offers', description: 'Special Offers', action: () => window.showTab('offers') },
];
function EarnShortcuts() {
    return h("section", { className: "home-shortcuts", "aria-labelledby": "earn-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "earn-title" }, "Earn Coins"),
            h("button", { className: "view-all-btn", onClick: () => window.showTab('tasks', 'all') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { className: "explore-grid", id: "exploreGrid" }, HOME_SHORTCUTS.map((item, index) => (h("button", { type: "button", className: 'explore-card earn-tile earn-tile-' + index, "data-title": item.title + ' ' + item.description, id: index === 0 ? 'adBtn' : undefined, onClick: item.action },
            h("span", { className: 'reference-art tile-art art-earn-' + index, "aria-hidden": "true" }),
            h("span", { className: "earn-copy" },
                h("span", { className: "explore-title" }, item.title),
                h("span", { className: "explore-sub" }, item.description)),
            h("span", { className: "tile-arrow" },
                h(UiIcon, { name: "arrow", size: 21 })))))),
        h("div", { hidden: true },
            h("span", { id: "adCardSub" }),
            h("span", { id: "adReward" }),
            h("span", { id: "adCount" }, "0"),
            h("span", { id: "adCap" }, "10"),
            h("input", { id: "searchInput" }),
            h("button", { id: "searchClearBtn" })));
}

// --- src/client/components/home/InviteBanner.tsx ---
function InviteBanner() {
    return (h("button", { type: "button", className: "invite-strip home-invite", onClick: () => window.showTab('refer') },
        h("span", { className: "invite-people" },
            h(UiIcon, { name: "friends", size: 38 })),
        h("span", { className: "invite-copy" },
            h("b", null, "Invite Friends"),
            h("small", null, "Get extra rewards when your friends join!")),
        h("img", { src: "/assets/paiso-gift-v2.webp", alt: "", width: "56", height: "56", decoding: "async" })));
}

// --- src/client/components/home/FeaturedGames.tsx ---
function FeaturedGames() {
    return (h("section", { className: "home-featured", "aria-labelledby": "featured-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "featured-title" },
                h("span", { className: "popular-icon", "aria-hidden": "true" }),
                "Popular Games"),
            h("button", { type: "button", className: "view-all-btn", onClick: () => window.showTab('games') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { id: "featuredGames", className: "featured-games", "aria-busy": "true" },
            h("div", { className: "home-games-placeholder", role: "status" },
                h(EarnIcon, { index: 2 }),
                h("span", null, "Loading your next adventure\u2026")))));
}
function updateFeaturedGames(games, pendingId) {
    const grid = document.getElementById('featuredGames');
    if (!grid)
        return;
    grid.setAttribute('aria-busy', 'false');
    grid.replaceChildren(...(games.length ? games.slice(0, 4).map(game => (h(GameCard, { game: game, compact: true, pending: pendingId === game.id }))) : [
        h("button", { type: "button", className: "games-empty-link", onClick: () => window.showTab('games') },
            h(EarnIcon, { index: 2 }),
            h("span", null,
                h("b", null, "Your next adventure awaits"),
                h("small", null, "New games are on the way")),
            h(UiIcon, { name: "chevron" }))
    ]));
}
function showFeaturedGamesError() {
    const grid = document.getElementById('featuredGames');
    if (!grid)
        return;
    grid.setAttribute('aria-busy', 'false');
    grid.replaceChildren(h("p", { className: "home-games-placeholder", role: "status" }, "Connecting to your games. Please check your connection."));
}

// --- src/client/components/HomeView.tsx ---
function HomeView() {
    return (h("section", { id: "tab-home", className: "app-screen home-screen active-screen", "aria-label": "Home" },
        h(AppHeader, null),
        h("div", { className: "screen-content home-layout" },
            h(HomeHero, null),
            h(QuickTasks, null),
            h(EarnShortcuts, null),
            h(FeaturedGames, null))));
}

// --- src/client/components/tasks/TaskHero.tsx ---
function TaskHero() {
    return h("section", { className: "tasks-hero", "aria-labelledby": "tasks-hero-title" },
        h("span", { className: "task-reference-art tasks-hero-art", "aria-hidden": "true" }),
        h("div", { className: "tasks-hero-copy" },
            h("h2", { id: "tasks-hero-title" },
                "Complete Tasks",
                h("br", null),
                h("span", null, "Earn More Coins")),
            h("p", null,
                "Try new apps, play games",
                h("br", null),
                "and explore offers")));
}

// --- src/client/components/tasks/TaskCategories.tsx ---


const TASK_CATEGORIES = [
    { title: 'Watch Videos', description: 'Watch short videos and earn coins', filter: 'video', art: 'video' },
    { title: 'Play Games', description: 'Play games and earn coins', filter: 'play_game', art: 'games' },
    { title: 'Complete Offers', description: 'Try new apps and earn coins', filter: 'app_task', art: 'offers' },
];
function TaskCategories() {
    return h("section", { className: "tasks-categories", "aria-labelledby": "task-categories-title" },
        h("div", { className: "section-head" },
            h("h2", { id: "task-categories-title" }, "Task Categories"),
            h("button", { type: "button", className: "view-all-btn", onClick: () => window.openTaskList('all') },
                "View All ",
                h(UiIcon, { name: "chevron", size: 14 }))),
        h("div", { className: "task-category-list" }, TASK_CATEGORIES.map(category => h("button", { type: "button", className: 'task-category category-' + category.art, onClick: () => window.openTaskList(category.filter) },
            h("span", { className: 'task-reference-art category-icon icon-' + category.art, "aria-hidden": "true" }),
            h("span", { className: "category-copy" },
                h("b", null, category.title),
                h("span", null, category.description)),
            h("span", { className: 'task-reference-art category-decoration decoration-' + category.art, "aria-hidden": "true" })))));
}

// --- src/client/components/tasks/TaskListPage.tsx ---
function TaskListPage() {
    const filters = [{ id: 'all', label: 'All' }, { id: 'video', label: 'Video' }, { id: 'app_task', label: 'Apps' }, { id: 'play_game', label: 'Games' }, { id: 'social_visit', label: 'Web' }, { id: 'telegram_join', label: 'Social' }, { id: 'done', label: 'Done' }];
    return h("section", { id: "sub-task-list", className: "settings-subpage task-detail-page", "aria-labelledby": "task-list-title" },
        h("div", { className: "native-subpage-bar" },
            h("button", { type: "button", className: "native-back-btn", "aria-label": "Back to Tasks", onClick: () => window.closeSettingPage() },
                h(UiIcon, { name: "chevron", size: 20 })),
            h("h1", { className: "native-subpage-title", id: "task-list-title" }, "All Tasks"),
            h("div", null)),
        h("div", { className: "screen-content" },
            h("label", { className: "task-search search-open" },
                h(UiIcon, { name: "search", size: 18 }),
                h("input", { id: "taskSearchInput", type: "search", "aria-label": "Search tasks", placeholder: "Search tasks", onInput: (event) => window.filterTasks(event.target.value) })),
            h("div", { className: "filter-bar", "aria-label": "Task categories" }, filters.map(filter => h("button", { type: "button", className: 'filter-chip' + (filter.id === 'all' ? ' active' : ''), "data-filter": filter.id, onClick: () => window.setTaskFilter(filter.id) }, filter.label))),
            h("div", { id: "taskList", className: "task-list", "aria-live": "polite" })));
}

// --- src/client/components/TasksView.tsx ---
function TasksView() {
    return h("section", { id: "tab-tasks", className: "app-screen tasks-screen", "aria-label": "Tasks" },
        h("div", { className: "screen-content tasks-layout" },
            h("div", { className: "tasks-heading" },
                h("h1", null, "Tasks"),
                h("p", null, "Complete simple tasks and earn coins")),
            h(TaskHero, null),
            h(QuickTasks, { variant: "tasks" }),
            h(TaskCategories, null),
            h("span", { id: "headerCoins", hidden: true })));
}
function OffersView() {
    return h("section", { id: "tab-offers", className: "app-screen" },
        h("div", { className: "screen-content" },
            h("div", { className: "page-heading" },
                h("h1", null, "Special Offers"),
                h("p", null, "Discover apps and earn rewards")),
            h("div", { id: "offerList", className: "task-list" })));
}

// --- src/client/components/GamesView.tsx ---
function GamesView() {
    return (h("div", { id: "exploreGames", className: "games-page" },
        h("div", { className: "page-heading" },
            h("h1", null, "Games"),
            h("p", null, "Find your next favorite game")),
        h("div", { id: "gamesGrid", className: "games-grid" })));
}
function GameModal() {
    return (h("div", { id: "gameModal", className: "fixed inset-0 z-[120] hidden flex-col bg-slate-950" },
        h("div", { className: "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 text-white" },
            h("div", { id: "activeGameTitle", className: "truncate text-sm font-bold" }, "Game"),
            h("button", { type: "button", onClick: () => window.closeGame(), "aria-label": "Close game", className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20" }, "\u00D7")),
        h("iframe", { id: "gameFrame", title: "Paiso game", sandbox: "allow-scripts", allow: "fullscreen; gamepad; autoplay", allowFullScreen: true, referrerPolicy: "no-referrer", className: "min-h-0 w-full flex-1 border-0 bg-white" })));
}

// --- src/client/components/FriendsView.tsx ---
function FriendsView() {
    return h("section", { id: "tab-refer", className: "app-screen" },
        h("div", { className: "screen-content" },
            h("div", { className: "invite-hero" },
                h("h1", null,
                    "Invite Friends",
                    h("br", null),
                    h("strong", null, "Earn More")),
                h("p", null, "More friends, more rewards!")),
            h("div", { className: "ref-link-card" },
                h("div", null,
                    h("label", { for: "refLink" }, "Your Invite Link"),
                    h("input", { id: "refLink", readOnly: true, "aria-label": "Your invite link", placeholder: "Loading your invite link\u2026" })),
                h("button", { className: "primary-btn", onClick: () => window.copyRef() }, "Copy")),
            h("div", { className: "ref-stats" },
                h("div", null,
                    h(UiIcon, { name: "friends", size: 26 }),
                    h("b", { id: "refCount" }, "0"),
                    h("small", null, "Total Invites")),
                h("div", null,
                    h(UiIcon, { name: "friends", size: 26 }),
                    h("b", { id: "refActive" }, "0"),
                    h("small", null, "Active Users")),
                h("div", null,
                    h("svg", { width: "26", height: "26" },
                        h("use", { href: "#icon-p-coin" })),
                    h("b", { id: "refEarned" }, "0"),
                    h("small", null, "Bonus Earned"))),
            h("h2", { className: "section-subtitle" }, "How It Works?"),
            h("div", { className: "ref-how" },
                h("ol", null,
                    h("li", null,
                        h("span", null, "1"),
                        "Share your invite link",
                        h("br", null),
                        "with your friends"),
                    h("li", null,
                        h("span", null, "2"),
                        "They join and start using",
                        h("br", null),
                        "Paiso bot"),
                    h("li", null,
                        h("span", null, "3"),
                        "They qualify, you earn!")),
                h("img", { src: "/assets/paiso-gift-v2.webp", alt: "Gift rewards" })),
            h("button", { className: "bonus-strip", onClick: () => window.shareRef() },
                h("img", { src: "/assets/paiso-gift-v2.webp", alt: "" }),
                h("span", null,
                    h("b", null, "Bonus Rewards"),
                    h("small", null,
                        "Earn ",
                        h("span", { id: "refBonusValue" }, "+500"),
                        " coins per qualified friend, plus 10% of task earnings.")),
                h(UiIcon, { name: "chevron", size: 16 })),
            h("div", { className: "section-head" },
                h("h2", null, "Your Invites"),
                h("button", { className: "view-all-btn", onClick: () => document.getElementById('refHistory')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }, "See All")),
            h("div", { id: "refHistory" })));
}

// --- src/client/components/settings/SettingsParts.tsx ---
function SubpageTopBar(props) {
    return (h("div", { className: "native-subpage-bar" },
        h("button", { type: "button", className: "native-back-btn", "aria-label": "Back to Settings", onClick: () => window.closeSettingPage() },
            h("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" },
                h("polyline", { points: "15 18 9 12 15 6" })),
            h("span", null, "Settings")),
        h("h3", { className: "native-subpage-title" }, props.title),
        h("div", { style: { width: '72px' } })));
}
function SettingRow({ icon, title, action, detail }) {
    return h("button", { type: "button", className: "settings-row", onClick: action },
        h("span", { className: 'settings-row-icon setting-icon-' + icon },
            h(UiIcon, { name: icon, size: 22 })),
        h("span", { className: "settings-item-title" }, title),
        h("span", { className: "settings-row-right" },
            detail ? h("span", { className: "settings-detail" }, detail) : null,
            h(UiIcon, { name: "chevron", size: 17 })));
}
function SettingsGroup({ title, id, children }) {
    return h("section", { className: "settings-group", "aria-labelledby": id },
        h("h2", { className: "settings-group-label", id: id }, title),
        h("div", { className: "settings-group-card" }, children));
}

// --- src/client/components/settings/SettingsProfile.tsx ---
function SettingsProfile() {
    return h("button", { type: "button", className: "settings-profile", onClick: () => window.openSettingPage('sub-userid'), "aria-label": "View account details" },
        h("span", { className: "settings-avatar-ring", id: "settingsAvatarBox", "aria-hidden": "true" }),
        h("span", { className: "profile-details" },
            h("span", { className: "profile-name-line" },
                h("b", { id: "settingsHeaderName" }, "Paiso User"),
                h("span", { id: "settingsVerifiedTick", style: "display:none" },
                    h("svg", { width: "18", height: "18" },
                        h("use", { href: "#icon-blue-tick" })))),
            h("span", { id: "settingsHeaderHandle" }, "Your Telegram account"),
            h("small", null, "View account details")),
        h(UiIcon, { name: "chevron", size: 20 }));
}

// --- src/client/components/settings/SettingsMenu.tsx ---
function SettingsMenu() {
    return h("div", { className: "screen-content settings-content", id: "settings-menu-view" },
        h("div", { className: "settings-heading" },
            h("h1", null, "Settings"),
            h("p", null, "Manage your account and rewards.")),
        h(SettingsProfile, null),
        h(SettingsGroup, { title: "Account & Rewards", id: "settings-account-title" },
            h(SettingRow, { icon: "shield", title: "Profile & Verification", action: () => window.openSettingPage('sub-verify'), detail: h("span", { id: "verifyMenuBadge" }, "Unverified") }),
            h(SettingRow, { icon: "wallet", title: "Withdraw Rewards", action: () => window.openSettingPage('sub-withdraw') }),
            h(SettingRow, { icon: "tasks", title: "My Activity", action: () => window.openSettingPage('sub-history') }),
            h(SettingRow, { icon: "bell", title: "Notifications", action: () => window.openNotificationsModal(), detail: h("span", { id: "notifUnreadBadge", style: "display:none" }, "0") })),
        h(SettingsGroup, { title: "Help & Support", id: "settings-support-title" },
            h(SettingRow, { icon: "help", title: "Help Center", action: () => window.openSettingPage('sub-faq') }),
            h(SettingRow, { icon: "user", title: "Contact Support", action: () => window.openSettingPage('sub-support') }),
            h(SettingRow, { icon: "shield", title: "Privacy Information", action: () => window.openSettingPage('sub-privacy') }),
            h(SettingRow, { icon: "tasks", title: "Terms of Service", action: () => window.openSettingPage('sub-terms') })),
        h("div", { hidden: true },
            h("span", { id: "userIdText" }),
            h("span", { id: "verifyMenuSub" })));
}

// --- src/client/components/settings/SettingsAccountPages.tsx ---
function SettingsAccountPages() {
    return h("div", { className: "settings-pages" },
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
                    h("label", { className: "verify-field-label", for: "vFullName" }, "Full Name"),
                    h("input", { className: "form-input", id: "vFullName", autoComplete: "name", type: "text", placeholder: "Enter your full name" }),
                    h("label", { className: "verify-field-label", for: "vEmail" }, "Email Address (optional)"),
                    h("input", { className: "form-input", id: "vEmail", autoComplete: "email", type: "email", placeholder: "you@example.com" }),
                    h("label", { className: "verify-field-label", for: "vDob" }, "Date of Birth"),
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
                        h("input", { className: "form-input otp-code-input", id: "vOtpInput", "aria-label": "Verification code", inputMode: "numeric", autoComplete: "one-time-code", type: "text", maxLength: 6, placeholder: "Enter 6-digit OTP" }),
                        h("button", { type: "button", className: "primary-btn btn-with-icon verify-confirm-btn", id: "confirmOtpBtn", onClick: () => window.confirmVerifyOtp() },
                            h("svg", { width: "17", height: "17" },
                                h("use", { href: "#icon-blue-tick" })),
                            h("span", null, "Confirm OTP & Verify")))))));
}

// --- src/client/components/settings/SettingsWithdrawalPages.tsx ---


function WithdrawSection() {
    return (h("div", { className: "withdraw-form bg-white border border-slate-200 rounded-xl p-4 space-y-4" },
        h("div", { className: "withdraw-balance flex items-center justify-between pb-3 border-b border-slate-100" },
            h("div", null,
                h("span", { className: "text-[11px] font-semibold text-slate-400 block" }, "Available Balance"),
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
            h("label", { for: "wAccount", className: "text-xs font-bold text-slate-700 mb-1 block", id: "wAccountLabel" }, "Account ID"),
            h("input", { className: "w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600", id: "wAccount", placeholder: "Enter Account / Wallet ID" })),
        h("div", null,
            h("div", { className: "flex items-center justify-between mb-1" },
                h("label", { for: "wAmount", className: "text-xs font-bold text-slate-700" }, "Amount (Coins)"),
                h("button", { type: "button", className: "text-[11px] font-extrabold text-blue-600", onClick: () => window.setWithdrawAmount('MAX') }, "MAX")),
            h("input", { className: "w-full px-3 py-2 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600", id: "wAmount", type: "number", placeholder: "Enter coins amount", onInput: () => window.updateWithdrawPreview() }),
            h("div", { className: "flex items-center justify-between text-xs pt-2" },
                h("span", { className: "text-slate-400 font-medium" }, "Receive"),
                h("b", { className: "text-slate-900 font-extrabold", id: "wReceivePreview" }, "NPR 0.00"))),
        h("button", { type: "button", id: "withdrawBtn", className: "w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg transition", onClick: () => window.withdraw() }, "Withdraw"),
        h("div", { className: "hidden" },
            h("span", { id: "coins" }, "0"),
            h("span", { id: "total" }, "0"),
            h("span", { id: "wAllowedCountriesBar" }),
            h("span", { id: "wqStatusBadge" }),
            h("span", { id: "wqAds" }),
            h("span", { id: "wqTasks" }),
            h("span", { id: "wqDaily" }))));
}
function SettingsWithdrawalPages() {
    return h("div", { className: "settings-pages" },
        h("div", { id: "sub-history", className: "settings-subpage" },
            h(SubpageTopBar, { title: "My Activity" }),
            h("div", { className: "screen-content pb-6" },
                h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100", id: "wHistory" }))),
        h("div", { id: "sub-withdraw", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Withdraw Rewards" }),
            h("div", { className: "screen-content space-y-4 pb-6" },
                h(WithdrawSection, null),
                h("div", null,
                    h("div", { className: "text-xs font-extrabold text-slate-700 mb-2 px-0.5" }, "Withdrawal History"),
                    h("div", { className: "bg-white border border-slate-200 rounded-xl divide-y divide-slate-100", id: "wWithdrawHistory" })))));
}

// --- src/client/components/settings/SettingsHelpPages.tsx ---


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
        a: 'Your current conversion rate and minimum are shown on the Withdrawal screen.'
    },
    {
        q: 'Why do completed tasks disappear?',
        a: 'Once a task is verified, it clears from your active list. Daily or resettable tasks appear again automatically when ready.'
    },
    {
        q: 'How does the referral reward work?',
        a: 'You receive the referral bonus when your invited friend meets the qualification targets, plus 10% of their task earnings.'
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
function SettingsHelpPages() {
    return h("div", { className: "settings-pages" },
        h("div", { id: "sub-privacy", className: "settings-subpage" },
            h(SubpageTopBar, { title: "Data & Privacy" }),
            h("div", { className: "screen-content" },
                h("div", { className: "card" },
                    h("h2", null, "Account information"),
                    h("p", { className: "small" }, "Paiso uses your Telegram identity to connect your rewards, completed tasks, referrals and withdrawal requests to your account. Verification details are used for account verification."),
                    h("p", { className: "small" }, "For questions about your information or a deletion request, contact support."),
                    h("button", { className: "primary-btn", onClick: () => window.openSupport() }, "Contact Support")))),
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
                    h("p", { className: "text-[11px] text-slate-500 leading-relaxed mt-1" }, sec.body))))))));
}

// --- src/client/components/SettingsView.tsx ---
function SettingsView() {
    return h("section", { id: "tab-wallet", className: "app-screen settings-screen", "aria-label": "Settings" },
        h(SettingsMenu, null));
}
function SettingsOverlays({ children }) {
    return h("div", { id: "settingsLayer", className: "settings-screen settings-overlay-layer", onKeyDown: (event) => {
            if (event.key === 'Escape')
                window.closeSettingPage();
        } },
        h(SettingsAccountPages, null),
        h(SettingsWithdrawalPages, null),
        h(SettingsHelpPages, null),
        children);
}

// --- src/client/components/BottomNav.tsx ---
function BottomNav() {
    return h("nav", { className: "bottom-nav", "aria-label": "Main navigation" },
        h("div", { className: "bottom-nav-items" },
            h("span", { className: "nav-active-pill", "aria-hidden": "true" }),
            h("button", { type: "button", "data-tab": "home", "aria-label": "Home", className: "active", "aria-current": "page", onClick: () => window.showTab('home') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "home" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Home")),
            h("button", { type: "button", "data-tab": "tasks", "aria-label": "Tasks", onClick: () => window.showTab('tasks', 'all') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "tasks" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Tasks")),
            h("button", { type: "button", "data-tab": "refer", "aria-label": "Invite", onClick: () => window.showTab('refer') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "friends" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Invite")),
            h("button", { type: "button", "data-tab": "wallet", "aria-label": "Settings", onClick: () => window.showTab('wallet') },
                h("span", { className: "nav-icon" },
                    h(UiIcon, { name: "settings" })),
                h("span", { className: "nav-label", "aria-hidden": "true" }, "Settings"))),
        h("button", { type: "button", className: "nav-reward", "aria-label": "Withdraw rewards", title: "Withdraw rewards", onClick: () => { window.showTab('wallet'); window.openSettingPage('sub-withdraw'); } },
            h("span", { className: "nav-icon" },
                h(UiIcon, { name: "wallet" }))));
}

// --- src/client/app.tsx ---














function NotificationModal() {
    return (h("div", { id: "notifModal", role: "dialog", "aria-modal": "true", "aria-labelledby": "notificationsTitle", className: "fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-[2px] hidden items-end sm:items-center justify-center p-0 sm:p-4", onKeyDown: (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeNotificationsModal();
                return;
            }
            if (event.key !== 'Tab')
                return;
            const buttons = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled)'));
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }, onClick: (e) => {
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
                        h("h3", { id: "notificationsTitle", className: "text-sm font-extrabold text-slate-900 leading-tight" }, "Notifications"),
                        h("p", { className: "text-[11px] text-slate-500 font-medium", id: "notifSubHeader" }, "Activity & Admin updates"))),
                h("div", { className: "flex items-center gap-1.5" },
                    h("button", { type: "button", onClick: () => clearAllNotifications(), className: "px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition" }, "Clear All"),
                    h("button", { type: "button", onClick: () => closeNotificationsModal(), "aria-label": "Close notifications", className: "w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center transition" }, "\u2715"))),
            h("div", { id: "notifList", className: "flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#F8FAFC]" }))));
}
function PaisoApp() {
    return (h("div", { className: "app-shell" },
        h(SvgSpriteDefs, null),
        h(FeedbackToast, null),
        h(NotificationModal, null),
        h(GameModal, null),
        h(DailyCheckInModal, null),
        h(SettingsOverlays, null,
            h(TaskListPage, null)),
        h("main", { className: "app-viewport" },
            h(HomeView, null),
            h(TasksView, null),
            h(OffersView, null),
            h("section", { id: "tab-games", className: "app-screen" },
                h("div", { className: "screen-content" },
                    h(GamesView, null))),
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
let taskSearchQuery = '';
let isDailyClaiming = false;
let isWithdrawing = false;
let startingGameId = null;
let renderedGamesKey = '';
const claimingTaskIds = new Set();
let AdController = null;
let renderedTasksKey = '';
let renderedMethodsKey = '';
let dailyCountdownTimer;
let lastTopNotifId = null;
const activeTimers = {};
const COIN_SVG = `<svg width="14" height="14" style="vertical-align:-2px"><use href="#icon-p-coin"/></svg>`;
const DUMMY_AVATARS = [
    `<span class="reference-art reference-avatar" role="img" aria-label="Dog avatar"></span>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av1)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#60A5FA"/><circle cx="32" cy="27" r="11" fill="#FDE68A"/><path d="M21 25c0-7 5-12 11-12s11 5 11 12v3H21v-3z" fill="#1E293B"/><path d="M18 27a14 14 0 0 1 28 0" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/><rect x="15" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><rect x="44" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><circle cx="28" cy="28" r="1.6" fill="#0F172A"/><circle cx="36" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2 1.8 5 1.8 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#6D28D9"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av2)"/><path d="M13 58c3-12 10-17 19-17s16 5 19 17" fill="#F43F5E"/><circle cx="32" cy="27" r="11" fill="#FED7AA"/><path d="M20 22c2-6 7-9 12-9s10 3 12 9c-4-2-8-2-12-2s-8 0-12 2z" fill="#311042"/><rect x="22" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><rect x="33" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><line x1="31" y1="26.5" x2="33" y2="26.5" stroke="#0F172A" stroke-width="2"/><path d="M29 33.5c2 1.4 4.5 1.4 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av3)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#064E3B"/><circle cx="32" cy="29" r="10.5" fill="#FDE68A"/><polygon points="21,20 25,12 32,17 39,12 43,20" fill="#FBBF24" stroke="#F59E0B" stroke-width="1"/><circle cx="28.5" cy="28.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28.5" r="1.6" fill="#0F172A"/><path d="M29 34c2 1.6 4.5 1.6 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#EA580C"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av4)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#1E293B"/><circle cx="32" cy="28" r="10.5" fill="#FFEDD5"/><path d="M21 23c0-6 5-10 11-10s11 4 11 10H21z" fill="#2563EB"/><rect x="19" y="21" width="28" height="3.5" rx="1.7" fill="#1D4ED8"/><circle cx="28.5" cy="28" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2.2 1.6 4.8 1.6 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#0E7490"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av5)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#0F172A"/><circle cx="32" cy="27" r="11" fill="#1E293B"/><rect x="22" y="23" width="20" height="7" rx="3.5" fill="#FDE68A"/><circle cx="28" cy="26.5" r="1.7" fill="#0F172A"/><circle cx="36" cy="26.5" r="1.7" fill="#0F172A"/><path d="M21 20h22" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EC4899"/><stop offset="100%" stop-color="#BE185D"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av6)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#FBCFE8"/><path d="M19 30c0-9 6-15 13-15s13 6 13 15c0 4-1 8-3 10H22c-2-2-3-6-3-10z" fill="#4C1D95"/><circle cx="32" cy="28" r="10" fill="#FDE68A"/><circle cx="28.5" cy="27.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="27.5" r="1.6" fill="#0F172A"/><path d="M29 32.5c2 1.6 4.5 1.6 6 0" fill="none" stroke="#E11D48" stroke-width="1.8" stroke-linecap="round"/></svg>`
];
let currentAvatarIndex = 0;
function renderDummyAvatar(idx = currentAvatarIndex) {
    const box = $('settingsAvatarBox');
    if (box) {
        box.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
    }
    for (const avatar of document.querySelectorAll('.profile-avatar-art')) {
        avatar.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
    }
}
function randomizeAvatar() {
    tg?.HapticFeedback?.impactOccurred?.('light');
    currentAvatarIndex = (currentAvatarIndex + 1 + Math.floor(Math.random() * (DUMMY_AVATARS.length - 1))) % DUMMY_AVATARS.length;
    renderDummyAvatar(currentAvatarIndex);
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
    showFeedback(msg, type);
    if (type !== 'info')
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
    const header = document.querySelector('.app-header');
    if (header)
        header.hidden = name !== 'home';
    const tabs = ['home', 'tasks', 'refer', 'wallet', 'games', 'offers'];
    tabs.forEach((t) => {
        const sec = $(`tab-${t}`);
        if (sec) {
            sec.classList.toggle('active-screen', t === name);
            if (t === name)
                sec.scrollTop = 0;
        }
    });
    document.querySelectorAll('nav.bottom-nav button').forEach((btn) => {
        const active = btn.dataset.tab === name || (name === 'offers' && btn.dataset.tab === 'tasks') || (name === 'games' && btn.dataset.tab === 'home');
        btn.classList.toggle('active', active);
        if (active)
            btn.setAttribute('aria-current', 'page');
        else
            btn.removeAttribute('aria-current');
    });
    closeSettingPage();
    if (name === 'tasks' && taskFilter) {
        taskSearchQuery = '';
        const search = $('taskSearchInput');
        if (search)
            search.value = '';
        setTaskFilter(taskFilter);
    }
    if (name === 'wallet') {
        closeSettingPage();
    }
}
let settingsOpener = null;
function setSettingsBackgroundInert(inert) {
    document.querySelectorAll('.app-shell > .app-viewport, .app-shell > .bottom-nav').forEach(el => {
        el.inert = inert;
    });
}
function openSettingPage(subId) {
    const layer = $('settingsLayer');
    const page = $(subId);
    if (!layer || !page || !layer.contains(page))
        return;
    tg?.HapticFeedback?.impactOccurred?.('light');
    if (!layer.classList.contains('is-open')) {
        settingsOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    layer.querySelectorAll('.settings-subpage').forEach(el => el.classList.toggle('open', el === page));
    layer.classList.add('is-open');
    page.scrollTop = 0;
    setSettingsBackgroundInert(true);
    page.querySelector('.native-back-btn')?.focus({ preventScroll: true });
}
function closeSettingPage() {
    const layer = $('settingsLayer');
    const wasOpen = layer?.classList.contains('is-open');
    if (wasOpen)
        tg?.HapticFeedback?.impactOccurred?.('light');
    document.querySelectorAll('.settings-subpage').forEach((el) => {
        el.classList.remove('open');
    });
    layer?.classList.remove('is-open');
    setSettingsBackgroundInert(false);
    if (wasOpen && settingsOpener?.isConnected && getComputedStyle(settingsOpener).visibility === 'visible') {
        settingsOpener.focus({ preventScroll: true });
    }
    settingsOpener = null;
}
function copyUserId() {
    const uid = state?.user?.id || '';
    if (!uid)
        return;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(uid).then(() => toast(`User ID (${uid}) copied.`)).catch(() => toast('Could not copy your user ID. Please try again.', 'error'));
    }
    else {
        toast(`User ID: ${uid}`, 'info');
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
    document.querySelectorAll('#exploreGrid .explore-card, #exploreGames .explore-game-card').forEach((card) => {
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
function openTaskList(filter = 'all') {
    if (!$('tab-tasks')?.classList.contains('active-screen'))
        showTab('tasks');
    taskSearchQuery = '';
    const search = $('taskSearchInput');
    if (search)
        search.value = '';
    setTaskFilter(filter);
    openSettingPage('sub-task-list');
}
function setTaskFilter(filter) {
    currentTaskFilter = filter;
    const titles = { all: 'All Tasks', video: 'Watch Videos', app_task: 'Complete Offers', play_game: 'Play Games', social_visit: 'Web Tasks', telegram_join: 'Social Tasks', done: 'Completed Tasks' };
    setText('task-list-title', titles[filter]);
    document.querySelectorAll('.filter-chip').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}
function filterTasks(query) {
    taskSearchQuery = (query || '').trim().toLowerCase();
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
    const key = JSON.stringify([methods, countries]);
    if (key === renderedMethodsKey || !grid)
        return;
    renderedMethodsKey = key;
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
    document.querySelectorAll('[data-daily-bonus]').forEach(button => {
        button.disabled = isDailyClaiming || !canDaily;
        const label = button.querySelector('[data-daily-label]');
        if (label)
            label.textContent = isDailyClaiming ? 'Claiming…' : canDaily ? 'Claim Now' : 'Claimed';
    });
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
            btn.disabled = isDailyClaiming;
            btn.classList.remove('claimed-state');
        }
        if (btnIcon)
            btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-gift"/></svg>`;
        if (btnText)
            btnText.textContent = isDailyClaiming ? 'Claiming...' : `Claim Today (+${nextReward})`;
        if (btnCoin)
            btnCoin.style.display = 'inline-block';
        if (subText)
            subText.textContent = `Check in daily to keep your streak!`;
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return;
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
    for (let i = 0; i < 8; i++) {
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
    setText('refActive', hist.filter(r => r.qualified).length);
    setText('refEarned', hist.reduce((sum, r) => sum + (r.qualified ? r.bonusCoins : 0), 0).toLocaleString());
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
function TaskCard({ task, prefix = 'verify' }) {
    const wait = activeTimers[task.id] || 0;
    const started = startedTasks.has(task.id);
    const index = task.type === 'app_task' ? 1 : task.type === 'play_game' ? 2 : /survey/i.test(task.title) ? 4 : 5;
    const category = task.type === 'app_task' ? 'Apps' : task.type === 'play_game' ? 'Games' : task.type === 'telegram_join' ? 'Social' : 'Web';
    return h("article", { className: "task-card" },
        h("div", { className: `task-art task-art-${task.type}` }, task.type === 'telegram_join' ? h("img", { src: "/assets/icon-channels.png", alt: "" }) : h(EarnIcon, { index: index })),
        h("div", { className: "task-copy" },
            h("h2", null, task.title),
            h("p", null, task.description || 'Complete this task to earn coins'),
            h("div", { className: "task-tags" },
                h("span", null, category),
                h("span", null, task.done ? 'Completed' : task.type === 'play_game' ? 'Play' : 'Easy'),
                h("span", null, task.type === 'telegram_join' ? 'Join' : (task.waitSeconds || 15) + ' sec'))),
        h("div", { className: "task-actions" },
            h("span", { className: "reward-pill" },
                h("svg", { width: "14", height: "14" },
                    h("use", { href: "#icon-p-coin" })),
                "+",
                task.reward.toLocaleString()),
            h("button", { id: `${prefix}-${task.id}`, disabled: !!task.done || wait > 0 || claimingTaskIds.has(task.id), onClick: () => { if (started)
                    claimTask(task.id);
                else {
                    startedTasks.add(task.id);
                    doTask(task.id, task.url);
                } }, className: "task-start" }, task.done ? 'Done' : claimingTaskIds.has(task.id) ? 'Checking' : wait > 0 ? wait + 's' : started ? 'Verify' : 'Start')));
}
const startedTasks = new Set();
function renderTasks() {
    if (!state)
        return;
    const all = state.tasks || [];
    const key = JSON.stringify([all, state.ads, currentTaskFilter, taskSearchQuery, [...startedTasks], [...claimingTaskIds], Object.keys(activeTimers)]);
    if (key === renderedTasksKey)
        return;
    renderedTasksKey = key;
    const source = all.filter(t => currentTaskFilter === 'done' ? t.done : !t.done);
    const tasks = source.filter(t => (currentTaskFilter === 'all' || currentTaskFilter === 'done' || t.type === currentTaskFilter) && (!taskSearchQuery || (t.title + ' ' + t.description + ' ' + t.type).toLowerCase().includes(taskSearchQuery)));
    const nodes = tasks.map(task => h(TaskCard, { task: task }));
    if ((currentTaskFilter === 'all' || currentTaskFilter === 'video') && (!taskSearchQuery || 'watch video ads'.includes(taskSearchQuery)) && state.ads) {
        nodes.unshift(h("article", { className: "task-card" },
            h("div", { className: "task-art" },
                h(EarnIcon, { index: 0 })),
            h("div", { className: "task-copy" },
                h("h2", null, "Watch Video Ads"),
                h("p", null, "Watch short videos and earn coins"),
                h("div", { className: "task-tags" },
                    h("span", null, "Video"),
                    h("span", null, "Easy"),
                    h("span", null, "1\u20132 min"))),
            h("div", { className: "task-actions" },
                h("span", { className: "reward-pill" },
                    h("svg", { width: "14", height: "14" },
                        h("use", { href: "#icon-p-coin" })),
                    "+",
                    state.ads.reward),
                h("button", { className: "task-start", disabled: state.ads.watchedToday >= state.ads.dailyCap, onClick: () => watchAd() }, state.ads.watchedToday >= state.ads.dailyCap ? 'Done' : 'Start'))));
    }
    const empty = (title) => h("div", { className: "empty-state" },
        h(EarnIcon, { index: 1 }),
        h("h2", null, title),
        h("p", null, "Try another category or check back for new rewards."));
    $('taskList')?.replaceChildren(...(nodes.length ? nodes : [empty(taskSearchQuery ? 'No matching tasks' : 'No tasks here yet')]));
    const offers = all.filter(t => t.type === 'app_task' && !t.done);
    $('offerList')?.replaceChildren(...(offers.length ? offers.map(task => h(TaskCard, { task: task, prefix: "offer-verify" })) : [empty('New offers are on the way')]));
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
    for (const id of ['notifUnreadBadge', 'homeUnreadBadge']) {
        const badge = $(id);
        if (badge) {
            if (unread > 0) {
                badge.style.display = 'flex';
                badge.textContent = unread > 9 ? '9+' : String(unread);
            }
            else {
                badge.style.display = 'none';
            }
        }
    }
    $('homeNotificationsBtn')?.setAttribute('aria-description', unread > 0 ? `${unread} unread notifications` : 'No unread notifications');
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
let notificationsOpener = null;
function openNotificationsModal() {
    tg?.HapticFeedback?.impactOccurred?.('light');
    const modal = $('notifModal');
    if (modal) {
        notificationsOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setSettingsBackgroundInert(true);
        modal.querySelector('[aria-label="Close notifications"]')?.focus({ preventScroll: true });
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
    setSettingsBackgroundInert(Boolean($('settingsLayer')?.classList.contains('is-open')));
    notificationsOpener?.focus({ preventScroll: true });
    notificationsOpener = null;
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
        const offerButton = $(`offer-verify-${taskId}`);
        if (offerButton) {
            offerButton.disabled = activeTimers[taskId] > 0;
            offerButton.textContent = activeTimers[taskId] > 0 ? `${activeTimers[taskId]}s` : 'Verify';
        }
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
        if (!renderedGamesKey)
            showFeaturedGamesError();
        return;
    }
    if (!state || state.error) {
        if (!renderedGamesKey)
            showFeaturedGamesError();
        if (state?.error)
            toast(state.error, 'error');
        return;
    }
    const u = state.user;
    const fullName = u.verification?.fullName || u.first_name || u.username || 'Paiso User';
    const firstName = (u.first_name?.trim() || u.verification?.fullName?.trim() || u.username || 'there').split(/\s+/)[0];
    setText('homeGreeting', `Hey, ${firstName}`);
    $('homeGreeting')?.setAttribute('title', `Hey, ${firstName}`);
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
    setText('refBonusValue', `+${(state.referralBonusCoins || 500).toLocaleString()}`);
    const refInput = $('refLink');
    if (refInput)
        refInput.value = state.refLink;
    setText('minW', state.minWithdrawCoins.toLocaleString());
    renderReferralsAndQualification();
    renderWithdrawMethodsAndCountries();
    renderTasks();
    renderGames();
    renderNotifications();
    try {
        const hData = await api('/api/my-withdrawals');
        const withdrawals = hData.withdrawals || [];
        const coinNotifs = (state.notifications || []).filter((n) => Boolean(n.coins) && n.type !== 'withdraw');
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
                        h("div", { className: `text-xs font-extrabold flex items-center justify-end gap-1 ${n.coins < 0 ? 'text-amber-600' : 'text-emerald-600'}` },
                            h("span", null,
                                n.coins < 0 ? '−' : '+',
                                Math.abs(n.coins || 0).toLocaleString()),
                            h("svg", { width: "13", height: "13", className: "inline-block" },
                                h("use", { href: "#icon-p-coin" }))),
                        h("span", { className: `status-badge ${n.coins < 0 ? 'status-pending' : 'status-paid'}` }, n.coins < 0 ? 'SPENT' : 'CREDITED'))));
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
    if (claimingTaskIds.has(id))
        return;
    claimingTaskIds.add(id);
    renderTasks();
    try {
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
    catch {
        toast('Network error. Please try again.', 'error');
    }
    finally {
        claimingTaskIds.delete(id);
        renderTasks();
    }
}
function renderGames() {
    if (!state)
        return;
    const games = state.games || [];
    const key = JSON.stringify([startingGameId, games.map(({ id, title, priceCoins }) => [id, title, priceCoins])]);
    if (key === renderedGamesKey)
        return;
    renderedGamesKey = key;
    const empty = h("div", { className: "empty-state" },
        h(EarnIcon, { index: 2 }),
        h("h2", null, "Games coming soon"),
        h("p", null, "New games will appear here when published."));
    $('gamesGrid')?.replaceChildren(...(games.length ? games.map(game => h(GameCard, { game: game, pending: startingGameId === game.id })) : [empty]));
    updateFeaturedGames(games, startingGameId);
}
async function playGame(id) {
    if (startingGameId)
        return;
    const game = state?.games?.find((item) => item.id === id);
    if (!game || !state)
        return;
    if (state.user.coins < game.priceCoins) {
        toast(`You need ${game.priceCoins.toLocaleString()} coins to play this game.`, 'warning');
        return;
    }
    startingGameId = id;
    renderGames();
    try {
        const result = await api(`/api/games/${encodeURIComponent(id)}/play`, {
            method: 'POST',
            body: '{}'
        });
        if (!result.ok || !result.playUrl) {
            toast(result.error || 'Could not start this game.', 'warning');
            return;
        }
        state.user.coins = result.coins ?? state.user.coins;
        setText('headerCoins', state.user.coins.toLocaleString());
        setText('wCoins', state.user.coins.toLocaleString());
        setText('npr', (state.user.coins / state.coinPerNpr).toFixed(2));
        const gameTitle = $('activeGameTitle');
        if (gameTitle)
            gameTitle.textContent = game.title;
        const frame = $('gameFrame');
        const modal = $('gameModal');
        if (frame && modal) {
            frame.src = result.playUrl;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
        toast(game.priceCoins ? `${game.priceCoins.toLocaleString()} coins used. Have fun!` : 'Game started. Have fun!', 'success');
    }
    catch {
        toast('Network error. Your balance was not charged.', 'error');
    }
    finally {
        startingGameId = null;
        renderGames();
    }
}
function closeGame() {
    const frame = $('gameFrame');
    if (frame)
        frame.src = 'about:blank';
    const modal = $('gameModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}
async function watchAd() {
    if (!window.Adsgram || !state?.ads?.blockId) {
        toast("Videos are not available yet. Please try again shortly.", 'warning');
        return;
    }
    if (state.ads.watchedToday >= state.ads.dailyCap) {
        toast("You've reached today's video limit. Come back tomorrow.", 'warning');
        return;
    }
    const before = state.ads.watchedToday || 0;
    try {
        if (!AdController) {
            AdController = window.Adsgram.init({ blockId: String(state.ads.blockId) });
        }
        const result = await AdController.show();
        if (result && result.done === false) {
            toast("Watch the full video to receive your reward.", 'warning');
            return;
        }
        toast('Video completed. Confirming your reward…', 'info');
        for (let i = 0; i < 4; i++) {
            await new Promise((r) => window.setTimeout(r, 3000));
            await load();
            if ((state.ads?.watchedToday || 0) > before) {
                toast(`Video reward received. +${state.ads.reward} coins added.`, 'success');
                return;
            }
        }
        toast('Your reward is still being confirmed. Your balance will update when it arrives.', 'info');
    }
    catch {
        toast("No video is available right now. Please try again later.", 'warning');
    }
}
async function claimDaily() {
    if (isDailyClaiming || !state?.canDaily)
        return;
    isDailyClaiming = true;
    renderDailyCheckin();
    const btn = $('dailyBtn');
    if (btn)
        btn.disabled = true;
    try {
        const r = await api('/api/daily', {
            method: 'POST',
            body: '{}'
        });
        if (r.ok) {
            const claimedDay = r.dailyStreak || 1;
            const reward = r.reward || 100;
            triggerClaimAnimation(claimedDay, reward);
            toast(`Day ${claimedDay} complete. +${reward} coins added.`, 'success');
        }
        else {
            toast(r.error || "Today's reward has already been claimed.", 'warning');
        }
    }
    catch {
        toast('Network error. Please try again.', 'error');
    }
    finally {
        isDailyClaiming = false;
        await load();
    }
}
function copyRef() {
    const input = $('refLink');
    if (!input)
        return;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(input.value).then(() => toast("Referral link copied.")).catch(() => toast('Could not copy the link. Please try again.', 'error'));
    }
    else {
        input.select();
        if (document.execCommand('copy'))
            toast("Referral link copied.");
        else
            toast('Could not copy the link. Please select and copy it manually.', 'error');
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
        toast("Enter your full name.", 'warning');
        return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Enter a valid email address.", 'warning');
        return;
    }
    if (!dob) {
        toast("Select your date of birth.", 'warning');
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
        toast("Enter the 6-digit verification code.", 'warning');
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
        toast("Your profile is verified. Your verification badge is now active.", 'success');
        await load();
    }
    finally {
        if (btn)
            btn.disabled = false;
    }
}
async function withdraw() {
    if (isWithdrawing)
        return;
    const methodEl = $('wMethod');
    const accEl = $('wAccount');
    const amtEl = $('wAmount');
    if (!methodEl || !accEl || !amtEl)
        return;
    const amount = Math.floor(Number(amtEl.value));
    if (!methodEl.value)
        return toast('Choose a payout method first', 'warning');
    if (accEl.value.trim().length < 5)
        return toast('Enter a valid payout account or ID (at least 5 characters)', 'warning');
    if (!Number.isFinite(amount) || amount <= 0)
        return toast('Enter a valid coin amount', 'warning');
    if (amount < (state?.minWithdrawCoins || 0))
        return toast(`Minimum withdrawal is ${state?.minWithdrawCoins.toLocaleString()} coins`, 'warning');
    if (amount > (state?.user.coins || 0))
        return toast('Amount is higher than your balance', 'warning');
    isWithdrawing = true;
    const btn = $('withdrawBtn');
    const originalText = btn?.textContent || 'Submit Withdrawal';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitting...';
    }
    try {
        const r = await api('/api/withdraw', {
            method: 'POST',
            body: JSON.stringify({ method: methodEl.value, account: accEl.value.trim(), amountCoins: amount })
        });
        if (r.ok) {
            toast("Withdrawal request submitted. Track its status in History.", 'success');
            accEl.value = '';
            amtEl.value = '';
            updateWithdrawPreview();
        }
        else {
            toast(r.error || 'Withdraw request failed', 'error');
        }
    }
    catch {
        toast('Network error. Please try again.', 'error');
    }
    finally {
        isWithdrawing = false;
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
        await load();
    }
}
window.showTab = showTab;
window.filterExplore = filterExplore;
window.filterTasks = filterTasks;
window.clearSearch = clearSearch;
window.setTaskFilter = setTaskFilter;
window.openTaskList = openTaskList;
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
window.playGame = playGame;
window.closeGame = closeGame;
window.watchAd = watchAd;
window.claimDaily = claimDaily;
window.openDailyCheckin = () => {
    const dialog = document.getElementById('dailyCheckinModal');
    if (!dialog.open)
        dialog.showModal();
    const button = document.getElementById('dailyBtn');
    if (!button.disabled)
        button.focus();
};
window.closeDailyCheckin = () => document.getElementById('dailyCheckinModal').close();
window.openDailySpin = () => {
    const spin = state?.games.find(game => game.enabled && /spin|wheel/i.test(game.title));
    if (spin) {
        void playGame(spin.id);
        return;
    }
    toast("Daily Spin isn't available yet. Check back soon.", 'warning');
};
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
