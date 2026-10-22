import { h } from '../jsx';

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

export function SettingsView() {
  return (
    <section id="tab-wallet" className="app-screen">
      {/* Main Settings Header with Random Dummy Avatar & User Name */}
      <div className="native-topbar settings-header-bar">
        <div className="settings-header-user">
          <button
            type="button"
            className="settings-avatar-wrap"
            id="settingsAvatarBtn"
            title="Tap to change avatar"
            onClick={() => window.randomizeAvatar()}
          >
            <div className="settings-avatar-ring" id="settingsAvatarBox" />
            <span className="settings-avatar-status" />
          </button>
          <div className="settings-user-meta">
            <div className="settings-user-name-row">
              <span className="settings-user-name" id="settingsHeaderName">
                Paiso User
              </span>
              <span className="blue-tick-badge" id="settingsVerifiedTick" style={{ display: 'none' }} title="Verified Account">
                <svg width="18" height="18">
                  <use href="#icon-blue-tick" />
                </svg>
              </span>
            </div>
            <div className="settings-user-handle" id="settingsHeaderHandle">
              @user
            </div>
          </div>
        </div>
        <div className="settings-header-badge">
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Settings</span>
        </div>
      </div>

      <div className="screen-content" id="settings-menu-view">
        <div className="settings-group-label">ACCOUNT &amp; WALLET</div>
        <div className="settings-group-card">
          {/* 1. User ID */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-userid')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-blue">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="9" cy="10" r="2" />
                  <path d="M15 8h2" />
                  <path d="M15 12h2" />
                  <path d="M7 16h10" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">User ID</div>
                <div className="settings-item-sub">
                  ID: #<span id="userIdText">---</span>
                </div>
              </div>
            </div>
            <span className="settings-chevron">›</span>
          </button>

          {/* 2. Verification (Blue Tick) */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-verify')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-sky">
                <svg width="20" height="20">
                  <use href="#icon-blue-tick" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">Verification</div>
                <div className="settings-item-sub" id="verifyMenuSub">
                  Verify email &amp; details for Blue Tick
                </div>
              </div>
            </div>
            <div className="settings-row-right">
              <span className="verify-status-pill unverified" id="verifyMenuBadge">
                Unverified
              </span>
              <span className="settings-chevron">›</span>
            </div>
          </button>

          {/* 2. Transaction History */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-history')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-amber">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">Transaction History</div>
                <div className="settings-item-sub">Your withdrawal requests &amp; status</div>
              </div>
            </div>
            <span className="settings-chevron">›</span>
          </button>

          {/* 3. Withdrawal */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-withdraw')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-green">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">Withdrawal</div>
                <div className="settings-item-sub">Redeem coins to eSewa, Khalti, USDT</div>
              </div>
            </div>
            <span className="settings-chevron">›</span>
          </button>
        </div>

        <div className="settings-group-label" style={{ marginTop: '18px' }}>
          HELP &amp; INFORMATION
        </div>
        <div className="settings-group-card">
          {/* 4. Support */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-support')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-purple">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">Support</div>
                <div className="settings-item-sub">Get help with tasks or withdrawals</div>
              </div>
            </div>
            <span className="settings-chevron">›</span>
          </button>

          {/* 5. FAQ */}
          <button type="button" className="settings-row" onClick={() => window.openSettingPage('sub-faq')}>
            <div className="settings-item-left">
              <div className="settings-icon-box icon-teal">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div className="settings-item-title">FAQ</div>
                <div className="settings-item-sub">Frequently asked questions</div>
              </div>
            </div>
            <span className="settings-chevron">›</span>
          </button>
        </div>
      </div>

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
            <p className="verify-done-sub">Your identity &amp; email are verified. Blue Tick is active on your profile.</p>
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
                <div className="verify-banner-sub">Complete your profile details &amp; confirm Email OTP</div>
              </div>
            </div>

            <div className="verify-field-label">Full Name</div>
            <input className="form-input" id="vFullName" type="text" placeholder="Enter your full name" />

            <div className="verify-field-label">Email Address</div>
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
              <span id="sendOtpBtnText">Send OTP to Email</span>
            </button>

            {/* Step 2: OTP Confirmation Section */}
            <div className="verify-otp-box" id="verifyOtpBox" style={{ display: 'none' }}>
              <div className="verify-otp-divider" />
              <div className="verify-otp-info">
                Enter the 6-digit OTP sent to <b id="otpTargetEmail">your email</b>
              </div>
              <div className="otp-preview-banner" id="otpPreviewBanner" style={{ display: 'none' }}>
                <span>Inbox OTP Code:</span>
                <b id="otpPreviewCode">------</b>
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
        <div className="screen-content">
          <div className="card" id="wHistory" />
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 3: Withdrawal */}
      <div id="sub-withdraw" className="settings-subpage">
        <SubpageTopBar title="Withdrawal" />
        <div className="screen-content">
          {/* 1. Premium Wallet Balance Hero Card */}
          <div className="withdraw-hero-card">
            <div className="withdraw-hero-glow" />
            <div className="withdraw-hero-top">
              <span className="withdraw-hero-label">AVAILABLE BALANCE</span>
              <span className="withdraw-rate-pill">100 Coins = NPR 1</span>
            </div>
            <div className="withdraw-hero-balance-row">
              <svg width="28" height="28">
                <use href="#icon-p-coin" />
              </svg>
              <span className="withdraw-hero-coins" id="wCoins">
                0
              </span>
              <span className="withdraw-hero-npr-pill">
                ≈ NPR <span id="npr">0.00</span>
              </span>
            </div>
            <div className="withdraw-hero-stats">
              <div className="withdraw-stat-item">
                <span className="withdraw-stat-lbl">Minimum Withdraw</span>
                <b className="withdraw-stat-val">
                  <span id="minW">10,000</span> Coins
                </b>
              </div>
              <div className="withdraw-stat-divider" />
              <div className="withdraw-stat-item">
                <span className="withdraw-stat-lbl">Total Earned</span>
                <b className="withdraw-stat-val">
                  <span id="total">0</span> Coins
                </b>
              </div>
            </div>
          </div>

          {/* 2. Qualification Status Card */}
          <div className="withdraw-qual-card" id="withdrawQualCard">
            <div className="withdraw-qual-head">
              <div className="withdraw-qual-title">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Withdrawal Eligibility</span>
              </div>
              <span className="wq-badge locked" id="wqStatusBadge">
                In Progress
              </span>
            </div>
            <div className="withdraw-qual-pills">
              <div className="wq-pill" id="wqPillAds">
                <span>Ads</span>
                <b id="wqAds">0/3</b>
              </div>
              <div className="wq-pill" id="wqPillTasks">
                <span>Tasks</span>
                <b id="wqTasks">0/2</b>
              </div>
              <div className="wq-pill" id="wqPillDaily">
                <span>Check-in</span>
                <b id="wqDaily">0/2</b>
              </div>
            </div>
          </div>

          {/* 3. Allowed Countries & Dynamic Custom Payout Methods */}
          <div className="withdraw-countries-bar" id="wAllowedCountriesBar" />
          <div className="withdraw-section-label">SELECT PAYOUT METHOD</div>
          <div className="method-pills" id="wMethodsGrid" />

          <input type="hidden" id="wMethod" value="" />

          {/* 4. Payout Account & Amount Card */}
          <div className="card withdraw-form-card">
            <div className="verify-field-label" id="wAccountLabel" style={{ marginTop: '0' }}>
              Account / Wallet ID
            </div>
            <input className="form-input" id="wAccount" placeholder="Enter Account / Wallet ID" />

            <div className="withdraw-amount-head">
              <span className="verify-field-label" style={{ margin: '0' }}>
                Withdraw Amount (Coins)
              </span>
              <div className="withdraw-quick-chips">
                <button type="button" className="w-chip" onClick={() => window.setWithdrawAmount(10000)}>
                  10K
                </button>
                <button type="button" className="w-chip" onClick={() => window.setWithdrawAmount(25000)}>
                  25K
                </button>
                <button type="button" className="w-chip" onClick={() => window.setWithdrawAmount(50000)}>
                  50K
                </button>
                <button type="button" className="w-chip w-chip-max" onClick={() => window.setWithdrawAmount('MAX')}>
                  MAX
                </button>
              </div>
            </div>

            <input
              className="form-input withdraw-amount-input"
              id="wAmount"
              type="number"
              placeholder="Minimum 10,000 coins"
              onInput={() => window.updateWithdrawPreview()}
            />

            <div className="withdraw-preview-strip">
              <div className="withdraw-preview-left">
                <span className="withdraw-preview-lbl">Estimated Payout</span>
                <span className="withdraw-preview-sub">Processed within 24–48 hrs</span>
              </div>
              <div className="withdraw-preview-val" id="wReceivePreview">
                NPR 0.00
              </div>
            </div>

            <button className="primary-btn btn-with-icon withdraw-submit-btn" onClick={() => window.withdraw()}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Request Withdraw</span>
            </button>
          </div>

          <div style={{ display: 'none' }}>
            <span id="coins">0</span>
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
        <div className="screen-content">
          <div className="card">
            <div className="faq-item">
              <div className="faq-q">1. How do I earn coins?</div>
              <div className="faq-a">
                Complete daily check-ins every 24 hours, watch rewarded ads, join Telegram channels, and invite friends.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q">2. What is the minimum withdrawal?</div>
              <div className="faq-a">
                Minimum withdrawal is 10,000 coins (NPR 100) via eSewa, Khalti, Binance USDT, or PayPal.
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-q">3. How long does withdrawal take?</div>
              <div className="faq-a">Withdrawals are reviewed and processed by admin within 24 to 48 hours.</div>
            </div>
            <div className="faq-item" style={{ marginBottom: '0', borderBottom: '0', paddingBottom: '0' }}>
              <div className="faq-q">4. How does referral bonus work?</div>
              <div className="faq-a">
                You earn +500 coins per qualified referral plus a 10% lifetime bonus on their task and daily check-in
                earnings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
