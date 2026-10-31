import { h } from '../../jsx';
import { SubpageTopBar } from './SettingsParts';
export function SettingsAccountPages() { return <div className="settings-pages">
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

            <label className="verify-field-label" for="vFullName">Full Name</label>
            <input className="form-input" id="vFullName" autoComplete="name" type="text" placeholder="Enter your full name" />

            <label className="verify-field-label" for="vEmail">Email Address (optional)</label>
            <input className="form-input" id="vEmail" autoComplete="email" type="email" placeholder="you@example.com" />

            <label className="verify-field-label" for="vDob">Date of Birth</label>
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
                aria-label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
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


</div>; }
