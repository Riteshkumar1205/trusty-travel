import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

interface FlowLine {
  startX: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  color: string;
  curve: number;
}

interface ConnectionLine {
  p1: number;
  p2: number;
  opacity: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const flowLinesRef = useRef<FlowLine[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Enhanced color palette
    const colors = [
      "rgba(225, 184, 90, ",   // Gold
      "rgba(77, 163, 255, ",   // Electric blue
      "rgba(47, 167, 114, ",   // Emerald
      "rgba(168, 130, 255, ",  // Lavender
      "rgba(255, 140, 105, ",  // Coral
    ];

    // Initialize particles with enhanced properties
    const particleCount = 80;
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Initialize flow lines with curves
    const flowLineCount = 12;
    flowLinesRef.current = [];
    for (let i = 0; i < flowLineCount; i++) {
      flowLinesRef.current.push({
        startX: -200 - Math.random() * 500,
        y: Math.random() * canvas.height,
        length: 150 + Math.random() * 300,
        speed: 0.4 + Math.random() * 0.6,
        opacity: 0.08 + Math.random() * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        curve: (Math.random() - 0.5) * 100,
      });
    }

    const animate = () => {
      frameRef.current++;
      
      // Premium dark background with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(14, 26, 43, 0.03)");
      gradient.addColorStop(0.5, "rgba(10, 20, 35, 0.03)");
      gradient.addColorStop(1, "rgba(14, 26, 43, 0.03)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const flowLines = flowLinesRef.current;
      const mouse = mouseRef.current;

      // Draw ambient glow spots
      const glowPositions = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, color: "rgba(77, 163, 255, 0.03)", size: 400 },
        { x: canvas.width * 0.8, y: canvas.height * 0.6, color: "rgba(225, 184, 90, 0.02)", size: 500 },
        { x: canvas.width * 0.5, y: canvas.height * 0.8, color: "rgba(47, 167, 114, 0.02)", size: 350 },
      ];
      
      glowPositions.forEach((glow) => {
        const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.size);
        gradient.addColorStop(0, glow.color);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(glow.x - glow.size, glow.y - glow.size, glow.size * 2, glow.size * 2);
      });

      // Draw curved flow lines
      flowLines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.startX, line.y);
        
        const cp1x = line.startX + line.length * 0.3;
        const cp1y = line.y + line.curve;
        const cp2x = line.startX + line.length * 0.7;
        const cp2y = line.y - line.curve * 0.5;
        const endX = line.startX + line.length;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, line.y);
        
        const gradient = ctx.createLinearGradient(line.startX, line.y, endX, line.y);
        gradient.addColorStop(0, line.color + "0)");
        gradient.addColorStop(0.3, line.color + (line.opacity * 0.5) + ")");
        gradient.addColorStop(0.5, line.color + line.opacity + ")");
        gradient.addColorStop(0.7, line.color + (line.opacity * 0.5) + ")");
        gradient.addColorStop(1, line.color + "0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        line.startX += line.speed;
        if (line.startX > canvas.width + 200) {
          line.startX = -200 - Math.random() * 300;
          line.y = Math.random() * canvas.height;
          line.curve = (Math.random() - 0.5) * 100;
        }
      });

      // Find connections between nearby particles
      const connections: ConnectionLine[] = [];
      const connectionDistance = 120;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDistance) {
            connections.push({
              p1: i,
              p2: j,
              opacity: (1 - dist / connectionDistance) * 0.15,
            });
          }
        }
      }

      // Draw connection lines
      connections.forEach((conn) => {
        const p1 = particles[conn.p1];
        const p2 = particles[conn.p2];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(77, 163, 255, ${conn.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw and update particles
      particles.forEach((p) => {
        // Pulse effect
        p.pulsePhase += p.pulseSpeed;
        const pulseFactor = 1 + Math.sin(p.pulsePhase) * 0.3;
        const currentSize = p.size * pulseFactor;
        const currentOpacity = p.opacity * (0.8 + Math.sin(p.pulsePhase) * 0.2);

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += (dx / dist) * force * 0.02;
            p.vy += (dy / dist) * force * 0.02;
          }
        }

        // Apply velocity damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentOpacity + ")";
        ctx.fill();

        // Draw outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4);
        glow.addColorStop(0, p.color + (currentOpacity * 0.4) + ")");
        glow.addColorStop(0.5, p.color + (currentOpacity * 0.1) + ")");
        glow.addColorStop(1, p.color + "0)");
        ctx.fillStyle = glow;
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
      });

      // Draw mouse interaction glow
      if (mouse.active) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        mouseGlow.addColorStop(0, "rgba(225, 184, 90, 0.05)");
        mouseGlow.addColorStop(0.5, "rgba(77, 163, 255, 0.02)");
        mouseGlow.addColorStop(1, "transparent");
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: "linear-gradient(135deg, hsl(216, 39%, 7%) 0%, hsl(216, 39%, 5%) 50%, hsl(216, 39%, 8%) 100%)" 
      }}
    />
  );
};

export default ParticleBackground;
