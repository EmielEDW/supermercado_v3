import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LogoSlideProps {
  isActive: boolean;
  onScrollDown: () => void;
  isMobile: boolean;
}

const LogoSlide = ({ isActive, isMobile }: LogoSlideProps) => {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const logo = logoRef.current;

    if (logo) {
      gsap.set(logo, { opacity: 0, scale: 0.95 });
      gsap.to(logo, {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      });
    }
  }, [isActive]);

  const slideClasses = isMobile 
    ? 'slide bg-white flex flex-col items-center justify-end pb-20'
    : 'slide bg-white flex flex-col items-center justify-end pb-24';

  return (
    <div className={slideClasses}>
      <img
        ref={logoRef}
        src="/images/logo.png"
        alt="SUPERMERCADO"
        className="w-[99vw] md:w-[98vw] lg:w-[96vw] max-w-[1800px] h-auto object-contain"
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
};

export default LogoSlide;
