import { h } from '../jsx';
import { AppHeader } from './shared/AppHeader';
import { HomeHero } from './home/HomeHero';
import { QuickTasks } from './home/QuickTasks';
import { EarnShortcuts } from './home/EarnShortcuts';
import { FeaturedGames } from './home/FeaturedGames';

export function HomeView() {
  return (
    <section id="tab-home" className="app-screen home-screen active-screen" aria-label="Home">
      <AppHeader />
      <div className="screen-content home-layout">
        <HomeHero />
        <QuickTasks />
        <EarnShortcuts />
        <FeaturedGames />
      </div>
    </section>
  );
}
