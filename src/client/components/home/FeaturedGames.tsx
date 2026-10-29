import { h } from '../../jsx';
import { EarnIcon } from '../shared/EarnIcon';
import { UiIcon } from '../shared/UiIcon';
import { GameCard, GameCardData } from '../shared/GameCard';

export function FeaturedGames() {
  return (
    <section className="home-featured" aria-labelledby="featured-title">
      <div className="section-head">
        <h2 id="featured-title">Featured Games</h2>
        <button type="button" className="view-all-btn" onClick={() => window.showTab('games')}>See All</button>
      </div>
      <div id="featuredGames" className="featured-games" aria-busy="true">
        <div className="home-games-placeholder" role="status"><EarnIcon index={2} /><span>Loading your next adventure…</span></div>
      </div>
    </section>
  );
}

export function updateFeaturedGames(games: GameCardData[], pendingId: string | null) {
  const grid = document.getElementById('featuredGames');
  if (!grid) return;
  grid.setAttribute('aria-busy', 'false');
  grid.replaceChildren(...(games.length ? games.slice(0, 4).map(game => (
    <GameCard game={game} compact={true} pending={pendingId === game.id} />
  )) : [
    <button type="button" className="games-empty-link" onClick={() => window.showTab('games')}>
      <EarnIcon index={2} /><span><b>Your next adventure awaits</b><small>New games are on the way</small></span><UiIcon name="chevron" />
    </button>
  ]));
}

export function showFeaturedGamesError() {
  const grid = document.getElementById('featuredGames');
  if (!grid) return;
  grid.setAttribute('aria-busy', 'false');
  grid.replaceChildren(<p className="home-games-placeholder" role="status">Connecting to your games. Please check your connection.</p>);
}
