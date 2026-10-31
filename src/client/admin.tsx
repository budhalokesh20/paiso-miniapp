import { h } from './jsx';
import { AdminNavigation } from './admin/AdminNavigation';
import { AdminStatCard } from './admin/AdminStatCard';
import { AdminUserEditor } from './admin/AdminUserEditor';
import type { AdminTab } from './admin/AdminNavigation';

interface CustomWithdrawMethod {
  id: string;
  name: string;
  logo: string;
  placeholder?: string;
  country?: string;
  enabled: boolean;
}

interface AllowedCountryItem {
  code: string;
  name: string;
  flag: string;
}

interface AdminUserRow {
  id: string;
  name: string;
  username: string;
  coins: number;
  totalEarned: number;
  referrals: number;
  verified: boolean;
  email: string;
  gender: string;
  dob: string;
  qualified: boolean;
  adsDone: number;
  tasksDone: number;
  dailyDone: number;
  joinedAt: string;
}

interface AdminWithdrawalRow {
  id: string;
  userId: string;
  username: string;
  method: string;
  account: string;
  coins: number;
  npr: number;
  status: 'pending' | 'paid' | 'rejected';
  at: string;
}

interface AdminTaskRow {
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
  lastResetAt?: string;
  claimsCount?: number;
}

interface AdminGameRow {
  id: string;
  title: string;
  description: string;
  url: string;
  priceCoins: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  plays: number;
  coinsCollected: number;
}

interface AdminWithdrawSettings {
  methods: CustomWithdrawMethod[];
  allowedMethods: string[];
  minWithdrawCoins: number;
  coinPerNpr: number;
  countries: AllowedCountryItem[];
  allowedCountries: string[];
  requireQualification: boolean;
}

interface AdminNotificationRow {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'reward' | 'withdraw' | 'referral' | 'admin' | 'system' | 'game';
  coins?: number;
  createdAt: string;
}

interface AdminStatsResponse {
  spinSettings?: {enabled:boolean;cooldownMs:number;rewards:number[]};
  rewardCodes?: {code:string;points:number;maxUses:number;uses:number;enabled:boolean;expiresAt:number|null}[];
  totalUsers: number;
  verifiedUsers: number;
  qualifiedUsers: number;
  totalCoins: number;
  totalEarned: number;
  pendingWithdrawals: number;
  paidWithdrawals: number;
  rejectedWithdrawals: number;
  pendingNpr: number;
  paidNpr: number;
  users: AdminUserRow[];
  recentWithdrawals: AdminWithdrawalRow[];
  tasks: AdminTaskRow[];
  games: AdminGameRow[];
  gameStarts: number;
  gameCoinsCollected: number;
  settings: AdminWithdrawSettings;
  dbMode?: 'postgres' | 'file';
  notifications?: AdminNotificationRow[];
}

let adminKey = sessionStorage.getItem('paiso_admin_key') || '';
let isRefreshing = false;
let isSavingUser = false;
let activeTab: AdminTab = 'dashboard';
let data: AdminStatsResponse | null = null;
let apiCountries: AllowedCountryItem[] = [];
let countryApiQuery = '';
let uploadedMethodLogoData = '';

// UI State for CRUD forms
let showWithdrawSettings = false;
let userSearchQuery = '';
let showUserEditor = false;
let editingUserId: string | null = null;

let editingTaskId: string | null = null;
let editingGameId: string | null = null;
let taskCategoryFilter: 'all' | 'app_task' | 'play_game' | 'telegram_join' | 'social_visit' = 'all';

let showWithdrawEditor = false;
let editingWithdrawId: string | null = null;
let txStatusFilter: 'all' | 'pending' | 'paid' | 'rejected' = 'all';
let txSearchQuery = '';

let draftSettings: AdminWithdrawSettings = {
  methods: [],
  allowedMethods: [],
  minWithdrawCoins: 10000,
  coinPerNpr: 100,
  countries: [],
  allowedCountries: [],
  requireQualification: true
};

function notify(msg: string, isErr = false): void {
  const el = document.getElementById('adminToast');
  if (!el) return;
  el.textContent = msg;
  el.className = `fixed top-4 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-bold ${
    isErr ? 'bg-red-600 text-white' : 'bg-[#16A34A] text-white'
  }`;
  setTimeout(() => {
    el.className = 'hidden';
  }, 2600);
}

async function adminApi<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const r = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-id': adminKey,
      ...((opts.headers as Record<string, string>) || {})
    }
  });
  const body = await r.json().catch(() => ({}));
  if (r.status === 403) throw new Error('Invalid admin ID');
  if (!r.ok) throw new Error(body?.error || body?.message || 'Request failed (' + r.status + ')');
  return body as T;
}
async function loadCountriesFromApi(): Promise<void> {
  try {
    const r = await fetch('/api/countries');
    const j = (await r.json()) as { countries?: AllowedCountryItem[] };
    if (Array.isArray(j.countries) && j.countries.length) {
      apiCountries = j.countries;
    }
  } catch {}
}

function DashboardTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const pending = s.recentWithdrawals.filter((w) => w.status === 'pending').slice(0, 6);
  const activeMethods = (s.settings.methods || []).filter((m) => m.enabled !== false);
  const countries = s.settings.countries || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        <AdminStatCard label="Total users" value={s.totalUsers.toLocaleString()} detail="Registered members" />
        <AdminStatCard label="Verified" value={s.verifiedUsers.toLocaleString()} detail="Verified members" tone="blue" />
        <AdminStatCard label="Pending payouts" value={s.pendingWithdrawals.toLocaleString()} detail="Needs review" tone="amber" />
        <AdminStatCard label="Pending value" value={'Rs ' + s.pendingNpr.toLocaleString()} detail="Awaiting approval" tone="amber" />
        <AdminStatCard label="Paid out" value={'Rs ' + s.paidNpr.toLocaleString()} detail="Completed payouts" tone="green" />
        <AdminStatCard label="Active tasks" value={s.tasks.length.toLocaleString()} detail="Available in app" />
        <AdminStatCard label="Game coins" value={(s.gameCoinsCollected || 0).toLocaleString()} detail={`${(s.gameStarts || 0).toLocaleString()} starts`} tone="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Pending Withdrawals</h3>
            <button
              type="button"
              onClick={() => switchAdminTab('withdrawal')}
              className="text-xs font-bold text-[#16A34A] hover:underline"
            >
              Manage All
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {pending.length ? (
              pending.map((w) => (
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">@{w.username || w.userId}</span>
                    <span className="text-slate-400 ml-1">
                      ({w.method}: {w.account})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">NPR {w.npr}</span>
                    <button
                      type="button"
                      onClick={() => decideWithdraw(w.id, 'paid')}
                      className="px-2 py-0.5 bg-[#16A34A] text-white font-bold rounded text-[11px]"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400">No pending withdrawals</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Withdrawal Configuration</h3>
            <button
              type="button"
              onClick={() => switchAdminTab('settings')}
              className="text-xs font-bold text-[#16A34A] hover:underline"
            >
              Settings
            </button>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Custom Methods</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {activeMethods.length ? (
                  activeMethods.map((m) => (
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                      {m.logo ? <img src={m.logo} className="w-3.5 h-3.5 rounded object-contain" /> : null}
                      <span>{m.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Minimum Withdrawal</span>
              <b className="text-slate-900">
                {s.settings.minWithdrawCoins.toLocaleString()} Coins (NPR{' '}
                {(s.settings.minWithdrawCoins / s.settings.coinPerNpr).toFixed(0)})
              </b>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Allowed Countries</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {countries.length ? (
                  countries.map((c) => (
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                      {c.flag ? <img src={c.flag} className="w-4 h-3 object-cover rounded-sm" /> : null}
                      <span>{c.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const q = userSearchQuery.trim().toLowerCase();
  const filtered = s.users.filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
  const editUser = editingUserId ? s.users.find((u) => u.id === editingUserId) : null;

  if (showUserEditor) return <AdminUserEditor user={editUser || null} saving={isSavingUser} onBack={closeUserForm} onSave={saveUserCrud} />;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-extrabold text-slate-900">User Management ({filtered.length})</h2>
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={userSearchQuery}
            onInput={(e: Event) => filterAdminUsers((e.target as HTMLInputElement).value)}
            placeholder="Search name, username, ID or email..."
            className="w-60 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]"
          />
          <button
            type="button"
            onClick={() => openUserForm()}
            className="px-3.5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition"
          >
            + Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Blue Tick</th>
              <th className="py-2.5 px-3">Qualification</th>
              <th className="py-2.5 px-3">Coins</th>
              <th className="py-2.5 px-3">Referrals</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length ? (
              filtered.map((u) => (
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{u.name}</span>
                      {u.verified ? (
                        <span className="w-4 h-4 rounded-full bg-[#1D9BF0] text-white text-[10px] inline-flex items-center justify-center">
                          ✓
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      #{u.id} {u.username ? `• @${u.username}` : ''}
                    </div>
                    {u.email ? <div className="text-[11px] text-slate-500">{u.email}</div> : null}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => toggleUserVerify(u.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                        u.verified
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.qualified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {u.qualified ? 'Qualified' : `${u.adsDone}/3A • ${u.tasksDone}/2T • ${u.dailyDone}/2D`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">{u.coins.toLocaleString()}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{u.referrals}</td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => quickAdjustCoins(u.id, u.coins)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[11px]"
                      title="Add or deduct coins"
                    >
                      +/- Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdminNotifModal(u.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[11px]"
                    >
                      Notify
                    </button>
                    <button
                      type="button"
                      onClick={() => openUserForm(u.id)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteUser(u.id)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[11px]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCountryApiListNodes(query: string): Node[] {
  const cq = query.trim().toLowerCase();
  const matching = apiCountries
    .filter(
      (c) =>
        !draftSettings.countries.some((dc) => dc.code === c.code) &&
        (!cq || c.name.toLowerCase().includes(cq) || c.code.toLowerCase().includes(cq))
    )
    .slice(0, 30);

  if (!matching.length) {
    return [
      <div className="col-span-full py-6 text-center text-xs text-slate-400">
        No matching countries found
      </div>
    ];
  }

  return matching.map((c) => (
    <button
      type="button"
      onClick={() => addCountryFromApi(c.code)}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-[#16A34A] hover:bg-emerald-50/50 transition text-left"
    >
      <div className="flex items-center gap-2 min-w-0">
        <img src={c.flag} className="w-5 h-3.5 object-cover rounded-sm border border-slate-200 shrink-0" />
        <span className="text-xs font-bold text-slate-800 truncate">{c.name}</span>
      </div>
      <span className="text-[11px] font-extrabold text-[#16A34A] shrink-0">+ Add</span>
    </button>
  ));
}

function WithdrawalTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const pending = s.recentWithdrawals.filter((w) => w.status === 'pending');
  const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
  const methodOptions = draftSettings.methods.length
    ? draftSettings.methods.map((m) => m.name)
    : ['Custom'];
  const activeMethods = (s.settings.methods || []).filter((m) => m.enabled !== false);
  const activeCountries = s.settings.countries || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatCard label="Pending requests" value={s.pendingWithdrawals.toLocaleString()} detail="Waiting for review" tone="amber" />
        <AdminStatCard label="Pending value" value={'Rs ' + s.pendingNpr.toLocaleString()} detail="Ready to process" tone="amber" />
        <AdminStatCard label="Paid requests" value={s.paidWithdrawals.toLocaleString()} detail="Completed payouts" tone="green" />
        <AdminStatCard label="Total paid" value={'Rs ' + s.paidNpr.toLocaleString()} detail="Successfully sent" tone="green" />
      </div>

      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Payout requests</h2>
        <p className="mt-1 text-sm text-slate-500">Review and process pending requests.</p>
      </div>
      {/* Edit payout details */}
      {showWithdrawEditor ? (
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Edit payout</h3>
            <button
              type="button"
              onClick={() => closeWithdrawForm()}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">User ID</label>
              <input
                id="crudWUserId"
                type="text"
                value={editW ? editW.userId : ''}
                disabled
                placeholder="User ID"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Method</label>
              <select
                id="crudWMethod"
                value={editW?.method || methodOptions[0]}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              >
                {methodOptions.map((m) => (
                  <option value={m} selected={editW?.method === m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Account / Wallet ID</label>
              <input
                id="crudWAccount"
                type="text"
                value={editW ? editW.account : ''}
                placeholder="Account ID"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Coins Amount</label>
              <input
                id="crudWCoins"
                type="number"
                value={editW ? editW.coins : 10000}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 font-semibold mb-1">Status</label>
                <select
                  id="crudWStatus"
                  value={editW?.status || 'pending'}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => saveWithdrawCrud()}
                className="px-4 py-1.5 bg-[#16A34A] text-white font-bold rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pending Withdrawals Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-extrabold text-slate-900 mb-3">
          Pending Withdrawal Requests ({pending.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Method &amp; Account</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pending.length ? (
                pending.map((w) => (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{w.id}</td>
                    <td className="py-3 px-3">@{w.username || w.userId}</td>
                    <td className="py-3 px-3">
                      <b>{w.method}</b>: <span className="font-mono">{w.account}</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {w.coins.toLocaleString()} (NPR {w.npr})
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => decideWithdraw(w.id, 'paid')}
                        className="px-3 py-1 bg-[#16A34A] text-white font-bold rounded-md text-xs"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => decideWithdraw(w.id, 'reject')}
                        className="px-3 py-1 bg-amber-500 text-white font-bold rounded-md text-xs"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => openWithdrawForm(w.id)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-md text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteWithdrawCrud(w.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-600 font-bold rounded-md text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No pending withdrawals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatResetBadge(hours?: number): string {
  const h = +(hours || 0);
  if (h <= 0) return 'One-Time';
  if (h === 24) return 'Daily (24h)';
  return `Every ${h}h`;
}

function TasksTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const editTask = editingTaskId ? s.tasks.find((t) => t.id === editingTaskId) : null;
  const tgTasksCount = s.tasks.filter((t) => t.type === 'telegram_join').length;
  const socialTasksCount = s.tasks.filter((t) => t.type === 'social_visit').length;
  const appTasksCount = s.tasks.filter((t) => t.type === 'app_task').length;
  const gameTasksCount = s.tasks.filter((t) => t.type === 'play_game').length;
  const repeatableCount = s.tasks.filter((t) => (t.resetHours || 0) > 0).length;
  const totalActiveClaims = s.tasks.reduce((sum, t) => sum + (t.claimsCount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AdminStatCard label="Tasks" value={s.tasks.length.toLocaleString()} detail="Published" />
        <AdminStatCard label="Repeatable" value={repeatableCount.toLocaleString()} detail="Scheduled reset" tone="blue" />
        <AdminStatCard label="Completions" value={totalActiveClaims.toLocaleString()} detail="Current total" tone="green" />
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={() => resetAllTasksClaims()} className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100">Reset all completions</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Create / Edit Task Card */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {editTask ? `Edit Task` : 'New task'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {editTask ? `Editing ID: ${editTask.id}` : 'Create task'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearTaskFormInputs()}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600"
            >
              {editTask ? 'Cancel Edit' : 'Reset Form'}
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] text-slate-600 font-bold mb-1">Title</label>
              <input
                id="newTaskTitle"
                type="text"
                value={editTask ? editTask.title : ''}
                placeholder="e.g. Join Official Telegram Channel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Type</label>
                <select
                  id="newTaskType"
                  value={editTask?.type || 'app_task'}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="app_task">App Task</option>
                  <option value="play_game">Play Game</option>
                  <option value="social_visit">Social / Web Visit</option>
                  <option value="telegram_join">Telegram Join</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Reset</label>
                <select
                  id="newTaskResetHours"
                  value={String(editTask?.resetHours || 0)}
                  className="w-full px-2.5 py-2 bg-emerald-50/60 border border-emerald-200 text-emerald-950 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="0">One-Time Only</option>
                  <option value="24">Daily (Every 24h)</option>
                  <option value="12">Every 12 Hours</option>
                  <option value="6">Every 6 Hours</option>
                  <option value="1">Every 1 Hour</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Reward</label>
                <input
                  id="newTaskReward"
                  type="number"
                  value={editTask ? editTask.reward : 200}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Wait (sec)</label>
                <input
                  id="newTaskWait"
                  type="number"
                  value={editTask ? editTask.waitSeconds || 15 : 15}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-bold mb-1">Destination URL</label>
              <input
                id="newTaskUrl"
                type="text"
                value={editTask ? editTask.url : ''}
                placeholder="https://t.me/... or https://youtube.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-bold mb-1">
                Telegram target
              </label>
              <input
                id="newTaskTarget"
                type="text"
                value={editTask ? editTask.target : ''}
                placeholder="@yourchannel (optional for web tasks)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <button
              type="button"
              onClick={() => saveTaskCrud()}
              className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              {editTask ? 'Save changes' : '+ Create Task'}
            </button>
          </div>
        </div>

        {/* Right: Clean Tasks List Table with Per-Task Reset */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Tasks ({s.tasks.length})</h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTaskCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  taskCategoryFilter === 'all'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({s.tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskCategoryFilter('app_task')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  taskCategoryFilter === 'app_task'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                App ({appTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setTaskCategoryFilter('play_game')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  taskCategoryFilter === 'play_game'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                }`}
              >
                Games ({gameTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setTaskCategoryFilter('telegram_join')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  taskCategoryFilter === 'telegram_join'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                Telegram ({tgTasksCount})
              </button>
              <button
                type="button"
                onClick={() => setTaskCategoryFilter('social_visit')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  taskCategoryFilter === 'social_visit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Social ({socialTasksCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
                  <th className="py-2.5 px-3">Task Details</th>
                  <th className="py-2.5 px-3">Type &amp; Timer</th>
                  <th className="py-2.5 px-3">Reset Mode</th>
                  <th className="py-2.5 px-3">Reward</th>
                  <th className="py-2.5 px-3">Done By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.tasks
                  .filter((t) => taskCategoryFilter === 'all' || t.type === taskCategoryFilter)
                  .length ? (
                  s.tasks
                    .filter((t) => taskCategoryFilter === 'all' || t.type === taskCategoryFilter)
                    .map((t) => {
                    const isTg = t.type === 'telegram_join';
                    const isApp = t.type === 'app_task';
                    const isGame = t.type === 'play_game';
                    const isRepeatable = (t.resetHours || 0) > 0;
                    const typeBadgeClass = isApp
                      ? 'bg-indigo-50 text-indigo-700'
                      : isGame
                      ? 'bg-violet-50 text-violet-700'
                      : isTg
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-blue-50 text-blue-700';
                    const typeBadgeText = isApp
                      ? `App Task (${t.waitSeconds || 20}s)`
                      : isGame
                      ? `Play Game (${t.waitSeconds || 30}s)`
                      : isTg
                      ? 'Telegram'
                      : `Social (${t.waitSeconds || 15}s)`;
                    return (
                      <tr className="hover:bg-slate-50/80">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{t.title}</div>
                          <a
                            href={t.url}
                            target="_blank"
                            className="text-[11px] text-blue-600 hover:underline truncate block max-w-[240px]"
                          >
                            {t.url}
                          </a>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${typeBadgeClass}`}>
                            {typeBadgeText}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isRepeatable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {formatResetBadge(t.resetHours)}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-[#16A34A] whitespace-nowrap">
                          +{t.reward}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-700">{t.claimsCount || 0}</span>{' '}
                          <span className="text-[11px] text-slate-400">users</span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => resetSingleTaskClaims(t.id, t.title)}
                            title="Reset completions so all users can complete this task again"
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-200 font-bold rounded text-[11px] transition"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => editTaskForm(t.id)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(t.id)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[11px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No tasks created yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardsAdmin({s}:{s:AdminStatsResponse}) {
  const spin=s.spinSettings || {enabled:true,cooldownMs:86400000,rewards:[5,10,20,50]};
  const field='block w-full rounded-xl border border-slate-200 p-3 text-sm';
  const submit=async(event:Event,bonus:boolean)=>{
    event.preventDefault();const form=event.currentTarget as HTMLFormElement;const button=form.querySelector('button[type=submit]') as HTMLButtonElement;if(button.disabled)return;button.disabled=true;
    const data=new FormData(form);
    try{const payload=bonus?{code:String(data.get('code')),points:Number(data.get('points')),maxUses:Number(data.get('maxUses')),expiresAt:data.get('expiresAt')?new Date(String(data.get('expiresAt'))).getTime():null}:{enabled:data.get('enabled')==='on',cooldownMs:Number(data.get('hours'))*3600000,rewards:String(data.get('rewards')).split(',').map(value=>Number(value.trim()))};
      await adminApi(bonus?'/api/admin/rewards/codes':'/api/admin/rewards/spin',{method:bonus?'POST':'PUT',body:JSON.stringify(payload)});notify(bonus?'Bonus code created':'Spin settings saved');await refreshAdmin();
    }catch(error){notify((error as Error).message,true);button.disabled=false;}
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4"><h2 className="text-lg font-bold">Spin & bonus rewards</h2><div className="grid gap-5 md:grid-cols-2">
    <form className="space-y-3" onSubmit={(e:Event)=>void submit(e,false)}><h3 className="font-bold">Daily Spin</h3><label className="block"><input type="checkbox" name="enabled" checked={spin.enabled}/> Enable spins</label><label className="block">Cooldown hours<input className={field} type="number" name="hours" min="0.016667" max="720" step="any" required value={spin.cooldownMs/3600000}/></label><label className="block">Possible P points (comma separated)<input className={field} name="rewards" required value={spin.rewards.join(', ')}/></label><p className="text-xs text-slate-500">Each listed entry has the same probability. Repeat a value to increase its probability.</p><button type="submit" className="rounded-xl bg-emerald-700 px-4 py-3 text-white font-bold">Save spin settings</button></form>
    <form className="space-y-3" onSubmit={(e:Event)=>void submit(e,true)}><h3 className="font-bold">Create bonus code</h3><label className="block">Code<input className={field} name="code" minLength={4} maxLength={40} required pattern="[A-Za-z0-9-]+"/></label><label className="block">P points<input className={field} name="points" type="number" min="1" max="1000000" defaultValue="100" required/></label><label className="block">Total redemptions<input className={field} name="maxUses" type="number" min="1" max="1000000" defaultValue="100" required/></label><label className="block">Expiry (optional)<input className={field} name="expiresAt" type="datetime-local"/></label><p className="text-xs text-slate-500">Each user can redeem a code once.</p><button type="submit" className="rounded-xl bg-emerald-700 px-4 py-3 text-white font-bold">Create code</button></form>
  </div><div className="space-y-2">{(s.rewardCodes || []).map(code=><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><b>{code.code}</b><p className="text-sm">{code.points} P · {code.uses}/{code.maxUses} uses · {code.expiresAt?new Date(code.expiresAt).toLocaleString():'No expiry'}</p></div><button type="button" className="rounded-lg border p-2" onClick={async(event:Event)=>{const button=event.currentTarget as HTMLButtonElement;button.disabled=true;try{await adminApi('/api/admin/rewards/codes/'+encodeURIComponent(code.code),{method:'PUT',body:JSON.stringify({enabled:!code.enabled})});await refreshAdmin();}catch(error){notify((error as Error).message,true);button.disabled=false;}}}>{code.enabled?'Pause':'Enable'}</button></div>)}</div></section>;
}

function GamesTabView(props: { s: AdminStatsResponse }) {
  const games = props.s.games || [];
  const editGame = editingGameId ? games.find((game) => game.id === editingGameId) : null;
  return (
    <div className="space-y-5">
      <RewardsAdmin s={props.s} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <AdminStatCard label="Published games" value={games.filter((g) => g.enabled).length.toLocaleString()} detail={`${games.length} total`} />
        <AdminStatCard label="Game starts" value={(props.s.gameStarts || 0).toLocaleString()} detail="Paid and free starts" tone="blue" />
        <AdminStatCard label="Coins collected" value={(props.s.gameCoinsCollected || 0).toLocaleString()} detail="Spent to start games" tone="green" />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(300px,380px)_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-extrabold text-slate-900">{editGame ? 'Edit game' : 'Add a game'}</h2><p className="mt-1 text-xs text-slate-500">Add a secure iframe game URL.</p></div>
            {editGame ? <button type="button" onClick={() => clearGameForm()} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600">Cancel</button> : null}
          </div>
          <div className="space-y-3.5">
            <label className="block text-xs font-bold text-slate-700">Game title
              <input id="gameTitle" maxLength={60} value={editGame?.title || ''} placeholder="e.g. Gem Runner" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Short description <span className="font-medium text-slate-400">(optional)</span>
              <textarea id="gameDescription" maxLength={240} rows={3} value={editGame?.description || ''} placeholder="Tell players what to expect" className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="block text-xs font-bold text-slate-700">Coins per start
              <input id="gamePrice" type="number" min="0" max="100000" step="1" value={editGame ? editGame.priceCoins : 10} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              <span className="mt-1 block text-[11px] font-medium text-slate-400">Set 0 for a free game. Coins are charged on each start.</span>
            </label>
            <label className="block text-xs font-bold text-slate-700">Game iframe URL
              <input id="gameUrl" type="url" value={editGame?.url || ''} maxLength={2000} placeholder="https://games.example.com/embed/..." className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              <span className="mt-1 block text-[11px] font-medium text-slate-400">Use an HTTPS embed URL. Paste the iframe source URL, not HTML code.</span>
            </label>
            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] leading-4 text-amber-800">Game providers must allow iframe embedding. The game opens in a sandboxed player.</div>
            <button type="button" onClick={() => saveGameCrud()} className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-emerald-800">{editGame ? 'Save game' : 'Publish game'}</button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3"><div><h2 className="text-sm font-extrabold text-slate-900">Game library</h2><p className="mt-1 text-xs text-slate-500">Iframe games and coin usage.</p></div><span className="text-xs font-bold text-slate-500">{games.length} games</span></div>
          {games.length ? games.map((game) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50"><img src="/assets/icon-games.png" alt="" className="h-6 w-6 object-contain" /></div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-extrabold text-slate-900">{game.title}</h3><span className={'rounded-full px-2 py-0.5 text-[10px] font-bold '+(game.enabled?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500')}>{game.enabled?'Live':'Paused'}</span></div><p className="mt-1 line-clamp-2 text-xs text-slate-500">{game.description || 'No description'}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600"><span>{game.priceCoins ? `${game.priceCoins.toLocaleString()} coins / start` : 'Free'}</span><span>{game.plays.toLocaleString()} plays</span><span>{game.coinsCollected.toLocaleString()} coins collected</span></div></div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button type="button" onClick={() => editGameForm(game.id)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={() => setGameEnabled(game.id, !game.enabled)} className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100">{game.enabled?'Pause':'Publish'}</button>
                  <button type="button" onClick={() => deleteGame(game.id, game.title)} className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100">Delete</button>
                </div>
              </div>
            </article>
          )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div className="text-sm font-bold text-slate-800">No games published</div><p className="mt-1 text-xs text-slate-500">Add an iframe game URL to make it available in Explore.</p></div>}
        </section>
      </div>
    </div>
  );
}

function TransactionsTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const q = txSearchQuery.trim().toLowerCase();
  const list = s.recentWithdrawals.filter((w) => {
    if (txStatusFilter !== 'all' && w.status !== txStatusFilter) return false;
    if (!q) return true;
    return w.id.toLowerCase().includes(q) ||
      (w.username || '').toLowerCase().includes(q) ||
      w.userId.toLowerCase().includes(q) ||
      w.account.toLowerCase().includes(q) ||
      w.method.toLowerCase().includes(q);
  });
  const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
  const methodOptions = draftSettings.methods.length ? draftSettings.methods.map((m) => m.name) : ['Custom'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStatCard label="Pending" value={s.pendingWithdrawals.toLocaleString()} detail="Requests" tone="amber" />
        <AdminStatCard label="Paid" value={s.paidWithdrawals.toLocaleString()} detail="Requests" tone="green" />
        <AdminStatCard label="Rejected" value={s.rejectedWithdrawals.toLocaleString()} detail="Requests" />
        <AdminStatCard label="Paid total" value={'Rs ' + s.paidNpr.toLocaleString()} detail="NPR" tone="green" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">Recent transactions <span className="font-medium text-slate-400">({list.length})</span></h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'pending', 'paid', 'rejected'] as const).map((st) => (
                <button type="button" onClick={() => setTxFilter(st)} className={'rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ' + (txStatusFilter === st ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {st}
                </button>
              ))}
            </div>
            <input type="search" id="txSearchInput" value={txSearchQuery} onInput={(e: Event) => filterTxSearch((e.target as HTMLInputElement).value)} placeholder="Search transactions" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:w-52" />
          </div>
        </div>

        {showWithdrawEditor ? (
          <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit payout</h3>
              <button type="button" onClick={() => closeWithdrawForm()} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200">Cancel</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs font-semibold text-slate-600">User ID
                <input id="crudWUserId" type="text" value={editW?.userId || ''} disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-600">Method
                <select id="crudWMethod" value={editW?.method || methodOptions[0]} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{methodOptions.map((m) => <option value={m}>{m}</option>)}</select>
              </label>
              <label className="text-xs font-semibold text-slate-600">Account
                <input id="crudWAccount" type="text" value={editW?.account || ''} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </label>
              <label className="text-xs font-semibold text-slate-600">Coins
                <input id="crudWCoins" type="number" value={editW?.coins || 0} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </label>
              <div className="flex items-end gap-2">
                <select id="crudWStatus" value={editW?.status || 'pending'} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="pending">Pending</option><option value="paid">Paid</option><option value="rejected">Rejected</option>
                </select>
                <button type="button" onClick={() => saveWithdrawCrud()} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">Save</button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto pt-3">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead><tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2.5">Transaction</th><th className="px-3 py-2.5">User</th><th className="px-3 py-2.5">Method / account</th><th className="px-3 py-2.5">Amount</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.length ? list.map((w) => (
                <tr className="transition hover:bg-slate-50">
                  <td className="px-3 py-3"><div className="font-bold text-slate-900">{w.id}</div><div className="mt-1 text-[10px] text-slate-400">{new Date(w.at).toLocaleString()}</div></td>
                  <td className="px-3 py-3"><div className="font-semibold text-slate-800">@{w.username || w.userId}</div><div className="mt-1 text-[10px] text-slate-400">ID {w.userId}</div></td>
                  <td className="px-3 py-3"><div className="font-semibold text-slate-800">{w.method}</div><div className="mt-1 max-w-48 truncate font-mono text-[10px] text-slate-500">{w.account}</div></td>
                  <td className="px-3 py-3 font-bold text-slate-900">{w.coins.toLocaleString()} coins<div className="mt-1 text-[10px] font-medium text-slate-400">NPR {w.npr.toLocaleString()}</div></td>
                  <td className="px-3 py-3"><span className={'rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ' + (w.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : w.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700')}>{w.status}</span></td>
                  <td className="space-x-1.5 whitespace-nowrap px-3 py-3 text-right">
                    <button type="button" onClick={() => openWithdrawForm(w.id)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200">Edit</button>
                    <button type="button" onClick={() => deleteWithdrawCrud(w.id)} className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="px-3 py-12 text-center text-sm text-slate-400">No transactions found</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function SettingsTabView(props: { s: AdminStatsResponse }) {
  const reqQual = draftSettings.requireQualification !== false;
  const methods = draftSettings.methods || [];
  const countries = draftSettings.countries || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Payout rules, methods and country access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => saveWithdrawSettings()}
            className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold rounded-lg shadow-sm transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Grid: 1. Exchange Rules & Qualification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Currency & Exchange */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-extrabold text-sm">
              ₹
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Exchange &amp; Minimums</h3>
              <p className="text-[11px] text-slate-400">Payout limits and coin conversion</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Minimum payout (coins)
              </label>
              <input
                id="setMinCoins"
                type="number"
                defaultValue={String(draftSettings.minWithdrawCoins)}
                placeholder="10000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Coin rate (coins per NPR)
              </label>
              <input
                id="setCoinRate"
                type="number"
                defaultValue={String(draftSettings.coinPerNpr)}
                placeholder="100"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-[#16A34A]"
              />
            </div>


          </div>
        </div>

        {/* Security & Qualification Switch */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-sm">
              🛡️
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Payout eligibility</h3>

            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-slate-900">Require 15 ads + 1 referral</div>

              </div>
              <button
                type="button"
                onClick={() => toggleQualificationReq()}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  reqQual ? 'bg-[#16A34A]' : 'bg-slate-300'
                }`}
                title="Toggle qualification requirement"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reqQual ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">Qualification Status:</span>
              <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
                reqQual ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {reqQual ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment methods */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Payment methods</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start">
            {methods.length} methods
          </span>
        </div>

        {/* Add Payout Method Form */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
            Add method
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Method name</label>
              <input
                id="newMethodName"
                type="text"
                placeholder="e.g. eSewa, Khalti, UPI"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Country</label>
              <select
                id="newMethodCountry"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
              >
                <option value="All">All Countries</option>
                {countries.map((c) => (
                  <option value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Account label</label>
              <input
                id="newMethodPlaceholder"
                type="text"
                placeholder="e.g. Enter Phone / Account ID"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#16A34A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Logo</label>
              <div className="flex gap-2 items-center">
                <input
                  id="newMethodLogoUrl"
                  type="text"
                  placeholder="https://... or upload"
                  onInput={(e: Event) => previewMethodLogoUrl((e.target as HTMLInputElement).value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#16A34A]"
                />
                <label className="cursor-pointer px-2.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold shrink-0">
                  📁
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e: Event) => handleMethodLogoUpload(e.target as HTMLInputElement)}
                  />
                </label>
                <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                  <img id="newMethodLogoPreview" className="w-full h-full object-contain hidden" />
                  <span id="newMethodLogoPlaceholder" className="text-[10px] text-slate-400 font-bold">Logo</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => addCustomMethod()}
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition"
            >
              + Add method
            </button>
          </div>
        </div>

        {/* Existing Methods List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {methods.length ? (
            methods.map((m) => (
              <div
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                  m.enabled !== false
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {m.logo ? (
                      <img src={m.logo} alt={m.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xs font-extrabold text-slate-500">{m.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">{m.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {m.country || 'All'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{m.placeholder}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleCustomMethod(m.id)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${
                      m.enabled !== false
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {m.enabled !== false ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomMethod(m.id)}
                    className="p-1 rounded text-red-500 hover:bg-red-50"
                    title="Remove method"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No payment methods yet.
            </div>
          )}
        </div>
      </div>

      {/* Country access */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Allowed countries</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start">
            {countries.length ? `${countries.length} countries whitelisted` : 'Worldwide (All Countries)'}
          </span>
        </div>

        {/* Current Active Whitelist */}
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">Allowed countries</div>
          <div className="flex flex-wrap gap-2">
            {countries.length ? (
              countries.map((c) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                  {c.flag ? <img src={c.flag} className="w-4 h-3 object-cover rounded-sm" /> : null}
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({c.code})</span>
                  <button
                    type="button"
                    onClick={() => removeAllowedCountry(c.code)}
                    className="ml-1 text-slate-400 hover:text-red-600 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">
                No country restriction active — users from any country can withdraw.
              </span>
            )}
          </div>
        </div>

        {/* Add Countries via REST Countries API Search */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Add countries</span>

          </div>
          <input
            type="text"
            placeholder="Search country"
            onInput={(e: Event) => filterCountryApiSearch((e.target as HTMLInputElement).value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#16A34A]"
          />
          <div
            id="countryApiResultsList"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1"
          >
            {renderCountryApiListNodes(countryApiQuery)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 lg:flex">
      <div id="adminToast" className="hidden" />
      <AdminNavigation activeTab={activeTab} onSelect={switchAdminTab} />
      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-black text-white lg:hidden">P</div>
              <div><p className="hidden text-[10px] font-bold uppercase tracking-[.15em] text-slate-400 sm:block">Paiso workspace</p><h1 className="text-lg font-extrabold tracking-tight text-slate-950">{activeTab === 'dashboard' ? 'Overview' : activeTab === 'withdrawal' ? 'Payouts' : activeTab === 'transactions' ? 'Transactions' : activeTab === 'users' ? 'Users' : activeTab === 'tasks' ? 'Tasks' : activeTab === 'games' ? 'Games' : 'Settings'}</h1></div>
              <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 md:inline-flex"><span className={'h-2 w-2 rounded-full '+(data?.dbMode==='postgres'?'bg-emerald-500':'bg-slate-400')}/>{data?.dbMode==='postgres'?'Database connected':'Local data'}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => openAdminNotifModal('all')} className="inline-flex rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 sm:px-3.5 sm:text-xs">Notify</button>
              <button id="adminRefreshButton" type="button" onClick={() => refreshAdmin()} className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">Refresh</button>
              <button type="button" onClick={() => adminLogout()} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Logout</button>
            </div>
          </div>
        </header>
      <div id="adminLoginSection" className="hidden flex min-h-[calc(100dvh-76px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[.04] sm:p-9">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Admin Login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enter your Admin ID to continue.</p>
          <input
            id="adminKeyInput"
            type="password"
            defaultValue={adminKey}
            placeholder="Admin ID"
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') adminLogin();
            }}
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="button"
            onClick={() => adminLogin()}
            className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Login
          </button>
          <div id="adminLoginErr" className="text-xs text-red-600 font-semibold mt-2" />
        </div>
      </div>

      <main id="adminMainWorkspace" className="min-h-[calc(100dvh-76px)] px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
        <div id="adminTabView" className="w-full h-full" />
      </main>
      </div>
      {/* Admin Send Notification & Activity Log Modal */}
      <div
        id="adminNotifModal"
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] hidden items-center justify-center p-4"
        onClick={(e: Event) => {
          if ((e.target as HTMLElement).id === 'adminNotifModal') closeAdminNotifModal();
        }}
      >
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Send Notification &amp; Activity Log</h3>
              <p className="text-xs text-slate-500">
                Broadcast a message (with optional bonus coins) to all users or a specific user.
              </p>
            </div>
            <button
              type="button"
              onClick={() => closeAdminNotifModal()}
              className="px-2.5 py-1 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-700 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 text-xs">
            {/* Compose Notification Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Recipient (Target User ID or 'all')
                  </label>
                  <input
                    id="adminNotifTarget"
                    type="text"
                    defaultValue="all"
                    placeholder="all (for everyone) or User ID e.g. 999001"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Optional Gift Coins (0 for none)
                  </label>
                  <input
                    id="adminNotifCoins"
                    type="number"
                    defaultValue="0"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Notification Title</label>
                <input
                  id="adminNotifTitle"
                  type="text"
                  placeholder="e.g. New High-Reward Task Added! or Special Bonus"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Notification Message</label>
                <textarea
                  id="adminNotifMessage"
                  rows={2}
                  placeholder="Write the notification message that users will see in their app..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <button
                type="button"
                onClick={() => sendAdminNotification()}
                className="w-full py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-lg transition"
              >
                Send Notification Now
              </button>
            </div>

            {/* Recent Notifications History */}
            <div>
              <div className="text-xs font-extrabold uppercase text-slate-700 mb-2">
                Recent Notifications &amp; Activity Log
              </div>
              <div id="adminNotifHistoryList" className="space-y-2 max-h-60 overflow-y-auto pr-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderActiveTab(): void {
  const container = document.getElementById('adminTabView');
  if (!container || !data) return;

  document.querySelectorAll<HTMLButtonElement>('[data-admintab]').forEach((btn) => {
    const isActive = btn.dataset.admintab === activeTab;
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    btn.classList.toggle('bg-emerald-50', isActive && !!btn.closest('aside'));
    btn.classList.toggle('text-emerald-800', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
    const isDesktopNav = !!btn.closest('aside');
    const icon = btn.querySelector('span');
    if (icon) {
      icon.classList.toggle('bg-emerald-100', isActive && isDesktopNav);
      icon.classList.toggle('bg-slate-100', !isActive && isDesktopNav);
      icon.classList.toggle('bg-emerald-50', isActive && !isDesktopNav);
      icon.classList.toggle('text-emerald-800', isActive && isDesktopNav);
      icon.classList.toggle('text-slate-500', !isActive && isDesktopNav);
    }
  });

  let viewNode: Node;
  if (activeTab === 'dashboard') viewNode = <DashboardTabView s={data} />;
  else if (activeTab === 'users') viewNode = <UsersTabView s={data} />;
  else if (activeTab === 'withdrawal') viewNode = <WithdrawalTabView s={data} />;
  else if (activeTab === 'tasks') viewNode = <TasksTabView s={data} />;
  else if (activeTab === 'games') viewNode = <GamesTabView s={data} />;
  else if (activeTab === 'settings') viewNode = <SettingsTabView s={data} />;
  else viewNode = <TransactionsTabView s={data} />;

  const focused = document.activeElement as HTMLInputElement | null;
  const focusId = focused?.id;
  const selectionStart = focused && (focused.type === 'text' || focused.type === 'search') ? focused.selectionStart : null;
  const selectionEnd = focused && (focused.type === 'text' || focused.type === 'search') ? focused.selectionEnd : null;
  container.replaceChildren(viewNode);
  if (focusId) {
    const next = document.getElementById(focusId) as HTMLInputElement | null;
    if (next && !next.disabled) {
      next.focus({ preventScroll: true });
      if (selectionStart !== null && selectionEnd !== null) next.setSelectionRange(selectionStart, selectionEnd);
    }
  }}

async function refreshAdmin(): Promise<void> {
  if (isRefreshing) return;
  isRefreshing = true;
  const refreshButton = document.getElementById('adminRefreshButton') as HTMLButtonElement | null;
  if (refreshButton) { refreshButton.disabled = true; refreshButton.textContent = 'Refreshing…'; }
  try {
    if (!apiCountries.length) loadCountriesFromApi();
    const s = await adminApi<AdminStatsResponse>('/api/admin/stats');
    data = s;
    draftSettings = {
      methods: Array.isArray(s.settings.methods) ? s.settings.methods.map((m) => ({ ...m })) : [],
      allowedMethods: [...(s.settings.allowedMethods || [])],
      minWithdrawCoins: s.settings.minWithdrawCoins || 10000,
      coinPerNpr: s.settings.coinPerNpr || 100,
      countries: Array.isArray(s.settings.countries) ? s.settings.countries.map((c) => ({ ...c })) : [],
      allowedCountries: [...(s.settings.allowedCountries || [])],
      requireQualification: s.settings.requireQualification !== false
    };
    document.getElementById('adminLoginSection')?.classList.add('hidden');
    document.getElementById('adminMainWorkspace')?.classList.remove('hidden');
    renderActiveTab();
  } catch (e) {
    document.getElementById('adminMainWorkspace')?.classList.add('hidden');
    document.getElementById('adminLoginSection')?.classList.remove('hidden');
    const errEl = document.getElementById('adminLoginErr');
    if (errEl) errEl.textContent = (e as Error).message;
  } finally {
    isRefreshing = false;
    if (refreshButton) { refreshButton.disabled = false; refreshButton.textContent = 'Refresh'; }
  }
}
async function adminLogin(): Promise<void> {
  const inp = document.getElementById('adminKeyInput') as HTMLInputElement | null;
  if (inp && inp.value.trim()) {
    adminKey = inp.value.trim();
    sessionStorage.setItem('paiso_admin_key', adminKey);
  }
  await refreshAdmin();
}

function adminLogout(): void {
  sessionStorage.removeItem('paiso_admin_key');
  adminKey = '';
  location.reload();
}

function clearGameForm(): void {
  editingGameId = null;
  renderActiveTab();
}

function editGameForm(id: string): void {
  editingGameId = id;
  renderActiveTab();
  document.getElementById('gameTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function saveGameCrud(): Promise<void> {
  const title = (document.getElementById('gameTitle') as HTMLInputElement | null)?.value.trim() || '';
  const description = (document.getElementById('gameDescription') as HTMLTextAreaElement | null)?.value.trim() || '';
  const url = (document.getElementById('gameUrl') as HTMLInputElement | null)?.value.trim() || '';
  const priceCoins = Number((document.getElementById('gamePrice') as HTMLInputElement | null)?.value);
  if (title.length < 2 || title.length > 60) return notify('Game title must be 2–60 characters', true);
  if (description.length > 240) return notify('Description must be 240 characters or less', true);
  if (!Number.isSafeInteger(priceCoins) || priceCoins < 0 || priceCoins > 100000) return notify('Price must be a whole number from 0 to 100,000', true);
  try {
    if (new URL(url).protocol !== 'https:') return notify('Game URL must use HTTPS', true);
  } catch {
    return notify('Enter a valid game iframe URL', true);
  }

  const payload = { title, description, url, priceCoins };
  try {
    if (editingGameId) {
      await adminApi(`/api/admin/games/${encodeURIComponent(editingGameId)}`, { method: 'PUT', body: JSON.stringify(payload) });
      notify('Game updated');
    } else {
      await adminApi('/api/admin/games', { method: 'POST', body: JSON.stringify(payload) });
      notify('Game published');
    }
    editingGameId = null;
    await refreshAdmin();
  } catch (e) {
    notify((e as Error).message || 'Could not save game', true);
  }
}

async function setGameEnabled(id: string, enabled: boolean): Promise<void> {
  try {
    await adminApi(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ enabled }) });
    notify(enabled ? 'Game published' : 'Game paused');
    await refreshAdmin();
  } catch (e) {
    notify((e as Error).message || 'Could not update game', true);
  }
}

async function deleteGame(id: string, title: string): Promise<void> {
  if (!confirm(`Remove “${title}” from the app? Past play totals will stay in reports.`)) return;
  try {
    await adminApi(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (editingGameId === id) clearGameForm();
    notify('Game deleted');
    await refreshAdmin();
  } catch (e) {
    notify((e as Error).message || 'Could not delete game', true);
  }
}

function switchAdminTab(tab: AdminTab): void {
  activeTab = tab;
  renderActiveTab();
}

function previewMethodLogoUrl(url: string): void {
  const trimmed = url.trim();
  uploadedMethodLogoData = trimmed;
  const img = document.getElementById('newMethodLogoPreview') as HTMLImageElement | null;
  const ph = document.getElementById('newMethodLogoPlaceholder');
  if (img && ph) {
    if (trimmed) {
      img.src = trimmed;
      img.classList.remove('hidden');
      ph.classList.add('hidden');
    } else {
      img.src = '';
      img.classList.add('hidden');
      ph.classList.remove('hidden');
    }
  }
}

function handleMethodLogoUpload(input: HTMLInputElement): void {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    uploadedMethodLogoData = String(reader.result || '');
    const urlInp = document.getElementById('newMethodLogoUrl') as HTMLInputElement | null;
    if (urlInp) urlInp.value = uploadedMethodLogoData;
    previewMethodLogoUrl(uploadedMethodLogoData);
    notify('Logo image ready');
  };
  reader.readAsDataURL(file);
}

async function persistDraftSettings(msg: string): Promise<void> {
  const minInput = document.getElementById('setMinCoins') as HTMLInputElement | null;
  const rateInput = document.getElementById('setCoinRate') as HTMLInputElement | null;
  if (minInput && minInput.value) draftSettings.minWithdrawCoins = Math.max(100, +minInput.value);
  if (rateInput && rateInput.value) draftSettings.coinPerNpr = Math.max(1, +rateInput.value);

  await adminApi('/api/admin/settings', {
    method: 'POST',
    body: JSON.stringify(draftSettings)
  });
  if (data) {
    data.settings = {
      ...data.settings,
      methods: draftSettings.methods.map((m) => ({ ...m })),
      minWithdrawCoins: draftSettings.minWithdrawCoins,
      coinPerNpr: draftSettings.coinPerNpr,
      countries: draftSettings.countries.map((c) => ({ ...c }))
    };
  }
  notify(msg);
  renderActiveTab();
}

async function addCustomMethod(): Promise<void> {
  const name = (document.getElementById('newMethodName') as HTMLInputElement | null)?.value.trim() || '';
  const logo =
    (document.getElementById('newMethodLogoUrl') as HTMLInputElement | null)?.value.trim() ||
    uploadedMethodLogoData ||
    '';
  const country = (document.getElementById('newMethodCountry') as HTMLSelectElement | null)?.value || 'All';
  const placeholder =
    (document.getElementById('newMethodPlaceholder') as HTMLInputElement | null)?.value.trim() ||
    `Enter ${name} ID / Account`;

  if (!name) {
    notify('Please enter Method Name (e.g. eSewa, UPI)', true);
    return;
  }

  draftSettings.methods.push({
    id: 'm_' + Date.now(),
    name,
    logo,
    placeholder,
    country,
    enabled: true
  });
  uploadedMethodLogoData = '';
  await persistDraftSettings(`Added method: ${name}`);
}

async function toggleCustomMethod(id: string): Promise<void> {
  const item = draftSettings.methods.find((m) => m.id === id);
  if (item) {
    item.enabled = item.enabled === false ? true : false;
    await persistDraftSettings(`${item.name} ${item.enabled ? ' enabled' : ' disabled'}`);
  }
}

async function removeCustomMethod(id: string): Promise<void> {
  draftSettings.methods = draftSettings.methods.filter((m) => m.id !== id);
  await persistDraftSettings('Method removed');
}

function filterCountryApiSearch(q: string): void {
  countryApiQuery = q;
  const listEl = document.getElementById('countryApiResultsList');
  if (listEl) {
    listEl.replaceChildren(...renderCountryApiListNodes(q));
  }
}

async function addCountryFromApi(code: string): Promise<void> {
  const found = apiCountries.find((c) => c.code === code);
  if (!found) return;
  if (!draftSettings.countries.some((c) => c.code === found.code)) {
    draftSettings.countries.push({ ...found });
  }
  await persistDraftSettings(`Added country: ${found.name}`);
}

async function removeAllowedCountry(code: string): Promise<void> {
  draftSettings.countries = draftSettings.countries.filter((c) => c.code !== code);
  await persistDraftSettings('Country removed');
}

async function saveWithdrawSettings(): Promise<void> {
  await persistDraftSettings('Minimum withdrawal & rate saved');
}

function setTaskCategoryFilter(cat: typeof taskCategoryFilter): void {
  taskCategoryFilter = cat;
  renderActiveTab();
}

function quickAdjustCoins(userId: string, currentCoins: number): void {
  const input = prompt(
    `Adjust coins for User #${userId} (Current: ${currentCoins.toLocaleString()} Coins):\n\nEnter amount to add (e.g. 500) or subtract (e.g. -200):`,
    '500'
  );
  if (!input) return;
  const delta = parseInt(input, 10);
  if (isNaN(delta) || delta === 0) return;
  adminApi(`/api/admin/user/${userId}/coins`, {
    method: 'POST',
    body: JSON.stringify({ delta })
  })
    .then(() => {
      notify(`Updated balance for #${userId} (${delta > 0 ? '+' : ''}${delta.toLocaleString()} Coins)`);
      refreshAdmin();
    })
    .catch((e) => notify(e.message, true));
}

function toggleQualificationReq(): void {
  draftSettings.requireQualification = !draftSettings.requireQualification;
  persistDraftSettings(`User qualification requirement ${draftSettings.requireQualification ? 'Enabled' : 'Disabled'}`);
}

function filterAdminUsers(q: string): void {
  userSearchQuery = q;
  renderActiveTab();
}

function openUserForm(userId?: string): void {
  editingUserId = userId || null;
  showUserEditor = true;
  renderActiveTab();
}

function closeUserForm(): void {
  editingUserId = null;
  showUserEditor = false;
  renderActiveTab();
}

async function saveUserCrud(): Promise<void> {
  if (isSavingUser) return;
  const id = (document.getElementById('crudUserId') as HTMLInputElement | null)?.value.trim() || '';
  const name = (document.getElementById('crudUserName') as HTMLInputElement | null)?.value.trim() || '';
  const username = (document.getElementById('crudUserHandle') as HTMLInputElement | null)?.value.trim() || '';
  const coins = Number((document.getElementById('crudUserCoins') as HTMLInputElement | null)?.value || 0);
  const email = (document.getElementById('crudUserEmail') as HTMLInputElement | null)?.value.trim() || '';
  const adsDone = Number((document.getElementById('crudUserAds') as HTMLInputElement | null)?.value || 0);
  const dailyDone = Number((document.getElementById('crudUserDaily') as HTMLInputElement | null)?.value || 0);
  const verified = Boolean((document.getElementById('crudUserVerified') as HTMLInputElement | null)?.checked);

  if (!editingUserId && !id) {
    notify('Enter a User ID', true);
    return;
  }
  if (!name) {
    notify('Enter the user name', true);
    return;
  }
  if (![coins, adsDone, dailyDone].every((value) => Number.isFinite(value) && value >= 0)) {
    notify('Balance and activity values must be zero or more', true);
    return;
  }

  isSavingUser = true;
  renderActiveTab();
  try {
    if (editingUserId) {
      await adminApi('/api/admin/user/' + encodeURIComponent(editingUserId), {
        method: 'PUT',
        body: JSON.stringify({ name, username, coins, email, adsDone, dailyDone, verified })
      });
      notify('User updated');
    } else {
      await adminApi('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ id, name, username, coins, email, verified })
      });
      notify('User created');
    }
    showUserEditor = false;
    editingUserId = null;
    await refreshAdmin();
  } catch (e) {
    notify((e as Error).message || 'Could not save user', true);
  } finally {
    isSavingUser = false;
    if (showUserEditor) renderActiveTab();
  }
}
async function toggleUserVerify(userId: string): Promise<void> {
  await adminApi(`/api/admin/user/${userId}/verify`, { method: 'POST' });
  notify(`Updated verification for #${userId}`);
  await refreshAdmin();
}

async function deleteUser(userId: string): Promise<void> {
  if (!confirm(`Delete user #${userId}?`)) return;
  await adminApi(`/api/admin/user/${userId}`, { method: 'DELETE' });
  notify(`Deleted #${userId}`);
  await refreshAdmin();
}

function editTaskForm(taskId: string): void {
  editingTaskId = taskId;
  renderActiveTab();
}

function resetTaskForm(): void {
  editingTaskId = null;
  renderActiveTab();
}

function clearTaskFormInputs(): void {
  editingTaskId = null;
  renderActiveTab();
  const titleEl = document.getElementById('newTaskTitle') as HTMLInputElement | null;
  const urlEl = document.getElementById('newTaskUrl') as HTMLInputElement | null;
  const targetEl = document.getElementById('newTaskTarget') as HTMLInputElement | null;
  const rewardEl = document.getElementById('newTaskReward') as HTMLInputElement | null;
  const waitEl = document.getElementById('newTaskWait') as HTMLInputElement | null;
  const resetEl = document.getElementById('newTaskResetHours') as HTMLSelectElement | null;
  if (titleEl) titleEl.value = '';
  if (urlEl) urlEl.value = '';
  if (targetEl) targetEl.value = '';
  if (rewardEl) rewardEl.value = '200';
  if (waitEl) waitEl.value = '15';
  if (resetEl) resetEl.value = '0';
}

async function saveTaskCrud(): Promise<void> {
  const title = (document.getElementById('newTaskTitle') as HTMLInputElement | null)?.value.trim() || '';
  const type = (document.getElementById('newTaskType') as HTMLSelectElement | null)?.value || 'social_visit';
  const reward = +((document.getElementById('newTaskReward') as HTMLInputElement | null)?.value || 200);
  const waitSeconds = +((document.getElementById('newTaskWait') as HTMLInputElement | null)?.value || 15);
  const resetHours = +((document.getElementById('newTaskResetHours') as HTMLSelectElement | null)?.value || 0);
  const url = (document.getElementById('newTaskUrl') as HTMLInputElement | null)?.value.trim() || '';
  const target = (document.getElementById('newTaskTarget') as HTMLInputElement | null)?.value.trim() || url;

  if (!title || !url) {
    notify('Enter Title and URL', true);
    return;
  }

  if (editingTaskId) {
    await adminApi(`/api/admin/tasks/${editingTaskId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, type, reward, waitSeconds, resetHours, url, target })
    });
    notify('Task updated');
    editingTaskId = null;
  } else {
    await adminApi('/api/admin/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, type, reward, waitSeconds, resetHours, url, target })
    });
    notify('Task created');
  }
  await refreshAdmin();
}

async function resetSingleTaskClaims(id: string, title: string): Promise<void> {
  await adminApi(`/api/admin/tasks/${id}/reset`, { method: 'POST', body: '{}' });
  notify(`Reset completions for "${title}" — users can complete it again!`);
  await refreshAdmin();
}

async function resetAllTasksClaims(): Promise<void> {
  if (!confirm('Reset completions for ALL tasks? All users will be able to complete every task again.')) return;
  await adminApi('/api/admin/tasks/reset-all', { method: 'POST', body: '{}' });
  notify('All tasks reset! Users can complete all tasks again.');
  await refreshAdmin();
}

async function deleteTask(id: string): Promise<void> {
  await adminApi(`/api/admin/tasks/${id}`, { method: 'DELETE' });
  if (editingTaskId === id) editingTaskId = null;
  notify('Task deleted');
  await refreshAdmin();
}

function openWithdrawForm(withdrawId: string): void {
  editingWithdrawId = withdrawId;
  showWithdrawEditor = true;
  renderActiveTab();
}
function closeWithdrawForm(): void {
  editingWithdrawId = null;
  showWithdrawEditor = false;
  renderActiveTab();
}

async function saveWithdrawCrud(): Promise<void> {
  if (!editingWithdrawId) return;
  const method = (document.getElementById('crudWMethod') as HTMLSelectElement | null)?.value || 'Custom';
  const account = (document.getElementById('crudWAccount') as HTMLInputElement | null)?.value.trim() || '';
  const coins = Number((document.getElementById('crudWCoins') as HTMLInputElement | null)?.value || 0);
  const status = (document.getElementById('crudWStatus') as HTMLSelectElement | null)?.value || 'pending';
  if (!account || !Number.isFinite(coins) || coins <= 0) {
    notify('Enter a valid account and payout amount', true);
    return;
  }
  try {
    await adminApi('/api/admin/withdraw/' + encodeURIComponent(editingWithdrawId), {
      method: 'PUT',
      body: JSON.stringify({ method, account, coins, status })
    });
    notify('Payout updated');
    showWithdrawEditor = false;
    editingWithdrawId = null;
    await refreshAdmin();
  } catch (e) {
    notify((e as Error).message || 'Could not update payout', true);
  }
}
async function decideWithdraw(id: string, action: 'paid' | 'reject'): Promise<void> {
  await adminApi(`/api/admin/withdraw/${id}`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });
  notify(action === 'paid' ? `Approved ${id}` : `Rejected ${id}`);
  await refreshAdmin();
}

async function deleteWithdrawCrud(id: string): Promise<void> {
  if (!confirm(`Delete transaction ${id}?`)) return;
  await adminApi(`/api/admin/withdraw/${id}`, { method: 'DELETE' });
  notify(`Deleted ${id}`);
  await refreshAdmin();
}

function setTxFilter(status: 'all' | 'pending' | 'paid' | 'rejected'): void {
  txStatusFilter = status;
  renderActiveTab();
}

function filterTxSearch(q: string): void {
  txSearchQuery = q;
  renderActiveTab();
}

function renderAdminNotifHistory(): void {
  const listEl = document.getElementById('adminNotifHistoryList');
  if (!listEl) return;
  const list = data?.notifications || [];
  if (!list.length) {
    listEl.replaceChildren(
      <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
        No notifications in history yet
      </div>
    );
    return;
  }
  listEl.replaceChildren(
    ...list.map((n) => (
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-900 truncate">{n.title}</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
              {n.userId === 'all' ? 'All Users' : `User #${n.userId}`}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
              {n.type}
            </span>
            {n.coins ? (
              <span className="text-[10px] font-extrabold text-[#16A34A]">+{n.coins} Coins</span>
            ) : null}
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 truncate">{n.message}</div>
        </div>
        <button
          type="button"
          onClick={() => deleteAdminNotif(n.id)}
          className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold shrink-0"
        >
          Delete
        </button>
      </div>
    ))
  );
}

function openAdminNotifModal(targetUserId = 'all'): void {
  const modal = document.getElementById('adminNotifModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  const targetInput = document.getElementById('adminNotifTarget') as HTMLInputElement | null;
  if (targetInput) targetInput.value = targetUserId;
  renderAdminNotifHistory();
}

function closeAdminNotifModal(): void {
  const modal = document.getElementById('adminNotifModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function sendAdminNotification(): Promise<void> {
  const userId = (document.getElementById('adminNotifTarget') as HTMLInputElement | null)?.value.trim() || 'all';
  const title = (document.getElementById('adminNotifTitle') as HTMLInputElement | null)?.value.trim() || '';
  const message = (document.getElementById('adminNotifMessage') as HTMLTextAreaElement | null)?.value.trim() || '';
  const coins = Math.max(
    0,
    Math.floor(+((document.getElementById('adminNotifCoins') as HTMLInputElement | null)?.value || 0))
  );

  if (!title || !message) {
    notify('Please enter both Title and Message', true);
    return;
  }

  await adminApi('/api/admin/notifications', {
    method: 'POST',
    body: JSON.stringify({ userId, title, message, coins })
  });

  const titleEl = document.getElementById('adminNotifTitle') as HTMLInputElement | null;
  const msgEl = document.getElementById('adminNotifMessage') as HTMLTextAreaElement | null;
  const coinsEl = document.getElementById('adminNotifCoins') as HTMLInputElement | null;
  if (titleEl) titleEl.value = '';
  if (msgEl) msgEl.value = '';
  if (coinsEl) coinsEl.value = '0';

  notify(userId === 'all' ? 'Notification broadcasted to all users!' : `Notification sent to #${userId}!`);
  await refreshAdmin();
  renderAdminNotifHistory();
}

async function deleteAdminNotif(id: string): Promise<void> {
  await adminApi(`/api/admin/notifications/${id}`, { method: 'DELETE' });
  notify('Notification removed');
  await refreshAdmin();
  renderAdminNotifHistory();
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('admin-root');
  if (root) {
    root.replaceChildren(<AdminApp />);
  }
  loadCountriesFromApi();
  refreshAdmin();
});
