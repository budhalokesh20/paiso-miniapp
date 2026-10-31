import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';

function CheckInDay({ day }: { day: number }) {
  return (
    <div className={`day-box upcoming${day === 7 ? ' day-7' : ''}`} id={`day-box-${day}`} data-day={day}>
      <div className="day-tile">
        {day === 7 ? (
          <img src="/assets/paiso-gift-v2.webp" alt="Bonus gift" className="day-gift" width="32" height="32" />
        ) : (
          <span>
            <span className="day-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" /></svg></span>
            <span className="day-lock"><UiIcon name="lock" size={15} /></span>
          </span>
        )}
      </div>
      <div className="day-label">Day {day}</div>
    </div>
  );
}

export function DailyCheckIn() {
  return (
    <section className="daily-card home-checkin" id="dailyCard" aria-labelledby="daily-title">
      <div className="daily-top">
        <div className="daily-left">
          <span className="daily-flame" aria-hidden="true">🔥</span>
          <div className="daily-copy">
            <h2 className="daily-title" id="daily-title">Daily Check-in</h2>
            <p className="daily-sub" id="dailySubText">Check in daily to keep your streak!</p>
          </div>
        </div>
        <span className="streak-pill" id="streakDayText">Day 1</span>
      </div>
      <div className="days-grid" id="daysGrid">{[1, 2, 3, 4, 5, 6, 7].map(day => <CheckInDay day={day} />)}</div>
      <div className="daily-claim-wrap">
        <button type="button" className="daily-claim-btn" id="dailyBtn" onClick={() => window.claimDaily()}>
          <span id="dailyBtnIcon"><svg width="19" height="19"><use href="#icon-gift" /></svg></span>
          <span id="dailyBtnText">Claim Today</span>
          <svg id="dailyBtnCoin" width="15" height="15"><use href="#icon-p-coin" /></svg>
        </button>
      </div>
      <div className="claim-fx-layer" id="claimFxLayer" aria-hidden="true" />
      <span id="dailyReward" hidden />
    </section>
  );
}

export function DailyCheckInModal() {
  return <dialog id="dailyCheckinModal" className="home-checkin-dialog" aria-labelledby="daily-title" onClick={(event: MouseEvent) => { if (event.target === event.currentTarget) window.closeDailyCheckin(); }}>
    <div className="checkin-dialog-content"><button className="checkin-close" aria-label="Close daily check-in" onClick={() => window.closeDailyCheckin()}>×</button>
      <DailyCheckIn /><p className="checkin-note">Check in once every 24 hours to continue your streak.</p>
    </div>
  </dialog>;
}
