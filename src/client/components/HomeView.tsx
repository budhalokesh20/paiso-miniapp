import { h } from '../jsx';
import { HomeHero } from './home/HomeHero';
import { DailyCheckIn } from './home/DailyCheckIn';
import { EarnShortcuts } from './home/EarnShortcuts';
import { InviteBanner } from './home/InviteBanner';
import { FeaturedGames } from './home/FeaturedGames';

export function HomeView() {
  return (
    <section id="tab-home" className="app-screen home-screen active-screen" aria-label="Home">
      <div className="screen-content home-layout">
        <HomeHero />
        <DailyCheckIn />
        <EarnShortcuts />
        <InviteBanner />
        <FeaturedGames />
      </div>
    </section>
  );
}
