/**
 * Paiso - Telegram Mini App Earning Backend (TypeScript)
 * - Verifies Telegram initData (HMAC) - no fake accounts
 * - Tasks: telegram_join (auto-verified via Bot API), social_visit (timer)
 * - Daily bonus (24h cooldown + 7-day streak)
 * - Qualified Referral System: Referrer gets +500 coins after referred user completes
 *   3 Ads + 2 Social Tasks + 2 Days Daily Check-in; plus 10% lifetime task earnings
 * - Withdrawal requires meeting the qualification condition (3 Ads, 2 Tasks, 2 Daily Check-ins)
 * - DB: Postgres (Neon) when DATABASE_URL is set, else local JSON file (data/db.json)
 */
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import {
  User,
  UserGender,
  Task,
  TaskType,
  HostedGame,
  GamePlay,
  Withdrawal,
  WithdrawMethod,
  CustomWithdrawMethod,
  AllowedCountryItem,
  WithdrawSettings,
  AppNotification,
  NotificationType,
  DatabaseSchema,
  QualificationStatus,
  ReferralHistoryItem
} from './types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// --- cross-platform .env loader (supports \r\n, \n, whitespace, comments) ---
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split(/\r?\n/)
    .forEach((l: string) => {
      const line = l.trim();
      if (!line || line.startsWith('#')) return;
      const idx = line.indexOf('=');
      if (idx !== -1) {
        const k = line.slice(0, idx).trim();
        const v = line.slice(idx + 1).trim();
        if (k) process.env[k] = v;
      }
    });
} catch {}

const BOT_TOKEN: string = process.env.BOT_TOKEN || '';
const ADMIN_ID: string = String(process.env.ADMIN_ID || '');
const PORT: number = +(process.env.PORT || 3000);
const COIN_PER_NPR: number = +(process.env.COIN_PER_NPR || 100);
const MIN_WITHDRAW_COINS: number = +(process.env.MIN_WITHDRAW_NPR || 100) * COIN_PER_NPR;
const REFERRAL_BONUS: number = +(process.env.REFERRAL_BONUS_COINS || 500);
const DAILY_BONUS: number = +(process.env.DAILY_BONUS_COINS || 100);
const ADSGRAM_BLOCK_ID: string = process.env.ADSGRAM_BLOCK_ID || '';
const AD_REWARD: number = +(process.env.AD_REWARD_COINS || 50);
const AD_DAILY_CAP: number = +(process.env.AD_DAILY_CAP || 10);
const AD_COOLDOWN_MS: number = +(process.env.AD_COOLDOWN_SEC || 45) * 1000;

const REQ_ADS = 3;
const REQ_TASKS = 2;
const REQ_DAILY = 2;

const DB_FILE: string = path.join(__dirname, 'data', 'db.json');
const SEED_TASKS: Task[] = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tasks.json'), 'utf8'));

const DEFAULT_SETTINGS: WithdrawSettings = {
  methods: [
    {
      id: 'm_esewa',
      name: 'eSewa',
      logo: 'https://cdn-icons-png.flaticon.com/512/10149/10149458.png',
      placeholder: 'Enter ID / Account Number',
      country: 'Nepal',
      enabled: true
    }
  ],
  allowedMethods: ['eSewa'],
  minWithdrawCoins: MIN_WITHDRAW_COINS,
  coinPerNpr: COIN_PER_NPR,
  countries: [
    {
      code: 'NP',
      name: 'Nepal',
      flag: 'https://flagcdn.com/w40/np.png'
    }
  ],
  allowedCountries: ['Nepal'],
  requireQualification: true
};

// --- Storage: Postgres (Neon) when DATABASE_URL is set, else local JSON file ---
const DATABASE_URL: string = process.env.DATABASE_URL || '';
type NeonSql = (query: string, params?: unknown[]) => Promise<Array<{ data: DatabaseSchema }>>;
let sql: { query: NeonSql } | null = null;
let db: DatabaseSchema = {
  users: {},
  withdrawals: [],
  claims: {},
  tasks: [...SEED_TASKS],
  games: [],
  gamePlays: [],
  settings: { ...DEFAULT_SETTINGS },
  notifications: []
};

function normalizeDB(d: Partial<DatabaseSchema> | null | undefined): DatabaseSchema {
  const rawSettings: Partial<WithdrawSettings> = (d && d.settings) || {};
  const methods: CustomWithdrawMethod[] = Array.isArray(rawSettings.methods)
    ? rawSettings.methods
    : DEFAULT_SETTINGS.methods;
  const countries: AllowedCountryItem[] = Array.isArray(rawSettings.countries)
    ? rawSettings.countries
    : DEFAULT_SETTINGS.countries;
  const loadedTasks: Task[] = d && Array.isArray(d.tasks) && d.tasks.length ? [...d.tasks] : [...SEED_TASKS];
  if (!loadedTasks.some((t) => t.type === 'app_task' || t.type === 'play_game')) {
    SEED_TASKS.filter((t) => t.type === 'app_task' || t.type === 'play_game').forEach((seedT) => {
      if (!loadedTasks.some((x) => x.id === seedT.id)) {
        loadedTasks.push({ ...seedT });
      }
    });
  }
  return {
    users: (d && d.users) || {},
    withdrawals: (d && d.withdrawals) || [],
    claims: (d && d.claims) || {},
    tasks: loadedTasks,
    games: Array.isArray(d?.games) ? d!.games! : [],
    gamePlays: Array.isArray(d?.gamePlays) ? d!.gamePlays! : [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...rawSettings,
      methods,
      allowedMethods: methods.filter((m) => m.enabled !== false).map((m) => m.name),
      countries,
      allowedCountries: countries.map((c) => c.name)
    },
    notifications: Array.isArray(d?.notifications) ? d!.notifications! : []
  };
}

function getNotifications(): AppNotification[] {
  if (!Array.isArray(db.notifications)) {
    db.notifications = [];
  }
  return db.notifications;
}

function pushNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  coins?: number;
}): AppNotification {
  const list = getNotifications();
  const item: AppNotification = {
    id: 'N' + Date.now() + Math.random().toString(36).slice(2, 6),
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type,
    coins: params.coins,
    createdAt: new Date().toISOString(),
    readBy: []
  };
  list.push(item);
  // Keep latest 300 notifications in DB
  if (list.length > 300) {
    db.notifications = list.slice(-300);
  }
  return item;
}

function getUserNotifications(userId: string): {
  notifications: Array<AppNotification & { read: boolean }>;
  unreadCount: number;
} {
  const list = getNotifications()
    .filter((n) => n.userId === 'all' || n.userId === userId)
    .slice(-40)
    .reverse()
    .map((n) => ({
      ...n,
      read: Array.isArray(n.readBy) ? n.readBy.includes(userId) : false
    }));
  const unreadCount = list.filter((n) => !n.read).length;
  return { notifications: list, unreadCount };
}

function getTasks(): Task[] {
  if (!db.tasks || !db.tasks.length) {
    db.tasks = [...SEED_TASKS];
  }
  return db.tasks;
}

function getGames(): HostedGame[] {
  if (!Array.isArray(db.games)) db.games = [];
  return db.games;
}

function getGamePlays(): GamePlay[] {
  if (!Array.isArray(db.gamePlays)) db.gamePlays = [];
  return db.gamePlays;
}

function publicGame(game: HostedGame) {
  const plays = getGamePlays().filter((p) => p.gameId === game.id);
  return {
    ...game,
    plays: plays.length,
    coinsCollected: plays.reduce((sum, p) => sum + p.coins, 0)
  };
}

