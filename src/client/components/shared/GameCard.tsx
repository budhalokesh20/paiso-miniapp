import { h } from '../../jsx';
import { UiIcon } from './UiIcon';

export interface GameCardData {
  id: string;
  title: string;
  priceCoins: number;
}

export function GameCard({ game, compact = false, pending = false }: { game: GameCardData; compact?: boolean; pending?: boolean }) {
  const artworkIndex = /fruit/i.test(game.title) ? 0 : /car|rac(e|ing)/i.test(game.title) ? 1 : /puzzle|match/i.test(game.title) ? 2 : /bubble/i.test(game.title) ? 3 : -1;
  const price = game.priceCoins > 0 ? `${game.priceCoins.toLocaleString()} coins / play` : 'Free to play';
  return (
    <button type="button" className={compact ? 'featured-game' : 'game-card'} onClick={() => window.playGame(game.id)} disabled={pending} aria-label={`${game.title}, ${price}`}>
      <span className="game-cover">{artworkIndex >= 0 ? <span className={'reference-art popular-art art-game-' + artworkIndex} aria-hidden="true" /> : <span className="game-fallback"><UiIcon name="game" size={56} /></span>}{compact && game.priceCoins > 0 ? <span className="game-price">{game.priceCoins.toLocaleString()} coins</span> : null}</span>
      <b title={game.title}>{game.title}</b>
      {!compact ? <small>{price}</small> : null}
      {!compact ? <span className="game-play">{pending ? 'Starting…' : 'Play Now'}</span> : null}
    </button>
  );
}
