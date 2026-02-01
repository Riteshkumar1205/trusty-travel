import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Smartphone, Fingerprint } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const CallToAction = () => {
  return (
    <section className="section-padding relative z-10">
      <div className="container-tight">
        <AnimatedSection animation="zoom-in">
          <div className="card-premium overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-electric/5" />
            
            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div>
                  <AnimatedSection animation="fade-right" delay={200}>
                    <h2 className="text-display text-foreground mb-4">
                      Ready to Be Someone's{" "}
                      <span className="text-primary">Saarthi</span>?
                    </h2>
                    <p className="text-body-large mb-8">
                      Whether you're sending trust across cities or carrying responsibility through your journey — we've got you covered.
                    </p>
                  </AnimatedSection>

                  <div className="space-y-4 mb-8">
                    <AnimatedSection animation="fade-up" delay={300}>
                      <TrustPoint
                        icon={Fingerprint}
                        title="Aadhaar Verified"
                        description="Government-grade identity verification"
                      />
                    </AnimatedSection>
                    <AnimatedSection animation="fade-up" delay={400}>
                      <TrustPoint
                        icon={Shield}
                        title="Escrow Protection"
                        description="Your money is safe until delivery"
                      />
                    </AnimatedSection>
                    <AnimatedSection animation="fade-up" delay={500}>
                      <TrustPoint
                        icon={Smartphone}
                        title="Real-Time Updates"
                        description="Track every moment of the journey"
                      />
                    </AnimatedSection>
                  </div>

                  <AnimatedSection animation="fade-up" delay={600}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="hero" size="lg" className="group">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button variant="glass" size="lg">
                        Learn More
                      </Button>
                    </div>
                  </AnimatedSection>
                </div>

                {/* Right - Trust Visualization */}
                <AnimatedSection animation="zoom-in" delay={300}>
                  <div className="relative hidden lg:flex items-center justify-center">
                    <div className="relative w-80 h-80">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
                      
                      {/* Middle ring */}
                      <div className="absolute inset-8 rounded-full border border-primary/30" />
                      
                      {/* Inner circle with content */}
                      <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/10 to-electric/10 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-1">सा</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-widest">Saarthi</div>
                        </div>
                      </div>

                      {/* Floating elements */}
                      <div className="absolute top-4 right-12 badge-verified animate-float" style={{ animationDelay: "0s" }}>
                        Sender
                      </div>
                      <div className="absolute bottom-12 left-0 badge-trusted animate-float" style={{ animationDelay: "1s" }}>
                        Traveler
                      </div>
                      <div className="absolute bottom-4 right-4 badge-review animate-float" style={{ animationDelay: "2s" }}>
                        Receiver
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

const TrustPoint = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="font-medium text-foreground text-sm">{title}</div>
      <div className="text-muted-foreground text-xs">{description}</div>
    </div>
  </div>
);

export default CallToAction;