function validGameFields(body: any): { title: string; description: string; url: string; priceCoins: number; enabled: boolean } | string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid game details.';
  if (body.title !== undefined && typeof body.title !== 'string') return 'Game title must be text.';
  if (body.description !== undefined && typeof body.description !== 'string') return 'Description must be text.';
  if (body.url !== undefined && typeof body.url !== 'string') return 'Game URL must be text.';
  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') return 'Game status must be enabled or paused.';
  const title = String(body?.title || '').trim();
  const description = String(body?.description || '').trim();
  const rawUrl = String(body?.url || '').trim();
  const priceCoins = Number(body?.priceCoins);
  if (title.length < 2 || title.length > 60) return 'Game title must be 2–60 characters.';
  if (description.length > 240) return 'Description must be 240 characters or less.';
  if (rawUrl.length > 2000) return 'Game URL is too long.';
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return 'Enter a valid HTTPS game URL.';
  }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname || parsedUrl.username || parsedUrl.password) {
    return 'Game URL must use HTTPS and cannot include login credentials.';
  }
  if (!Number.isSafeInteger(priceCoins) || priceCoins < 0 || priceCoins > 100000) {
    return 'Play price must be a whole number between 0 and 100,000 coins.';
  }
  return { title, description, url: parsedUrl.toString(), priceCoins, enabled: body?.enabled !== false };
}

const gamePlayTickets = new Map<string, { gameId: string; expiresAt: number }>();

function getSettings(): WithdrawSettings {
  if (!db.settings) {
    db.settings = { ...DEFAULT_SETTINGS };
  }
  return db.settings;
}

let saveChain: Promise<void> = Promise.resolve();

function persistNow(): Promise<void> {
  if (!sql) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch {}
    return Promise.resolve();
  }
  const snapshot = JSON.stringify(db);
  return sql
    .query(
      'INSERT INTO paiso_state (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
      [snapshot]
    )
    .then(() => undefined)
    .catch((e: Error) => console.error('DB save failed:', e.message));
}

function saveDB(): Promise<void> {
  saveChain = saveChain.then(persistNow);
  return saveChain;
}

async function initDB(): Promise<void> {
  if (DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { neon } = require('@neondatabase/serverless');
      sql = neon(DATABASE_URL);
      if (sql) {
        await sql.query('CREATE TABLE IF NOT EXISTS paiso_state (id INT PRIMARY KEY, data JSONB NOT NULL)');
        const rows = await sql.query('SELECT data FROM paiso_state WHERE id = 1');
        if (rows.length) db = normalizeDB(rows[0].data);
        else await persistNow();
        console.log('🗄️  Postgres DB loaded (Neon) — data permanent chha');
        return;
      }
    } catch (e) {
      const err = e as Error;
      console.error('⚠️ Postgres init failed, file DB ma fallback:', err.message);
      sql = null;
    }
  }
  try {
    db = normalizeDB(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
  } catch {}
  console.log('🗄️  File DB mode (DATABASE_URL chhaina)');
}

interface TelegramUserPayload {
  id: number | string;
  first_name?: string;
  username?: string;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Real loopback connection only (Host header can be spoofed, socket address cannot)
function isTrueLocalRequest(req: Request): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (req.headers['x-forwarded-for']) return false;
  const ip = String(req.socket.remoteAddress || '');
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

const INIT_DATA_MAX_AGE_SEC: number = +(process.env.INIT_DATA_MAX_AGE_SEC || 86400);

function verifyInitData(initData: string): TelegramUserPayload | null {
  if (!BOT_TOKEN) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheck = [...params.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');
  if (!safeEqual(calc, hash)) return null;
  // Reject stale / replayed initData
  const authDate = +(params.get('auth_date') || 0);
  if (!authDate || Date.now() / 1000 - authDate > INIT_DATA_MAX_AGE_SEC) return null;
  try {
    return JSON.parse(params.get('user') || 'null');
  } catch {
    return null;
  }
}

async function tgApi(method: string, body?: Record<string, unknown>): Promise<any> {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return r.json();
}

async function isMember(chat: string, userId: string): Promise<boolean> {
  try {
    const r = await tgApi('getChatMember', { chat_id: chat, user_id: userId });
    return Boolean(r.ok && ['member', 'administrator', 'creator'].includes(r.result?.status));
  } catch {
    return false;
  }
}

function getTaskClaimState(userId: string, task: Task): { done: boolean; nextAvailableAt?: number } {
  const claimedAt = db.claims[`${userId}:${task.id}`];
  if (!claimedAt) return { done: false };
  const resetHours = +(task.resetHours || 0);
  if (resetHours > 0) {
    const unlockAt = claimedAt + resetHours * 3600 * 1000;
    if (Date.now() >= unlockAt) {
      return { done: false };
    }
    return { done: true, nextAvailableAt: unlockAt };
  }
  return { done: true };
}

function getQualification(user: User): QualificationStatus {
  const adsDone = user.totalAdsWatched ?? user.adCount ?? 0;
  const activeClaimsCount = getTasks().filter((t) => getTaskClaimState(user.id, t).done).length;
  const tasksDone = Math.max(user.totalTasksCompleted || 0, activeClaimsCount);
  const dailyDone = user.totalDailyCheckins ?? user.dailyStreak ?? (user.lastDaily ? 1 : 0);
  const qualified = adsDone >= REQ_ADS && tasksDone >= REQ_TASKS && dailyDone >= REQ_DAILY;
  return {
    adsDone,
    adsReq: REQ_ADS,
    tasksDone,
    tasksReq: REQ_TASKS,
    dailyDone,
    dailyReq: REQ_DAILY,
    qualified
  };
}

function checkAndPayReferralBonus(user: User): void {
  if (!user.referredBy || user.refBonusPaid) return;
  const referrer = db.users[user.referredBy];
  if (!referrer) return;

  const qual = getQualification(user);
  if (qual.qualified) {
    user.refBonusPaid = true;
    user.qualifiedAt = new Date().toISOString();
    referrer.coins += REFERRAL_BONUS;
    referrer.totalEarned += REFERRAL_BONUS;
    pushNotification({
      userId: referrer.id,
      title: 'Referral Qualified Bonus!',
      message: `Your friend ${user.first_name || user.username || user.id} completed all requirements! +${REFERRAL_BONUS} Coins added.`,
      type: 'referral',
      coins: REFERRAL_BONUS
    });
    saveDB();
    tgApi('sendMessage', {
      chat_id: referrer.id,
      text: `🎉 Timro referral ${user.first_name || user.username || user.id} qualified bhayo (3 Ads, 2 Tasks, 2 Daily Check-in)! +${REFERRAL_BONUS} coins bonus milyo.`
    }).catch(() => {});
  }
}

function getUser(tgUser: TelegramUserPayload, startParam: string): User {
  const id = String(tgUser.id);
  if (!db.users[id]) {
    db.users[id] = {
      id,
      first_name: tgUser.first_name || '',
      username: tgUser.username || '',
      coins: 0,
      totalEarned: 0,
      referrals: 0,
      lastDaily: '',
      totalDailyCheckins: 0,
      totalAdsWatched: 0,
      referredBy: null,
      refBonusPaid: false,
      joinedAt: new Date().toISOString()
    };
    pushNotification({
      userId: id,
      title: 'Welcome to Paiso!',
      message: 'Complete daily check-ins, watch ads, and verify social tasks to earn real rewards.',
      type: 'system'
    });
    const m = /^ref_(\d+)$/.exec(startParam || '');
    if (m && m[1] !== id && db.users[m[1]]) {
      db.users[id].referredBy = m[1];
      db.users[id].refBonusPaid = false;
      db.users[m[1]].referrals += 1;
      pushNotification({
        userId: m[1],
        title: 'New Referral Joined!',
        message: `${tgUser.first_name || 'A friend'} joined via your link! You will earn +${REFERRAL_BONUS} Coins once they qualify.`,
        type: 'referral'
      });
      tgApi('sendMessage', {
        chat_id: m[1],
        text: `👋 Naya referral (${tgUser.first_name || 'User'}) join bhayo! Usle 3 Ads, 2 Social Tasks ra 2 Days Daily Check-in pura garepachhi +${REFERRAL_BONUS} coins bonus aauchha.`
      }).catch(() => {});
    }
    saveDB();
  }
  return db.users[id];
}

function credit(user: User, amount: number, reason: 'task' | 'daily' | 'ad'): void {
  user.coins += amount;
  user.totalEarned += amount;
  if (user.referredBy && db.users[user.referredBy] && (reason === 'task' || reason === 'daily')) {
    const cut = Math.floor(amount * 0.1);
    if (cut > 0) {
      db.users[user.referredBy].coins += cut;
      db.users[user.referredBy].totalEarned += cut;
    }
  }
  saveDB();
}

function getReferralHistory(referrerId: string): ReferralHistoryItem[] {
  return Object.values(db.users)
    .filter((u) => u.referredBy === referrerId)
    .sort((a, b) => (b.joinedAt || '').localeCompare(a.joinedAt || ''))
    .map((u) => {
      const q = getQualification(u);
      return {
        id: u.id,
        name: u.first_name || 'User',
        username: u.username || '',
        joinedAt: u.joinedAt,
        qualified: Boolean(u.refBonusPaid || q.qualified),
        bonusCoins: REFERRAL_BONUS,
        adsDone: q.adsDone,
        adsReq: q.adsReq,
        tasksDone: q.tasksDone,
        tasksReq: q.tasksReq,
        dailyDone: q.dailyDone,
        dailyReq: q.dailyReq
      };
    });
}

// --- Express ---
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Basic security headers (no X-Frame-Options: Telegram Web loads the Mini App in an iframe)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory rate limiter (per IP + bucket)
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(bucket: string, max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${bucket}:${req.ip}`;
    const now = Date.now();
    const cur = rateBuckets.get(key);
    if (!cur || now > cur.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    cur.count += 1;
    if (cur.count > max) {
      res.status(429).json({ ok: false, error: 'Too many requests, please slow down.' });
      return;
    }
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  rateBuckets.forEach((v, k) => {
    if (now > v.resetAt) rateBuckets.delete(k);
  });
}, 60 * 1000).unref();

app.use('/api/', rateLimit('api', 180, 60 * 1000));
app.use('/api/admin/', rateLimit('admin', 120, 60 * 1000));
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

let cachedCountries: AllowedCountryItem[] | null = null;

app.get('/api/countries', async (_req: Request, res: Response) => {
  if (cachedCountries && cachedCountries.length) {
    res.json({ countries: cachedCountries });
    return;
  }
  try {
    const r = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
    const raw = (await r.json()) as Array<{
      cca2?: string;
      name?: { common?: string };
      flags?: { png?: string; svg?: string };
    }>;
    if (Array.isArray(raw)) {
      cachedCountries = raw
        .filter((c) => c.name?.common && c.cca2)
        .map((c) => ({
          code: String(c.cca2),
          name: String(c.name!.common),
          flag: String(c.flags?.png || c.flags?.svg || `https://flagcdn.com/w40/${String(c.cca2).toLowerCase()}.png`)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      res.json({ countries: cachedCountries });
      return;
    }
  } catch {}
  res.json({ countries: getSettings().countries });
});

