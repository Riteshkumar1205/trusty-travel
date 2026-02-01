import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

type AnimationType = 
  | "fade-up" 
  | "fade-down" 
  | "fade-left" 
  | "fade-right" 
  | "zoom-in" 
  | "zoom-out"
  | "flip-up"
  | "blur-in";

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

const animationClasses: Record<AnimationType, { initial: string; visible: string }> = {
  "fade-up": {
    initial: "opacity-0 translate-y-12",
    visible: "opacity-100 translate-y-0",
  },
  "fade-down": {
    initial: "opacity-0 -translate-y-12",
    visible: "opacity-100 translate-y-0",
  },
  "fade-left": {
    initial: "opacity-0 translate-x-12",
    visible: "opacity-100 translate-x-0",
  },
  "fade-right": {
    initial: "opacity-0 -translate-x-12",
    visible: "opacity-100 translate-x-0",
  },
  "zoom-in": {
    initial: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
  },
  "zoom-out": {
    initial: "opacity-0 scale-110",
    visible: "opacity-100 scale-100",
  },
  "flip-up": {
    initial: "opacity-0 rotateX-90",
    visible: "opacity-100 rotateX-0",
  },
  "blur-in": {
    initial: "opacity-0 blur-sm",
    visible: "opacity-100 blur-0",
  },
};

const AnimatedSection = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  className,
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) => {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold, once });
  const { initial, visible } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible ? visible : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
