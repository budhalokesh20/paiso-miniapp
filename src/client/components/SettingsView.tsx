import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

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

function WithdrawSection() {
  return (
    <div className="withdraw-form bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      {/* 1. Simple Balance & Min Withdraw Row */}
      <div className="withdraw-balance flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Available Balance</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="18" height="18" className="shrink-0">
              <use href="#icon-p-coin" />
            </svg>
            <span className="text-lg font-extrabold text-slate-900" id="wCoins">
              0
            </span>
            <span className="text-xs font-bold text-slate-500">
              (NPR <span id="npr">0.00</span>)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 block">Minimum</span>
          <b className="text-xs font-extrabold text-slate-800">
            <span id="minW">10,000</span> Coins
          </b>
        </div>
      </div>

      {/* 2. Payment Method */}
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2">Method</div>
        <div className="grid grid-cols-2 gap-2" id="wMethodsGrid" />
        <input type="hidden" id="wMethod" value="" />
      </div>

      {/* 3. Account ID */}
      <div>
        <div className="text-xs font-bold text-slate-700 mb-1" id="wAccountLabel">
          Account ID
        </div>
        <input
          className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          id="wAccount"
          placeholder="Enter Account / Wallet ID"
        />
      </div>

      {/* 4. Amount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-700">Amount (Coins)</span>
          <button
            type="button"
            className="text-[11px] font-extrabold text-blue-600"
            onClick={() => window.setWithdrawAmount('MAX')}
          >
            MAX
          </button>
        </div>

        <input
          className="w-full px-3 py-2 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          id="wAmount"
          type="number"
          placeholder="Enter coins amount"
          onInput={() => window.updateWithdrawPreview()}
        />

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-slate-400 font-medium">Receive</span>
          <b className="text-slate-900 font-extrabold" id="wReceivePreview">
            NPR 0.00
          </b>
        </div>
      </div>

      {/* 5. Submit Button */}
      <button
        type="button"
        id="withdrawBtn"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg transition"
        onClick={() => window.withdraw()}
      >
        Withdraw
      </button>

      {/* Hidden state placeholders */}
      <div className="hidden">
        <span id="coins">0</span>
        <span id="total">0</span>
        <span id="wAllowedCountriesBar" />
        <span id="wqStatusBadge" />
        <span id="wqAds" />
        <span id="wqTasks" />
        <span id="wqDaily" />
      </div>
    </div>
  );
}

function SubpageTopBar(props: { title: string }) {
  return (
    <div className="native-subpage-bar">
      <button type="button" className="native-back-btn" onClick={() => window.closeSettingPage()}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Settings</span>
      </button>
      <h3 className="native-subpage-title">{props.title}</h3>
      <div style={{ width: '72px' }} />
    </div>
  );
}

function SettingRow({icon, title, action, detail}: {icon: string; title: string; action: () => void; detail?: any}) {
  return <button className="settings-row" onClick={action}><span className="settings-item-left"><UiIcon name={icon} size={18} /><span className="settings-item-title">{title}</span></span><span className="settings-row-right"><span className="settings-detail">{detail}</span><UiIcon name="chevron" size={13} /></span></button>;
}

