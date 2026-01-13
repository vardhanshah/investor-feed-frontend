import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";

export default function HeroNew() {
  const scrollToFeed = () => {
    const element = document.getElementById('live-feed-preview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-cyan-50 dark:from-purple-950/20 dark:via-background dark:to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100 dark:bg-cyan-900/20 rounded-full blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 border border-purple-200 dark:border-purple-800 rounded-full">
            <Zap className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-alata text-muted-foreground">
              Updates within <span className="text-primary font-semibold">2 minutes</span> of BSE filings
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-alata font-medium text-foreground mb-6 leading-tight">
            See Through the{' '}
            <span className="gradient-text">Noise</span>
          </h1>

          {/* Taglines */}
          <div className="space-y-3 mb-12 max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl lg:text-2xl font-alata text-muted-foreground">
              Track market updates <span className="text-foreground">instantaneously</span>
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-alata text-muted-foreground">
              Find <span className="text-foreground">hidden opportunities</span>. Understand company journeys.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link href="/signup">
              <Button
                size="lg"
                className="gradient-bg hover:opacity-90 text-white font-alata text-lg px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Tracking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeed}
              className="border-border text-foreground hover:bg-muted font-alata text-lg px-8 py-6 rounded-xl"
            >
              See Live Feed
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              <span className="font-alata text-sm">Live Updates</span>
            </div>
            <div className="flex items-center">
              <span className="font-alata text-sm">9.5K+ Investors Trust Us</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
