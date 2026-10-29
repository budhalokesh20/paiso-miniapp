import { h } from '../../jsx';
import { EarnIcon } from './EarnIcon';

export interface GameCardData {
  id: string;
  title: string;
  priceCoins: number;
}

export function GameCard({ game, compact = false, pending = false }: { game: GameCardData; compact?: boolean; pending?: boolean }) {
  const price = game.priceCoins > 0 ? `${game.priceCoins.toLocaleString()} coins / play` : 'Free to play';
  return (
    <button type="button" className={compact ? 'featured-game' : 'game-card'} onClick={() => window.playGame(game.id)} disabled={pending} aria-label={`${game.title}, ${price}`}>
      <span className="game-cover"><EarnIcon index={2} /><span className="game-spark" aria-hidden="true">✦</span></span>
      <b title={game.title}>{game.title}</b>
      <small>{price}</small>
      {!compact ? <span className="game-play">{pending ? 'Starting…' : 'Play Now'}</span> : null}
    </button>
  );
}
