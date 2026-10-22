import { h } from '../jsx';

function DayCheckBox(props: { day: number }) {
  return (
    <div className="day-box" id={`day-box-${props.day}`} data-day={props.day}>
      <div className="day-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="day-num">{props.day}</div>
      <div className="day-label">Day</div>
    </div>
  );
}

export function HomeView() {
  return (
    <section id="tab-home" className="app-screen active-screen">
      <div className="screen-content">
        <header className="app-header">
          <div className="brand-wrap">
            <img src="/assets/logo.png" alt="Paiso Logo" className="brand-logo" />
            <div className="brand-text">
              <h1>Paiso</h1>
              <p>
                Small Tasks <span className="dot">•</span> Real Rewards
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="bell-btn" onClick={() => window.showTab('wallet')} aria-label="Notifications">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="bell-dot" />
            </button>
          </div>
        </header>

        <div className="hero-banner">
          <div className="hero-content">
            <div className="hero-tag">EARN • PLAY • REDEEM</div>
            <div className="hero-title">
              Complete Tasks
              <br />
              <span className="cyan">Get Real</span> <span className="pink">Rewards</span>
            </div>
            <div className="hero-sub">Simple tasks, big rewards!</div>
            <button className="hero-cta" onClick={() => window.showTab('tasks')} aria-label="Complete Tasks">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <img src="/assets/hero-gift.png" alt="Rewards Gift" className="hero-art" />
        </div>

        <div className="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            id="searchInput"
            placeholder="Search tasks, games..."
            onInput={(e: Event) => window.filterExplore((e.target as HTMLInputElement).value)}
          />
          <button type="button" className="search-clear" id="searchClearBtn" onClick={() => window.clearSearch()}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="daily-card" id="dailyCard">
          <div className="daily-top">
            <div className="daily-left">
              <img src="/assets/calendar.png" alt="Calendar" className="daily-cal-icon" />
              <div style={{ minWidth: '0' }}>
                <div className="daily-title">Daily Check-in</div>
                <div className="daily-sub" id="dailySubText">
                  7 day streak! Keep it going!
                </div>
              </div>
            </div>
            <div className="streak-pill">
              <img src="/assets/flame.png" alt="Streak" className="streak-flame-icon" />
              <span id="streakDayText">Day 1</span>
            </div>
          </div>

          <div className="days-grid" id="daysGrid">
            <DayCheckBox day={1} />
            <DayCheckBox day={2} />
            <DayCheckBox day={3} />
            <DayCheckBox day={4} />
            <DayCheckBox day={5} />
            <DayCheckBox day={6} />
            <div className="day-box day-7" id="day-box-7" data-day="7">
              <img src="/assets/gift-day7.png" alt="Day 7 Gift" className="day-gift" />
              <div className="day-num">7</div>
              <div className="day-label">Day</div>
            </div>
          </div>

          <div className="daily-claim-wrap">
            <button type="button" className="daily-claim-btn" id="dailyBtn" onClick={() => window.claimDaily()}>
              <span className="claim-btn-icon" id="dailyBtnIcon">
                <svg width="16" height="16">
                  <use href="#icon-gift" />
                </svg>
              </span>
              <span id="dailyBtnText">Claim Day 1 Bonus (+100)</span>
              <svg className="inline-coin" id="dailyBtnCoin" width="15" height="15">
                <use href="#icon-p-coin" />
              </svg>
            </button>
          </div>
          <div className="claim-fx-layer" id="claimFxLayer" />
        </div>

        <div className="section-head">
          <h2>Explore &amp; Earn</h2>
          <button className="view-all-btn" onClick={() => window.showTab('tasks', 'all')}>
            View All
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="explore-grid" id="exploreGrid">
          <div
            className="explore-card card-ads"
            data-title="watch ads earn coins video"
            id="adBtn"
            onClick={() => window.watchAd()}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-ads.png" alt="Watch Ads" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Watch Ads</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub" id="adCardSub">
                Earn coins
              </div>
            </div>
          </div>

          <div
            className="explore-card card-tasks"
            data-title="complete tasks easy fast"
            onClick={() => window.showTab('tasks', 'all')}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-tasks.png" alt="Complete Tasks" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Complete Tasks</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub">Easy &amp; Fast</div>
            </div>
          </div>

          <div
            className="explore-card card-games"
            data-title="play games more fun coins"
            onClick={() => window.showTab('tasks', 'social_visit')}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-games.png" alt="Play Games" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Play Games</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub">More Fun, More Coins</div>
            </div>
          </div>

          <div
            className="explore-card card-channels"
            data-title="join channels telegram get rewards"
            onClick={() => window.showTab('tasks', 'telegram_join')}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-channels.png" alt="Join Channels" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Join Channels</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub">Get rewards</div>
            </div>
          </div>

          <div
            className="explore-card card-friends"
            data-title="invite friends refer earn together"
            onClick={() => window.showTab('refer')}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-friends.png" alt="Invite Friends" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Invite Friends</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub">Earn Together</div>
            </div>
          </div>

          <div
            className="explore-card card-freefire"
            data-title="free fire indonesia play earn rewards diamonds"
            onClick={() => {
              window.showTab('wallet');
              window.openSettingPage('sub-withdraw');
            }}
          >
            <div className="explore-icon-wrap">
              <img src="/assets/icon-freefire.png" alt="Free Fire Indonesia" className="explore-icon" />
            </div>
            <div className="explore-info">
              <div className="explore-title-row">
                <span className="explore-title">Free Fire Indonesia</span>
                <span className="explore-arrow">›</span>
              </div>
              <div className="explore-sub">Play &amp; Earn rewards</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'none' }}>
          <span id="adReward" />
          <span id="adCount">0</span>
          <span id="adCap">10</span>
          <span id="dailyReward" />
        </div>
      </div>
    </section>
  );
}
