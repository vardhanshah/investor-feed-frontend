import { useState, useEffect } from "react";
import { Users, Eye } from "lucide-react";

// Custom hook for animated counters
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return count;
}

const stats = [
  {
    icon: Users,
    value: 9500,
    suffix: '+',
    label: 'Investors Trust Us',
    color: 'text-purple-400',
  },
  {
    icon: Eye,
    value: 13300000,
    format: 'millions',
    suffix: '+',
    label: 'Impressions',
    color: 'text-cyan-400',
  },
];

export default function SocialProof() {
  const counters = {
    investors: useAnimatedCounter(9500),
    impressions: useAnimatedCounter(13300000),
  };

  const formatValue = (value: number, format?: string) => {
    if (format === 'millions') {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getCounterValue = (index: number) => {
    const keys = ['investors', 'impressions'] as const;
    return counters[keys[index]];
  };

  return (
    <section id="stats-section" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-alata text-foreground mb-4">
            Trusted by{' '}
            <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-muted-foreground font-alata max-w-2xl mx-auto text-lg">
            Join a growing community of investors who rely on us for timely market intelligence.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-muted rounded-2xl border border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-center mb-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl lg:text-3xl font-alata text-foreground font-bold mb-1">
                {formatValue(getCounterValue(index), stat.format)}
                {stat.suffix}
              </div>
              <div className="text-xs lg:text-sm text-muted-foreground font-alata">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
