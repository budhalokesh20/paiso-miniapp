import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

export function BottomNav() {
  return <nav className="bottom-nav" aria-label="Main navigation">
    <button data-tab="home" className="active" aria-current="page" onClick={() => window.showTab('home')}><UiIcon name="home" /><span>Home</span></button>
    <button data-tab="tasks" onClick={() => window.showTab('tasks', 'all')}><UiIcon name="tasks" /><span>Tasks</span></button>
    <button className="nav-reward" aria-label="Claim daily reward" onClick={() => { window.showTab('home'); window.openDailyCheckin(); }}><span><svg viewBox="0 0 24 24" width="25" height="25"><use href="#icon-gift" /></svg></span></button>
    <button data-tab="refer" onClick={() => window.showTab('refer')}><UiIcon name="friends" /><span>Invite</span></button>
    <button data-tab="wallet" onClick={() => window.showTab('wallet')}><UiIcon name="settings" /><span>Settings</span></button>
  </nav>;
}
