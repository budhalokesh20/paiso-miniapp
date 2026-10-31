import { h } from '../jsx';
import { UiIcon } from './shared/UiIcon';

export function GamesView() {
  return (
    <div id="exploreGames" className="games-page">
      <div className="games-heading"><div><span className="games-eyebrow">YOUR GAME LOUNGE</span><h1>Find your next<br /><span>favorite game.</span></h1><p>Take a break and discover something fun.</p></div><span className="games-heading-icon" aria-hidden="true"><UiIcon name="game" size={38} /></span></div>
      <div className="games-toolbar"><div><h2>Explore games</h2><p id="gameCount" aria-live="polite">Loading games…</p></div></div>
      <label className="games-search"><UiIcon name="search" size={19} /><input type="search" aria-label="Search games" placeholder="Search games" onInput={(e: Event) => window.searchGames((e.target as HTMLInputElement).value)} /></label>
      <div className="games-filters" aria-label="Game price filters"><button type="button" data-game-filter="all" className="active" aria-pressed="true" onClick={() => window.filterGames('all')}>All games</button><button type="button" data-game-filter="free" aria-pressed="false" onClick={() => window.filterGames('free')}>Free</button><button type="button" data-game-filter="paid" aria-pressed="false" onClick={() => window.filterGames('paid')}>Coins</button></div>
      <div id="gamesGrid" className="games-grid" />
      <section className="game-history" id="gameHistorySection" hidden><h2>Recently played</h2><div id="gameHistory" /></section>
    </div>
  );
}

export function GameModal() {
  return (
      <div id="gameModal" className="fixed inset-0 z-[120] hidden flex-col bg-slate-950">
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 text-white">
          <div id="activeGameTitle" className="truncate text-sm font-bold">Game</div>
          <button type="button" onClick={() => window.closeGame()} aria-label="Close game" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg hover:bg-white/20">×</button>
        </div>
        <iframe
          id="gameFrame"
          title="Paiso game"
          sandbox="allow-scripts"
          allow="fullscreen; gamepad; autoplay"
          allowFullScreen={true}
          referrerPolicy="no-referrer"
          className="min-h-0 w-full flex-1 border-0 bg-white"
        />
      </div>
  );
}
