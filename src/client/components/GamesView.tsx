import { h } from '../jsx';

export function GamesView() {
  return (
    <div id="exploreGames" className="mt-5 scroll-mt-4">
      <div className="mb-2.5">
        <h3 className="text-sm font-extrabold text-slate-900">Games</h3>
        <p className="mt-0.5 text-[11px] text-slate-500">Coin price is shown before you play.</p>
      </div>
      <div id="gamesGrid" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" />

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
    </div>
  );
}
