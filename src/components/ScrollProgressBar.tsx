import { useScrollProgress } from "@/hooks/useScrollAnimation";

const ScrollProgressBar = () => {
  const progress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect at the leading edge */}
      <div
        className="absolute top-0 h-[3px] w-8 blur-sm bg-primary/80 transition-[left] duration-150 ease-out"
        style={{ left: `calc(${progress}% - 16px)` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
