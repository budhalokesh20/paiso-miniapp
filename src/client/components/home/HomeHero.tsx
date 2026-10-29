import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';

export function HomeHero() {
  return (
    <section className="hero-banner home-hero" aria-labelledby="home-hero-title">
      <div className="hero-content">
        <h1 id="home-hero-title" className="hero-title">
          Play, Complete<br /><span className="cyan">Earn Rewards</span>
        </h1>
        <p className="hero-sub">Real Tasks. Real Payouts.</p>
        <button type="button" className="hero-cta" onClick={() => window.showTab('tasks', 'all')}>
          Explore Now <UiIcon name="arrow" size={14} />
        </button>
      </div>
    </section>
  );
}
