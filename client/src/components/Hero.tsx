import { Button } from "@/components/ui/button";
import { FaTwitter } from "react-icons/fa";

export default function Hero() {
  return (
    <section id="home" className="relative py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          {/* Logo Display */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 mr-4">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17L9 11L13 15L21 7" stroke="url(#hero-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 7L21 7L21 12" stroke="url(#hero-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(258, 60%, 52%)" />
                    <stop offset="100%" stopColor="hsl(258, 73%, 68%)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-4xl lg:text-6xl font-alata font-medium" style={{ color: 'hsl(258, 60%, 52%)' }}>
              Investor Feed
            </h1>
          </div>
          
          {/* Main Taglines */}
          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            <h2 className="text-2xl lg:text-4xl font-alata text-gray-900 leading-relaxed">
              Follow us to <span className="gradient-text">see through the clutter</span>
            </h2>
            <h3 className="text-2xl lg:text-4xl font-alata text-gray-900 leading-relaxed">
              Follow us to <span className="gradient-text">stay ahead</span>
            </h3>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up">
            <Button
              asChild
              size="lg"
              className="bg-[hsl(258,60%,52%)] hover:bg-[hsl(258,73%,68%)] text-white font-alata text-lg px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <a 
                href="https://x.com/_Investor_Feed_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <FaTwitter className="mr-3 text-xl" />
                Follow on Twitter
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
