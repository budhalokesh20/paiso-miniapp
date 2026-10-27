import { h } from '../jsx';

interface UserRecord {
  id: string;
  name: string;
  username: string;
  coins: number;
  email: string;
  adsDone: number;
  dailyDone: number;
  verified: boolean;
}

interface Props {
  user: UserRecord | null;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function AdminUserEditor(props: Props) {
  const user = props.user;
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button type="button" onClick={props.onBack} className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
        <span aria-hidden="true">←</span> Back to users
      </button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">User management</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{user ? 'Edit user' : 'Add user'}</h2>
          <p className="mt-1 text-sm text-slate-500">{user ? 'Update account details and status.' : 'Create an account and set its starting balance.'}</p>
        </div>
        {user ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">ID #{user.id}</span> : null}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-sm font-bold text-slate-900">Account details</h3>
        <p className="mt-1 text-xs text-slate-500">Keep the account information accurate and easy to identify.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">User ID
            <input id="crudUserId" type="text" value={user?.id || ''} disabled={Boolean(user)} placeholder="e.g. 9812345" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Full name
            <input id="crudUserName" type="text" value={user?.name || ''} placeholder="Full name" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Username
            <input id="crudUserHandle" type="text" value={user?.username || ''} placeholder="username" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-600">Email
            <input id="crudUserEmail" type="email" value={user?.email || ''} placeholder="name@example.com" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-sm font-bold text-slate-900">Balance and activity</h3>
        <p className="mt-1 text-xs text-slate-500">Adjust the balance and keep the account status up to date.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Coin balance
            <input id="crudUserCoins" type="number" min="0" value={user?.coins ?? 0} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-600">Ads completed
              <input id="crudUserAds" type="number" min="0" value={user?.adsDone ?? 0} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Daily check-ins
              <input id="crudUserDaily" type="number" min="0" value={user?.dailyDone ?? 0} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm" />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
            <input id="crudUserVerified" type="checkbox" checked={Boolean(user?.verified)} className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" />
            <span><span className="block text-sm font-semibold text-slate-800">Verified account</span><span className="mt-0.5 block text-xs text-slate-500">Show the verification badge on this user.</span></span>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <button type="button" onClick={props.onBack} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button id="userSaveButton" type="button" disabled={props.saving} onClick={props.onSave} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{props.saving ? 'Saving...' : user ? 'Save changes' : 'Create user'}</button>
      </div>
    </div>
  );
}