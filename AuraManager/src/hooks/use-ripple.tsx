import { useState, useCallback } from "react";

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    let x: number, y: number;

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0];
      x = touch.clientX - rippleContainer.left;
      y = touch.clientY - rippleContainer.top;
    } else {
      // Mouse event
      x = event.clientX - rippleContainer.left;
      y = event.clientY - rippleContainer.top;
    }

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  const RippleContainer = () => (
    <span className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-accent/30 rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}
    </span>
  );

  return { addRipple, RippleContainer };
};
