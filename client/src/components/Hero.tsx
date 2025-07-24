import { Button } from "@/components/ui/button";
import { FaTwitter } from "react-icons/fa";

export default function Hero() {
  return (
    <section id="home" className="relative py-20 lg:py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in">
          {/* Main Title */}
          <div className="mb-12">
            <h1 className="text-5xl lg:text-8xl font-alata font-medium text-white mb-8">
              Investor Feed
            </h1>
          </div>
          
          {/* Main Taglines */}
          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            <h2 className="text-2xl lg:text-4xl font-alata text-white leading-relaxed">
              Follow us to <span className="gradient-text">see through the clutter</span>
            </h2>
            <h3 className="text-2xl lg:text-4xl font-alata text-white leading-relaxed">
              Follow us to <span className="gradient-text">stay ahead</span>
            </h3>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata text-lg px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
