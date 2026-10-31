import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function SettingsProfile() {
  return <button type="button" className="settings-profile" onClick={() => window.openSettingPage('sub-userid')} aria-label="View account details">
    <span className="settings-avatar-ring" id="settingsAvatarBox" aria-hidden="true" />
    <span className="profile-details"><span className="profile-name-line"><b id="settingsHeaderName">Paiso User</b><span id="settingsVerifiedTick" style="display:none"><svg width="18" height="18"><use href="#icon-blue-tick" /></svg></span></span><span id="settingsHeaderHandle">Your Telegram account</span><small>View account details</small></span>
    <UiIcon name="chevron" size={20} />
  </button>;
}
