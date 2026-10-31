import { h } from '../../jsx';
export function TaskHero() {
  return <section className="tasks-hero" aria-labelledby="tasks-hero-title">
    <span className="task-reference-art tasks-hero-art" aria-hidden="true" />
    <div className="tasks-hero-copy"><h2 id="tasks-hero-title">Complete Tasks<br /><span>Earn More Coins</span></h2><p>Try new apps, play games<br />and explore offers</p></div>
  </section>;
}