function auth(req: Request, res: Response, next: NextFunction): void {
  const initData = String(req.headers['x-init-data'] || '');
  const isLocalDev = !initData && isTrueLocalRequest(req);
  const tgUser: TelegramUserPayload | null = isLocalDev
    ? { id: 999001, first_name: 'Test User', username: 'test' }
    : verifyInitData(initData);
  if (!tgUser) {
    res.status(401).json({ error: 'Invalid Telegram login' });
    return;
  }
  const startParam = new URLSearchParams(initData).get('start_param') || '';
  req.user = getUser(tgUser, startParam);
  next();
}

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const STREAK_RESET_MS = 48 * 60 * 60 * 1000; // 48 hours

function getDailyState(user: User): { canDaily: boolean; nextDailyAt: number; dailyStreak: number } {
  const now = Date.now();
  const lastAt = user.lastDailyAt || 0;
  let streak = user.dailyStreak || 0;

  if (lastAt > 0 && now - lastAt >= STREAK_RESET_MS) {
    streak = 0;
  }

  const nextDailyAt = lastAt > 0 ? lastAt + DAILY_COOLDOWN_MS : 0;
  const canDaily = now >= nextDailyAt;

  return { canDaily, nextDailyAt, dailyStreak: streak };
}

app.get('/api/me', auth, (req: Request, res: Response) => {
  const user = req.user!;
  const today = new Date().toISOString().slice(0, 10);
  const dailyState = getDailyState(user);
  const cfg = getSettings();
  checkAndPayReferralBonus(user);
  const notifData = getUserNotifications(user.id);
  // Never expose secret fields (OTP) to the client
  const { pendingOtp: _hiddenOtp, ...safeUser } = user;
  res.json({
    user: safeUser,
    tasks: getTasks().map((t) => {
      const st = getTaskClaimState(user.id, t);
      return { ...t, done: st.done, nextAvailableAt: st.nextAvailableAt };
    }),
    games: getGames().filter((g) => g.enabled).map((g) => {
      const { url: _hiddenUrl, ...safeGame } = publicGame(g);
      return safeGame;
    }),
    recentGames: getGamePlays().filter((play) => play.userId === user.id).slice(-5).reverse().map(({ gameId, gameTitle, coins, at }) => ({ gameId, gameTitle, coins, at })),
    coinPerNpr: cfg.coinPerNpr || COIN_PER_NPR,
    minWithdrawCoins: cfg.minWithdrawCoins || MIN_WITHDRAW_COINS,
    referralBonusCoins: REFERRAL_BONUS,
    dailyBonus: DAILY_BONUS,
    ads: {
      blockId: ADSGRAM_BLOCK_ID,
      reward: AD_REWARD,
      dailyCap: AD_DAILY_CAP,
      watchedToday: user.adDay === today ? user.adCount || 0 : 0
    },
    canDaily: dailyState.canDaily,
    nextDailyAt: dailyState.nextDailyAt,
    dailyStreak: dailyState.dailyStreak,
    qualification: getQualification(user),
    referralHistory: getReferralHistory(user.id),
    withdrawSettings: cfg,
    notifications: notifData.notifications,
    unreadCount: notifData.unreadCount,
    refLink: `https://t.me/${process.env.BOT_USERNAME || 'YourBot'}?start=ref_${user.id}`
  });
});

app.post('/api/games/:id/play', auth, async (req: Request, res: Response) => {
  const user = req.user!;
  const game = getGames().find((g) => g.id === String(req.params.id) && g.enabled);
  if (!game) {
    res.status(404).json({ ok: false, error: 'Game is not available.' });
    return;
  }
  if (typeof validGameFields(game) === 'string') {
    res.status(503).json({ ok: false, error: 'Game URL is invalid. No coins were charged.' });
    return;
  }
  if (user.coins < game.priceCoins) {
    res.status(402).json({ ok: false, error: `You need ${game.priceCoins.toLocaleString()} coins to play this game.` });
    return;
  }

  user.coins -= game.priceCoins;
  const play: GamePlay = {
    id: 'GP' + Date.now() + crypto.randomBytes(3).toString('hex'),
    gameId: game.id,
    gameTitle: game.title,
    userId: user.id,
    coins: game.priceCoins,
    at: new Date().toISOString()
  };
  getGamePlays().push(play);
  pushNotification({
    userId: user.id,
    title: `Played ${game.title}`,
    message: game.priceCoins ? `${game.priceCoins.toLocaleString()} coins used to start the game.` : 'Game started for free.',
    type: 'game',
    coins: game.priceCoins ? -game.priceCoins : undefined
  });
  await saveDB();

  const now = Date.now();
  gamePlayTickets.forEach((ticket, token) => {
    if (ticket.expiresAt <= now) gamePlayTickets.delete(token);
  });
  const ticket = crypto.randomBytes(24).toString('hex');
  gamePlayTickets.set(ticket, { gameId: game.id, expiresAt: now + 30 * 60 * 1000 });
  res.json({ ok: true, coins: user.coins, playUrl: `/api/games/${encodeURIComponent(game.id)}/content?ticket=${ticket}` });
});

