import { h } from '../jsx';
import { TaskFilter } from '../app';
import { UiIcon } from './shared/UiIcon';

export function TasksView() {
  const filters: { id: TaskFilter; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'video', label: 'Video' }, { id: 'app_task', label: 'Apps' }, { id: 'play_game', label: 'Games' }, { id: 'social_visit', label: 'Web' }, { id: 'telegram_join', label: 'Social' }, { id: 'done', label: 'Done' }];
  return <section id="tab-tasks" className="app-screen"><div className="screen-content">
    <div className="page-heading"><h1>All Tasks</h1><p>Complete tasks and earn rewards</p></div>
    <label className="task-search"><UiIcon name="search" size={17} /><input id="taskSearchInput" type="search" aria-label="Search tasks" placeholder="Search tasks" onInput={(event: Event) => window.filterTasks((event.target as HTMLInputElement).value)} /></label>
    <div className="filter-bar">{filters.map(filter => <button className={`filter-chip${filter.id === 'all' ? ' active' : ''}`} data-filter={filter.id} onClick={() => window.setTaskFilter(filter.id)}>{filter.label}</button>)}</div>
    <div id="taskList" className="task-list" aria-live="polite" /><span id="headerCoins" hidden />
  </div></section>;
}

export function OffersView() {
  return <section id="tab-offers" className="app-screen"><div className="screen-content"><div className="page-heading"><h1>Special Offers</h1><p>Discover apps and earn rewards</p></div><div id="offerList" className="task-list" /></div></section>;
}
