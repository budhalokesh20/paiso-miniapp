import { h } from './jsx';

type AdminTab = 'dashboard' | 'users' | 'withdrawal' | 'tasks' | 'transactions';

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
  type: 'telegram_join' | 'social_visit';
  target: string;
  url: string;
  waitSeconds?: number;
  resetHours?: number;
  lastResetAt?: string;
  claimsCount?: number;
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

interface AdminStatsResponse {
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
  settings: AdminWithdrawSettings;
}

let adminKey = sessionStorage.getItem('paiso_admin_key') || '8990374489';
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
  if (r.status === 403) {
    throw new Error('Invalid Admin Key');
  }
  return r.json() as Promise<T>;
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Users</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{s.totalUsers}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Verified Users</div>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">{s.verifiedUsers}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Pending Withdraw</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{s.pendingWithdrawals}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Pending NPR</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">Rs {s.pendingNpr}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Paid</div>
          <div className="text-2xl font-extrabold text-[#16A34A] mt-1">Rs {s.paidNpr}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Active Tasks</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{s.tasks.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
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

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Withdrawal Configuration</h3>
            <button
              type="button"
              onClick={() => {
                switchAdminTab('withdrawal');
                toggleWithdrawSettingsModal(true);
              }}
              className="text-xs font-bold text-[#16A34A] hover:underline"
            >
              Configure
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-extrabold text-slate-900">User Management ({filtered.length})</h2>
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={userSearchQuery}
            onInput={(e: Event) => filterAdminUsers((e.target as HTMLInputElement).value)}
            placeholder="Search user, ID, email..."
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

      {showUserEditor ? (
        <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-700">
              {editUser ? `Edit User #${editUser.id}` : 'Create New User'}
            </h3>
            <button
              type="button"
              onClick={() => closeUserForm()}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">User ID</label>
              <input
                id="crudUserId"
                type="text"
                value={editUser ? editUser.id : ''}
                disabled={Boolean(editUser)}
                placeholder="e.g. 9812345"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Full Name</label>
              <input
                id="crudUserName"
                type="text"
                value={editUser ? editUser.name : ''}
                placeholder="Full Name"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Username</label>
              <input
                id="crudUserHandle"
                type="text"
                value={editUser ? editUser.username : ''}
                placeholder="username"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Coins Balance</label>
              <input
                id="crudUserCoins"
                type="number"
                value={editUser ? editUser.coins : 0}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Email</label>
              <input
                id="crudUserEmail"
                type="email"
                value={editUser ? editUser.email : ''}
                placeholder="user@mail.com"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 font-semibold mb-1">Ads / Check-ins</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  id="crudUserAds"
                  type="number"
                  value={editUser ? editUser.adsDone : 0}
                  title="Ads Done"
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
                <input
                  id="crudUserDaily"
                  type="number"
                  value={editUser ? editUser.dailyDone : 0}
                  title="Daily Check-ins"
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 cursor-pointer">
                <input
                  id="crudUserVerified"
                  type="checkbox"
                  checked={Boolean(editUser?.verified)}
                  className="rounded"
                />
                <span>Blue Tick Verified</span>
              </label>
              <button
                type="button"
                onClick={() => saveUserCrud()}
                className="w-full py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-lg"
              >
                {editUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Blue Tick</th>
              <th className="py-2.5 px-3">Qualification</th>
              <th className="py-2.5 px-3">Coins</th>
              <th className="py-2.5 px-3">Referrals</th>
              <th className="py-2.5 px-3 text-right">CRUD Actions</th>
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
      {/* Top Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Active Methods ({activeMethods.length})</div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {activeMethods.length ? (
                activeMethods.map((m) => (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                    {m.logo ? (
                      <img src={m.logo} className="w-4 h-4 rounded object-contain bg-white" />
                    ) : (
                      <span className="w-4 h-4 rounded bg-slate-300 text-[10px] flex items-center justify-center font-extrabold">
                        {m.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>{m.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-amber-600">No methods added</span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Minimum Payout</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">
              {s.settings.minWithdrawCoins.toLocaleString()} Coins{' '}
              <span className="text-xs font-semibold text-slate-500">
                (NPR {(s.settings.minWithdrawCoins / (s.settings.coinPerNpr || 100)).toFixed(0)})
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">
              Allowed Countries ({activeCountries.length})
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {activeCountries.length ? (
                activeCountries.map((c) => (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    {c.flag ? <img src={c.flag} className="w-4 h-3 object-cover rounded-sm" /> : null}
                    <span>{c.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-slate-400">All Countries</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openWithdrawForm()}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            + Manual Withdrawal
          </button>

          <button
            type="button"
            onClick={() => toggleWithdrawSettingsModal()}
            className={`px-4 py-2 rounded-lg border text-xs font-extrabold flex items-center gap-2 transition ${
              showWithdrawSettings
                ? 'bg-[#16A34A] border-[#16A34A] text-white'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-[#16A34A] hover:text-white'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{showWithdrawSettings ? 'Close Settings' : 'Withdrawal Settings'}</span>
          </button>
        </div>
      </div>

      {/* Clean Withdrawal Settings Panel */}
      {showWithdrawSettings ? (
        <div className="bg-white border-2 border-[#16A34A] rounded-xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Withdrawal Configuration</h3>
              <p className="text-xs text-slate-500">
                Manage custom payout methods (logo &amp; name), minimum withdrawal limit, and allowed countries. Changes save automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleWithdrawSettingsModal(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              ✕ Done
            </button>
          </div>

          {/* Step 1: Minimum Withdrawal & Conversion Rate */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-extrabold uppercase text-slate-800 mb-3">
              1. Minimum Withdrawal &amp; Conversion Rate
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Minimum Withdraw (Coins)
                </label>
                <input
                  id="setMinCoins"
                  type="number"
                  value={draftSettings.minWithdrawCoins}
                  className="w-full px-3 py-2 font-extrabold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Coins per NPR 1
                </label>
                <input
                  id="setCoinRate"
                  type="number"
                  value={draftSettings.coinPerNpr}
                  className="w-full px-3 py-2 font-extrabold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <button
                type="button"
                onClick={() => saveWithdrawSettings()}
                className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-lg transition"
              >
                Save Limit &amp; Rate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Step 2: Custom Payout Methods (Custom Logo & Name) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-slate-800">
                    2. Custom Payout Methods ({draftSettings.methods.length})
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">Custom Logo &amp; Name</span>
                </div>

                {/* Existing Custom Methods List */}
                <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                  {draftSettings.methods.length ? (
                    draftSettings.methods.map((m) => (
                      <div
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-white ${
                          m.enabled !== false ? 'border-slate-200' : 'border-slate-200 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {m.logo ? (
                            <img
                              src={m.logo}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm shrink-0">
                              {m.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">{m.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {m.country && m.country !== 'All' ? m.country : 'All Countries'} •{' '}
                              {m.placeholder || `Enter ${m.name} ID`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleCustomMethod(m.id)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              m.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {m.enabled !== false ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCustomMethod(m.id)}
                            className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                      No withdrawal methods added yet. Add one below!
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Add Custom Method Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 text-xs">
                <div className="font-extrabold text-slate-800">Add New Payout Method</div>

                <div className="flex items-center gap-3">
                  {/* Clickable Logo Preview / Upload Box */}
                  <label
                    title="Click to upload logo image"
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#16A34A] bg-slate-50 flex flex-col items-center justify-center cursor-pointer shrink-0 overflow-hidden"
                  >
                    <img
                      id="newMethodLogoPreview"
                      src={uploadedMethodLogoData || ''}
                      className={`w-full h-full object-contain p-1 ${uploadedMethodLogoData ? '' : 'hidden'}`}
                    />
                    <span
                      id="newMethodLogoPlaceholder"
                      className={`text-[10px] font-bold text-slate-400 text-center leading-tight px-1 ${
                        uploadedMethodLogoData ? 'hidden' : ''
                      }`}
                    >
                      Upload Logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: Event) => handleMethodLogoUpload(e.target as HTMLInputElement)}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 space-y-2">
                    <input
                      id="newMethodName"
                      type="text"
                      placeholder="Method Name (e.g. eSewa, Khalti, UPI, PayPal)"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                    />
                    <input
                      id="newMethodLogoUrl"
                      type="text"
                      placeholder="Or paste Logo Image URL here..."
                      onInput={(e: Event) => previewMethodLogoUrl((e.target as HTMLInputElement).value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="newMethodCountry"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="All">All Allowed Countries</option>
                    {draftSettings.countries.map((c) => (
                      <option value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    id="newMethodPlaceholder"
                    type="text"
                    placeholder="Input Hint (e.g. Enter Wallet ID)"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => addCustomMethod()}
                  className="w-full py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-lg transition"
                >
                  + Add &amp; Save Method
                </button>
              </div>
            </div>

            {/* Step 3: Allowed Countries (REST Countries API) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase text-slate-800">
                    3. Allowed Countries ({draftSettings.countries.length})
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">Live Country API</span>
                </div>

                {/* Selected Countries Pills */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 min-h-[54px] flex flex-wrap items-center gap-2">
                  {draftSettings.countries.length ? (
                    draftSettings.countries.map((c) => (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-[#16A34A] text-emerald-950 text-xs font-bold">
                        {c.flag ? <img src={c.flag} className="w-4 h-3 object-cover rounded-sm" /> : null}
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAllowedCountry(c.code)}
                          className="ml-1 text-red-500 hover:text-red-700 font-extrabold"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      No country restriction (or select allowed countries below)
                    </span>
                  )}
                </div>

                {/* Search Input (Updates list in-place without losing focus) */}
                <div className="mb-2">
                  <input
                    id="countrySearchInput"
                    type="text"
                    value={countryApiQuery}
                    onInput={(e: Event) => filterCountryApiSearch((e.target as HTMLInputElement).value)}
                    placeholder="Type country name to search (e.g. Nepal, India, Bangladesh, USA)..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-semibold focus:outline-none focus:border-[#16A34A]"
                  />
                </div>

                {/* API Country Results Grid */}
                <div
                  id="countryApiResultsList"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1"
                >
                  {renderCountryApiListNodes(countryApiQuery)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Manual Withdrawal Editor */}
      {showWithdrawEditor ? (
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-700">
              {editW ? `Edit Withdrawal ${editW.id}` : 'Create Manual Withdrawal'}
            </h3>
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
                disabled={Boolean(editW)}
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
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-base font-extrabold text-slate-900 mb-3">
          Pending Withdrawal Requests ({pending.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
  const repeatableCount = s.tasks.filter((t) => (t.resetHours || 0) > 0).length;
  const totalActiveClaims = s.tasks.reduce((sum, t) => sum + (t.claimsCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Task Summary & Global Reset Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Total Tasks</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{s.tasks.length} Tasks</div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Categories</div>
            <div className="flex items-center gap-2 mt-1 text-xs font-bold">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                Telegram: {tgTasksCount}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Social/Web: {socialTasksCount}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Auto-Resetting</div>
            <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
              {repeatableCount} Repeatable
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Active Completions</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5">{totalActiveClaims} Claims</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => resetAllTasksClaims()}
            className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white border border-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Reset All Tasks Claims</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Create / Edit Task Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 h-fit">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {editTask ? `Edit Task` : 'Create New Task'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {editTask ? `Editing ID: ${editTask.id}` : 'Add a one-time or repeatable task'}
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
              <label className="block text-[11px] text-slate-600 font-bold mb-1">Task Title</label>
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
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Task Type</label>
                <select
                  id="newTaskType"
                  value={editTask?.type || 'social_visit'}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                >
                  <option value="social_visit">Social / Web Visit</option>
                  <option value="telegram_join">Telegram Join</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Reset Frequency</label>
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
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Reward (Coins)</label>
                <input
                  id="newTaskReward"
                  type="number"
                  value={editTask ? editTask.reward : 200}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-[#16A34A] focus:outline-none focus:border-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-bold mb-1">Verify Timer (Sec)</label>
                <input
                  id="newTaskWait"
                  type="number"
                  value={editTask ? editTask.waitSeconds || 15 : 15}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:outline-none focus:border-[#16A34A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-bold mb-1">Task Destination URL</label>
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
                Telegram @Channel (For Telegram Join)
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
              className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold py-2.5 rounded-lg transition"
            >
              {editTask ? 'Save Task Changes' : '+ Create Task'}
            </button>
          </div>
        </div>

        {/* Right: Clean Tasks List Table with Per-Task Reset */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Active Tasks ({s.tasks.length})</h2>
              <p className="text-[11px] text-slate-500">
                Click "Reset" on any task to clear user completions so everyone can do it again.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
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
                {s.tasks.length ? (
                  s.tasks.map((t) => {
                    const isTg = t.type === 'telegram_join';
                    const isRepeatable = (t.resetHours || 0) > 0;
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
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isTg ? 'bg-sky-50 text-sky-700' : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {isTg ? 'Telegram' : `Social (${t.waitSeconds || 15}s)`}
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

function TransactionsTabView(props: { s: AdminStatsResponse }) {
  const { s } = props;
  const q = txSearchQuery.trim().toLowerCase();
  const list = s.recentWithdrawals.filter((w) => {
    if (txStatusFilter !== 'all' && w.status !== txStatusFilter) return false;
    if (!q) return true;
    return (
      w.id.toLowerCase().includes(q) ||
      (w.username || '').toLowerCase().includes(q) ||
      w.userId.toLowerCase().includes(q) ||
      w.account.toLowerCase().includes(q) ||
      w.method.toLowerCase().includes(q)
    );
  });

  const editW = editingWithdrawId ? s.recentWithdrawals.find((w) => w.id === editingWithdrawId) : null;
  const methodOptions = draftSettings.methods.length
    ? draftSettings.methods.map((m) => m.name)
    : ['Custom'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-extrabold text-slate-900">Transactions ({list.length})</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'pending', 'paid', 'rejected'] as const).map((st) => (
            <button
              type="button"
              onClick={() => setTxFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                txStatusFilter === st ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
          <input
            type="text"
            value={txSearchQuery}
            onInput={(e: Event) => filterTxSearch((e.target as HTMLInputElement).value)}
            placeholder="Search TX, user, account..."
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          />
          <button
            type="button"
            onClick={() => openWithdrawForm()}
            className="px-3 py-1.5 bg-[#16A34A] text-white text-xs font-bold rounded-lg"
          >
            + Add TX
          </button>
        </div>
      </div>

      {showWithdrawEditor ? (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-700">
              {editW ? `Edit Transaction ${editW.id}` : 'Create Transaction'}
            </h3>
            <button
              type="button"
              onClick={() => closeWithdrawForm()}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <input
              id="crudWUserId"
              type="text"
              value={editW ? editW.userId : ''}
              disabled={Boolean(editW)}
              placeholder="User ID"
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
            <select
              id="crudWMethod"
              value={editW?.method || methodOptions[0]}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
            >
              {methodOptions.map((m) => (
                <option value={m} selected={editW?.method === m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              id="crudWAccount"
              type="text"
              value={editW ? editW.account : ''}
              placeholder="Account ID"
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
            />
            <input
              id="crudWCoins"
              type="number"
              value={editW ? editW.coins : 10000}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
            />
            <div className="flex gap-2">
              <select
                id="crudWStatus"
                value={editW?.status || 'pending'}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="rejected">rejected</option>
              </select>
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[11px]">
              <th className="py-2.5 px-3">TX ID</th>
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Method / Account</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">CRUD Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length ? (
              list.map((w) => (
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{w.id}</div>
                    <div className="text-[11px] text-slate-400">{new Date(w.at).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-3">
                    @{w.username || w.userId} <span className="text-slate-400">(#{w.userId})</span>
                  </td>
                  <td className="py-3 px-3">
                    <b>{w.method}</b>: <span className="font-mono">{w.account}</span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    {w.coins.toLocaleString()} (NPR {w.npr})
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        w.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : w.status === 'rejected'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openWithdrawForm(w.id)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[11px]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWithdrawCrud(w.id)}
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
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
      <div id="adminToast" className="hidden" />

      <header className="w-full bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center text-white font-extrabold text-sm">
              P
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">Paiso Admin</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refreshAdmin()}
              className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-md transition"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => adminLogout()}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="w-full px-6 flex items-center gap-8 overflow-x-auto border-t border-slate-100">
          <button
            type="button"
            data-admintab="dashboard"
            onClick={() => switchAdminTab('dashboard')}
            className="admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-[#16A34A] text-slate-900"
          >
            Dashboard
          </button>
          <button
            type="button"
            data-admintab="users"
            onClick={() => switchAdminTab('users')}
            className="admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900"
          >
            User Management
          </button>
          <button
            type="button"
            data-admintab="withdrawal"
            onClick={() => switchAdminTab('withdrawal')}
            className="admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900"
          >
            Withdrawal
          </button>
          <button
            type="button"
            data-admintab="tasks"
            onClick={() => switchAdminTab('tasks')}
            className="admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900"
          >
            Task Management
          </button>
          <button
            type="button"
            data-admintab="transactions"
            onClick={() => switchAdminTab('transactions')}
            className="admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 border-transparent text-slate-500 hover:text-slate-900"
          >
            Transaction
          </button>
        </div>
      </header>

      <div id="adminLoginSection" className="flex-1 flex items-center justify-center px-4 hidden">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 mb-1">Admin Login</h2>
          <p className="text-xs text-slate-500 mb-4">Enter your Admin ID to continue.</p>
          <input
            id="adminKeyInput"
            type="password"
            defaultValue={adminKey}
            placeholder="Admin ID"
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#16A34A] mb-3"
          />
          <button
            type="button"
            onClick={() => adminLogin()}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs uppercase py-2.5 rounded-lg transition"
          >
            Login
          </button>
          <div id="adminLoginErr" className="text-xs text-red-600 font-semibold mt-2" />
        </div>
      </div>

      <main id="adminMainWorkspace" className="flex-1 w-full overflow-y-auto px-6 py-5">
        <div id="adminTabView" className="w-full h-full" />
      </main>
    </div>
  );
}

function renderActiveTab(): void {
  const container = document.getElementById('adminTabView');
  if (!container || !data) return;

  document.querySelectorAll<HTMLButtonElement>('.admin-tab-btn').forEach((btn) => {
    const isAct = btn.dataset.admintab === activeTab;
    btn.className = `admin-tab-btn py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 ${
      isAct ? 'border-[#16A34A] text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'
    }`;
  });

  let viewNode: Node;
  if (activeTab === 'dashboard') viewNode = <DashboardTabView s={data} />;
  else if (activeTab === 'users') viewNode = <UsersTabView s={data} />;
  else if (activeTab === 'withdrawal') viewNode = <WithdrawalTabView s={data} />;
  else if (activeTab === 'tasks') viewNode = <TasksTabView s={data} />;
  else viewNode = <TransactionsTabView s={data} />;

  container.replaceChildren(viewNode);
}

async function refreshAdmin(): Promise<void> {
  try {
    if (!apiCountries.length) {
      loadCountriesFromApi();
    }
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

function switchAdminTab(tab: AdminTab): void {
  activeTab = tab;
  renderActiveTab();
}

function toggleWithdrawSettingsModal(show?: boolean): void {
  showWithdrawSettings = typeof show === 'boolean' ? show : !showWithdrawSettings;
  if (showWithdrawSettings && !apiCountries.length) {
    loadCountriesFromApi().then(() => renderActiveTab());
  }
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
  const id = (document.getElementById('crudUserId') as HTMLInputElement | null)?.value.trim() || '';
  const name = (document.getElementById('crudUserName') as HTMLInputElement | null)?.value.trim() || 'User';
  const username = (document.getElementById('crudUserHandle') as HTMLInputElement | null)?.value.trim() || '';
  const coins = +((document.getElementById('crudUserCoins') as HTMLInputElement | null)?.value || 0);
  const email = (document.getElementById('crudUserEmail') as HTMLInputElement | null)?.value.trim() || '';
  const adsDone = +((document.getElementById('crudUserAds') as HTMLInputElement | null)?.value || 0);
  const dailyDone = +((document.getElementById('crudUserDaily') as HTMLInputElement | null)?.value || 0);
  const verified = Boolean((document.getElementById('crudUserVerified') as HTMLInputElement | null)?.checked);

  if (editingUserId) {
    await adminApi(`/api/admin/user/${editingUserId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, username, coins, email, adsDone, dailyDone, verified })
    });
    notify(`Updated user #${editingUserId}`);
  } else {
    if (!id) {
      notify('Enter a User ID', true);
      return;
    }
    await adminApi('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ id, name, username, coins, email, verified })
    });
    notify(`Created user #${id}`);
  }
  showUserEditor = false;
  editingUserId = null;
  await refreshAdmin();
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

function openWithdrawForm(withdrawId?: string): void {
  editingWithdrawId = withdrawId || null;
  showWithdrawEditor = true;
  renderActiveTab();
}

function closeWithdrawForm(): void {
  editingWithdrawId = null;
  showWithdrawEditor = false;
  renderActiveTab();
}

async function saveWithdrawCrud(): Promise<void> {
  const userId = (document.getElementById('crudWUserId') as HTMLInputElement | null)?.value.trim() || '';
  const method = (document.getElementById('crudWMethod') as HTMLSelectElement | null)?.value || 'Custom';
  const account = (document.getElementById('crudWAccount') as HTMLInputElement | null)?.value.trim() || '';
  const coins = +((document.getElementById('crudWCoins') as HTMLInputElement | null)?.value || 10000);
  const status = (document.getElementById('crudWStatus') as HTMLSelectElement | null)?.value || 'pending';

  if (editingWithdrawId) {
    await adminApi(`/api/admin/withdraw/${editingWithdrawId}`, {
      method: 'PUT',
      body: JSON.stringify({ method, account, coins, status })
    });
    notify(`Updated ${editingWithdrawId}`);
  } else {
    if (!userId || !account) {
      notify('Enter User ID and Account', true);
      return;
    }
    await adminApi('/api/admin/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ userId, method, account, coins, status })
    });
    notify('Withdrawal created');
  }
  showWithdrawEditor = false;
  editingWithdrawId = null;
  await refreshAdmin();
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

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('admin-root');
  if (root) {
    root.replaceChildren(<AdminApp />);
  }
  loadCountriesFromApi();
  refreshAdmin();
});