app.get('/api/games/:id/content', (req: Request, res: Response) => {
  const id = String(req.params.id || '');
  const ticket = String(req.query.ticket || '');
  const session = gamePlayTickets.get(ticket);
  if (!/^[a-zA-Z0-9_-]{3,80}$/.test(id) || !session || session.gameId !== id || session.expiresAt <= Date.now()) {
    res.status(403).type('text/plain').send('Play session expired. Start the game again.');
    return;
  }
  const game = getGames().find((g) => g.id === id && g.enabled);
  if (!game) {
    res.status(404).type('text/plain').send('Game is no longer available.');
    return;
  }
  const validUrl = validGameFields(game);
  if (typeof validUrl === 'string') {
    res.status(410).type('text/plain').send('Game URL is invalid.');
    return;
  }
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, validUrl.url);
});

app.post('/api/notifications/read', auth, (req: Request, res: Response) => {
  const user = req.user!;
  const targetId = req.body?.id ? String(req.body.id) : '';
  getNotifications().forEach((n) => {
    if (n.userId === 'all' || n.userId === user.id) {
      if (!targetId || n.id === targetId) {
        if (!Array.isArray(n.readBy)) n.readBy = [];
        if (!n.readBy.includes(user.id)) n.readBy.push(user.id);
      }
    }
  });
  saveDB();
  res.json({ ok: true, ...getUserNotifications(user.id) });
});

app.delete('/api/notifications', auth, (req: Request, res: Response) => {
  const user = req.user!;
  db.notifications = getNotifications().filter((n) => n.userId !== user.id);
  getNotifications().forEach((n) => {
    if (n.userId === 'all') {
      if (!Array.isArray(n.readBy)) n.readBy = [];
      if (!n.readBy.includes(user.id)) n.readBy.push(user.id);
    }
  });
  saveDB();
  res.json({ ok: true, ...getUserNotifications(user.id) });
});

app.post('/api/task/claim', auth, async (req: Request, res: Response) => {
  const user = req.user!;
  const task = getTasks().find((t) => t.id === req.body?.taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const key = `${user.id}:${task.id}`;
  const claimState = getTaskClaimState(user.id, task);
  if (claimState.done) {
    res.json({ ok: false, error: 'Already claimed' });
    return;
  }
  // If task reset cooldown expired, clear old claim before starting new verification
  if (db.claims[key]) {
    delete db.claims[key];
    delete db.claims[`${key}:start`];
  }
  if (task.type === 'telegram_join') {
    if (BOT_TOKEN && !(await isMember(task.target, user.id))) {
      res.json({ ok: false, error: 'Pahila join gara, ani Verify dabau.' });
      return;
    }
  } else {
    const started = db.claims[`${key}:start`];
    const waitSec = task.waitSeconds || 15;
    if (!started) {
      db.claims[`${key}:start`] = Date.now();
      saveDB();
      res.json({
        ok: false,
        started: true,
        waitSeconds: waitSec,
        error: `Opened! Wait ${waitSec}s and tap Verify.`
      });
      return;
    }
    if (Date.now() - started < waitSec * 1000) {
      res.json({ ok: false, error: 'Wait time not finished yet, stay on the page and try again.' });
      return;
    }
  }
  db.claims[key] = Date.now();
  delete db.claims[`${key}:start`];
  user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
  pushNotification({
    userId: user.id,
    title: `Task Verified: ${task.title}`,
    message: `You completed "${task.title}" and earned +${task.reward} Coins!`,
    type: 'task',
    coins: task.reward
  });
  credit(user, task.reward, 'task');
  checkAndPayReferralBonus(user);
  res.json({ ok: true, reward: task.reward, coins: user.coins });
});

// --- AdsGram rewarded ads ---
function tryCreditAd(user: User): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (user.adDay !== today) {
    user.adDay = today;
    user.adCount = 0;
  }
  if ((user.adCount || 0) >= AD_DAILY_CAP) return false;
  if (user.lastAdAt && Date.now() - user.lastAdAt < AD_COOLDOWN_MS) return false;
  user.adCount = (user.adCount || 0) + 1;
  user.totalAdsWatched = (user.totalAdsWatched || 0) + 1;
  user.lastAdAt = Date.now();
  pushNotification({
    userId: user.id,
    title: 'Ad Reward Credited',
    message: `You watched a rewarded ad (${user.adCount}/${AD_DAILY_CAP} today) and earned +${AD_REWARD} Coins!`,
    type: 'reward',
    coins: AD_REWARD
  });
  credit(user, AD_REWARD, 'ad');
  checkAndPayReferralBonus(user);
  return true;
}

app.get('/api/adsgram/reward', (req: Request, res: Response) => {
  // Optional shared secret: set ADSGRAM_REWARD_SECRET and append &secret=... to the Adsgram reward URL
  const rewardSecret = process.env.ADSGRAM_REWARD_SECRET || '';
  if (rewardSecret && !safeEqual(String(req.query.secret || ''), rewardSecret)) {
    res.status(403).send('forbidden');
    return;
  }
  const uid = String(req.query.userid || '');
  const user = db.users[uid];
  if (user && ADSGRAM_BLOCK_ID) tryCreditAd(user);
  res.status(200).send('ok');
});

app.post('/api/daily', auth, (req: Request, res: Response) => {
  const user = req.user!;
  const now = Date.now();
  const { canDaily, nextDailyAt, dailyStreak } = getDailyState(user);

  if (!canDaily) {
    const remSec = Math.max(1, Math.ceil((nextDailyAt - now) / 1000));
    const hrs = Math.floor(remSec / 3600);
    const mins = Math.floor((remSec % 3600) / 60);
    res.json({
      ok: false,
      error: `Arko check-in ${hrs}h ${mins}m pachhi milchha!`,
      nextDailyAt,
      dailyStreak
    });
    return;
  }

  const newStreak = (dailyStreak % 7) + 1;
  const reward = newStreak === 7 ? DAILY_BONUS * 2 : DAILY_BONUS;
  user.lastDaily = new Date(now).toISOString().slice(0, 10);
  user.lastDailyAt = now;
  user.dailyStreak = newStreak;
  user.totalDailyCheckins = (user.totalDailyCheckins || 0) + 1;
  pushNotification({
    userId: user.id,
    title: `Day ${newStreak} Check-in Bonus!`,
    message: `Daily check-in claimed! +${reward} Coins added to your balance.`,
    type: 'reward',
    coins: reward
  });
  credit(user, reward, 'daily');
  checkAndPayReferralBonus(user);

  res.json({
    ok: true,
    reward,
    coins: user.coins,
    dailyStreak: newStreak,
    nextDailyAt: now + DAILY_COOLDOWN_MS
  });
});

