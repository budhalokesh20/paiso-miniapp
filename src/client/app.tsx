import { h, Fragment } from './jsx';
import { SvgSpriteDefs } from './components/Icons';
import { HomeView } from './components/HomeView';
import { AppHeader } from './components/shared/AppHeader';
import { EarnIcon } from './components/shared/EarnIcon';
import { UiIcon } from './components/shared/UiIcon';
import { GameCard } from './components/shared/GameCard';
import { updateFeaturedGames, showFeaturedGamesError } from './components/home/FeaturedGames';
import { TasksView, OffersView } from './components/TasksView';
import { FriendsView } from './components/FriendsView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { GamesView, GameModal } from './components/GamesView';

export type TabName = 'home' | 'tasks' | 'refer' | 'wallet' | 'games' | 'offers';
export type TaskFilter = 'all' | 'telegram_join' | 'social_visit' | 'app_task' | 'play_game' | 'done' | 'video';
export type ClientWithdrawMethod = string;
export type ClientGender = 'Male' | 'Female';

interface ClientCustomWithdrawMethod {
  id: string;
  name: string;
  logo: string;
  placeholder?: string;
  country?: string;
  enabled: boolean;
}

interface ClientAllowedCountry {
  code: string;
  name: string;
  flag: string;
}

interface ClientVerification {
  verified: boolean;
  fullName: string;
  email: string;
  dob: string;
  gender: ClientGender;
  verifiedAt?: string;
}

interface ClientUser {
  id: string;
  first_name: string;
  username: string;
  coins: number;
  totalEarned: number;
  referrals: number;
  lastDaily: string;
  lastDailyAt?: number;
  dailyStreak?: number;
  verified?: boolean;
  verification?: ClientVerification;
}

interface ClientTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  type: 'telegram_join' | 'social_visit' | 'app_task' | 'play_game';
  target: string;
  url: string;
  waitSeconds?: number;
  resetHours?: number;
  nextAvailableAt?: number;
  done?: boolean;
}

interface ClientGame {
  id: string;
  title: string;
  description: string;
  priceCoins: number;
  enabled: boolean;
  plays: number;
  coinsCollected: number;
}

interface ClientAdsInfo {
  blockId: string;
  reward: number;
  dailyCap: number;
  watchedToday: number;
}

interface ClientQualification {
  adsDone: number;
  adsReq: number;
  tasksDone: number;
  tasksReq: number;
  dailyDone: number;
  dailyReq: number;
  qualified: boolean;
}

interface ClientRefHistoryItem {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
  qualified: boolean;
  bonusCoins: number;
  adsDone: number;
  adsReq: number;
  tasksDone: number;
  tasksReq: number;
  dailyDone: number;
  dailyReq: number;
}

interface ClientNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'reward' | 'withdraw' | 'referral' | 'admin' | 'system' | 'game';
  coins?: number;
  createdAt: string;
  read: boolean;
}

interface ClientMeResponse {
  user: ClientUser;
  tasks: ClientTask[];
  games: ClientGame[];
  coinPerNpr: number;
  minWithdrawCoins: number;
  referralBonusCoins?: number;
  dailyBonus: number;
  ads: ClientAdsInfo;
  canDaily: boolean;
  nextDailyAt: number;
  dailyStreak: number;
  qualification: ClientQualification;
  referralHistory: ClientRefHistoryItem[];
  withdrawSettings?: {
    methods: ClientCustomWithdrawMethod[];
    countries: ClientAllowedCountry[];
  };
  notifications?: ClientNotification[];
  unreadCount?: number;
  refLink: string;
  error?: string;
}

interface ClientWithdrawal {
  id: string;
  userId: string;
  username: string;
  method: ClientWithdrawMethod;
  account: string;
  coins: number;
  npr: number;
  status: 'pending' | 'paid' | 'rejected';
  at: string;
}

interface ClaimTaskResult {
  ok: boolean;
  reward?: number;
  coins?: number;
  started?: boolean;
  waitSeconds?: number;
  error?: string;
}

interface DailyClaimResult {
  ok: boolean;
  reward?: number;
  coins?: number;
  dailyStreak?: number;
  nextDailyAt?: number;
  error?: string;
}

interface AdsgramShowResult {
  done: boolean;
  description?: string;
  state?: string;
  error?: boolean;
}

interface AdsgramController {
  show(): Promise<AdsgramShowResult>;
}

interface TelegramWebApp {
  initData?: string;
  ready(): void;
  expand(): void;
  openLink?(url: string): void;
  openTelegramLink?(url: string): void;
  HapticFeedback?: {
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    impactOccurred?(style: 'light' | 'medium' | 'heavy'): void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
    Adsgram?: {
      init(config: { blockId: string }): AdsgramController;
    };
    showTab: (name: TabName, filter?: TaskFilter) => void;
    filterExplore: (query: string) => void;
    filterTasks: (query: string) => void;
    clearSearch: () => void;
    setTaskFilter: (filter: TaskFilter) => void;
    selectMethod: (method: ClientWithdrawMethod) => void;
    setWithdrawAmount: (val: number | 'MAX') => void;
    updateWithdrawPreview: () => void;
    openSettingPage: (subId: string) => void;
    closeSettingPage: () => void;
    copyUserId: () => void;
    openSupport: () => void;
    randomizeAvatar: () => void;
    selectGender: (gender: ClientGender) => void;
    sendVerifyOtp: () => Promise<void>;
    confirmVerifyOtp: () => Promise<void>;
    doTask: (id: string, url: string) => void;
    claimTask: (id: string) => Promise<void>;
    playGame: (id: string) => Promise<void>;
    closeGame: () => void;
    watchAd: () => Promise<void>;
    claimDaily: () => Promise<void>;
    copyRef: () => void;
    shareRef: () => void;
    withdraw: () => Promise<void>;
    openNotificationsModal: () => void;
    closeNotificationsModal: () => void;
    markAllNotificationsRead: () => Promise<void>;
    clearAllNotifications: () => Promise<void>;
  }
}

function NotificationModal() {
  return (
    <div
      id="notifModal"
      className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-[2px] hidden items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e: Event) => {
        if ((e.target as HTMLElement).id === 'notifModal') closeNotificationsModal();
      }}
    >
      <div className="w-full max-w-[440px] max-h-[82vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Notifications</h3>
              <p className="text-[11px] text-slate-500 font-medium" id="notifSubHeader">
                Activity &amp; Admin updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => clearAllNotifications()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => closeNotificationsModal()}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        <div id="notifList" className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#F8FAFC]" />
      </div>
    </div>
  );
}

