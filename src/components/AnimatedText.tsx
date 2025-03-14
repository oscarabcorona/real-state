import React, { useEffect } from 'react';
import { stagger, animate } from 'motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  useEffect(() => {
    const chars = Array.from(text);
    const elements = chars.map((_, i) => document.getElementById(`char-${i}`));
    
    animate(
      elements,
      { 
        opacity: [0, 1],
        y: [20, 0]
      },
      { 
        delay: stagger(0.03, { start: delay }),
        duration: 0.5,
        easing: 'ease-out'
      }
    );
  }, [text, delay]);

  return (
    <span className={className}>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          id={`char-${i}`}
          style={{ opacity: 0, display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}