app.post('/api/withdraw', auth, (req: Request, res: Response) => {
  const user = req.user!;
  const cfg = getSettings();
  const qual = getQualification(user);
  if (cfg.requireQualification !== false && !qual.qualified) {
    res.json({
      ok: false,
      error: `Withdraw unlock garna 3 Ads (${qual.adsDone}/${qual.adsReq}), 2 Social Tasks (${qual.tasksDone}/${qual.tasksReq}) ra 2 Days Check-in (${qual.dailyDone}/${qual.dailyReq}) pura garnuhos!`
    });
    return;
  }

  const { method, account, amountCoins } = req.body || {};
  const enabledNames = (cfg.methods || []).filter((m) => m.enabled !== false).map((m) => m.name);
  if (!method || (enabledNames.length > 0 && !enabledNames.includes(String(method)))) {
    res.json({ ok: false, error: `${method || 'Selected'} withdrawal method is not enabled` });
    return;
  }
  if (!account || String(account).length < 5) {
    res.json({ ok: false, error: 'Sahi account number/id hal' });
    return;
  }
  const minCoins = cfg.minWithdrawCoins || MIN_WITHDRAW_COINS;
  const rate = cfg.coinPerNpr || COIN_PER_NPR;
  const amt = Math.floor(+(amountCoins || 0));
  if (amt < minCoins) {
    res.json({
      ok: false,
      error: `Minimum withdraw ${minCoins} coins (NPR ${(minCoins / rate).toFixed(0)})`
    });
    return;
  }
  if (amt > user.coins) {
    res.json({ ok: false, error: 'Balance pugena' });
    return;
  }
  user.coins -= amt;
  const w: Withdrawal = {
    id: 'W' + Date.now(),
    userId: user.id,
    username: user.username,
    method,
    account: String(account),
    coins: amt,
    npr: +(amt / rate).toFixed(2),
    status: 'pending',
    at: new Date().toISOString()
  };
  db.withdrawals.push(w);
  pushNotification({
    userId: user.id,
    title: 'Withdrawal Request Submitted',
    message: `Your withdrawal of ${w.coins} Coins (NPR ${w.npr}) via ${w.method} (${w.account}) is pending admin approval.`,
    type: 'withdraw',
    coins: w.coins
  });
  saveDB();
  if (ADMIN_ID) {
    tgApi('sendMessage', {
      chat_id: ADMIN_ID,
      text: `💸 Withdraw request ${w.id}\n@${w.username} (${w.userId})\n${w.method}: ${w.account}\n${w.coins} coins = NPR ${w.npr}`
    }).catch(() => {});
  }
  res.json({ ok: true, withdraw: w, coins: user.coins });
});

app.get('/api/my-withdrawals', auth, (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    withdrawals: db.withdrawals
      .filter((w) => w.userId === user.id)
      .slice(-20)
      .reverse()
  });
});

// --- Profile Verification (Details + Real Email/Telegram OTP -> Blue Tick) ---
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'mailinator.com',
  'yopmail.com',
  'guerrillamail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'maildrop.cc'
]);

async function hasValidEmailDomainMx(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) return false;
  try {
    const records = await dns.promises.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

async function sendVerificationEmail(toEmail: string, fullName: string, otp: string): Promise<boolean> {
  const htmlBody = `<div style="font-family:sans-serif;max-width:440px;margin:0 auto;padding:24px;border:1px solid #E2E8F0;border-radius:16px">
    <h2 style="color:#091A3C;margin:0 0 8px">Verify your Paiso Account</h2>
    <p style="color:#475569;font-size:14px">Hi <b>${fullName}</b>, use the 6-digit OTP below to complete your profile verification and unlock your Blue Tick badge:</p>
    <div style="background:#EFF6FF;border:1px dashed #2563EB;border-radius:12px;padding:16px;text-align:center;font-size:28px;font-weight:800;letter-spacing:6px;color:#1D4ED8;margin:18px 0">${otp}</div>
    <p style="color:#64748B;font-size:12px">This code expires in 10 minutes.</p>
  </div>`;

  // 1. Try SMTP via Nodemailer (e.g. Gmail App Password or custom SMTP)
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: +(process.env.SMTP_PORT || 465),
        secure: (process.env.SMTP_PORT || '465') === '465',
        auth: { user: smtpUser, pass: smtpPass }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Paiso Verification" <${smtpUser}>`,
        to: toEmail,
        subject: `${otp} is your Paiso Verification OTP`,
        html: htmlBody
      });
      return true;
    } catch (e) {
      console.error('SMTP email error:', (e as Error).message);
    }
  }

  // 2. Try Resend API if configured
  const resendKey = process.env.RESEND_API_KEY || '';
  if (resendKey) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Paiso Verification <onboarding@resend.dev>',
          to: [toEmail],
          subject: `${otp} is your Paiso Verification OTP`,
          html: htmlBody
        })
      });
      if (r.ok) return true;
    } catch {}
  }

  return false;
}