function PaisoApp() {
  return (
    <div className="app-shell">
      <SvgSpriteDefs />
      <div className="toast" id="toast" />
      <NotificationModal />
      <GameModal />
      <AppHeader />
      <main className="app-viewport">
        <HomeView />
        <TasksView />
        <OffersView />
        <section id="tab-games" className="app-screen"><div className="screen-content"><GamesView /></div></section>
        <FriendsView />
        <SettingsView />
      </main>
      <BottomNav />
    </div>
  );
}

const tg: TelegramWebApp | undefined = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const initData: string = tg?.initData || '';
let state: ClientMeResponse | null = null;
let currentTaskFilter: TaskFilter = 'all';
let taskSearchQuery = '';
let isDailyClaiming = false;
let isWithdrawing = false;
let startingGameId: string | null = null;
let renderedGamesKey = '';
const claimingTaskIds = new Set<string>();
let AdController: AdsgramController | null = null;
let toastTimer: number | undefined;
let dailyCountdownTimer: number | undefined;
let lastTopNotifId: string | null = null;
const activeTimers: Record<string, number> = {};

const COIN_SVG = `<svg width="14" height="14" style="vertical-align:-2px"><use href="#icon-p-coin"/></svg>`;

const DUMMY_AVATARS: string[] = [
  `<img src="/assets/paiso-avatar-v2.webp" alt="Cat avatar" width="64" height="64" />`,
  // 1. Blue Cyber Gamer with Headphones
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av1)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#60A5FA"/><circle cx="32" cy="27" r="11" fill="#FDE68A"/><path d="M21 25c0-7 5-12 11-12s11 5 11 12v3H21v-3z" fill="#1E293B"/><path d="M18 27a14 14 0 0 1 28 0" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/><rect x="15" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><rect x="44" y="23" width="5" height="10" rx="2.5" fill="#0284C7"/><circle cx="28" cy="28" r="1.6" fill="#0F172A"/><circle cx="36" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2 1.8 5 1.8 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  // 2. Purple Streetwear Hoodie & Shades
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8B5CF6"/><stop offset="100%" stop-color="#6D28D9"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av2)"/><path d="M13 58c3-12 10-17 19-17s16 5 19 17" fill="#F43F5E"/><circle cx="32" cy="27" r="11" fill="#FED7AA"/><path d="M20 22c2-6 7-9 12-9s10 3 12 9c-4-2-8-2-12-2s-8 0-12 2z" fill="#311042"/><rect x="22" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><rect x="33" y="24" width="9" height="5.5" rx="2" fill="#0F172A"/><line x1="31" y1="26.5" x2="33" y2="26.5" stroke="#0F172A" stroke-width="2"/><path d="M29 33.5c2 1.4 4.5 1.4 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  // 3. Emerald Crown VIP Character
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#10B981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av3)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#064E3B"/><circle cx="32" cy="29" r="10.5" fill="#FDE68A"/><polygon points="21,20 25,12 32,17 39,12 43,20" fill="#FBBF24" stroke="#F59E0B" stroke-width="1"/><circle cx="28.5" cy="28.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28.5" r="1.6" fill="#0F172A"/><path d="M29 34c2 1.6 4.5 1.6 6 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  // 4. Sunset Orange Cap Explorer
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#EA580C"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av4)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#1E293B"/><circle cx="32" cy="28" r="10.5" fill="#FFEDD5"/><path d="M21 23c0-6 5-10 11-10s11 4 11 10H21z" fill="#2563EB"/><rect x="19" y="21" width="28" height="3.5" rx="1.7" fill="#1D4ED8"/><circle cx="28.5" cy="28" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="28" r="1.6" fill="#0F172A"/><path d="M28.5 33c2.2 1.6 4.8 1.6 7 0" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  // 5. Teal Ninja / Mask Avatar
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#0E7490"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av5)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#0F172A"/><circle cx="32" cy="27" r="11" fill="#1E293B"/><rect x="22" y="23" width="20" height="7" rx="3.5" fill="#FDE68A"/><circle cx="28" cy="26.5" r="1.7" fill="#0F172A"/><circle cx="36" cy="26.5" r="1.7" fill="#0F172A"/><path d="M21 20h22" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/></svg>`,
  // 6. Rose Pink Pop Star Avatar
  `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="av6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#EC4899"/><stop offset="100%" stop-color="#BE185D"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#av6)"/><path d="M14 58c2-11 10-16 18-16s16 5 18 16" fill="#FBCFE8"/><path d="M19 30c0-9 6-15 13-15s13 6 13 15c0 4-1 8-3 10H22c-2-2-3-6-3-10z" fill="#4C1D95"/><circle cx="32" cy="28" r="10" fill="#FDE68A"/><circle cx="28.5" cy="27.5" r="1.6" fill="#0F172A"/><circle cx="35.5" cy="27.5" r="1.6" fill="#0F172A"/><path d="M29 32.5c2 1.6 4.5 1.6 6 0" fill="none" stroke="#E11D48" stroke-width="1.8" stroke-linecap="round"/></svg>`
];

let currentAvatarIndex = 0;

function renderDummyAvatar(idx = currentAvatarIndex): void {
  const box = $('settingsAvatarBox');
  if (box) {
    box.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
  }
  for (const avatar of document.querySelectorAll('.profile-avatar-art')) {
    avatar.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
  }
}

function randomizeAvatar(): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  currentAvatarIndex = (currentAvatarIndex + 1 + Math.floor(Math.random() * (DUMMY_AVATARS.length - 1))) % DUMMY_AVATARS.length;
  renderDummyAvatar(currentAvatarIndex);
}

function $<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function setText(id: string, text: string | number): void {
  const el = $(id);
  if (el) el.textContent = String(text);
}

