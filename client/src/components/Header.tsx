import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17L9 11L13 15L21 7" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 7L21 7L21 12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(258, 60%, 52%)" />
                    <stop offset="100%" stopColor="hsl(258, 73%, 68%)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-alata font-medium" style={{ color: 'hsl(258, 60%, 52%)' }}>
              Investor Feed
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('follow')}
              className="text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
            >
              Follow
            </button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-left text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('follow')}
                className="text-left text-gray-900 hover:text-[hsl(258,60%,52%)] transition-colors duration-200 font-alata"
              >
                Follow
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
