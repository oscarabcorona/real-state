import React, { useEffect, useRef } from 'react';
import { animate, inView } from 'motion';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'scale' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedElement({ 
  children, 
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  className = ''
}: AnimatedElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const animations = {
      fadeIn: {
        opacity: [0, 1],
        duration,
        delay
      },
      slideUp: {
        opacity: [0, 1],
        y: [50, 0],
        duration,
        delay
      },
      scale: {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration,
        delay
      },
      slideLeft: {
        opacity: [0, 1],
        x: [-50, 0],
        duration,
        delay
      },
      slideRight: {
        opacity: [0, 1],
        x: [50, 0],
        duration,
        delay
      }
    };

    inView(elementRef.current, ({ target }) => {
      animate(target, animations[animation]);
    });
  }, [animation, delay, duration]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}