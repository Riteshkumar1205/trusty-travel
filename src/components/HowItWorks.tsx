import { CheckCircle2, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  {
    number: "01",
    title: "Post Your Request",
    description: "Sender posts parcel details. Traveler posts journey with available capacity.",
    side: "sender",
  },
  {
    number: "02",
    title: "Smart Matching",
    description: "Our algorithm finds the optimal pair based on route, timing, and trust scores.",
    side: "system",
  },
  {
    number: "03",
    title: "Digital Handshake",
    description: "Both parties agree. Payment is secured in escrow. Trust contract is created.",
    side: "both",
  },
  {
    number: "04",
    title: "Secure Pickup",
    description: "OTP + QR verification at pickup. Parcel photos captured for safety.",
    side: "traveler",
  },
  {
    number: "05",
    title: "Live Journey",
    description: "Real-time tracking. In-app messaging. Peace of mind throughout.",
    side: "sender",
  },
  {
    number: "06",
    title: "Safe Delivery",
    description: "Receiver confirms with OTP. Payment released. Trust scores updated.",
    side: "receiver",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding relative z-10 bg-gradient-to-b from-transparent via-card/30 to-transparent">
      <div className="container-wide">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-display text-foreground mb-4">
            The Journey of <span className="text-primary">Trust</span>
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            From handshake to delivery — every step is verified, tracked, and protected.
          </p>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 hidden md:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <AnimatedSection
                key={step.number}
                animation={index % 2 === 0 ? "fade-right" : "fade-left"}
                delay={index * 150}
                threshold={0.2}
              >
                <div
                  className={`relative flex flex-col md:flex-row items-center gap-4 md:gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <div className="card-glass p-6 inline-block">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-primary text-sm">{step.number}</span>
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-primary flex items-center justify-center pulse-trust">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Final arrow */}
          <AnimatedSection animation="zoom-in" delay={1000}>
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium">Trust Delivered</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
