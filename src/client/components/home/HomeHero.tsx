import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';
export function HomeHero() {
  return <section className="hero-banner home-hero" aria-labelledby="home-hero-title">
    <span className="reference-art hero-art" aria-hidden="true" />
    <div className="hero-content">
      <h1 id="home-hero-title" className="hero-title">Play<br />Complete<br /><span className="cyan">Earn Coins</span></h1>
      <p className="hero-sub">Real Tasks. Real Rewards.</p>
      <button type="button" className="hero-cta" onClick={() => window.showTab('tasks', 'all')}>Explore Now <UiIcon name="arrow" size={14} /></button>
    </div>
    <span className="banner-dots" aria-hidden="true"><i /><i /><i /></span>
  </section>;
}
