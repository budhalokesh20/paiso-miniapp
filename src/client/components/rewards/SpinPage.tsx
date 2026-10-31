import { h } from '../../jsx';
import { SubpageTopBar } from '../settings/SettingsParts';

export function SpinPage() {
  return <section id="sub-spin" className="settings-subpage reward-page" aria-labelledby="spinPageTitle">
    <SubpageTopBar title="Daily Spin" backLabel="Back" onBack={() => window.closeRewards()} />
    <div className="screen-content reward-dialog-content reward-page-content">
      <h2 id="spinPageTitle">Your daily chance to earn</h2>
      <p>Your reward is chosen securely when you spin.</p>
      <div className="reward-wheel" aria-hidden="true">P</div>
      <p id="spinRewardOptions" />
      <button id="spinClaimButton" type="button" className="primary-btn" onClick={() => window.claimSpin()}>Spin now</button>
      <p id="spinRewardResult" role="status" aria-live="polite" />
    </div>
  </section>;
}
