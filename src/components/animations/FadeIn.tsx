import React, { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
}

const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, duration = 0.5, y = 20 }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: y,
        },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          delay: delay,
          ease: 'power2.out',
        }
      );
    }
  }, [delay, duration, y]);

  return (
    <div ref={elementRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export default FadeIn;
