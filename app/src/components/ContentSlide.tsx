import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ContentSlideProps {
  id: string;
  title: string;
  content: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  isActive: boolean;
  isMobile: boolean;
}

const ContentSlide = ({ id, title, content, imageSrc, imageAlt, isActive, isMobile }: ContentSlideProps) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const imageContainer = imageContainerRef.current;
    const text = textRef.current;

    if (imageContainer && text) {
      gsap.set(imageContainer, { opacity: 0, x: -100 });
      gsap.set(text.children, { opacity: 0, y: 30 });

      gsap.to(imageContainer, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(text.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3,
      });
    }
  }, [isActive]);


  // Mobile layout
  if (isMobile) {
    return (
      <div
        ref={slideRef}
        id={id}
        className="slide flex flex-col bg-white pt-14 overflow-hidden"
      >
        {/* Image */}
        <div
          ref={imageContainerRef}
          className={`w-full flex-shrink-0 ${id === 'roots' ? 'h-56' : 'aspect-square'}`}
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div ref={textRef} className="text-justify">
            {/* Title with underline */}
            <div className="mb-3">
              <h2
                ref={titleRef}
                className="text-2xl font-bold tracking-wide text-gray-900 mb-1 inline-block"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                {title}
              </h2>
              <div
                ref={underlineRef}
                className="text-gray-400 text-sm tracking-widest overflow-hidden whitespace-nowrap"
                style={{ fontFamily: 'VT323, monospace' }}
              >
                ================================================================================================================================================
              </div>
            </div>

            {/* Content */}
            <div
              className="text-base leading-relaxed text-gray-600 space-y-2"
              style={{ fontFamily: 'VT323, monospace' }}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      ref={slideRef}
      id={id}
      className="slide flex flex-row pt-14 md:pt-16 bg-white"
    >
      {/* Image */}
      <div className="w-1/2 h-full flex items-center justify-center p-3 md:p-8 bg-white">
        <div
          ref={imageContainerRef}
          className="relative bg-white w-full h-auto max-h-[80%]"
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain max-h-[70vh]"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="w-1/2 h-full flex items-center justify-center p-4 md:px-16 overflow-y-auto bg-white">
        <div ref={textRef} className="w-full max-w-lg text-justify">
          {/* Title with underline */}
          <div className="mb-4 md:mb-6">
            <h2 
              ref={titleRef}
              className="text-3xl md:text-4xl font-bold tracking-wide text-gray-900 mb-1 inline-block" 
              style={{ fontFamily: 'VT323, monospace' }}
            >
              {title}
            </h2>
            <div 
              ref={underlineRef}
              className="text-gray-400 text-sm md:text-base tracking-widest overflow-hidden whitespace-nowrap"
              style={{ fontFamily: 'VT323, monospace' }}
            >
              ================================================================================================================================================
            </div>
          </div>
          
          {/* Content */}
          <div 
            className="text-lg md:text-xl leading-relaxed text-gray-600 space-y-2 md:space-y-3" 
            style={{ fontFamily: 'VT323, monospace' }}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSlide;
