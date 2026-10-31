import { h } from '../../jsx';
import { SettingsProfile } from './SettingsProfile';
import { SettingRow, SettingsGroup } from './SettingsParts';
export function SettingsMenu() {
  return <div className="screen-content settings-content" id="settings-menu-view">
    <div className="settings-heading"><h1>Settings</h1><p>Manage your account and rewards.</p></div>
    <SettingsProfile />
    <SettingsGroup title="Account & Rewards" id="settings-account-title">
      <SettingRow icon="shield" title="Profile & Verification" action={() => window.openSettingPage('sub-verify')} detail={<span id="verifyMenuBadge">Unverified</span>} />
      <SettingRow icon="wallet" title="Withdraw Rewards" action={() => window.openSettingPage('sub-withdraw')} />
      <SettingRow icon="tasks" title="My Activity" action={() => window.openSettingPage('sub-history')} />
      <SettingRow icon="bell" title="Notifications" action={() => window.openNotificationsModal()} detail={<span id="notifUnreadBadge" style="display:none">0</span>} />
    </SettingsGroup>
    <SettingsGroup title="Help & Support" id="settings-support-title">
      <SettingRow icon="help" title="Help Center" action={() => window.openSettingPage('sub-faq')} />
      <SettingRow icon="user" title="Contact Support" action={() => window.openSettingPage('sub-support')} />
      <SettingRow icon="shield" title="Privacy Information" action={() => window.openSettingPage('sub-privacy')} />
      <SettingRow icon="tasks" title="Terms of Service" action={() => window.openSettingPage('sub-terms')} />
    </SettingsGroup>
    <div hidden><span id="userIdText" /><span id="verifyMenuSub" /></div>
  </div>;
}
