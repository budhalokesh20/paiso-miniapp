import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
const HOME_SHORTCUTS = [
  { title: 'Watch', description: 'Earn Coins', action: () => window.watchAd() },
  { title: 'Tasks', description: 'Complete & Earn', action: () => window.showTab('tasks', 'all') },
  { title: 'Games', description: 'Play & Earn', action: () => window.showTab('games') },
  { title: 'Offers', description: 'Special Offers', action: () => window.showTab('offers') },
];
export function EarnShortcuts() {
  return <section className="home-shortcuts" aria-labelledby="earn-title">
    <div className="section-head"><h2 id="earn-title">Earn Coins</h2><button className="view-all-btn" onClick={() => window.showTab('tasks', 'all')}>View All <UiIcon name="chevron" size={14} /></button></div>
    <div className="explore-grid" id="exploreGrid">{HOME_SHORTCUTS.map((item, index) => (
      <button type="button" className={'explore-card earn-tile earn-tile-' + index} data-title={item.title + ' ' + item.description} id={index === 0 ? 'adBtn' : undefined} onClick={item.action}>
        <span className={'reference-art tile-art art-earn-' + index} aria-hidden="true" />
        <span className="earn-copy"><span className="explore-title">{item.title}</span><span className="explore-sub">{item.description}</span></span>
        <span className="tile-arrow"><UiIcon name="arrow" size={21} /></span>
      </button>
    ))}</div>
    <div hidden><span id="adCardSub" /><span id="adReward" /><span id="adCount">0</span><span id="adCap">10</span><input id="searchInput" /><button id="searchClearBtn" /></div>
  </section>;
}
