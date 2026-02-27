import { AboutHero } from "@/components/AboutHero";
import { FounderSection } from "@/components/FounderSection";
import { StatsSection } from "@/components/StatsSection";
import { VisionSection } from "@/components/VisionSection";
import { AboutCTA } from "@/components/AboutCTA";

export default function AboutPage() {
    return (
        <>
            <AboutHero />
            <FounderSection />
            <StatsSection />
            <VisionSection />
            <AboutCTA />
        </>
    );
}
