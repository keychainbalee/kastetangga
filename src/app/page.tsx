import HeroSection from "@/components/home/HeroSection";
import GaleriSection from "@/components/home/GaleriSection";
import FasilitasSection from "@/components/home/FasilitasSection";
import TataTertibSection from "@/components/home/TataTertibSection";
import LayananSuratSection from "@/components/home/LayananSuratSection";

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16 animate-fade-in">
      <HeroSection />
      <GaleriSection />
      <FasilitasSection />
      <TataTertibSection />
      <LayananSuratSection />
    </div>
  );
}