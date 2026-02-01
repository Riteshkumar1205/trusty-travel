import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useParallax } from "@/hooks/useScrollAnimation";
import AnimatedSection from "@/components/AnimatedSection";

const HeroSection = () => {
  const navigate = useNavigate();
  const parallaxOffset = useParallax(0.4);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background z-[1]" />

      {/* Content */}
      <div className="relative z-10 container-wide pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <AnimatedSection animation="fade-down" delay={0}>
            <div className="inline-flex items-center gap-2 badge-verified mb-8">
              <Shield className="w-4 h-4" />
              <span>Government Verified • Escrow Protected</span>
            </div>
          </AnimatedSection>

          {/* Main Heading */}
          <AnimatedSection animation="fade-up" delay={100}>
            <h1 className="text-hero text-foreground mb-6">
              Guiding{" "}
              <span className="text-primary glow-text-gold">Trust</span>
              <br />
              Across Distance
            </h1>
          </AnimatedSection>

          {/* Tagline */}
          <AnimatedSection animation="fade-up" delay={200}>
            <p className="text-body-large max-w-2xl mx-auto mb-4">
              Send parcels with travelers heading your way. Faster than courier, 
              cheaper than porter — powered by people you can trust.
            </p>
          </AnimatedSection>

          {/* Hindi Tagline */}
          <AnimatedSection animation="blur-in" delay={300}>
            <p className="text-muted-foreground italic mb-12">
              "Aapka humsafar, zimmedaari ke saath"
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection animation="zoom-in" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
                onClick={() => navigate("/dashboard/sender")}
              >
                Send a Parcel
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="heroOutline" 
                size="xl" 
                className="group"
                onClick={() => navigate("/dashboard/traveler")}
              >
                <MapPin className="w-5 h-5" />
                Become a Saarthi
              </Button>
            </div>
          </AnimatedSection>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};


export default HeroSection;
