import Hero from "@/components/home/hero";
import ParticleField from "@/components/home/particle-field";
import PressMarquee from "@/components/home/press-marquee";
import V8Strip from "@/components/home/v8-strip";
import AboutSection from "@/components/home/about-section";
import KineticBand from "@/components/home/kinetic-band";
import ImpactSection from "@/components/home/impact-section";
import GoalsSection from "@/components/home/goals-section";
import ArchiveFlythrough from "@/components/home/archive-flythrough";
import JudgesSection from "@/components/home/judges-section";
import NextHackathonSection from "@/components/home/next-hackathon-section";
import DiscordSection from "@/components/home/discord-section";

export default function Home() {
  return (
    <main className="relative overflow-x-clip bg-[#050505] text-white">
      <ParticleField />
      <div className="relative z-10 overflow-x-clip">
        <Hero />
      </div>
      <V8Strip />
      <AboutSection />
      <KineticBand />
      <ImpactSection />
      <GoalsSection />
      <ArchiveFlythrough />
      <JudgesSection />
      <PressMarquee />
      <NextHackathonSection />
      <DiscordSection />
    </main>
  );
}
