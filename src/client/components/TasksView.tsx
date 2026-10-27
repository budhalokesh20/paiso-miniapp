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
        <label className="relative block">
          <span className="sr-only">Search tasks</span>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="taskSearchInput"
            type="search"
            placeholder="Search tasks"
            onInput={(e: Event) => window.filterTasks((e.target as HTMLInputElement).value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
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
          <button
            className="filter-chip"
            data-filter="done"
            onClick={() => window.setTaskFilter('done')}
          >
            Completed
          </button>
        </div>

        {/* Active Uncompleted Tasks List */}
        <div id="taskList" className="space-y-2.5 pb-4" />
      </div>
    </section>
  );
}
