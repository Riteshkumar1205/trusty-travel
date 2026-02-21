import { memo } from "react";

/**
 * TunnelWaves – Concentric rings that continuously expand outward
 * from a vanishing point at the center, creating a tunnel/warp effect.
 * Uses pure CSS animations for maximum performance.
 */
const TunnelWaves = memo(() => {
  const rings = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Central vanishing point glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/30 blur-md" />

      {/* Expanding rings */}
      {rings.map((i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full border tunnel-ring"
          style={{
            animationDelay: `${i * -1.2}s`,
            borderColor: i % 2 === 0
              ? 'hsl(var(--primary) / 0.12)'
              : 'hsl(var(--accent) / 0.08)',
          }}
        />
      ))}

      {/* Subtle radial gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 30%, hsl(var(--background) / 0.6) 70%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
});

TunnelWaves.displayName = "TunnelWaves";

export default TunnelWaves;