// Telegram OTP delivery (primary channel since 2026-10-25: outbound SMTP is
// blocked from Render, so email OTP times out. Telegram Bot API uses HTTPS
// port 443, which is never blocked. Email stays an OPTIONAL profile field.)
async function sendTelegramOtp(chatId: string, otp: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔐 Paiso Verification Code\n\nYour 6-digit code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`
      }),
      signal: AbortSignal.timeout(15000)
    });
    const j: any = await r.json();
    return Boolean(j.ok);
  } catch (e) {
    console.error('Telegram OTP error:', (e as Error).message);
    return false;
  }
}

app.post('/api/verify/send-otp', auth, async (req: Request, res: Response) => {
  const user = req.user!;
  if (user.verified && user.verification?.verified) {
    res.json({ ok: false, error: 'Account is already verified!' });
    return;
  }

  const fullName = String(req.body?.fullName || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const dob = String(req.body?.dob || '').trim();
  const gender = String(req.body?.gender || '').trim() as UserGender;

  if (fullName.length < 3 || !/^[a-zA-Z\s.'-]+$/.test(fullName)) {
    res.json({ ok: false, error: 'Please enter your real full name (letters only)' });
    return;
  }
  // Email is OPTIONAL now (delivery is via Telegram). If given, it must be valid.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.json({ ok: false, error: 'Please enter a valid email address' });
    return;
  }

  // Check if email is already used by another verified user (only when given)
  const emailTaken = Boolean(email) && Object.values(db.users).some(
    (u) => u.id !== user.id && u.verified && u.verification?.email?.toLowerCase() === email
  );
  if (emailTaken) {
    res.json({ ok: false, error: 'This email address is already linked to another verified account' });
    return;
  }

  // Real DNS MX record check on the email domain (only when email is given)
  if (email) {
    const validDomain = await hasValidEmailDomainMx(email);
    if (!validDomain) {
      res.json({
        ok: false,
        error: 'Invalid or disposable email domain! Please use a real email (e.g. Gmail, Outlook, Yahoo, iCloud).'
      });
      return;
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    res.json({ ok: false, error: 'Please select your Date of Birth' });
    return;
  }
  const birthYear = +dob.slice(0, 4);
  const currentYear = new Date().getFullYear();
  if (currentYear - birthYear < 13 || currentYear - birthYear > 100) {
    res.json({ ok: false, error: 'You must be at least 13 years old to verify your account' });
    return;
  }

  if (gender !== 'Male' && gender !== 'Female') {
    res.json({ ok: false, error: 'Please select Male or Female' });
    return;
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  const prevOtp = user.pendingOtp;
  if (prevOtp?.sentAt && Date.now() - prevOtp.sentAt < 60 * 1000) {
    res.json({ ok: false, error: 'Please wait 60 seconds before requesting a new OTP.' });
    return;
  }

  // OTP is delivered to the user's Telegram chat via @PaisoEarnBot.
  // (Email delivery is intentionally NOT attempted here: outbound SMTP is
  // blocked from Render and would hang the request for ~2 minutes.)
  const tgSent = await sendTelegramOtp(user.id, otp);
  if (!tgSent) {
    res.json({ ok: false, error: 'Could not send OTP to your Telegram chat. Please open Paiso from @PaisoEarnBot and try again.' });
    return;
  }

  user.pendingOtp = {
    otp,
    fullName,
    email,
    dob,
    gender,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    sentAt: Date.now()
  };
  saveDB();

  res.json({
    ok: true,
    channel: 'telegram',
    message: '6-digit verification code sent to your Telegram chat!'
  });
});

app.post('/api/verify/confirm-otp', auth, (req: Request, res: Response) => {
  const user = req.user!;
  const code = String(req.body?.otp || '').trim();

  if (!user.pendingOtp) {
    res.json({ ok: false, error: 'Please request an OTP first' });
    return;
  }
  if (Date.now() > user.pendingOtp.expiresAt) {
    delete user.pendingOtp;
    saveDB();
    res.json({ ok: false, error: 'OTP expired! Please request a new OTP.' });
    return;
  }
  if (code !== user.pendingOtp.otp) {
    user.pendingOtp.attempts = (user.pendingOtp.attempts || 0) + 1;
    if (user.pendingOtp.attempts >= 5) {
      delete user.pendingOtp;
      saveDB();
      res.json({ ok: false, error: 'Too many wrong attempts! Please request a new OTP.' });
      return;
    }
    saveDB();
    res.json({ ok: false, error: `Invalid OTP code! ${5 - user.pendingOtp.attempts} attempts left.` });
    return;
  }

  // Re-check email uniqueness at confirm time (race safety, only when an email was given)
  const emailTakenNow = Boolean(user.pendingOtp!.email) && Object.values(db.users).some(
    (u) => u.id !== user.id && u.verified && u.verification?.email?.toLowerCase() === user.pendingOtp!.email
  );
  if (emailTakenNow) {
    delete user.pendingOtp;
    saveDB();
    res.json({ ok: false, error: 'This email address is already linked to another verified account' });
    return;
  }

  const { fullName, email, dob, gender } = user.pendingOtp;
  user.verified = true;
  user.first_name = fullName;
  user.verification = {
    verified: true,
    fullName,
    email,
    dob,
    gender,
    verifiedAt: new Date().toISOString()
  };
  delete user.pendingOtp;
  pushNotification({
    userId: user.id,
    title: 'Profile Verified (Blue Tick)!',
    message: `Congratulations ${fullName}! Your profile is verified and your Blue Tick badge is now active.${email ? ` Email (${email}) is linked.` : ''}`,
    type: 'system'
  });
  saveDB();

  res.json({
    ok: true,
    verified: true,
    verification: user.verification
  });
});

// --- Admin endpoints ---
function adminOnly(req: Request, res: Response, next: NextFunction): void {
  const key = String(req.headers['x-admin-id'] || '').trim();
  const secret = process.env.ADMIN_SECRET || '';
  if (key && ((secret && safeEqual(key, secret)) || (ADMIN_ID && safeEqual(key, ADMIN_ID)))) {
    next();
    return;
  }
  // Local dev convenience only when request truly comes from loopback
  if (isTrueLocalRequest(req) && key === 'admin') {
    next();
    return;
  }
  res.status(403).json({ error: 'forbidden' });
}

app.get('/api/admin/withdrawals', adminOnly, (_req: Request, res: Response) => {
  res.json({ withdrawals: db.withdrawals.filter((w) => w.status === 'pending') });
});

app.get('/api/admin/stats', adminOnly, (_req: Request, res: Response) => {
  const users = Object.values(db.users);
  const gamePlays = getGamePlays();
  const pendingList = db.withdrawals.filter((w) => w.status === 'pending');
  const paidList = db.withdrawals.filter((w) => w.status === 'paid');
  const rejectedList = db.withdrawals.filter((w) => w.status === 'rejected');

  res.json({
    totalUsers: users.length,
    verifiedUsers: users.filter((u) => Boolean(u.verified)).length,
    qualifiedUsers: users.filter((u) => getQualification(u).qualified).length,
    totalCoins: users.reduce((s, u) => s + u.coins, 0),
    totalEarned: users.reduce((s, u) => s + u.totalEarned, 0),
    pendingWithdrawals: pendingList.length,
    paidWithdrawals: paidList.length,
    rejectedWithdrawals: rejectedList.length,
    pendingNpr: +pendingList.reduce((s, w) => s + w.npr, 0).toFixed(2),
    paidNpr: +paidList.reduce((s, w) => s + w.npr, 0).toFixed(2),
    games: getGames().map(publicGame),
    gameStarts: gamePlays.length,
    gameCoinsCollected: gamePlays.reduce((sum, p) => sum + p.coins, 0),
    users: users
      .sort((a, b) => b.coins - a.coins)
      .map((u) => {
        const q = getQualification(u);
        return {
          id: u.id,
          name: u.verification?.fullName || u.first_name || 'User',
          username: u.username || '',
          coins: u.coins,
          totalEarned: u.totalEarned,
          referrals: u.referrals,
          verified: Boolean(u.verified),
          email: u.verification?.email || '',
          gender: u.verification?.gender || '',
          dob: u.verification?.dob || '',
          qualified: q.qualified,
          adsDone: q.adsDone,
          tasksDone: q.tasksDone,
          dailyDone: q.dailyDone,
          joinedAt: u.joinedAt
        };
      }),
    recentWithdrawals: [...db.withdrawals].reverse(),
    dbMode: sql ? 'postgres' : 'file',
    tasks: getTasks().map((t) => {
      const claimsCount = Object.keys(db.claims).filter(
        (k) => k.endsWith(`:${t.id}`) && !k.endsWith(':start') && getTaskClaimState(k.split(':')[0], t).done
      ).length;
      return { ...t, claimsCount };
    }),
    settings: getSettings(),
    notifications: [...getNotifications()].reverse().slice(0, 50)
  });
});

app.post('/api/admin/games', adminOnly, async (req: Request, res: Response) => {
  const fields = validGameFields(req.body);
  if (typeof fields === 'string') {
    res.status(400).json({ ok: false, error: fields });
    return;
  }
  const game: HostedGame = {
    id: `game_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    ...fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  getGames().push(game);
  await saveDB();
  res.json({ ok: true, game: publicGame(game) });
});

app.put('/api/admin/games/:id', adminOnly, async (req: Request, res: Response) => {
  const game = getGames().find((g) => g.id === String(req.params.id));
  if (!game) {
    res.status(404).json({ ok: false, error: 'Game not found.' });
    return;
  }
  const fields = validGameFields({ ...game, ...(req.body || {}) });
  if (typeof fields === 'string') {
    res.status(400).json({ ok: false, error: fields });
    return;
  }
  Object.assign(game, fields, { updatedAt: new Date().toISOString() });
  await saveDB();
  res.json({ ok: true, game: publicGame(game) });
});

app.delete('/api/admin/games/:id', adminOnly, async (req: Request, res: Response) => {
  const id = String(req.params.id || '');
  const index = getGames().findIndex((g) => g.id === id);
  if (index === -1) {
    res.status(404).json({ ok: false, error: 'Game not found.' });
    return;
  }
  getGames().splice(index, 1);
  gamePlayTickets.forEach((ticket, token) => {
    if (ticket.gameId === id) gamePlayTickets.delete(token);
  });
  await saveDB();
  res.json({ ok: true });
});

app.post('/api/admin/notifications', adminOnly, (req: Request, res: Response) => {
  const b = req.body || {};
  const targetUserId = String(b.userId || 'all').trim() || 'all';
  const title = String(b.title || '').trim();
  const message = String(b.message || '').trim();
  const bonusCoins = Math.max(0, Math.floor(+(b.coins || 0)));

  if (!title || !message) {
    res.status(400).json({ ok: false, error: 'Title and Message are required' });
    return;
  }

  if (targetUserId !== 'all' && !db.users[targetUserId]) {
    res.status(404).json({ ok: false, error: `User ID #${targetUserId} not found` });
    return;
  }

  // Credit optional bonus coins
  if (bonusCoins > 0) {
    if (targetUserId === 'all') {
      Object.values(db.users).forEach((u) => {
        u.coins += bonusCoins;
        u.totalEarned += bonusCoins;
      });
    } else if (db.users[targetUserId]) {
      db.users[targetUserId].coins += bonusCoins;
      db.users[targetUserId].totalEarned += bonusCoins;
    }
  }

  const notif = pushNotification({
    userId: targetUserId,
    title,
    message,
    type: 'admin',
    coins: bonusCoins > 0 ? bonusCoins : undefined
  });
  saveDB();

  // Also send via Telegram Bot if BOT_TOKEN is configured
  if (BOT_TOKEN) {
    const tgText = `🔔 *${title}*\n${message}${bonusCoins > 0 ? `\n\n🎁 Bonus: +${bonusCoins} Coins credited!` : ''}`;
    if (targetUserId === 'all') {
      Object.keys(db.users).forEach((uid) => {
        tgApi('sendMessage', { chat_id: uid, text: tgText }).catch(() => {});
      });
    } else {
      tgApi('sendMessage', { chat_id: targetUserId, text: tgText }).catch(() => {});
    }
  }

  res.json({ ok: true, notification: notif });
});

