import ParticleBackground from "@/components/ParticleBackground";
import CinematicAmbience from "@/components/CinematicAmbience";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import BottomNav from "@/components/layout/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative pb-20 md:pb-0">
      {/* Scroll Progress */}
      <ScrollProgressBar />

      {/* Animated Background */}
      <ParticleBackground />
      <CinematicAmbience />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        
        <section id="features">
          <FeatureGrid />
        </section>
        
        <section id="how-it-works">
          <HowItWorks />
        </section>
        
        <CallToAction />
      </main>
      
      {/* Footer */}
      <Footer />

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </div>
  );
};

export default Index;
