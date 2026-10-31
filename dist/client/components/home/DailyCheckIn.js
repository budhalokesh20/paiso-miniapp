import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
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
export function DailyCheckIn() {
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
export function DailyCheckInModal() {
    return h("dialog", { id: "dailyCheckinModal", className: "home-checkin-dialog", "aria-labelledby": "daily-title", onClick: (event) => { if (event.target === event.currentTarget)
            window.closeDailyCheckin(); } },
        h("div", { className: "checkin-dialog-content" },
            h("button", { className: "checkin-close", "aria-label": "Close daily check-in", onClick: () => window.closeDailyCheckin() }, "\u00D7"),
            h(DailyCheckIn, null),
            h("p", { className: "checkin-note" }, "Your daily check-in includes today's bonus.")));
}
