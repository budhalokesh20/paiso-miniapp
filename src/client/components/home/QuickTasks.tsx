import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function QuickTasks({ variant = 'home' }: { variant?: 'home' | 'tasks' }) {
  const tasksVariant = variant === 'tasks';
  const titleId = tasksVariant ? 'tasks-quick-title' : 'quick-title';
  const items = [
    { title: 'Daily Check-in', copy: 'Claim daily reward', action: () => window.openDailyCheckin(), label: 'Check In', art: 'checkin' },
    { title: 'Daily Spin', copy: 'Spin & win coins!', action: () => window.openDailySpin(), label: 'Spin Now', art: 'spin' },
    { title: 'Daily Bonus', copy: 'Claim free rewards!', action: () => window.claimDaily(), label: 'Claim Now', art: 'bonus' },
  ];
  return <section className={tasksVariant ? "tasks-quick home-quick" : "home-quick"} aria-labelledby={titleId}>
    <div className="section-head"><h2 id={titleId}>Quick Tasks</h2>{!tasksVariant ? <button className="view-all-btn" onClick={() => window.openDailyCheckin()}>View All <UiIcon name="chevron" size={14} /></button> : null}</div>
    <div className="quick-grid">{items.map(item => <article className={'quick-card quick-' + item.art}>
      <span className={'reference-art quick-art art-' + item.art} aria-hidden="true" />
      <h3>{item.title}</h3><p>{item.copy}</p>
      <button type="button" id={item.art === 'bonus' ? (tasksVariant ? 'tasksBonusBtn' : 'quickBonusBtn') : undefined} data-daily-bonus={item.art === 'bonus' ? '' : undefined} onClick={item.action}>
        <span id={item.art === 'bonus' ? (tasksVariant ? 'tasksBonusText' : 'quickBonusText') : undefined} data-daily-label={item.art === 'bonus' ? '' : undefined}>{item.label}</span>{!tasksVariant ? <UiIcon name="arrow" size={14} /> : null}
      </button>
    </article>)}</div>
  </section>;
}
