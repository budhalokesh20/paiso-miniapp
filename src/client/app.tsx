import { h, Fragment } from './jsx';
import { SvgSpriteDefs } from './components/Icons';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { FriendsView } from './components/FriendsView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';

export type TabName = 'home' | 'tasks' | 'refer' | 'wallet';
export type TaskFilter = 'all' | 'telegram_join' | 'social_visit' | 'done';
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
  type: 'telegram_join' | 'social_visit';
  target: string;
  url: string;
  waitSeconds?: number;
  resetHours?: number;
  nextAvailableAt?: number;
  done?: boolean;
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

interface ClientMeResponse {
  user: ClientUser;
  tasks: ClientTask[];
  coinPerNpr: number;
  minWithdrawCoins: number;
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
    watchAd: () => Promise<void>;
    claimDaily: () => Promise<void>;
    copyRef: () => void;
    shareRef: () => void;
    withdraw: () => Promise<void>;
  }
}

function PaisoApp() {
  return (
    <div className="app-shell">
      <SvgSpriteDefs />
      <div className="toast" id="toast" />
      <main className="app-viewport">
        <HomeView />
        <TasksView />
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
let AdController: AdsgramController | null = null;
let toastTimer: number | undefined;
let dailyCountdownTimer: number | undefined;
const activeTimers: Record<string, number> = {};

const COIN_SVG = `<svg width="14" height="14" style="vertical-align:-2px"><use href="#icon-p-coin"/></svg>`;

const DUMMY_AVATARS: string[] = [
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

let currentAvatarIndex = Math.floor(Math.random() * DUMMY_AVATARS.length);

function renderDummyAvatar(idx = currentAvatarIndex): void {
  const box = $('settingsAvatarBox');
  if (box) {
    box.innerHTML = DUMMY_AVATARS[idx % DUMMY_AVATARS.length];
  }
}

function randomizeAvatar(): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  currentAvatarIndex = (currentAvatarIndex + 1 + Math.floor(Math.random() * (DUMMY_AVATARS.length - 1))) % DUMMY_AVATARS.length;
  renderDummyAvatar(currentAvatarIndex);
}

function TaskSvgIcon({ task }: { task: ClientTask }) {
  if (task.type === 'telegram_join') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    );
  }
  if (task.url.includes('youtube.com') || task.url.includes('youtu.be')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="4"></rect>
        <polygon points="10 9 15 12 10 15 10 9" fill="#DC2626"></polygon>
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
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
  const tabs: TabName[] = ['home', 'tasks', 'refer', 'wallet'];
  tabs.forEach((t) => {
    const sec = $(`tab-${t}`);
    if (sec) {
      sec.classList.toggle('active-screen', t === name);
    }
  });

  document.querySelectorAll<HTMLButtonElement>('nav.bottom-nav button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === name);
  });

  if (name === 'tasks' && taskFilter) {
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

  document.querySelectorAll<HTMLElement>('#exploreGrid .explore-card').forEach((card) => {
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

function selectMethod(method: ClientWithdrawMethod): void {
  tg?.HapticFeedback?.impactOccurred?.('light');
  const select = $<HTMLInputElement>('wMethod');
  if (select) select.value = method;
  document.querySelectorAll<HTMLButtonElement>('.method-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.method === method);
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
        <div className="withdraw-countries-inner">
          <span className="wc-label">Allowed Countries:</span>
          <div className="wc-flags">
            {countries.map((c) => (
              <span className="wc-pill">
                {c.flag ? <img src={c.flag} alt={c.name} className="wc-flag-img" /> : null}
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>
      );
    } else {
      cBar.replaceChildren();
    }
  }

  if (!grid) return;
  if (!methods.length) {
    grid.replaceChildren(
      <div className="small" style="grid-column:1/-1;text-align:center;padding:12px">
        No payout methods enabled by Admin
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
          className={`method-pill ${isAct ? 'active' : ''}`}
          data-method={m.name}
          onClick={() => selectMethod(m.name)}
        >
          {m.logo ? (
            <img src={m.logo} alt={m.name} className="method-custom-logo" />
          ) : (
            <div className="method-brand-icon brand-paypal">{m.name.slice(0, 1).toUpperCase()}</div>
          )}
          <div className="method-meta">
            <span className="method-name">{m.name}</span>
            <span className="method-sub">{m.country && m.country !== 'All' ? m.country : 'Instant Payout'}</span>
          </div>
          <span className="method-check">
            <svg width="15" height="15">
              <use href="#icon-check-circle" />
            </svg>
          </span>
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
      btn.disabled = false;
      btn.classList.remove('claimed-state');
    }
    if (btnIcon) btnIcon.innerHTML = `<svg width="16" height="16"><use href="#icon-gift"/></svg>`;
    if (btnText) btnText.textContent = `Claim Day ${targetDay} Bonus (+${nextReward})`;
    if (btnCoin) btnCoin.style.display = 'inline-block';
    if (subText) subText.textContent = `7 day streak! Keep it going!`;
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

function getTaskPlatformClass(task: ClientTask): string {
  if (task.type === 'telegram_join') return 'platform-telegram';
  if (task.url.includes('youtube.com') || task.url.includes('youtu.be')) return 'platform-youtube';
  return 'platform-web';
}

function renderTasks(): void {
  const listEl = $('taskList');
  if (!listEl || !state) return;

  const allTasks = state.tasks || [];
  const filtered = allTasks.filter((t) => {
    if (currentTaskFilter === 'done') return Boolean(t.done);
    if (currentTaskFilter === 'telegram_join') return t.type === 'telegram_join';
    if (currentTaskFilter === 'social_visit') return t.type === 'social_visit';
    return true;
  });

  if (!filtered.length) {
    listEl.replaceChildren(
      <div className="empty-state">
        <div className="empty-title">No tasks here</div>
      </div>
    );
    return;
  }

  listEl.replaceChildren(
    ...filtered.map((t) => {
      const waitRemaining = activeTimers[t.id] || 0;
      const platClass = getTaskPlatformClass(t);
      const resetHours = +(t.resetHours || 0);
      const repeatLabel =
        resetHours === 24 ? 'Daily' : resetHours > 0 ? `Every ${resetHours}h` : '';
      return (
        <div className={`task-card ${t.done ? 'task-done' : ''}`}>
          <div className={`task-icon-box ${platClass}`}>
            <TaskSvgIcon task={t} />
          </div>
          <div className="task-info">
            <div className="task-name">{t.title}</div>
            <div className="task-reward-row">
              <svg width="14" height="14" style="vertical-align:-2px">
                <use href="#icon-p-coin" />
              </svg>{' '}
              <span>+{t.reward}</span>
              {repeatLabel ? (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {repeatLabel}
                </span>
              ) : null}
            </div>
          </div>
          <div className="task-actions">
            {t.done ? (
              <button className="btn-done" disabled>
                {repeatLabel ? `Done (${repeatLabel})` : 'Done'}
              </button>
            ) : (
              <>
                <button className="btn-open" onClick={() => doTask(t.id, t.url)}>
                  Open
                </button>
                <button
                  className="btn-verify"
                  id={`verify-${t.id}`}
                  disabled={waitRemaining > 0}
                  onClick={() => claimTask(t.id)}
                >
                  {waitRemaining > 0 ? `${waitRemaining}s` : 'Verify'}
                </button>
              </>
            )}
          </div>
        </div>
      );
    })
  );
}

function startTaskCountdown(taskId: string, seconds: number): void {
  if (activeTimers[taskId]) return;
  activeTimers[taskId] = seconds;
  renderTasks();
  const interval = window.setInterval(() => {
    activeTimers[taskId] -= 1;
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
    return;
  }
  if (!state || state.error) {
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
  const refInput = $<HTMLInputElement>('refLink');
  if (refInput) refInput.value = state.refLink;
  setText('minW', state.minWithdrawCoins.toLocaleString());

  renderReferralsAndQualification();
  renderWithdrawMethodsAndCountries();
  renderTasks();

  try {
    const hData = await api<{ withdrawals: ClientWithdrawal[] }>('/api/my-withdrawals');
    const wHist = $('wHistory');
    if (wHist) {
      const list = hData.withdrawals || [];
      if (list.length) {
        wHist.replaceChildren(
          ...list.map((w) => (
            <div className="withdraw-item" style="border-bottom:1px solid #F1F5F9;padding:10px 0">
              <div>
                <div className="withdraw-title">
                  {w.method} • <span className="small">{w.account}</span>
                </div>
                <div className="small">
                  {w.id} • {new Date(w.at).toLocaleDateString()}
                </div>
              </div>
              <div style="text-align:right">
                <div className="withdraw-amount">
                  {w.coins.toLocaleString()}{' '}
                  <svg width="14" height="14" style="vertical-align:-2px">
                    <use href="#icon-p-coin" />
                  </svg>
                </div>
                <span className={`status-badge status-${w.status}`}>{w.status.toUpperCase()}</span>
              </div>
            </div>
          ))
        );
      } else {
        wHist.replaceChildren(
          <div className="small" style="padding:10px 0">
            No transactions yet.
          </div>
        );
      }
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
      : 'Verify email & details for Blue Tick';
  }

  const doneCard = $('verifyDoneCard');
  const formCard = $('verifyFormCard');
  if (doneCard && formCard) {
    doneCard.style.display = isVerified ? 'block' : 'none';
    formCard.style.display = isVerified ? 'none' : 'block';
  }

  if (isVerified && u.verification) {
    setText('verifiedNameText', u.verification.fullName);
    setText('verifiedEmailText', u.verification.email);
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    setText('otpTargetEmail', email);
    const otpBox = $('verifyOtpBox');
    if (otpBox) otpBox.style.display = 'block';

    const previewBanner = $('otpPreviewBanner');
    if (previewBanner) {
      if (r.otpPreview) {
        previewBanner.style.display = 'flex';
        setText('otpPreviewCode', r.otpPreview);
      } else {
        previewBanner.style.display = 'none';
      }
    }

    toast(`OTP sent to ${email}! Check & confirm below`, 'success');
  } finally {
    if (btn) btn.disabled = false;
    setText('sendOtpBtnText', 'Resend OTP to Email');
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
  const methodEl = $<HTMLSelectElement>('wMethod');
  const accEl = $<HTMLInputElement>('wAccount');
  const amtEl = $<HTMLInputElement>('wAmount');
  if (!methodEl || !accEl || !amtEl) return;

  const r = await api<{ ok: boolean; error?: string }>('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({
      method: methodEl.value,
      account: accEl.value.trim(),
      amountCoins: amtEl.value
    })
  });
  if (r.ok) {
    toast('Withdraw request gayo! Admin le 1-2 din ma approve garcha', 'success');
    accEl.value = '';
    amtEl.value = '';
  } else {
    toast(r.error || 'Withdraw request failed', 'error');
  }
  await load();
}

window.showTab = showTab;
window.filterExplore = filterExplore;
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
window.watchAd = watchAd;
window.claimDaily = claimDaily;
window.copyRef = copyRef;
window.shareRef = shareRef;
window.withdraw = withdraw;

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
    root.appendChild(<PaisoApp />);
  }
  renderDummyAvatar();
  load();
});
