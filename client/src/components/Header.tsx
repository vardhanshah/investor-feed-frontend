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
    <header className={`sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800 transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Name */}
          <div className="flex items-center">
            <span className="text-xl font-alata font-medium text-white">
              Investor Feed
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-white hover:text-[hsl(280,100%,70%)] transition-colors duration-200 font-alata"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('follow')}
              className="text-white hover:text-[hsl(280,100%,70%)] transition-colors duration-200 font-alata"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('stats-section')}
              className="text-white hover:text-[hsl(280,100%,70%)] transition-colors duration-200 font-alata"
            >
              Impact
            </button>
            <button 
              onClick={() => scrollToSection('contact-section')}
              className="text-white hover:text-[hsl(280,100%,70%)] transition-colors duration-200 font-alata"
            >
              Contact
            </button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-left text-white hover:text-[hsl(258,73%,68%)] transition-colors duration-200 font-alata"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('follow')}
                className="text-left text-white hover:text-[hsl(258,73%,68%)] transition-colors duration-200 font-alata"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('stats-section')}
                className="text-left text-white hover:text-[hsl(258,73%,68%)] transition-colors duration-200 font-alata"
              >
                Impact
              </button>
              <button 
                onClick={() => scrollToSection('contact-section')}
                className="text-left text-white hover:text-[hsl(258,73%,68%)] transition-colors duration-200 font-alata"
              >
                Contact
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
