import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background z-[1]" />

      {/* Content */}
      <div className="relative z-10 container-wide pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 badge-verified mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            <span>Government Verified • Escrow Protected</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-hero text-foreground mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Guiding{" "}
            <span className="text-primary glow-text-gold">Trust</span>
            <br />
            Across Distance
          </h1>

          {/* Tagline */}
          <p 
            className="text-body-large max-w-2xl mx-auto mb-4 animate-fade-in" 
            style={{ animationDelay: "200ms" }}
          >
            Send parcels with travelers heading your way. Faster than courier, 
            cheaper than porter — powered by people you can trust.
          </p>

          {/* Hindi Tagline */}
          <p 
            className="text-muted-foreground italic mb-12 animate-fade-in" 
            style={{ animationDelay: "250ms" }}
          >
            "Aapka humsafar, zimmedaari ke saath"
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" 
            style={{ animationDelay: "300ms" }}
          >
            <Button variant="hero" size="xl" className="group">
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

          {/* Stats */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <StatCard value="50K+" label="Verified Travelers" />
            <StatCard value="₹40L+" label="Saved by Users" />
            <StatCard value="99.2%" label="Safe Deliveries" />
            <StatCard value="4.9★" label="Trust Rating" />
          </div>
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

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="font-mono text-2xl md:text-3xl font-bold text-primary mb-1">
      {value}
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default HeroSection;