function toast(msg: string, type: 'success' | 'warning' | 'error' = 'success'): void {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${type}`;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    t.className = 'toast';
  }, 3200);
  tg?.HapticFeedback?.notificationOccurred(type);
}

async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-init-data': initData,
    ...((opts.headers as Record<string, string>) || {})
  };
  const r = await fetch(path, { ...opts, headers });
  return r.json() as Promise<T>;
}

function showTab(name: TabName, taskFilter?: TaskFilter): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const tabs: TabName[] = ['home', 'tasks', 'refer', 'wallet', 'games', 'offers'];
  tabs.forEach((t) => {
    const sec = $(`tab-${t}`);
    if (sec) {
      sec.classList.toggle('active-screen', t === name);
    }
  });

  document.querySelectorAll<HTMLButtonElement>('nav.bottom-nav button').forEach((btn) => {
    const active = btn.dataset.tab === name || (name === 'offers' && btn.dataset.tab === 'tasks') || (name === 'games' && btn.dataset.tab === 'home');
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });

  closeSettingPage();
  if (name === 'tasks' && taskFilter) {
    taskSearchQuery = '';
    const search = $<HTMLInputElement>('taskSearchInput');
    if (search) search.value = '';
    setTaskFilter(taskFilter);
  }
  if (name === 'wallet') {
    closeSettingPage();
  }
}

function openSettingPage(subId: string): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const page = $(subId);
  if (page) {
    page.classList.add('open');
  }
}

function closeSettingPage(): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  document.querySelectorAll<HTMLElement>('.settings-subpage').forEach((el) => {
    el.classList.remove('open');
  });
}

function copyUserId(): void {
  const uid = state?.user?.id || '';
  if (!uid) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(uid).then(() => toast(`User ID (${uid}) copied!`));
  } else {
    toast(`User ID: ${uid}`);
  }
}

function openSupport(): void {
  const supportUrl = 'https://t.me/onlineearnlokesh';
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(supportUrl);
  } else {
    window.open(supportUrl, '_blank');
  }
}

function filterExplore(query: string): void {
  const term = (query || '').trim().toLowerCase();
  const clearBtn = $('searchClearBtn');
  if (clearBtn) clearBtn.style.display = term ? 'inline-flex' : 'none';

  document.querySelectorAll<HTMLElement>('#exploreGrid .explore-card, #exploreGames .explore-game-card').forEach((card) => {
    const titleData = (card.dataset.title || '').toLowerCase();
    card.style.display = !term || titleData.includes(term) ? 'flex' : 'none';
  });
}

function clearSearch(): void {
  const input = $<HTMLInputElement>('searchInput');
  if (input) {
    input.value = '';
    filterExplore('');
    input.focus();
  }
}

function setTaskFilter(filter: TaskFilter): void {
  currentTaskFilter = filter;
  document.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

function filterTasks(query: string): void {
  taskSearchQuery = (query || '').trim().toLowerCase();
  renderTasks();
}

function selectMethod(method: ClientWithdrawMethod): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const select = $<HTMLInputElement>('wMethod');
  if (select) select.value = method;
  document.querySelectorAll<HTMLButtonElement>('#wMethodsGrid button').forEach((btn) => {
    const isAct = btn.dataset.method === method;
    btn.className = `flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
      isAct
        ? 'bg-blue-50/70 border-blue-600 text-slate-900'
        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
    }`;
  });
  const acc = $<HTMLInputElement>('wAccount');
  const lbl = $('wAccountLabel');
  const customObj = state?.withdrawSettings?.methods?.find((m) => m.name === method);
  if (lbl) lbl.textContent = `${method} Account / ID`;
  if (acc) acc.placeholder = customObj?.placeholder || `Enter ${method} ID / Account`;
}

function renderWithdrawMethodsAndCountries(): void {
  const grid = $('wMethodsGrid');
  const cBar = $('wAllowedCountriesBar');
  const methods = (state?.withdrawSettings?.methods || []).filter((m) => m.enabled !== false);
  const countries = state?.withdrawSettings?.countries || [];

  if (cBar) {
    if (countries.length) {
      cBar.replaceChildren(
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Regions:</span>
          {countries.map((c) => (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
              {c.flag ? <img src={c.flag} alt={c.name} className="w-3.5 h-2.5 object-cover rounded-xs" /> : null}
              <span>{c.name}</span>
            </span>
          ))}
        </div>
      );
    } else {
      cBar.replaceChildren();
    }
  }

  if (!grid) return;
  if (!methods.length) {
    grid.replaceChildren(
      <div className="col-span-full text-center text-xs text-slate-400 py-3">
        No payout methods enabled
      </div>
    );
    return;
  }

  const currentVal = $<HTMLInputElement>('wMethod')?.value || '';
  const selectedName = methods.some((m) => m.name === currentVal) ? currentVal : methods[0].name;

  grid.replaceChildren(
    ...methods.map((m) => {
      const isAct = m.name === selectedName;
      return (
        <button
          type="button"
          data-method={m.name}
          onClick={() => selectMethod(m.name)}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
            isAct
              ? 'bg-blue-50/70 border-blue-600 text-slate-900'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          {m.logo ? (
            <img src={m.logo} alt={m.name} className="w-6 h-6 rounded object-contain shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
              {m.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-bold truncate">{m.name}</span>
        </button>
      );
    })
  );

  selectMethod(selectedName);
}

function updateWithdrawPreview(): void {
  const amtEl = $<HTMLInputElement>('wAmount');
  const previewEl = $('wReceivePreview');
  if (!amtEl || !previewEl) return;
  const coins = Math.max(0, Math.floor(+(amtEl.value || 0)));
  const rate = state?.coinPerNpr || 100;
  const npr = (coins / rate).toFixed(2);
  previewEl.textContent = `NPR ${npr}`;
}

function setWithdrawAmount(val: number | 'MAX'): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const amtEl = $<HTMLInputElement>('wAmount');
  if (!amtEl) return;
  const maxCoins = state?.user?.coins || 0;
  const target = val === 'MAX' ? maxCoins : val;
  amtEl.value = String(target);
  updateWithdrawPreview();
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function renderDailyCheckin(): void {
  if (!state) return;
  const streak = state.dailyStreak || 0;
  const canDaily = state.canDaily;
  const targetDay = canDaily ? (streak % 7) + 1 : streak || 1;
  const nextReward = targetDay === 7 ? state.dailyBonus * 2 : state.dailyBonus;

  setText('streakDayText', `Day ${targetDay}`);

  for (let d = 1; d <= 7; d++) {
    const box = $(`day-box-${d}`);
    if (!box) continue;
    box.classList.remove('ready-today', 'upcoming');
    const isClaimed = d <= streak;
    const isTodayTarget = canDaily && d === targetDay;

    if (isTodayTarget) {
      box.classList.add('ready-today');
    } else if (!isClaimed && d !== 7) {
      box.classList.add('upcoming');
    }
  }

  const btn = $<HTMLButtonElement>('dailyBtn');
  const btnIcon = $('dailyBtnIcon');
  const btnText = $('dailyBtnText');
  const btnCoin = $('dailyBtnCoin');
  const subText = $('dailySubText');

  if (dailyCountdownTimer) {
    window.clearInterval(dailyCountdownTimer);
    dailyCountdownTimer = undefined;
  }

  if (canDaily) {
    if (btn) {
      btn.disabled = isDailyClaiming;
      btn.classList.remove('claimed-state');
    }
    if (btnIcon) btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-gift"/></svg>`;
    if (btnText) btnText.textContent = isDailyClaiming ? 'Claiming...' : `Claim Today (+${nextReward})`;
    if (btnCoin) btnCoin.style.display = 'inline-block';
    if (subText) subText.textContent = `Check in daily to keep your streak!`;
  } else {
    if (btn) {
      btn.disabled = true;
      btn.classList.add('claimed-state');
    }
    if (btnIcon) btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-clock"/></svg>`;
    if (btnCoin) btnCoin.style.display = 'none';

    const updateTimer = () => {
      if (!state) return;
      const rem = (state.nextDailyAt || 0) - Date.now();
      if (rem <= 0) {
        if (dailyCountdownTimer) window.clearInterval(dailyCountdownTimer);
        state.canDaily = true;
        renderDailyCheckin();
        return;
      }
      const formatted = formatDuration(rem);
      if (btnText) btnText.textContent = `Claimed • Next in ${formatted}`;
      if (subText) subText.textContent = `Next check-in unlocks in ${formatted}`;
    };

    updateTimer();
    dailyCountdownTimer = window.setInterval(updateTimer, 1000);
  }
}

