import { useState, useEffect } from "react";
import { Menu, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
    <header className={`sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 gradient-bg rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-alata font-medium text-foreground">
              Investor Feed
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('stats-section')}
                className="text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                Impact
              </button>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary hover:bg-transparent font-alata"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="gradient-bg hover:opacity-90 text-white font-alata"
                >
                  Create Account
                </Button>
              </Link>
            </nav>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('stats-section')}
                className="text-left text-foreground hover:text-primary transition-colors duration-200 font-alata"
              >
                Impact
              </button>
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted font-alata"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    className="w-full gradient-bg hover:opacity-90 text-white font-alata"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
