import { Package, Users, Shield, MapPin, Clock, Wallet } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const features = [
  {
    icon: Users,
    title: "Peer-to-Peer Trust",
    description: "Connect with verified travelers heading your way. Every Saarthi is KYC-verified.",
    badge: "Verified",
  },
  {
    icon: Clock,
    title: "Faster Than Courier",
    description: "Same-day delivery possibilities. Your parcel travels at the speed of human journeys.",
    badge: "Express",
  },
  {
    icon: Wallet,
    title: "Cost Effective",
    description: "Travelers offset their costs, you save money. Everyone wins.",
    badge: "Save 40%",
  },
  {
    icon: Shield,
    title: "Escrow Protection",
    description: "Secure payments released only after safe delivery confirmation.",
    badge: "Protected",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Know exactly where your parcel is, every step of the journey.",
    badge: "Live",
  },
  {
    icon: Package,
    title: "Any Size Parcel",
    description: "From documents to electronics. We match the right capacity for your needs.",
    badge: "Flexible",
  },
];

const FeatureGrid = () => {
  return (
    <section className="section-padding relative z-10">
      <div className="container-wide">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-display text-foreground mb-4">
            Why Choose <span className="text-primary">SAARTHI</span>?
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            A people-powered logistics network built on trust, transparency, and responsibility.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection
              key={feature.title}
              animation={index % 2 === 0 ? "fade-left" : "fade-right"}
              delay={index * 100}
            >
              <div
                className="card-premium p-6 group hover:border-primary/30 transition-all duration-500 h-full"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <span className="badge-verified text-xs">{feature.badge}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
