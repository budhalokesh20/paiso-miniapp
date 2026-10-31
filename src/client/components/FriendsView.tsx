import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

export function FriendsView() {
  return <section id="tab-refer" className="app-screen"><div className="screen-content">
    <div className="invite-hero"><h1>Invite Friends<br /><strong>Earn More</strong></h1><p>More friends, more rewards!</p></div>
    <div className="ref-link-card"><div><label for="refLink">Your Invite Link</label><input id="refLink" readOnly={true} aria-label="Your invite link" placeholder="Loading your invite link…" /></div><button className="primary-btn" onClick={() => window.copyRef()}>Copy</button></div>
    <div className="ref-stats"><div><UiIcon name="friends" size={26} /><b id="refCount">0</b><small>Total Invites</small></div><div><UiIcon name="friends" size={26} /><b id="refActive">0</b><small>Active Users</small></div><div><svg width="26" height="26"><use href="#icon-p-coin" /></svg><b id="refEarned">0</b><small>Bonus Earned</small></div></div>
    <h2 className="section-subtitle">How It Works?</h2><div className="ref-how"><ol><li><span>1</span>Share your invite link<br />with your friends</li><li><span>2</span>They join and start using<br />Paiso bot</li><li><span>3</span>They qualify, you earn!</li></ol><img src="/assets/paiso-gift-v2.webp" alt="Gift rewards" /></div>
    <button className="bonus-strip" onClick={() => window.shareRef()}><img src="/assets/paiso-gift-v2.webp" alt="" /><span><b>Bonus Rewards</b><small>Earn <span id="refBonusValue">+500</span> coins per qualified friend, plus 10% of task earnings.</small></span><UiIcon name="chevron" size={16} /></button>
    <div className="section-head"><h2>Your Invites</h2><button className="view-all-btn" onClick={() => document.getElementById('refHistory')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })}>See All</button></div><div id="refHistory" />
  </div></section>;
}
