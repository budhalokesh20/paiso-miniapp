import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function SubpageTopBar(props: { title: string }) {
  return (
    <div className="native-subpage-bar">
      <button type="button" className="native-back-btn" aria-label="Back to Settings" onClick={() => window.closeSettingPage()}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Settings</span>
      </button>
      <h3 className="native-subpage-title">{props.title}</h3>
      <div style={{ width: '72px' }} />
    </div>
  );
}


export function SettingRow({ icon, title, action, detail }: { icon: string; title: string; action: () => void; detail?: any }) {
  return <button type="button" className="settings-row" onClick={action}>
    <span className={'settings-row-icon setting-icon-' + icon}><UiIcon name={icon} size={22} /></span>
    <span className="settings-item-title">{title}</span>
    <span className="settings-row-right">{detail ? <span className="settings-detail">{detail}</span> : null}<UiIcon name="chevron" size={17} /></span>
  </button>;
}
export function SettingsGroup({ title, id, children }: { title: string; id: string; children?: any[] }) {
  return <section className="settings-group" aria-labelledby={id}><h2 className="settings-group-label" id={id}>{title}</h2><div className="settings-group-card">{children}</div></section>;
}
