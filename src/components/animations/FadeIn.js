import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const FadeIn = ({ children, delay = 0, duration = 0.5, y = 20 }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    
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
  }, [delay, duration, y]);

  return (
    <div ref={elementRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};

export default FadeIn;