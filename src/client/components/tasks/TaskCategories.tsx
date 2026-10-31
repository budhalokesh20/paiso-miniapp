import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
import { TaskFilter } from '../../app';
const TASK_CATEGORIES: {title: string; description: string; filter: TaskFilter; art: string}[] = [
  { title: 'Watch Videos', description: 'Watch short videos and earn coins', filter: 'video', art: 'video' },
  { title: 'Play Games', description: 'Play games and earn coins', filter: 'play_game', art: 'games' },
  { title: 'Complete Offers', description: 'Try new apps and earn coins', filter: 'app_task', art: 'offers' },
];
export function TaskCategories() {
  return <section className="tasks-categories" aria-labelledby="task-categories-title">
    <div className="section-head"><h2 id="task-categories-title">Task Categories</h2><button type="button" className="view-all-btn" onClick={() => window.openTaskList('all')}>View All <UiIcon name="chevron" size={14} /></button></div>
    <div className="task-category-list">{TASK_CATEGORIES.map(category => <button type="button" className={'task-category category-' + category.art} onClick={() => window.openTaskList(category.filter)}>
      <span className={'task-reference-art category-icon icon-' + category.art} aria-hidden="true" />
      <span className="category-copy"><b>{category.title}</b><span>{category.description}</span></span>
      <span className={'task-reference-art category-decoration decoration-' + category.art} aria-hidden="true" />
    </button>)}</div>
  </section>;
}