function triggerClaimAnimation(claimedDay: number, reward: number): void {
  tg?.HapticFeedback?.impactOccurred?.('heavy');
  const dayBox = $(`day-box-${claimedDay}`);
  if (dayBox) {
    dayBox.classList.remove('claimed-anim');
    void dayBox.offsetWidth;
    dayBox.classList.add('claimed-anim');
  }

  const fxLayer = $('claimFxLayer');
  if (!fxLayer) return;
  fxLayer.innerHTML = '';

  const starSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l2.6 6.8L21 12l-6.4 3.2L12 22l-2.6-6.8L3 12l6.4-3.2L12 2z"/></svg>`;
  const coinSvg = `<svg width="20" height="20"><use href="#icon-p-coin"/></svg>`;

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span');
    p.className = 'claim-particle';
    p.innerHTML = i % 2 === 0 ? coinSvg : starSvg;
    const startX = 25 + Math.random() * 50;
    const tx = (Math.random() - 0.5) * 190;
    const ty = -55 - Math.random() * 95;
    const rot = (Math.random() - 0.5) * 260;
    p.style.left = `${startX}%`;
    p.style.bottom = `28px`;
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    p.style.setProperty('--rot', `${rot}deg`);
    fxLayer.appendChild(p);
  }

  const badge = document.createElement('div');
  badge.className = 'claim-float-badge';
  badge.innerHTML = `<svg width="16" height="16" style="vertical-align:-3px;margin-right:4px"><use href="#icon-check-circle"/></svg>Day ${claimedDay} Claimed! +${reward} ${COIN_SVG}`;
  fxLayer.appendChild(badge);

  window.setTimeout(() => {
    fxLayer.innerHTML = '';
  }, 1400);
}

function renderReferralsAndQualification(): void {
  if (!state) return;

  const q = state.qualification;
  if (q) {
    setText('wqAds', `${Math.min(q.adsDone, q.adsReq)}/${q.adsReq}`);
    setText('wqTasks', `${Math.min(q.tasksDone, q.tasksReq)}/${q.tasksReq}`);
    setText('wqDaily', `${Math.min(q.dailyDone, q.dailyReq)}/${q.dailyReq}`);
    $('wqPillAds')?.classList.toggle('done', q.adsDone >= q.adsReq);
    $('wqPillTasks')?.classList.toggle('done', q.tasksDone >= q.tasksReq);
    $('wqPillDaily')?.classList.toggle('done', q.dailyDone >= q.dailyReq);
    const badge = $('wqStatusBadge');
    if (badge) {
      badge.textContent = q.qualified ? 'Unlocked & Eligible' : 'In Progress';
      badge.className = `wq-badge ${q.qualified ? 'unlocked' : 'locked'}`;
    }
  }

  const hist = state.referralHistory || [];
  setText('refActive', hist.filter(r => r.qualified).length);
  setText('refEarned', hist.reduce((sum, r) => sum + (r.qualified ? r.bonusCoins : 0), 0).toLocaleString());
  const refHistEl = $('refHistory');
  if (refHistEl) {
    if (!hist.length) {
      refHistEl.replaceChildren(
        <div className="empty-state">
          <div className="empty-title">No referrals yet</div>
          <div className="small">Share your invite link above to start earning!</div>
        </div>
      );
    } else {
      refHistEl.replaceChildren(
        ...hist.map((r) => {
          const uLabel = r.name + (r.username ? ` (@${r.username})` : '');
          const dateStr = r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : '';
          return (
            <div className="ref-hist-card">
              <div className="ref-hist-top">
                <div>
                  <div className="ref-user-name">{uLabel}</div>
                  <div className="small">Joined {dateStr}</div>
                </div>
                <span className={`status-badge ${r.qualified ? 'status-paid' : 'status-pending'}`}>
                  {r.qualified ? `+${r.bonusCoins} CREDITED` : 'PENDING'}
                </span>
              </div>
            </div>
          );
        })
      );
    }
  }
}

