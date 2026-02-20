import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './components/Navigation';
import LogoSlide from './components/LogoSlide';
import ContentSlide from './components/ContentSlide';
import ContactSlide from './components/ContactSlide';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slides = [
    {
      id: 'about',
      title: 'ABOUT.',
      image: '/images/unnamed.jpg',
      imageAlt: 'Basque pintxos spread',
      content: (
        <>
          <p>
            <span className="text-[#c41e3a] font-bold">KAIXO.</span> Catering en event-service, gevestigd in Gent. Onze roots liggen diep verankerd in de Baskische cultuur. SUPERMERCADO brengt krachtige, seizoensgebonden gerechten met een subtiele knipoog naar het País Vasco. <span className="text-[#c41e3a] font-bold">AGUR.</span>
          </p>
        </>
      ),
    },
    {
      id: 'roots',
      title: 'ROOTS.',
      image: '/images/roots.jpg',
      imageAlt: 'Basque fishermen heritage',
      content: (
        <>
          <p>
            <span className="text-[#c41e3a] font-bold">FAMILIA.</span> Elvira & José-Luis vluchtten als kind voor de Franco-tirannie die zich in 1936 in hun vaderland afspeelde. Via enkele omwegen kwamen ze in Gent terecht, waar ze uiteindelijk de rest van hun leven zouden blijven. Zo werd Gent mijn geboortestad. Mijn grootouders waren bourgondiërs in hart en nieren. Warmte en smaak dicteerden mijn jeugd. Twintig jaar later sta ik zelf achter het fornuis. Mijn naam is Jaime Larrea-Betolaza, welkom bij <span className="text-[#c41e3a] font-bold">SUPERMERCADO.</span>
          </p>
        </>
      ),
    },
    {
      id: 'paella',
      title: 'PAELLA.',
      image: '/images/paella2.jpg',
      imageAlt: 'Traditional Spanish paella',
      content: (
        <>
          <p>
            <span className="text-[#c41e3a] font-bold">STAPLE.</span> Een familierecept dat al meer dan 40 jaar gesmaakt wordt. Hetzelfde vertrouwde recept in een nieuw jasje. Ideaal voor grotere groepen, maar ook perfect te combineren in menuvorm met onze pintxos. <span className="text-[#c41e3a] font-bold">TRADITIE.</span>
          </p>
        </>
      ),
    },
  ];

  const handleNavigate = useCallback((index: number) => {
    if (isScrolling.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    if (isMobile) {
      const slideHeight = window.innerHeight;
      container.scrollTo({
        top: index * slideHeight,
        behavior: 'smooth',
      });
      setActiveSlide(index);
      return;
    }

    isScrolling.current = true;
    const slideHeight = window.innerHeight;
    
    container.scrollTo({
      top: index * slideHeight,
      behavior: 'smooth',
    });

    setActiveSlide(index);

    setTimeout(() => {
      isScrolling.current = false;
    }, 800);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling.current) return;
      
      const scrollTop = container.scrollTop;
      const slideHeight = window.innerHeight;
      const newSlide = Math.round(scrollTop / slideHeight);
      
      if (newSlide !== activeSlide && newSlide >= 0 && newSlide < 5) {
        setActiveSlide(newSlide);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeSlide, isMobile]);

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    let accumulatedDelta = 0;
    const deltaThreshold = 50;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling.current) return;

      accumulatedDelta += e.deltaY;

      if (Math.abs(accumulatedDelta) >= deltaThreshold) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        const newSlide = activeSlide + direction;

        if (newSlide >= 0 && newSlide < 5) {
          handleNavigate(newSlide);
        }

        accumulatedDelta = 0;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [activeSlide, handleNavigate, isMobile]);

  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (activeSlide < 4) {
          handleNavigate(activeSlide + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeSlide > 0) {
          handleNavigate(activeSlide - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlide, handleNavigate, isMobile]);

  return (
    <div className="h-screen w-full bg-white overflow-hidden">
      <Navigation activeSlide={activeSlide} onNavigate={handleNavigate} />
      
      <div
        ref={containerRef}
        className={`h-full w-full ${isMobile ? 'mobile-scroll' : 'slides-container'}`}
      >
        <LogoSlide 
          isActive={activeSlide === 0} 
          onScrollDown={() => handleNavigate(1)}
          isMobile={isMobile}
        />

        {slides.map((slide, index) => (
          <ContentSlide
            key={slide.id}
            id={slide.id}
            title={slide.title}
            content={slide.content}
            imageSrc={slide.image}
            imageAlt={slide.imageAlt}
            isActive={activeSlide === index + 1}
            isMobile={isMobile}
          />
        ))}
        
        <ContactSlide isActive={activeSlide === 4} isMobile={isMobile} />
      </div>
    </div>
  );
}

export default App;
