import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = 60;
    const colors = [
      "rgba(225, 184, 90, ", // Gold
      "rgba(77, 163, 255, ", // Electric blue
      "rgba(47, 167, 114, ", // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.3) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Flow lines
    interface FlowLine {
      startX: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      color: string;
    }

    const flowLines: FlowLine[] = [];
    const flowLineCount = 8;

    for (let i = 0; i < flowLineCount; i++) {
      flowLines.push({
        startX: -200 - Math.random() * 500,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 200,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(14, 26, 43, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw flow lines
      flowLines.forEach((line) => {
        const gradient = ctx.createLinearGradient(
          line.startX,
          line.y,
          line.startX + line.length,
          line.y
        );
        gradient.addColorStop(0, line.color + "0)");
        gradient.addColorStop(0.5, line.color + line.opacity + ")");
        gradient.addColorStop(1, line.color + "0)");

        ctx.beginPath();
        ctx.moveTo(line.startX, line.y);
        ctx.lineTo(line.startX + line.length, line.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();

        line.startX += line.speed;
        if (line.startX > canvas.width + 200) {
          line.startX = -200 - Math.random() * 300;
          line.y = Math.random() * canvas.height;
        }
      });

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ")";
        ctx.fill();

        // Add glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, p.color + (p.opacity * 0.3) + ")");
        glow.addColorStop(1, p.color + "0)");
        ctx.fillStyle = glow;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "hsl(216, 39%, 7%)" }}
    />
  );
};

export default ParticleBackground;