export function SettingsView() {
  return (
    <section id="tab-wallet" className="app-screen">
      <div className="screen-content" id="settings-menu-view">
        <div className="settings-profile"><button className="settings-avatar-wrap" id="settingsAvatarBtn" onClick={() => window.randomizeAvatar()} aria-label="Change avatar"><div className="settings-avatar-ring" id="settingsAvatarBox" /></button><button className="profile-details" onClick={() => window.openSettingPage('sub-userid')}><b id="settingsHeaderName">Paiso User</b><span id="settingsHeaderHandle">@paiso_user</span><span id="settingsVerifiedTick" style="display:none"><svg width="16" height="16"><use href="#icon-blue-tick" /></svg></span></button><UiIcon name="chevron" size={16} /></div>
        <h2 className="settings-group-label">Account</h2><div className="settings-group-card">
          <SettingRow icon="user" title="Edit Profile" action={() => window.openSettingPage('sub-verify')} />
          <SettingRow icon="shield" title="Verification" action={() => window.openSettingPage('sub-verify')} detail={<span id="verifyMenuBadge">Unverified</span>} />
          <SettingRow icon="wallet" title="Withdraw Rewards" action={() => window.openSettingPage('sub-withdraw')} />
          <SettingRow icon="tasks" title="Transaction History" action={() => window.openSettingPage('sub-history')} />
        </div>
        <h2 className="settings-group-label">Preferences</h2><div className="settings-group-card">
          <SettingRow icon="bell" title="Notifications" action={() => window.openNotificationsModal()} detail={<span id="notifUnreadBadge" style="display:none">0</span>} />
          <SettingRow icon="shield" title="Data & Privacy" action={() => window.openSettingPage('sub-privacy')} />
          <SettingRow icon="globe" title="Language" action={() => window.openSettingPage('sub-language')} detail="English" />
        </div>
        <h2 className="settings-group-label">Help & Support</h2><div className="settings-group-card">
          <SettingRow icon="help" title="Help Center" action={() => window.openSettingPage('sub-faq')} />
          <SettingRow icon="user" title="Contact Support" action={() => window.openSettingPage('sub-support')} />
          <SettingRow icon="tasks" title="Terms of Service" action={() => window.openSettingPage('sub-terms')} />
          <SettingRow icon="shield" title="Privacy Information" action={() => window.openSettingPage('sub-privacy')} />
        </div>
        <h2 className="settings-group-label">About</h2><div className="settings-group-card">
          <SettingRow icon="share" title="Share Paiso" action={() => window.shareRef()} />
          <div className="settings-row"><span className="settings-item-left"><UiIcon name="help" size={18} /><span>Version</span></span><span className="settings-detail">1.0.0</span></div>
        </div><div hidden><span id="userIdText" /><span id="verifyMenuSub" /></div>
      </div>
      <div id="sub-privacy" className="settings-subpage"><SubpageTopBar title="Data & Privacy" /><div className="screen-content"><div className="card"><h2>Account information</h2><p className="small">Paiso uses your Telegram identity to connect your rewards, completed tasks, referrals and withdrawal requests to your account. Verification details are used for account verification.</p><p className="small">For questions about your information or a deletion request, contact support.</p><button className="primary-btn" onClick={() => window.openSupport()}>Contact Support</button></div></div></div>
      <div id="sub-language" className="settings-subpage"><SubpageTopBar title="Language" /><div className="screen-content"><div className="card"><h2>English</h2><p className="small">English is the currently available app language.</p></div></div></div>
      {/* Slide-in Fullscreen Sub-Page 1: User ID */}
      <div id="sub-userid" className="settings-subpage">
        <SubpageTopBar title="User ID" />
        <div className="screen-content">
          <div className="card">
            <div className="uid-detail-row">
              <span className="small">Account Name</span>
              <b id="uname">User</b>
            </div>
            <div className="uid-detail-row" style={{ marginTop: '8px' }}>
              <span className="small">Telegram User ID</span>
              <b id="uidFullText">---</b>
            </div>
            <button
              type="button"
              className="primary-btn btn-with-icon"
              style={{ marginTop: '16px' }}
              onClick={() => window.copyUserId()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy User ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page: Verification (Blue Tick) */}
      <div id="sub-verify" className="settings-subpage">
        <SubpageTopBar title="Verification" />
        <div className="screen-content">
          {/* Verified State Card (shown once verified) */}
          <div className="card verify-done-card" id="verifyDoneCard" style={{ display: 'none' }}>
            <div className="verify-seal-wrap">
              <svg width="54" height="54">
                <use href="#icon-blue-tick" />
              </svg>
            </div>
            <h3 className="verify-done-title">Verified Profile</h3>
            <p className="verify-done-sub">Your identity is verified. Blue Tick is active on your profile.</p>
            <div className="verify-details-list">
              <div className="uid-detail-row">
                <span className="small">Full Name</span>
                <b id="verifiedNameText">---</b>
              </div>
              <div className="uid-detail-row">
                <span className="small">Email</span>
                <b id="verifiedEmailText">---</b>
              </div>
              <div className="uid-detail-row">
                <span className="small">Date of Birth</span>
                <b id="verifiedDobText">---</b>
              </div>
              <div className="uid-detail-row">
                <span className="small">Gender</span>
                <b id="verifiedGenderText">---</b>
              </div>
            </div>
          </div>

          {/* Unverified Form Card */}
          <div className="card" id="verifyFormCard">
            <div className="verify-banner-head">
              <div className="verify-banner-icon">
                <svg width="28" height="28">
                  <use href="#icon-blue-tick" />
                </svg>
              </div>
              <div>
                <div className="verify-banner-title">Get Verified Blue Tick</div>
                <div className="verify-banner-sub">Complete your profile details &amp; confirm Telegram OTP</div>
              </div>
            </div>

            <div className="verify-field-label">Full Name</div>
            <input className="form-input" id="vFullName" type="text" placeholder="Enter your full name" />

            <div className="verify-field-label">Email Address (optional)</div>
            <input className="form-input" id="vEmail" type="email" placeholder="you@example.com" />

            <div className="verify-field-label">Date of Birth</div>
            <input className="form-input" id="vDob" type="date" />

            <div className="verify-field-label">Gender</div>
            <div className="gender-pills">
              <button
                type="button"
                className="gender-pill active"
                id="genderMaleBtn"
                onClick={() => window.selectGender('Male')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="10" cy="14" r="5" />
                  <line x1="19" y1="5" x2="13.6" y2="10.4" />
                  <polyline points="15 5 19 5 19 9" />
                </svg>
                <span>Male</span>
              </button>
              <button
                type="button"
                className="gender-pill"
                id="genderFemaleBtn"
                onClick={() => window.selectGender('Female')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="9" r="5" />
                  <line x1="12" y1="14" x2="12" y2="21" />
                  <line x1="9" y1="18" x2="15" y2="18" />
                </svg>
                <span>Female</span>
              </button>
            </div>
            <input type="hidden" id="vGender" value="Male" />

            <button
              type="button"
              className="primary-btn btn-with-icon"
              id="sendOtpBtn"
              onClick={() => window.sendVerifyOtp()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span id="sendOtpBtnText">Send OTP to Telegram</span>
            </button>

            {/* Step 2: OTP Confirmation Section */}
            <div className="verify-otp-box" id="verifyOtpBox" style={{ display: 'none' }}>
              <div className="verify-otp-divider" />
              <div className="verify-otp-info">
                Enter the 6-digit verification code sent to <b id="otpTargetEmail">your Telegram chat</b>
              </div>
              <input
                className="form-input otp-code-input"
                id="vOtpInput"
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
              <button
                type="button"
                className="primary-btn btn-with-icon verify-confirm-btn"
                id="confirmOtpBtn"
                onClick={() => window.confirmVerifyOtp()}
              >
                <svg width="17" height="17">
                  <use href="#icon-blue-tick" />
                </svg>
                <span>Confirm OTP &amp; Verify</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 2: Transaction History */}
      <div id="sub-history" className="settings-subpage">
        <SubpageTopBar title="Transaction History" />
        <div className="screen-content pb-6">
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100" id="wHistory" />
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 3: Simple Withdrawal + Transaction History */}
      <div id="sub-withdraw" className="settings-subpage">
        <SubpageTopBar title="Withdraw Rewards" />
        <div className="screen-content space-y-4 pb-6">
          <WithdrawSection />

          <div>
            <div className="text-xs font-extrabold text-slate-700 mb-2 px-0.5">Transaction History</div>
            <div
              className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100"
              id="wWithdrawHistory"
            />
          </div>
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 4: Support */}
      <div id="sub-support" className="settings-subpage">
        <SubpageTopBar title="Support" />
        <div className="screen-content">
          <div className="card">
            <p className="small" style={{ lineHeight: '1.55', marginBottom: '14px' }}>
              Need help with your account, tasks, or withdrawal request? Contact our official support team directly on
              Telegram.
            </p>
            <button type="button" className="primary-btn btn-with-icon" onClick={() => window.openSupport()}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Contact Telegram Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 5: FAQ */}
      <div id="sub-faq" className="settings-subpage">
        <SubpageTopBar title="FAQ" />
        <div className="screen-content space-y-3 pb-6">
          {/* Modular Step-by-Step Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-extrabold text-slate-900 mb-3">How It Works</div>
            <div className="space-y-3">
              {FAQ_STEPS.map((item) => (
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modular Questions List */}
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {FAQ_LIST.map((item) => (
              <div className="p-3.5">
                <div className="text-xs font-bold text-slate-900">{item.q}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 6: Terms & Conditions */}
      <div id="sub-terms" className="settings-subpage">
        <SubpageTopBar title="Terms & Conditions" />
        <div className="screen-content pb-6">
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {TERMS_SECTIONS.map((sec) => (
              <div className="p-3.5">
                <div className="text-xs font-bold text-slate-900">{sec.title}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
