import { Instagram } from 'lucide-react';

interface NavigationProps {
  activeSlide: number;
  onNavigate: (index: number) => void;
}

const Navigation = ({ activeSlide, onNavigate }: NavigationProps) => {
  const navItems = [
    { label: 'ABOUT', index: 1 },
    { label: 'ROOTS', index: 2 },
    { label: 'PAELLA', index: 3 },
    { label: 'CONTACT', index: 4 },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-3 md:px-8 py-4 md:py-5">
        {/* Left Navigation */}
        <div className="flex items-center justify-between flex-1 gap-2 md:gap-8 pr-2 md:pr-0">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.index)}
              className={`nav-link text-lg md:text-xl font-bold py-2 px-1 md:px-0 flex-1 text-center ${activeSlide === item.index ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right - Instagram */}
        <a
          href="https://www.instagram.com/superrrrmercado/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-btn flex-shrink-0 ml-2"
          aria-label="Instagram"
        >
          <Instagram size={26} className="md:w-8 md:h-8" />
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
