import { h } from '../jsx';

export function TasksView() {
  return (
    <section id="tab-tasks" className="app-screen">
      <div className="native-topbar">
        <h2 className="page-title">Earn Tasks</h2>
        <div className="coin-pill">
          <svg width="16" height="16">
            <use href="#icon-p-coin" />
          </svg>
          <span id="headerCoins">0</span>
        </div>
      </div>

      <div className="screen-content space-y-3.5">
        {/* Clean Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            className="filter-chip active"
            data-filter="all"
            onClick={() => window.setTaskFilter('all')}
          >
            All Tasks
          </button>
          <button
            className="filter-chip"
            data-filter="app_task"
            onClick={() => window.setTaskFilter('app_task')}
          >
            App Task
          </button>
          <button
            className="filter-chip"
            data-filter="play_game"
            onClick={() => window.setTaskFilter('play_game')}
          >
            Play Game
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
            Social &amp; Web
          </button>
        </div>

        {/* Active Uncompleted Tasks List */}
        <div id="taskList" className="space-y-2.5 pb-4" />
      </div>
    </section>
  );
}
