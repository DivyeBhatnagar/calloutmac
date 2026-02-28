import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { WhySection } from "@/components/WhySection";
import { FeaturedGames } from "@/components/FeaturedGames";
import { GamingTiles } from "@/components/GamingTiles";
import { HowItWorks } from "@/components/HowItWorks";
import { TournamentPreview } from "@/components/TournamentPreview";
import { FinalCTA } from "@/components/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <WhySection />
      <FeaturedGames />
      <GamingTiles />
      <HowItWorks />
      <TournamentPreview />
      <FinalCTA />
    </>
  );
}
