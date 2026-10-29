import { h } from '../../jsx';
import { EarnIcon } from '../shared/EarnIcon';

function openSurveys() {
  window.showTab('tasks', 'all');
  window.filterTasks('survey');
  const input = document.getElementById('taskSearchInput') as HTMLInputElement | null;
  if (input) {
    input.value = 'survey';
    input.closest('.task-search')?.classList.add('search-open');
  }
}

const HOME_SHORTCUTS = [
  { title: 'Watch', description: 'Earn by watching', action: () => window.watchAd() },
  { title: 'Tasks', description: 'Complete & Earn', action: () => window.showTab('tasks', 'all') },
  { title: 'Games', description: 'Play & Have Fun', action: () => window.showTab('games') },
  { title: 'Offers', description: 'Special Offers', action: () => window.showTab('offers') },
  { title: 'Surveys', description: 'Share Opinion', action: openSurveys },
  { title: 'More', description: 'Explore More', action: () => window.showTab('tasks', 'all') },
];

export function EarnShortcuts() {
  return (
    <section className="home-shortcuts" aria-label="Explore ways to earn">
      <div className="explore-grid" id="exploreGrid">
        {HOME_SHORTCUTS.map((item, index) => (
          <button type="button" className="explore-card" data-title={`${item.title} ${item.description}`} id={index === 0 ? 'adBtn' : undefined} onClick={item.action}>
            <EarnIcon index={index} />
            <span className="explore-title">{item.title}</span>
            <span className="explore-sub" id={index === 0 ? 'adCardSub' : undefined}>{item.description}</span>
          </button>
        ))}
      </div>
      <div hidden><span id="adReward" /><span id="adCount">0</span><span id="adCap">10</span><input id="searchInput" /><button id="searchClearBtn" /></div>
    </section>
  );
}
