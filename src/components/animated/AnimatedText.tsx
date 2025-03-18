import { animate, stagger } from "motion";
import { useEffect } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
}: AnimatedTextProps) {
  useEffect(() => {
    const chars = Array.from(text);
    const elements = chars.map((_, i) =>
      document.getElementById(`char-${text}-${i}`)
    );

    animate(
      elements.filter((el): el is HTMLElement => el !== null),
      {
        opacity: [0, 1],
        y: [20, 0],
      },
      {
        delay: stagger(0.03, { start: delay }),
        duration: 0.5,
        easing: "ease-out",
      }
    );
  }, [text, delay]);

  return (
    <span className={`inline-block ${className}`}>
      {Array.from(text).map((char, i) => (
        <span
          key={`${text}-${i}`}
          id={`char-${text}-${i}`}
          style={{
            opacity: 0,
            display: "inline-block",
            whiteSpace: "pre",
            width: char === " " ? "0.25em" : "auto",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
