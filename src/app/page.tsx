import HeroSection from "@/components/home/HeroSection";
import GaleriSection from "@/components/home/GaleriSection";
import FasilitasSection from "@/components/home/FasilitasSection";
import TataTertibSection from "@/components/home/TataTertibSection";
import LayananSuratSection from "@/components/home/LayananSuratSection";

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-14 pb-12 sm:pb-16 animate-fade-in">
      <HeroSection />
      <GaleriSection />
      <FasilitasSection />
      <TataTertibSection />
      <LayananSuratSection />
    </div>
  );
}