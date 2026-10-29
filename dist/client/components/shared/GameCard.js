import { h } from '../../jsx';
import { EarnIcon } from './EarnIcon';
export function GameCard({ game, compact = false, pending = false }) {
    const price = game.priceCoins > 0 ? `${game.priceCoins.toLocaleString()} coins / play` : 'Free to play';
    return (h("button", { type: "button", className: compact ? 'featured-game' : 'game-card', onClick: () => window.playGame(game.id), disabled: pending, "aria-label": `${game.title}, ${price}` },
        h("span", { className: "game-cover" },
            h(EarnIcon, { index: 2 }),
            h("span", { className: "game-spark", "aria-hidden": "true" }, "\u2726")),
        h("b", { title: game.title }, game.title),
        h("small", null, price),
        !compact ? h("span", { className: "game-play" }, pending ? 'Starting…' : 'Play Now') : null));
}
