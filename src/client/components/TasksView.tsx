import { h } from '../jsx';

export function TasksView() {
  return (
    <section id="tab-tasks" className="app-screen">
      <div className="native-topbar">
        <h2 className="page-title">Tasks</h2>
        <div className="coin-pill">
          <svg width="16" height="16">
            <use href="#icon-p-coin" />
          </svg>
          <span id="headerCoins">0</span>
        </div>
      </div>

      <div className="screen-content">
        <div className="filter-bar">
          <button className="filter-chip active" data-filter="all" onClick={() => window.setTaskFilter('all')}>
            All
          </button>
          <button
            className="filter-chip"
            data-filter="telegram_join"
            onClick={() => window.setTaskFilter('telegram_join')}
          >
            Telegram
          </button>
          <button
            className="filter-chip"
            data-filter="social_visit"
            onClick={() => window.setTaskFilter('social_visit')}
          >
            Social
          </button>
          <button className="filter-chip" data-filter="done" onClick={() => window.setTaskFilter('done')}>
            Completed
          </button>
        </div>

        <div id="taskList" className="tasks-list-wrap" />
      </div>
    </section>
  );
}
