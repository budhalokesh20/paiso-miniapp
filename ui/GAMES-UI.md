# Games and activity

The game lounge displays enabled games returned by `/api/me`, with a live text search and All games / Free / Coins filters. Each card uses the real title, description and price; matching artwork is decorative. A connection error offers a retry, and an empty list or filter result is explained. No game or payout is fabricated.

The existing play endpoint validates the game and balance, records the play and returns a time-limited content URL. `/api/me` now returns at most five recent plays for the authenticated user, with game title, price and date. The interface refreshes after starting a game. If a response is lost, the app asks the user to check balance and activity before retrying rather than asserting that no coins were charged. An unconfirmed withdrawal similarly directs the user to My Activity. Failed refreshes retain the previous usable state.

Remote access without a configured bot token no longer receives the local test account. Local test login is limited to direct non-production requests, as before. Game providers must allow their games to run embedded; the app keeps the existing iframe sandbox and cannot override a provider's embedding restrictions. Daily Spin keeps the existing published-game behavior.

Validation: `npm run build`; `node scripts/verify-games-api.cjs` starts an isolated file-backed server and checks authentication, history privacy, free and paid plays, insufficient balance and game session redirects. `node scripts/verify-ui.cjs` uses fixture data to check the game filters, search, history, offline retry and existing screen flows across screen sizes. No live account or balance is modified.
