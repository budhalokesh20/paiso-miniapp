import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

export function BottomNav() {
  return <nav className="bottom-nav" aria-label="Main navigation">
    <div className="bottom-nav-items">
      <span className="nav-active-pill" aria-hidden="true" />
      <button type="button" data-tab="home" aria-label="Home" className="active" aria-current="page" onClick={() => window.showTab('home')}><span className="nav-icon"><UiIcon name="home" /></span><span className="nav-label" aria-hidden="true">Home</span></button>
      <button type="button" data-tab="tasks" aria-label="Tasks" onClick={() => window.showTab('tasks', 'all')}><span className="nav-icon"><UiIcon name="tasks" /></span><span className="nav-label" aria-hidden="true">Tasks</span></button>
      <button type="button" data-tab="refer" aria-label="Invite" onClick={() => window.showTab('refer')}><span className="nav-icon"><UiIcon name="friends" /></span><span className="nav-label" aria-hidden="true">Invite</span></button>
      <button type="button" data-tab="wallet" aria-label="Settings" onClick={() => window.showTab('wallet')}><span className="nav-icon"><UiIcon name="settings" /></span><span className="nav-label" aria-hidden="true">Settings</span></button>
    </div>
    <button type="button" className="nav-reward" aria-label="Claim daily reward" title="Daily rewards" onClick={() => { window.showTab('home'); window.openDailyCheckin(); }}><span className="nav-icon"><UiIcon name="gift" /></span></button>
  </nav>;
}
