import { h } from '../../jsx';
import { TaskFilter } from '../../app';
import { UiIcon } from '../shared/UiIcon';
export function TaskListPage() {
  const filters: { id: TaskFilter; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'video', label: 'Video' }, { id: 'app_task', label: 'Apps' }, { id: 'play_game', label: 'Games' }, { id: 'social_visit', label: 'Web' }, { id: 'telegram_join', label: 'Social' }, { id: 'done', label: 'Done' }];
  return <section id="sub-task-list" className="settings-subpage task-detail-page" aria-labelledby="task-list-title">
    <div className="native-subpage-bar"><button type="button" className="native-back-btn" aria-label="Back to Tasks" onClick={() => window.closeSettingPage()}><UiIcon name="chevron" size={20} /></button><h1 className="native-subpage-title" id="task-list-title">All Tasks</h1><div /></div>
    <div className="screen-content">
      <label className="task-search search-open"><UiIcon name="search" size={18} /><input id="taskSearchInput" type="search" aria-label="Search tasks" placeholder="Search tasks" onInput={(event: Event) => window.filterTasks((event.target as HTMLInputElement).value)} /></label>
      <div className="filter-bar" aria-label="Task categories">{filters.map(filter => <button type="button" className={'filter-chip' + (filter.id === 'all' ? ' active' : '')} data-filter={filter.id} onClick={() => window.setTaskFilter(filter.id)}>{filter.label}</button>)}</div>
      <div id="taskList" className="task-list" aria-live="polite" />
    </div>
  </section>;
}