function TaskCard({ task, prefix = 'verify' }: { task: ClientTask; prefix?: string }) {
  const wait = activeTimers[task.id] || 0;
  const started = startedTasks.has(task.id);
  const index = task.type === 'app_task' ? 1 : task.type === 'play_game' ? 2 : /survey/i.test(task.title) ? 4 : 5;
  const category = task.type === 'app_task' ? 'Apps' : task.type === 'play_game' ? 'Games' : task.type === 'telegram_join' ? 'Social' : 'Web';
  return <article className="task-card">
    <div className={`task-art task-art-${task.type}`}>{task.type === 'telegram_join' ? <img src="/assets/icon-channels.png" alt="" /> : <EarnIcon index={index} />}</div>
    <div className="task-copy"><h2>{task.title}</h2><p>{task.description || 'Complete this task to earn coins'}</p><div className="task-tags"><span>{category}</span><span>{task.done ? 'Completed' : task.type === 'play_game' ? 'Play' : 'Easy'}</span><span>{task.type === 'telegram_join' ? 'Join' : (task.waitSeconds || 15) + ' sec'}</span></div></div>
    <div className="task-actions"><span className="reward-pill"><svg width="14" height="14"><use href="#icon-p-coin" /></svg>+{task.reward.toLocaleString()}</span><button id={`${prefix}-${task.id}`} disabled={!!task.done || wait > 0 || claimingTaskIds.has(task.id)} onClick={() => { if (started) claimTask(task.id); else { startedTasks.add(task.id); doTask(task.id, task.url); } }} className="task-start">{task.done ? 'Done' : claimingTaskIds.has(task.id) ? 'Checking' : wait > 0 ? wait + 's' : started ? 'Verify' : 'Start'}</button></div>
  </article>;
}

const startedTasks = new Set<string>();

function renderTasks(): void {
  if (!state) return;
  const all = state.tasks || [];
  const source = all.filter(t => currentTaskFilter === 'done' ? t.done : !t.done);
  const tasks = source.filter(t => (currentTaskFilter === 'all' || currentTaskFilter === 'done' || t.type === currentTaskFilter) && (!taskSearchQuery || (t.title + ' ' + t.description + ' ' + t.type).toLowerCase().includes(taskSearchQuery)));
  const nodes: Node[] = tasks.map(task => <TaskCard task={task} />);
  if ((currentTaskFilter === 'all' || currentTaskFilter === 'video') && (!taskSearchQuery || 'watch video ads'.includes(taskSearchQuery)) && state.ads) {
    nodes.unshift(<article className="task-card"><div className="task-art"><EarnIcon index={0} /></div><div className="task-copy"><h2>Watch Video Ads</h2><p>Watch short videos and earn coins</p><div className="task-tags"><span>Video</span><span>Easy</span><span>1–2 min</span></div></div><div className="task-actions"><span className="reward-pill"><svg width="14" height="14"><use href="#icon-p-coin" /></svg>+{state.ads.reward}</span><button className="task-start" disabled={state.ads.watchedToday >= state.ads.dailyCap} onClick={() => watchAd()}>{state.ads.watchedToday >= state.ads.dailyCap ? 'Done' : 'Start'}</button></div></article>);
  }
  const empty = (title: string) => <div className="empty-state"><EarnIcon index={1} /><h2>{title}</h2><p>Try another category or check back for new rewards.</p></div>;
  $('taskList')?.replaceChildren(...(nodes.length ? nodes : [empty(taskSearchQuery ? 'No matching tasks' : 'No tasks here yet')]));
  const offers = all.filter(t => t.type === 'app_task' && !t.done);
  $('offerList')?.replaceChildren(...(offers.length ? offers.map(task => <TaskCard task={task} prefix="offer-verify" />) : [empty('New offers are on the way')]));
}

