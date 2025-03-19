import React, { useEffect, useRef } from "react";
import { animate, stagger, inView } from "motion";

interface StaggeredListProps {
  children: React.ReactNode[];
  animation?: "fadeIn" | "slideUp" | "scale" | "slideLeft" | "slideRight";
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  className?: string;
}

export function StaggeredList({
  children,
  animation = "fadeIn",
  staggerDelay = 0.05,
  initialDelay = 0,
  duration = 0.4,
  className = "",
}: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = Array.from(containerRef.current.children);
    if (elements.length === 0) return;

    const getAnimationProperties = () => {
      switch (animation) {
        case "fadeIn":
          return { opacity: [0, 1] };
        case "slideUp":
          return { opacity: [0, 1], y: [20, 0] };
        case "scale":
          return { opacity: [0, 1], scale: [0.9, 1] };
        case "slideLeft":
          return { opacity: [0, 1], x: [20, 0] };
        case "slideRight":
          return { opacity: [0, 1], x: [-20, 0] };
        default:
          return { opacity: [0, 1] };
      }
    };

    inView(containerRef.current, () => {
      animate(elements, getAnimationProperties(), {
        delay: stagger(staggerDelay, { start: initialDelay }),
        duration,
        easing: "ease-out",
      });
    });
  }, [animation, staggerDelay, initialDelay, duration, childrenArray.length]);

  return (
    <div ref={containerRef} className={className}>
      {childrenArray.map((child, i) => (
        <div key={i} style={{ opacity: 0 }}>
          {child}
        </div>
      ))}
    </div>
  );
}
