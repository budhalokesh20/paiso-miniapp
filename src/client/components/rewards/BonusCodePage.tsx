import { h } from '../../jsx';
import { SubpageTopBar } from '../settings/SettingsParts';

export function BonusCodePage() {
  return <section id="sub-bonus" className="settings-subpage reward-page" aria-labelledby="bonusPageTitle">
    <SubpageTopBar title="Bonus Code" backLabel="Back" onBack={() => window.closeRewards()} />
    <div className="screen-content reward-dialog-content reward-page-content">
      <h2 id="bonusPageTitle">Redeem your bonus</h2>
      <p>Enter a code published by Paiso to add P points to your balance.</p>
      <form id="bonusCodePanel" onSubmit={(event: Event) => { event.preventDefault(); void window.redeemBonus(); }}>
        <label for="bonusCodeInput">Bonus code</label>
        <input id="bonusCodeInput" required maxLength={40} autoComplete="off" placeholder="Enter your code" />
        <button id="bonusRedeemButton" className="primary-btn" type="submit">Redeem points</button>
      </form>
      <p id="bonusRewardResult" role="status" aria-live="polite" />
    </div>
  </section>;
}