function formatTimeAgo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function NotifTypeIcon({ type }: { type: ClientNotification['type'] }) {
  if (type === 'task') {
    return (
      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (type === 'reward') {
    return (
      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
        <svg width="18" height="18">
          <use href="#icon-gift" />
        </svg>
      </div>
    );
  }
  if (type === 'withdraw') {
    return (
      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
    );
  }
  if (type === 'admin') {
    return (
      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
      <svg width="18" height="18">
        <use href="#icon-blue-tick" />
      </svg>
    </div>
  );
}

function renderNotifications(): void {
  const list = state?.notifications || [];
  const unread = state?.unreadCount || 0;

  const badge = $('notifUnreadBadge');
  if (badge) {
    if (unread > 0) {
      badge.style.display = 'flex';
      badge.textContent = unread > 9 ? '9+' : String(unread);
    } else {
      badge.style.display = 'none';
    }
  }

  const subHeader = $('notifSubHeader');
  if (subHeader) {
    subHeader.textContent = unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up';
  }

  // Trigger toast if a brand new notification arrived after initial load
  if (list.length > 0) {
    const newest = list[0];
    if (lastTopNotifId !== null && newest.id !== lastTopNotifId && !newest.read) {
      toast(`${newest.title}: ${newest.message}`, 'success');
    }
    lastTopNotifId = newest.id;
  } else if (lastTopNotifId === null) {
    lastTopNotifId = '';
  }

  const listEl = $('notifList');
  if (!listEl) return;

  if (!list.length) {
    listEl.replaceChildren(
      <div className="py-12 text-center">
        <div className="text-sm font-extrabold text-slate-700 mb-1">No notifications yet</div>
        <div className="text-xs text-slate-400">
          Task verifications, rewards, and Admin messages will appear here.
        </div>
      </div>
    );
    return;
  }

  listEl.replaceChildren(
    ...list.map((n) => (
      <div
        className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
          n.read ? 'bg-white border-slate-100' : 'bg-blue-50/60 border-blue-200 shadow-2xs'
        }`}
      >
        <NotifTypeIcon type={n.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-slate-900 truncate">{n.title}</span>
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
              {formatTimeAgo(n.createdAt)}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">{n.message}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {n.coins ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold">
                <svg width="11" height="11">
                  <use href="#icon-p-coin" />
                </svg>
                <span>+{n.coins} Coins</span>
              </span>
            ) : null}
            {n.type === 'admin' ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">
                Admin Broadcast
              </span>
            ) : null}
          </div>
        </div>
        {!n.read ? <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" /> : null}
      </div>
    ))
  );
}

function openNotificationsModal(): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const modal = $('notifModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if ((state?.unreadCount || 0) > 0) {
    markAllNotificationsRead();
  }
}

function closeNotificationsModal(): void {
  const modal = $('notifModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function markAllNotificationsRead(): Promise<void> {
  try {
    const r = await api<{ notifications: ClientNotification[]; unreadCount: number }>(
      '/api/notifications/read',
      { method: 'POST', body: '{}' }
    );
    if (state && r.notifications) {
      state.notifications = r.notifications;
      state.unreadCount = r.unreadCount;
      renderNotifications();
    }
  } catch {}
}

async function clearAllNotifications(): Promise<void> {
  try {
    const r = await api<{ notifications: ClientNotification[]; unreadCount: number }>(
      '/api/notifications',
      { method: 'DELETE' }
    );
    if (state && r.notifications) {
      state.notifications = r.notifications;
      state.unreadCount = r.unreadCount;
      renderNotifications();
    }
    toast('Notifications cleared', 'success');
  } catch {}
}
function startTaskCountdown(taskId: string, seconds: number): void {
  if (activeTimers[taskId]) return;
  activeTimers[taskId] = seconds;
  renderTasks();
  const interval = window.setInterval(() => {
    activeTimers[taskId] -= 1;
    const offerButton = $<HTMLButtonElement>(`offer-verify-${taskId}`);
    if (offerButton) { offerButton.disabled = activeTimers[taskId] > 0; offerButton.textContent = activeTimers[taskId] > 0 ? `${activeTimers[taskId]}s` : 'Verify'; }
    const btn = $<HTMLButtonElement>(`verify-${taskId}`);
    if (activeTimers[taskId] <= 0) {
      delete activeTimers[taskId];
      window.clearInterval(interval);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Verify';
      }
      renderTasks();
    } else if (btn) {
      btn.disabled = true;
      btn.textContent = `${activeTimers[taskId]}s`;
    }
  }, 1000);
}

async function load(): Promise<void> {
  try {
    state = await api<ClientMeResponse>('/api/me');
  } catch {
    if (!renderedGamesKey) showFeaturedGamesError();
    return;
  }
  if (!state || state.error) {
    if (!renderedGamesKey) showFeaturedGamesError();
    if (state?.error) toast(state.error, 'error');
    return;
  }

  const u = state.user;
  const fullName = u.verification?.fullName || u.first_name || u.username || 'Paiso User';
  const displayName = fullName + (u.username ? ` (@${u.username})` : '');
  setText('uname', displayName);
  setText('settingsHeaderName', fullName);
  setText('settingsHeaderHandle', u.username ? `@${u.username}` : `ID: #${u.id}`);
  renderDummyAvatar();
  renderVerificationState(u);
  setText('userIdText', u.id);
  setText('uidFullText', `#${u.id}`);
  setText('coins', u.coins.toLocaleString());
  setText('wCoins', u.coins.toLocaleString());
  setText('headerCoins', u.coins.toLocaleString());
  setText('npr', (u.coins / state.coinPerNpr).toFixed(2));
  setText('total', u.totalEarned.toLocaleString());
  setText('dailyReward', `+${state.dailyBonus}`);

  renderDailyCheckin();

  if (state.ads) {
    setText('adReward', `+${state.ads.reward}`);
    setText('adCount', state.ads.watchedToday);
    setText('adCap', state.ads.dailyCap);
    const adSub = $('adCardSub');
    if (adSub) {
      adSub.textContent =
        state.ads.watchedToday > 0
          ? `${state.ads.watchedToday}/${state.ads.dailyCap} watched`
          : 'Earn coins';
    }
  }

  setText('refCount', u.referrals);
  setText('refBonusValue', `+${(state.referralBonusCoins || 500).toLocaleString()}`);
  const refInput = $<HTMLInputElement>('refLink');
  if (refInput) refInput.value = state.refLink;
  setText('minW', state.minWithdrawCoins.toLocaleString());

  renderReferralsAndQualification();
  renderWithdrawMethodsAndCountries();
  renderTasks();
  renderGames();
  renderNotifications();

  try {
    const hData = await api<{ withdrawals: ClientWithdrawal[] }>('/api/my-withdrawals');
    const withdrawals = hData.withdrawals || [];
    const coinNotifs = (state.notifications || []).filter((n) => Boolean(n.coins) && n.type !== 'withdraw');

    const renderWithdrawNodes = () => {
      if (!withdrawals.length) {
        return [
          <div className="p-4 text-center text-xs text-slate-400">
            No withdrawal transactions yet.
          </div>
        ];
      }
      return withdrawals.map((w) => (
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {w.method} <span className="text-slate-400 font-medium">• {w.account}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {w.id} • {new Date(w.at).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-extrabold text-slate-900 flex items-center justify-end gap-1">
              <span>-{w.coins.toLocaleString()}</span>
              <svg width="13" height="13" className="inline-block">
                <use href="#icon-p-coin" />
              </svg>
            </div>
            <span className={`status-badge status-${w.status}`}>{w.status.toUpperCase()}</span>
          </div>
        </div>
      ));
    };

    const renderFullTxNodes = () => {
      const items: Node[] = [...renderWithdrawNodes()];
      if (!withdrawals.length && coinNotifs.length) {
        items.length = 0;
      }
      coinNotifs.forEach((n) => {
        items.push(
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{n.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {new Date(n.createdAt).toLocaleDateString()} • {n.type.toUpperCase()}
              </div>
            </div>
              <div className="text-right shrink-0">
              <div className={`text-xs font-extrabold flex items-center justify-end gap-1 ${n.coins! < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                <span>{n.coins! < 0 ? '−' : '+'}{Math.abs(n.coins || 0).toLocaleString()}</span>
                <svg width="13" height="13" className="inline-block">
                  <use href="#icon-p-coin" />
                </svg>
              </div>
              <span className={`status-badge ${n.coins! < 0 ? 'status-pending' : 'status-paid'}`}>{n.coins! < 0 ? 'SPENT' : 'CREDITED'}</span>
            </div>
          </div>
        );
      });
      if (!items.length) {
        return [
          <div className="p-4 text-center text-xs text-slate-400">
            No transactions yet.
          </div>
        ];
      }
      return items;
    };

    const wHist = $('wHistory');
    if (wHist) {
      wHist.replaceChildren(...renderFullTxNodes());
    }
    const wPageHist = $('wWithdrawHistory');
    if (wPageHist) {
      wPageHist.replaceChildren(...renderWithdrawNodes());
    }
  } catch {}
}

function doTask(id: string, url: string): void {
  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
  claimTask(id);
}

async function claimTask(id: string): Promise<void> {
  if (claimingTaskIds.has(id)) return;
  claimingTaskIds.add(id);
  renderTasks();
  try {
    const r = await api<ClaimTaskResult>('/api/task/claim', {
      method: 'POST',
      body: JSON.stringify({ taskId: id })
    });
    if (r.ok) {
      toast(`+${r.reward} coins credited!`, 'success');
      await load();
    } else if (r.started && r.waitSeconds) {
      toast(r.error || `Wait ${r.waitSeconds}s before verifying`, 'warning');
      startTaskCountdown(id, r.waitSeconds);
    } else {
      toast(r.error || 'Could not verify task', 'warning');
    }
  } catch {
    toast('Network error. Please try again.', 'error');
  } finally {
    claimingTaskIds.delete(id);
    renderTasks();
  }
}

function renderGames(): void {
  if (!state) return;
  const games = state.games || [];
  // Polling should not replace unchanged buttons or disturb focus and scrolling.
  const key = JSON.stringify([startingGameId, games.map(({ id, title, priceCoins }) => [id, title, priceCoins])]);
  if (key === renderedGamesKey) return;
  renderedGamesKey = key;
  const empty = <div className="empty-state"><EarnIcon index={2} /><h2>Games coming soon</h2><p>New games will appear here when published.</p></div>;
  $('gamesGrid')?.replaceChildren(...(games.length ? games.map(game => <GameCard game={game} pending={startingGameId === game.id} />) : [empty]));
  updateFeaturedGames(games, startingGameId);
}

async function playGame(id: string): Promise<void> {
  if (startingGameId) return;
  const game = state?.games?.find((item) => item.id === id);
  if (!game || !state) return;
  if (state.user.coins < game.priceCoins) {
    toast(`You need ${game.priceCoins.toLocaleString()} coins to play this game.`, 'warning');
    return;
  }
  startingGameId = id;
  renderGames();
  try {
    const result = await api<{ ok: boolean; coins?: number; playUrl?: string; error?: string }>(`/api/games/${encodeURIComponent(id)}/play`, {
      method: 'POST',
      body: '{}'
    });
    if (!result.ok || !result.playUrl) {
      toast(result.error || 'Could not start this game.', 'warning');
      return;
    }
    state.user.coins = result.coins ?? state.user.coins;
    setText('headerCoins', state.user.coins.toLocaleString());
    setText('wCoins', state.user.coins.toLocaleString());
    setText('npr', (state.user.coins / state.coinPerNpr).toFixed(2));
    const gameTitle = $('activeGameTitle');
    if (gameTitle) gameTitle.textContent = game.title;
    const frame = $<HTMLIFrameElement>('gameFrame');
    const modal = $('gameModal');
    if (frame && modal) {
      frame.src = result.playUrl;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    toast(game.priceCoins ? `${game.priceCoins.toLocaleString()} coins used. Have fun!` : 'Game started. Have fun!', 'success');
  } catch {
    toast('Network error. Your balance was not charged.', 'error');
  } finally {
    startingGameId = null;
    renderGames();
  }
}

function closeGame(): void {
  const frame = $<HTMLIFrameElement>('gameFrame');
  if (frame) frame.src = 'about:blank';
  const modal = $('gameModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function watchAd(): Promise<void> {
  if (!window.Adsgram || !state?.ads?.blockId) {
    toast('Ads ajhai ready chhaina', 'warning');
    return;
  }
  if (state.ads.watchedToday >= state.ads.dailyCap) {
    toast('Aaja ko ad limit sakiyo!', 'warning');
    return;
  }
  const before = state.ads.watchedToday || 0;
  try {
    if (!AdController) {
      AdController = window.Adsgram.init({ blockId: String(state.ads.blockId) });
    }
    const result = await AdController.show();
    if (result && result.done === false) {
      toast('Ad pura here matra coins milchha', 'warning');
      return;
    }
    toast('Ad sakiyo! Coins credit hudai chha…', 'success');
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => window.setTimeout(r, 3000));
      await load();
      if ((state.ads?.watchedToday || 0) > before) {
        toast(`+${state.ads.reward} coins milyo!`, 'success');
        return;
      }
    }
    toast('Coins kei chhin ma balance ma aauchha', 'success');
  } catch {
    toast('Ahile ad uplabdha chhaina, pachhi try gara', 'warning');
  }
}

async function claimDaily(): Promise<void> {
  if (isDailyClaiming || !state?.canDaily) return;
  isDailyClaiming = true;
  const btn = $<HTMLButtonElement>('dailyBtn');
  if (btn) btn.disabled = true;
  try {
    const r = await api<DailyClaimResult>('/api/daily', {
      method: 'POST',
      body: '{}'
    });
    if (r.ok) {
      const claimedDay = r.dailyStreak || 1;
      const reward = r.reward || 100;
      triggerClaimAnimation(claimedDay, reward);
      toast(`Day ${claimedDay} Check-in: +${reward} coins milyo!`, 'success');
    } else {
      toast(r.error || 'Aaja ko bonus liyi sakyo', 'warning');
    }
  } catch {
    toast('Network error. Please try again.', 'error');
  } finally {
    isDailyClaiming = false;
    await load();
  }
  await load();
}

function copyRef(): void {
  const input = $<HTMLInputElement>('refLink');
  if (!input) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(input.value).then(() => toast('Referral link copy bhayo!'));
  } else {
    input.select();
    document.execCommand('copy');
    toast('Referral link copy bhayo!');
  }
}

function shareRef(): void {
  const input = $<HTMLInputElement>('refLink');
  const link = input ? input.value : '';
  const shareUrl =
    'https://t.me/share/url?url=' +
    encodeURIComponent(link) +
    '&text=' +
    encodeURIComponent('Paiso app bata simple tasks garera real rewards kamaau!');
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}

function renderVerificationState(u: ClientUser): void {
  const isVerified = Boolean(u.verified && u.verification?.verified);
  const tickEl = $('settingsVerifiedTick');
  if (tickEl) {
    tickEl.style.display = isVerified ? 'inline-flex' : 'none';
  }

  const menuBadge = $('verifyMenuBadge');
  const menuSub = $('verifyMenuSub');
  if (menuBadge) {
    menuBadge.textContent = isVerified ? 'Verified' : 'Unverified';
    menuBadge.className = `verify-status-pill ${isVerified ? 'verified' : 'unverified'}`;
  }
  if (menuSub) {
    menuSub.textContent = isVerified
      ? `${u.verification?.email || 'Verified'} • Blue Tick Active`
      : 'Verify your details for Blue Tick';
  }

  const doneCard = $('verifyDoneCard');
  const formCard = $('verifyFormCard');
  if (doneCard && formCard) {
    doneCard.style.display = isVerified ? 'block' : 'none';
    formCard.style.display = isVerified ? 'none' : 'block';
  }

  if (isVerified && u.verification) {
    setText('verifiedNameText', u.verification.fullName);
    setText('verifiedEmailText', u.verification.email || 'Not provided');
    setText('verifiedDobText', u.verification.dob);
    setText('verifiedGenderText', u.verification.gender);
  } else {
    const nameInput = $<HTMLInputElement>('vFullName');
    if (nameInput && !nameInput.value && u.first_name && u.first_name !== 'Dev User') {
      nameInput.value = u.first_name;
    }
  }
}

function selectGender(gender: ClientGender): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const input = $<HTMLInputElement>('vGender');
  if (input) input.value = gender;
  $('genderMaleBtn')?.classList.toggle('active', gender === 'Male');
  $('genderFemaleBtn')?.classList.toggle('active', gender === 'Female');
}

async function sendVerifyOtp(): Promise<void> {
  const fullName = $<HTMLInputElement>('vFullName')?.value.trim() || '';
  const email = $<HTMLInputElement>('vEmail')?.value.trim() || '';
  const dob = $<HTMLInputElement>('vDob')?.value.trim() || '';
  const gender = ($<HTMLInputElement>('vGender')?.value || 'Male') as ClientGender;

  if (fullName.length < 2) {
    toast('Full Name halnuहोस्', 'warning');
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast('Valid Email Address halnuहोस्', 'warning');
    return;
  }
  if (!dob) {
    toast('Date of Birth छान्नुहोस्', 'warning');
    return;
  }

  const btn = $<HTMLButtonElement>('sendOtpBtn');
  if (btn) btn.disabled = true;
  setText('sendOtpBtnText', 'Sending OTP...');

  try {
    const r = await api<{
      ok: boolean;
      emailSent?: boolean;
      otpPreview?: string;
      message?: string;
      error?: string;
    }>('/api/verify/send-otp', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, dob, gender })
    });

    if (!r.ok) {
      toast(r.error || 'Failed to send OTP', 'error');
      return;
    }

    setText('otpTargetEmail', 'your Telegram chat');
    const otpBox = $('verifyOtpBox');
    if (otpBox) otpBox.style.display = 'block';

    await load();
    toast(r.message || 'Verification OTP sent to your Telegram chat!', 'success');
  } finally {
    if (btn) btn.disabled = false;
    setText('sendOtpBtnText', 'Resend OTP to Telegram');
  }
}

async function confirmVerifyOtp(): Promise<void> {
  const otp = $<HTMLInputElement>('vOtpInput')?.value.trim() || '';
  if (otp.length !== 6) {
    toast('6-digit OTP code halnuहोस्', 'warning');
    return;
  }

  const btn = $<HTMLButtonElement>('confirmOtpBtn');
  if (btn) btn.disabled = true;

  try {
    const r = await api<{
      ok: boolean;
      verified?: boolean;
      verification?: ClientVerification;
      error?: string;
    }>('/api/verify/confirm-otp', {
      method: 'POST',
      body: JSON.stringify({ otp })
    });

    if (!r.ok) {
      toast(r.error || 'Invalid OTP code', 'error');
      return;
    }

    toast('Profile Verified! Blue Tick activated!', 'success');
    await load();
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function withdraw(): Promise<void> {
  if (isWithdrawing) return;
  const methodEl = $<HTMLSelectElement>('wMethod');
  const accEl = $<HTMLInputElement>('wAccount');
  const amtEl = $<HTMLInputElement>('wAmount');
  if (!methodEl || !accEl || !amtEl) return;
  const amount = Math.floor(Number(amtEl.value));
  if (!methodEl.value) return toast('Choose a payout method first', 'warning');
  if (accEl.value.trim().length < 5) return toast('Enter a valid payout account or ID (at least 5 characters)', 'warning');
  if (!Number.isFinite(amount) || amount <= 0) return toast('Enter a valid coin amount', 'warning');
  if (amount < (state?.minWithdrawCoins || 0)) return toast(`Minimum withdrawal is ${state?.minWithdrawCoins.toLocaleString()} coins`, 'warning');
  if (amount > (state?.user.coins || 0)) return toast('Amount is higher than your balance', 'warning');

  isWithdrawing = true;
  const btn = $<HTMLButtonElement>('withdrawBtn');
  const originalText = btn?.textContent || 'Submit Withdrawal';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting...';
  }
  try {
    const r = await api<{ ok: boolean; error?: string }>('/api/withdraw', {
      method: 'POST',
      body: JSON.stringify({ method: methodEl.value, account: accEl.value.trim(), amountCoins: amount })
    });
    if (r.ok) {
      toast('Withdraw request gayo! Admin le 1-2 din ma approve garcha', 'success');
      accEl.value = '';
      amtEl.value = '';
      updateWithdrawPreview();
    } else {
      toast(r.error || 'Withdraw request failed', 'error');
    }
  } catch {
    toast('Network error. Please try again.', 'error');
  } finally {
    isWithdrawing = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
    await load();
  }
}

window.showTab = showTab;
window.filterExplore = filterExplore;
window.filterTasks = filterTasks;
window.clearSearch = clearSearch;
window.setTaskFilter = setTaskFilter;
window.selectMethod = selectMethod;
window.setWithdrawAmount = setWithdrawAmount;
window.updateWithdrawPreview = updateWithdrawPreview;
window.openSettingPage = openSettingPage;
window.closeSettingPage = closeSettingPage;
window.copyUserId = copyUserId;
window.openSupport = openSupport;
window.randomizeAvatar = randomizeAvatar;
window.selectGender = selectGender;
window.sendVerifyOtp = sendVerifyOtp;
window.confirmVerifyOtp = confirmVerifyOtp;
window.doTask = doTask;
window.claimTask = claimTask;
window.playGame = playGame;
window.closeGame = closeGame;
window.watchAd = watchAd;
window.claimDaily = claimDaily;
window.copyRef = copyRef;
window.shareRef = shareRef;
window.withdraw = withdraw;
window.openNotificationsModal = openNotificationsModal;
window.closeNotificationsModal = closeNotificationsModal;
window.markAllNotificationsRead = markAllNotificationsRead;
window.clearAllNotifications = clearAllNotifications;

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
    root.appendChild(<PaisoApp />);
  }
  renderDummyAvatar();
  load();
  // Real-time background poll for Admin broadcasts & activity notifications
  window.setInterval(() => {
    load();
  }, 8000);
});
