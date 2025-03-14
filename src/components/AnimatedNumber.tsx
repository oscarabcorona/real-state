import React, { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1500, // Changed to milliseconds
  delay = 0,
  className = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameId = useRef<number>();

  useEffect(() => {
    const startAnimation = () => {
      startTime.current = Date.now();
      animate();
    };

    const animate = () => {
      if (!startTime.current) return;

      const currentTime = Date.now();
      const elapsed = currentTime - startTime.current;

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.round(easedProgress * value);
        setDisplayValue(currentValue);
        frameId.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [value, duration, delay]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// Easing function for smoother animation
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
