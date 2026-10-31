import { h } from '../jsx';
import { QuickTasks } from './home/QuickTasks';
import { TaskHero } from './tasks/TaskHero';
import { TaskCategories } from './tasks/TaskCategories';
export function TasksView() {
  return <section id="tab-tasks" className="app-screen tasks-screen" aria-label="Tasks">
    <div className="screen-content tasks-layout">
      <div className="tasks-heading"><h1>Tasks</h1><p>Complete simple tasks and earn coins</p></div>
      <TaskHero /><QuickTasks variant="tasks" /><TaskCategories /><span id="headerCoins" hidden />
    </div>
  </section>;
}
export function OffersView() {
  return <section id="tab-offers" className="app-screen"><div className="screen-content"><div className="page-heading"><h1>Special Offers</h1><p>Discover apps and earn rewards</p></div><div id="offerList" className="task-list" /></div></section>;
}
