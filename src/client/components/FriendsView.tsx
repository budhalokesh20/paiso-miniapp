import { h } from '../jsx';

export function FriendsView() {
  return (
    <section id="tab-refer" className="app-screen">
      <div className="native-topbar">
        <h2 className="page-title">
          <svg
            className="title-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Invite Friends</span>
        </h2>
      </div>

      <div className="screen-content">
        <div className="refer-hero">
          <img src="/assets/icon-friends.png" alt="Invite Friends" />
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <span>Earn +500</span>
              <svg width="18" height="18">
                <use href="#icon-p-coin" />
              </svg>
              <span>/ Friend</span>
            </h3>
            <p>
              Plus <b>10% lifetime bonus</b> on all tasks your friends complete!
            </p>
          </div>
        </div>

        <div className="stats-grid-2">
          <div className="stat-box">
            <div className="num" id="refCount">
              0
            </div>
            <div className="lbl">Friends Invited</div>
          </div>
          <div className="stat-box">
            <div className="num">10%</div>
            <div className="lbl">Lifetime Bonus</div>
          </div>
        </div>

        <div className="card">
          <b style={{ display: 'block', fontSize: '14px' }}>Your Referral Link</b>
          <input className="form-input" id="refLink" readOnly={true} />
          <button className="primary-btn btn-with-icon" onClick={() => window.copyRef()}>
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
            <span>Copy Invite Link</span>
          </button>
          <button className="ghost-btn btn-with-icon" style={{ marginTop: '8px' }} onClick={() => window.shareRef()}>
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
            <span>Share on Telegram</span>
          </button>
        </div>

        <div className="section-subtitle">Referral History</div>
        <div id="refHistory" />
      </div>
    </section>
  );
}
