import { h } from '../../jsx';
import { SubpageTopBar } from './SettingsParts';
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
export function SettingsHelpPages() {
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
