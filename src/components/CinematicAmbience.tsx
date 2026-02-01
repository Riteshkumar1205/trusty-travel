import { useEffect, useRef } from "react";

const CinematicAmbience = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute w-[600px] h-[600px] -top-[200px] -left-[200px] animate-orb-float-1">
        <div className="w-full h-full rounded-full bg-gradient-radial from-primary/10 via-primary/5 to-transparent blur-3xl" />
      </div>
      
      <div className="absolute w-[500px] h-[500px] top-1/3 -right-[150px] animate-orb-float-2">
        <div className="w-full h-full rounded-full bg-gradient-radial from-accent/8 via-accent/3 to-transparent blur-3xl" />
      </div>
      
      <div className="absolute w-[400px] h-[400px] bottom-[10%] left-[20%] animate-orb-float-3">
        <div className="w-full h-full rounded-full bg-gradient-radial from-success/8 via-success/3 to-transparent blur-3xl" />
      </div>

      {/* Scanning Light Beam */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-scan-vertical" />
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-scan-horizontal" />
      </div>

      {/* Shimmer Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent animate-shimmer" />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-radial-vignette" />

      {/* Aurora Ribbons */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-[300px] -top-[100px] left-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-primary/0 via-primary/30 to-accent/0 animate-aurora-1 blur-2xl" 
               style={{ transform: "skewY(-3deg)" }} />
        </div>
        <div className="absolute w-full h-[200px] top-[20%] left-0 opacity-15">
          <div className="w-full h-full bg-gradient-to-r from-accent/0 via-accent/20 to-success/0 animate-aurora-2 blur-2xl" 
               style={{ transform: "skewY(2deg)" }} />
        </div>
      </div>

      {/* Floating Dust Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30 animate-dust"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Lens Flare Effect */}
      <div className="absolute top-[15%] right-[20%] w-[300px] h-[300px] opacity-20 animate-lens-flare">
        <div className="absolute inset-0 bg-gradient-radial from-primary/40 via-primary/10 to-transparent rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary/60 rounded-full blur-sm" />
        <div className="absolute top-[60%] left-[30%] w-3 h-3 bg-accent/40 rounded-full blur-sm" />
        <div className="absolute top-[40%] left-[70%] w-2 h-2 bg-white/30 rounded-full" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
           style={{
             backgroundImage: `
               linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
               linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
             `,
             backgroundSize: "100px 100px"
           }} />
    </div>
  );
};

export default CinematicAmbience;
