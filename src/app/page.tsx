import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { WhySection } from "@/components/WhySection";
import { FeaturedGames } from "@/components/FeaturedGames";
import { HowItWorks } from "@/components/HowItWorks";
import { TournamentPreview } from "@/components/TournamentPreview";
import { FinalCTA } from "@/components/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-neon-green/30 selection:text-neon-green">
      {/* Header/Nav (Mocked for Homepage structure) */}
      <header className="fixed top-0 w-full border-b border-neon-green/20 bg-black/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black font-orbitron tracking-widest text-white">
            CALL<span className="text-neon-green">OUT</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-wider text-gray-400">
            <a href="#" className="hover:text-neon-green transition-colors">Tournaments</a>
            <a href="#" className="hover:text-neon-green transition-colors">Games</a>
            <a href="#" className="hover:text-neon-green transition-colors">Leaderboard</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-mono text-white hover:text-neon-green px-4 py-2 transition-colors">
              LOG IN
            </button>
            <button className="border border-neon-green text-neon-green text-sm font-mono px-6 py-2 hover:bg-neon-green hover:text-black transition-all neon-shadow">
              SIGN UP
            </button>
          </div>
        </div>
      </header>

      <Hero />
      <StatsStrip />
      <WhySection />
      <FeaturedGames />
      <HowItWorks />
      <TournamentPreview />
      <FinalCTA />

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-neon-green/10 text-center">
        <div className="container mx-auto px-6">
          <div className="text-2xl font-black font-orbitron tracking-widest text-white mb-6">
            CALL<span className="text-neon-green">OUT</span> ESPORTS
          </div>
          <p className="text-gray-500 font-sans text-sm mb-8 max-w-md mx-auto">
            India's most competitive battleground. Join the elite. Build your legacy.
          </p>
          <div className="flex justify-center gap-6 mb-12">
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">TW</a>
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">IG</a>
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">YT</a>
            <a href="#" className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-neon-green hover:border-neon-green transition-all">DC</a>
          </div>
          <div className="text-gray-600 font-mono text-xs uppercase tracking-widest border-t border-white/5 pt-8">
            © {new Date().getFullYear()} CallOut Esports. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
