import { h } from '../jsx';
import { SettingsMenu } from './settings/SettingsMenu';
import { SettingsAccountPages } from './settings/SettingsAccountPages';
import { SettingsWithdrawalPages } from './settings/SettingsWithdrawalPages';
import { SettingsHelpPages } from './settings/SettingsHelpPages';

export function SettingsView() {
  return <section id="tab-wallet" className="app-screen settings-screen" aria-label="Settings">
    <SettingsMenu />
  </section>;
}

// Keep full-page details outside the scrolling tab and its transformed ancestors.
export function SettingsOverlays({ children }: { children?: any[] }) {
  return <div id="settingsLayer" className="settings-screen settings-overlay-layer" onKeyDown={(event: KeyboardEvent) => {
    if (event.key === 'Escape') window.closeSettingPage();
  }}>
    <SettingsAccountPages />
    <SettingsWithdrawalPages />
    <SettingsHelpPages />
    {children}
  </div>;
}
