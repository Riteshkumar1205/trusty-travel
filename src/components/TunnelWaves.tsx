import { memo } from "react";

/**
 * TunnelWaves – Concentric rings that continuously expand outward
 * from a vanishing point at the center, creating a tunnel/warp effect.
 * Uses pure CSS animations for maximum performance.
 */
const TunnelWaves = memo(() => {
  const rings = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Central vanishing point glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full blur-lg"
        style={{ background: 'hsl(var(--primary) / 0.25)' }}
      />

      {/* Expanding rings — staggered across a longer cycle */}
      {rings.map((i) => {
        const isGold = i % 3 !== 2;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full border tunnel-ring"
            style={{
              animationDelay: `${i * -0.95}s`,
              borderColor: isGold
                ? 'hsl(var(--primary) / 0.10)'
                : 'hsl(var(--accent) / 0.06)',
            }}
          />
        );
      })}

      {/* Depth vignette — fades rings into background at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 25%, hsl(var(--background) / 0.5) 60%, hsl(var(--background) / 0.85) 80%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
});

TunnelWaves.displayName = "TunnelWaves";

export default TunnelWaves;
