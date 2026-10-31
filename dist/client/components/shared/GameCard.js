import { h } from '../../jsx';
import { UiIcon } from './UiIcon';
export function GameCard({ game, compact = false, pending = false }) {
    const artworkIndex = /fruit/i.test(game.title) ? 0 : /car|rac(e|ing)/i.test(game.title) ? 1 : /puzzle|match/i.test(game.title) ? 2 : /bubble/i.test(game.title) ? 3 : -1;
    const price = game.priceCoins > 0 ? `${game.priceCoins.toLocaleString()} coins / play` : 'Free to play';
    return (h("button", { type: "button", className: compact ? 'featured-game' : 'game-card', onClick: () => window.playGame(game.id), disabled: pending, "aria-label": `${game.title}, ${price}` },
        h("span", { className: "game-cover" },
            artworkIndex >= 0 ? h("span", { className: 'reference-art popular-art art-game-' + artworkIndex, "aria-hidden": "true" }) : h("span", { className: "game-fallback" },
                h(UiIcon, { name: "game", size: 56 })),
            compact && game.priceCoins > 0 ? h("span", { className: "game-price" },
                game.priceCoins.toLocaleString(),
                " coins") : null),
        h("b", { title: game.title }, game.title),
        !compact && game.description ? h("span", { className: "game-description" }, game.description) : null,
        !compact ? h("small", null, price) : null,
        !compact ? h("span", { className: "game-play" }, pending ? 'Starting…' : 'Play Now') : null));
}