app.delete('/api/admin/notifications/:id', adminOnly, (req: Request, res: Response) => {
  const nid = String(req.params.id);
  db.notifications = getNotifications().filter((n) => n.id !== nid);
  saveDB();
  res.json({ ok: true });
});

app.post('/api/admin/settings', adminOnly, (req: Request, res: Response) => {
  const cur = getSettings();
  const body = req.body || {};

  const methods: CustomWithdrawMethod[] = Array.isArray(body.methods)
    ? body.methods
        .map((m: any) => ({
          id: String(m.id || 'm_' + Date.now() + Math.random().toString(36).slice(2, 6)),
          name: String(m.name || '').trim(),
          logo: String(m.logo || '').trim(),
          placeholder: String(m.placeholder || `Enter ${m.name || 'Account'} ID`).trim(),
          country: String(m.country || 'All').trim(),
          enabled: m.enabled !== false
        }))
        .filter((m: CustomWithdrawMethod) => Boolean(m.name))
    : cur.methods;

  const countries: AllowedCountryItem[] = Array.isArray(body.countries)
    ? body.countries
        .map((c: any) => ({
          code: String(c.code || '').trim(),
          name: String(c.name || '').trim(),
          flag: String(c.flag || '').trim()
        }))
        .filter((c: AllowedCountryItem) => Boolean(c.name))
    : cur.countries;

  const minWithdrawCoins = Math.max(100, Math.floor(+(body.minWithdrawCoins ?? cur.minWithdrawCoins)));
  const coinPerNpr = Math.max(1, Math.floor(+(body.coinPerNpr ?? cur.coinPerNpr)));
  const requireQualification =
    typeof body.requireQualification === 'boolean' ? body.requireQualification : cur.requireQualification;

  db.settings = {
    methods,
    allowedMethods: methods.filter((m) => m.enabled !== false).map((m) => m.name),
    minWithdrawCoins,
    coinPerNpr,
    countries,
    allowedCountries: countries.map((c) => c.name),
    requireQualification
  };
  saveDB();
  res.json({ ok: true, settings: db.settings });
});

app.post('/api/admin/tasks', adminOnly, (req: Request, res: Response) => {
  const b = req.body || {};
  const title = String(b.title || '').trim();
  const reward = Math.max(1, Math.floor(+(b.reward || 100)));
  const validTypes: TaskType[] = ['telegram_join', 'social_visit', 'app_task', 'play_game'];
  const type: TaskType = validTypes.includes(b.type) ? b.type : 'social_visit';
  const url = String(b.url || '').trim();
  const target = String(b.target || url).trim();
  const waitSeconds = Math.max(5, Math.floor(+(b.waitSeconds || 15)));
  const resetHours = Math.max(0, Math.floor(+(b.resetHours || 0)));

  if (!title || !url) {
    res.status(400).json({ ok: false, error: 'Title and URL are required' });
    return;
  }

  const iconMap: Record<TaskType, string> = {
    telegram_join: 'TG',
    social_visit: 'WEB',
    app_task: 'APP',
    play_game: 'GAME'
  };

  const newTask: Task = {
    id: 'task_' + Date.now(),
    title,
    description: String(b.description || title),
    icon: iconMap[type] || 'WEB',
    reward,
    type,
    target,
    url,
    waitSeconds,
    resetHours
  };
  getTasks().push(newTask);
  saveDB();
  res.json({ ok: true, task: newTask, tasks: getTasks() });
});

app.put('/api/admin/tasks/:id', adminOnly, (req: Request, res: Response) => {
  const list = getTasks();
  const idx = list.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ ok: false, error: 'Task not found' });
    return;
  }
  const b = req.body || {};
  const cur = list[idx];
  const validTypes: TaskType[] = ['telegram_join', 'social_visit', 'app_task', 'play_game'];
  list[idx] = {
    ...cur,
    title: String(b.title ?? cur.title).trim(),
    reward: Math.max(1, Math.floor(+(b.reward ?? cur.reward))),
    type: validTypes.includes(b.type) ? b.type : cur.type,
    url: String(b.url ?? cur.url).trim(),
    target: String(b.target ?? cur.target).trim(),
    waitSeconds: Math.max(5, Math.floor(+(b.waitSeconds ?? cur.waitSeconds ?? 15))),
    resetHours: Math.max(0, Math.floor(+(b.resetHours ?? cur.resetHours ?? 0)))
  };
  saveDB();
  res.json({ ok: true, task: list[idx], tasks: list });
});

app.post('/api/admin/tasks/reset-all', adminOnly, (_req: Request, res: Response) => {
  db.claims = {};
  const nowIso = new Date().toISOString();
  getTasks().forEach((t) => {
    t.lastResetAt = nowIso;
  });
  saveDB();
  res.json({ ok: true, tasks: getTasks() });
});

app.post('/api/admin/tasks/:id/reset', adminOnly, (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  const task = getTasks().find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ ok: false, error: 'Task not found' });
    return;
  }
  Object.keys(db.claims).forEach((k) => {
    if (k.endsWith(`:${taskId}`) || k.endsWith(`:${taskId}:start`)) {
      delete db.claims[k];
    }
  });
  task.lastResetAt = new Date().toISOString();
  saveDB();
  res.json({ ok: true, task, tasks: getTasks() });
});

app.delete('/api/admin/tasks/:id', adminOnly, (req: Request, res: Response) => {
  const taskId = String(req.params.id);
  db.tasks = getTasks().filter((t) => t.id !== taskId);
  Object.keys(db.claims).forEach((k) => {
    if (k.endsWith(`:${taskId}`) || k.endsWith(`:${taskId}:start`)) {
      delete db.claims[k];
    }
  });
  saveDB();
  res.json({ ok: true, tasks: getTasks() });
});

app.post('/api/admin/users', adminOnly, (req: Request, res: Response) => {
  const b = req.body || {};
  const id = String(b.id || Date.now()).trim();
  if (db.users[id]) {
    res.status(400).json({ ok: false, error: 'User ID already exists' });
    return;
  }
  const name = String(b.name || 'New User').trim();
  const username = String(b.username || '').trim();
  const coins = Math.max(0, Math.floor(+(b.coins || 0)));
  const verified = Boolean(b.verified);
  const email = String(b.email || '').trim();

  const newUser: User = {
    id,
    first_name: name,
    username,
    coins,
    totalEarned: coins,
    referrals: 0,
    lastDaily: '',
    referredBy: null,
    verified,
    verification: verified
      ? {
          verified: true,
          fullName: name,
          email: email || 'verified@paiso.app',
          dob: '2000-01-01',
          gender: 'Male',
          verifiedAt: new Date().toISOString()
        }
      : undefined,
    joinedAt: new Date().toISOString()
  };
  db.users[id] = newUser;
  saveDB();
  res.json({ ok: true, user: newUser });
});

app.put('/api/admin/user/:id', adminOnly, (req: Request, res: Response) => {
  const uid = String(req.params.id);
  const u = db.users[uid];
  if (!u) {
    res.status(404).json({ ok: false, error: 'User not found' });
    return;
  }
  const b = req.body || {};
  if (b.name !== undefined) u.first_name = String(b.name).trim();
  if (b.username !== undefined) u.username = String(b.username).trim();
  if (b.coins !== undefined) u.coins = Math.max(0, Math.floor(+b.coins));
  if (b.adsDone !== undefined) u.totalAdsWatched = Math.max(0, Math.floor(+b.adsDone));
  if (b.dailyDone !== undefined) u.totalDailyCheckins = Math.max(0, Math.floor(+b.dailyDone));
  if (typeof b.verified === 'boolean') {
    u.verified = b.verified;
    if (u.verified) {
      u.verification = {
        verified: true,
        fullName: u.first_name,
        email: String(b.email || u.verification?.email || 'verified@paiso.app'),
        dob: u.verification?.dob || '2000-01-01',
        gender: u.verification?.gender || 'Male',
        verifiedAt: u.verification?.verifiedAt || new Date().toISOString()
      };
    } else if (u.verification) {
      u.verification.verified = false;
    }
  }
  saveDB();
  res.json({ ok: true, user: u });
});

