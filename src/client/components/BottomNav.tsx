import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

export function BottomNav() {
  return <nav className="bottom-nav" aria-label="Main navigation">
    <div className="bottom-nav-items">
      <button type="button" data-tab="home" className="active" aria-current="page" onClick={() => window.showTab('home')}><span className="nav-icon"><UiIcon name="home" /></span><span className="nav-label">Home</span></button>
      <button type="button" data-tab="tasks" onClick={() => window.showTab('tasks', 'all')}><span className="nav-icon"><UiIcon name="tasks" /></span><span className="nav-label">Tasks</span></button>
      <button type="button" className="nav-reward" aria-label="Claim daily reward" onClick={() => { window.showTab('home'); window.openDailyCheckin(); }}><span className="nav-icon"><UiIcon name="gift" /></span><span className="nav-label">Rewards</span></button>
      <button type="button" data-tab="refer" onClick={() => window.showTab('refer')}><span className="nav-icon"><UiIcon name="friends" /></span><span className="nav-label">Invite</span></button>
      <button type="button" data-tab="wallet" onClick={() => window.showTab('wallet')}><span className="nav-icon"><UiIcon name="settings" /></span><span className="nav-label">Settings</span></button>
    </div>
  </nav>;
}
