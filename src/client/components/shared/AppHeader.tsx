import { h } from '../../jsx';
import { UiIcon } from './UiIcon';

export function AppHeader() {
  return <header className="app-header home-header">
    <button type="button" className="home-identity" onClick={() => window.showTab('wallet')} aria-label="Your profile">
      <span className="profile-avatar-art home-avatar" aria-hidden="true" />
      <span className="home-greeting" id="homeGreeting">Hey, there</span>
    </button>
    <div className="header-actions">
      <button type="button" id="homeNotificationsBtn" className="header-icon home-notifications" aria-label="Notifications" onClick={() => window.openNotificationsModal()}>
        <UiIcon name="bell" size={21} /><span id="homeUnreadBadge" className="home-unread-badge" style="display:none" aria-hidden="true" />
      </button>
      <button type="button" className="header-icon" aria-label="Withdraw rewards" onClick={() => { window.showTab('wallet'); window.openSettingPage('sub-withdraw'); }}><UiIcon name="crown" size={21} /></button>
    </div>
  </header>;
}
