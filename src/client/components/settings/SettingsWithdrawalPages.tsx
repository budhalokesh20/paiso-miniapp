import { h } from '../../jsx';
import { SubpageTopBar } from './SettingsParts';
function WithdrawSection() {
  return (
    <div className="withdraw-form bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      {/* 1. Simple Balance & Min Withdraw Row */}
      <div className="withdraw-balance flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">Available Balance</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="18" height="18" className="shrink-0">
              <use href="#icon-p-coin" />
            </svg>
            <span className="text-lg font-extrabold text-slate-900" id="wCoins">
              0
            </span>
            <span className="text-xs font-bold text-slate-500">
              (NPR <span id="npr">0.00</span>)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 block">Minimum</span>
          <b className="text-xs font-extrabold text-slate-800">
            <span id="minW">10,000</span> Coins
          </b>
        </div>
      </div>

      {/* 2. Payment Method */}
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2">Method</div>
        <div className="grid grid-cols-2 gap-2" id="wMethodsGrid" />
        <input type="hidden" id="wMethod" value="" />
      </div>

      {/* 3. Account ID */}
      <div>
        <label for="wAccount" className="text-xs font-bold text-slate-700 mb-1 block" id="wAccountLabel">
          Account ID
        </label>
        <input
          className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          id="wAccount"
          placeholder="Enter Account / Wallet ID"
        />
      </div>

      {/* 4. Amount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label for="wAmount" className="text-xs font-bold text-slate-700">Amount (Coins)</label>
          <button
            type="button"
            className="text-[11px] font-extrabold text-blue-600"
            onClick={() => window.setWithdrawAmount('MAX')}
          >
            MAX
          </button>
        </div>

        <input
          className="w-full px-3 py-2 text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
          id="wAmount"
          type="number"
          placeholder="Enter coins amount"
          onInput={() => window.updateWithdrawPreview()}
        />

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-slate-400 font-medium">Receive</span>
          <b className="text-slate-900 font-extrabold" id="wReceivePreview">
            NPR 0.00
          </b>
        </div>
      </div>

      {/* 5. Submit Button */}
      <button
        type="button"
        id="withdrawBtn"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg transition"
        onClick={() => window.withdraw()}
      >
        Withdraw
      </button>

      {/* Hidden state placeholders */}
      <div className="hidden">
        <span id="coins">0</span>
        <span id="total">0</span>
        <span id="wAllowedCountriesBar" />
        <span id="wqStatusBadge" />
        <span id="wqAds" />
        <span id="wqTasks" />
        <span id="wqDaily" />
      </div>
    </div>
  );
}

export function SettingsWithdrawalPages() { return <div className="settings-pages">
      {/* Slide-in Fullscreen Sub-Page 2: Withdrawal History */}
      <div id="sub-history" className="settings-subpage">
        <SubpageTopBar title="My Activity" />
        <div className="screen-content pb-6">
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100" id="wHistory" />
        </div>
      </div>

      {/* Slide-in Fullscreen Sub-Page 3: Simple Withdrawal + Withdrawal History */}
      <div id="sub-withdraw" className="settings-subpage">
        <SubpageTopBar title="Withdraw Rewards" />
        <div className="screen-content space-y-4 pb-6">
          <WithdrawSection />

          <div>
            <div className="text-xs font-extrabold text-slate-700 mb-2 px-0.5">Withdrawal History</div>
            <div
              className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100"
              id="wWithdrawHistory"
            />
          </div>
        </div>
      </div>


</div>; }