app.post('/api/admin/user/:id/coins', adminOnly, (req: Request, res: Response) => {
  const uid = String(req.params.id);
  const u = db.users[uid];
  if (!u) {
    res.status(404).json({ ok: false, error: 'User not found' });
    return;
  }
  const delta = Math.floor(+(req.body?.delta || 0));
  u.coins = Math.max(0, u.coins + delta);
  if (delta > 0) u.totalEarned += delta;
  saveDB();
  res.json({ ok: true, coins: u.coins });
});

app.post('/api/admin/user/:id/verify', adminOnly, (req: Request, res: Response) => {
  const uid = String(req.params.id);
  const u = db.users[uid];
  if (!u) {
    res.status(404).json({ ok: false, error: 'User not found' });
    return;
  }
  u.verified = !u.verified;
  if (u.verified && !u.verification) {
    u.verification = {
      verified: true,
      fullName: u.first_name || 'Verified User',
      email: 'verified@paiso.app',
      dob: '2000-01-01',
      gender: 'Male',
      verifiedAt: new Date().toISOString()
    };
  } else if (u.verification) {
    u.verification.verified = u.verified;
  }
  if (u.verified) {
    pushNotification({
      userId: uid,
      title: 'Profile Verified by Admin!',
      message: 'Your account has been verified with a Blue Tick badge.',
      type: 'system'
    });
  }
  saveDB();
  res.json({ ok: true, verified: u.verified });
});

app.delete('/api/admin/user/:id', adminOnly, (req: Request, res: Response) => {
  const uid = String(req.params.id);
  delete db.users[uid];
  saveDB();
  res.json({ ok: true });
});

app.post('/api/admin/withdrawals', adminOnly, (req: Request, res: Response) => {
  const b = req.body || {};
  const userId = String(b.userId || '').trim();
  const username = String(b.username || db.users[userId]?.username || userId).trim();
  const method: WithdrawMethod = String(b.method || getSettings().methods[0]?.name || 'Custom').trim();
  const account = String(b.account || '').trim();
  const coins = Math.max(100, Math.floor(+(b.coins || 10000)));
  const rate = getSettings().coinPerNpr || COIN_PER_NPR;
  const status = b.status === 'paid' || b.status === 'rejected' ? b.status : 'pending';

  if (!userId || !account) {
    res.status(400).json({ ok: false, error: 'User ID and Account are required' });
    return;
  }

  const w: Withdrawal = {
    id: 'W' + Date.now(),
    userId,
    username,
    method,
    account,
    coins,
    npr: +(coins / rate).toFixed(2),
    status,
    at: new Date().toISOString()
  };
  db.withdrawals.push(w);
  pushNotification({
    userId: w.userId,
    title: 'Withdrawal Created',
    message: `Withdrawal ${w.id} of ${w.coins} Coins (NPR ${w.npr}) via ${w.method} (${w.account}) — Status: ${w.status.toUpperCase()}.`,
    type: 'withdraw',
    coins: w.coins
  });
  saveDB();
  res.json({ ok: true, withdraw: w });
});

app.put('/api/admin/withdraw/:id', adminOnly, (req: Request, res: Response) => {
  const wid = String(req.params.id);
  const w = db.withdrawals.find((x) => x.id === wid);
  if (!w) {
    res.status(404).json({ ok: false, error: 'Withdrawal not found' });
    return;
  }
  const b = req.body || {};
  const rate = getSettings().coinPerNpr || COIN_PER_NPR;
  if (b.method) w.method = String(b.method).trim();
  if (b.account !== undefined) w.account = String(b.account).trim();
  if (b.coins !== undefined) {
    w.coins = Math.max(1, Math.floor(+b.coins));
    w.npr = +(w.coins / rate).toFixed(2);
  }
  if (b.status === 'pending' || b.status === 'paid' || b.status === 'rejected') {
    w.status = b.status;
  }
  saveDB();
  res.json({ ok: true, withdraw: w });
});

app.delete('/api/admin/withdraw/:id', adminOnly, (req: Request, res: Response) => {
  const wid = String(req.params.id);
  db.withdrawals = db.withdrawals.filter((x) => x.id !== wid);
  saveDB();
  res.json({ ok: true });
});

app.post('/api/admin/withdraw/:id', adminOnly, (req: Request, res: Response) => {
  const w = db.withdrawals.find((x) => x.id === req.params.id);
  if (!w) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  if (w.status !== 'pending') {
    res.status(400).json({ ok: false, error: `Withdrawal already ${w.status}` });
    return;
  }
  w.status = req.body?.action === 'paid' ? 'paid' : 'rejected';
  if (w.status === 'rejected' && db.users[w.userId]) {
    db.users[w.userId].coins += w.coins;
  }
  pushNotification({
    userId: w.userId,
    title: w.status === 'paid' ? `Withdrawal Approved (${w.id})` : `Withdrawal Rejected (${w.id})`,
    message:
      w.status === 'paid'
        ? `Your payout of NPR ${w.npr} (${w.coins} Coins) to ${w.method} (${w.account}) has been sent!`
        : `Your withdrawal request ${w.id} was rejected and ${w.coins} Coins were refunded to your balance.`,
    type: 'withdraw',
    coins: w.coins
  });
  saveDB();
  tgApi('sendMessage', {
    chat_id: w.userId,
    text:
      w.status === 'paid'
        ? `✅ Withdraw ${w.id} PAID: NPR ${w.npr} -> ${w.method}`
        : `❌ Withdraw ${w.id} rejected, coins refund bhayo.`
  }).catch(() => {});
  res.json({ ok: true, withdraw: w });
});

// --- Bot polling (/start with Mini App button) ---
let offset = 0;
async function poll(): Promise<void> {
  if (!BOT_TOKEN) {
    console.log('⚠️  BOT_TOKEN chhaina - bot polling off, API dev mode ma chha.');
    return;
  }
  console.log('🤖 Bot polling start...');
  while (true) {
    try {
      const r = await tgApi('getUpdates', { offset, timeout: 25 });
      if (!r || r.ok === false) {
        await new Promise((res2) => setTimeout(res2, 5000));
        continue;
      }
      for (const u of r.result || []) {
        offset = u.update_id + 1;
        const msg = u.message;
        if (!msg?.text) continue;
        if (msg.text.startsWith('/start')) {
          const param = msg.text.split(' ')[1] || '';
          getUser(msg.from, param);
          await tgApi('sendMessage', {
            chat_id: msg.chat.id,
            text: `👋 Paiso ma swagat chha ${msg.from.first_name}!\n\n🪙 Tasks gara, coins kamaau\n👥 Refer gara = +${REFERRAL_BONUS} coins\n💸 ${MIN_WITHDRAW_COINS} coins = NPR ${MIN_WITHDRAW_COINS / COIN_PER_NPR} withdraw (eSewa/Khalti)\n\nTala ko button dabayera Paiso app khola 👇`,
            reply_markup: {
              inline_keyboard: [[{ text: '🚀 Open Paiso App', web_app: { url: process.env.WEBAPP_URL || '' } }]]
            }
          });
        }
        if (msg.text === '/balance') {
          const u2 = getUser(msg.from, '');
          await tgApi('sendMessage', {
            chat_id: msg.chat.id,
            text: `🪙 Balance: ${u2.coins} coins (≈ NPR ${(u2.coins / COIN_PER_NPR).toFixed(2)})`
          });
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

initDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));
  poll();
});
