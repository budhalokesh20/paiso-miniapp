# Paiso — Telegram Mini App (Earning App)

Tasks complete garera coins kamaune Telegram Mini App. Test garisakyo: server chalcha, tasks list aaucha, daily bonus kaam garcha.

## Ke ke chha bhitra

| Feature | Kasari kaam garcha |
|---|---|
| **Home** | Balance (coins + NPR), total earned, Daily Bonus 100 coins |
| **Telegram Tasks** | Channel/Group join → bot le auto-verify garcha (`getChatMember`). Join nagari coins paudaina |
| **Social Tasks** | YouTube subscribe, blog visit jasta — link khulcha, 20 sec timer pachi matra Verify huncha |
| **Refer** | 1 referral = **500 coins**, plus usle kamako **10%** lifetime (usko ghatchaina) |
| **Wallet** | Min withdraw **10,000 coins = NPR 100**, eSewa / Khalti / Binance USDT / PayPal. Request admin lai Telegram ma jancha, approve/reject admin endpoint bata, reject bhaye coins refund |
| **Security** | Telegram `initData` HMAC verify — fake/browser bata coins kamauna mildaina, 1 Telegram ID = 1 account |

Pahila batai rakhiyeka tasks (`data/tasks.json` ma change garna milcha):
- Join @lokesh2060 (+200), Join @onlineearnlokesh (+200)
- Subscribe Mukti Pao (+300), Chhota Hero Toons (+300), Lokesh Budha (+300)
- AI Earn Hub blog visit (+100)

## Live garna timle garnu parne 3 step matra

**1. Bot banaune (2 min)**
- Telegram ma `@BotFather` → `/newbot` → naam hal (jastai `Paiso`) → username hal (jastai `PaisoBot`, `Bot` ma sakine)
- Aayeko **token** copy gara. Malai token chat ma nadeu — pachi `.env` ma afai halne.

**2. Bot lai channel/group ma Admin banaune**
- @lokesh2060 ra @onlineearnlokesh ma bot lai admin hal — natra join verify hudaina.

**3. Hosting (free)**
- Yo folder lai Render.com / Railway ma deploy gara (Build: `npm install`, Start: `npm start`)
- Environment variables hal: `BOT_TOKEN`, `BOT_USERNAME`, `ADMIN_ID` (timro numeric Telegram ID — `@userinfobot` bata milcha), `WEBAPP_URL` (deploy bhayeko https link)
- BotFather ma feri jau: `/mybots` → timro bot → Bot Settings → Menu Button → Web App URL ma tyahi link hal

Tyo pachi kunai le `t.me/TimroBot` kholchha → Start dabauchha → **Open Earning App** button bata app khulcha.

## Local test
```
npm install
npm start        # http://localhost:3000  (BOT_TOKEN nahuda dev mode: test user)
```

## Task thapna / reward change
`data/tasks.json` edit gara, server restart gara. Naya type:
- `telegram_join` — `target` ma channel username, auto verify
- `social_visit` — kunai link, `waitSeconds` timer verify

## Dhyana dine kura
- YouTube/Facebook follow lai Telegram le auto-verify garna mildaina — timer + spot-check nai industry ko tarika ho (Nodix ma pani testai thiyo).
- Coins ko value/rate timrai haat ma: `.env` ma `COIN_PER_NPR=100`, withdraw minimum pani tyahi bata.
- DB ahile `data/db.json` file ho — user badhe pachi SQLite/Mongo ma sarna sajilo chha, code structure ready chha.
