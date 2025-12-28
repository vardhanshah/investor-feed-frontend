import { FaTwitter } from "react-icons/fa";
import { Users, Heart, Bookmark, MessageCircle, Eye } from "lucide-react";
import { useState, useEffect } from "react";

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

export default function Follow() {
  const followers = useAnimatedCounter(6000);
  const impressions = useAnimatedCounter(6500000);
  const likes = useAnimatedCounter(25000);
  const bookmarks = useAnimatedCounter(6000);
  const posts = useAnimatedCounter(30000);

  return (
    <section id="follow" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-alata text-foreground mb-12">
            Why Follow <span className="gradient-text">Us?</span>
          </h2>

          {/* Services Section */}
          <div className="mb-16 bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-2xl font-alata text-foreground mb-4">Real-Time Market <span className="gradient-text">Intelligence</span></h3>
            <p className="text-muted-foreground font-alata mb-6 text-lg">
              Get critical updates within <span className="text-primary font-bold">2-5 minutes</span> from Indian Stock Exchange announcements
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center p-4 bg-muted rounded-lg border border-border">
                <span className="text-2xl mr-3">🏭</span>
                <div>
                  <h4 className="font-alata text-foreground font-semibold">Capacity Expansion</h4>
                  <p className="text-muted-foreground text-sm font-alata">Production growth insights</p>
                </div>
                <span className="text-2xl ml-auto">📈</span>
              </div>

              <div className="flex items-center p-4 bg-muted rounded-lg border border-border">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <h4 className="font-alata text-foreground font-semibold">Order Books</h4>
                  <p className="text-muted-foreground text-sm font-alata">Contract & demand analysis</p>
                </div>
                <span className="text-2xl ml-auto">📝</span>
              </div>

              <div className="flex items-center p-4 bg-muted rounded-lg border border-border">
                <span className="text-2xl mr-3">🔮</span>
                <div>
                  <h4 className="font-alata text-foreground font-semibold">Future Guidance</h4>
                  <p className="text-muted-foreground text-sm font-alata">Forward-looking projections</p>
                </div>
                <span className="text-2xl ml-auto">🧭</span>
              </div>

              <div className="flex items-center p-4 bg-muted rounded-lg border border-border">
                <span className="text-2xl mr-3">💰</span>
                <div>
                  <h4 className="font-alata text-foreground font-semibold">Financial Results</h4>
                  <p className="text-muted-foreground text-sm font-alata">Quarterly & annual data</p>
                </div>
                <span className="text-2xl ml-auto">📊</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg border border-border">
                <div className="text-2xl font-alata text-primary font-bold">Thousands</div>
                <div className="text-sm text-muted-foreground font-alata">Documents processed everyday</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg border border-border">
                <div className="text-2xl font-alata text-cyan-500 font-bold">4 Lakh+</div>
                <div className="text-sm text-muted-foreground font-alata">Documents processed so far</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg border border-border">
                <div className="text-2xl font-alata text-pink-500 font-bold">30K+</div>
                <div className="text-sm text-muted-foreground font-alata">Updates delivered till today</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground font-alata mb-4">
                Follow on <span className="gradient-text font-bold">Twitter</span> to get real-time updates
              </p>
              <a
                href="https://twitter.com/_Investor_Feed_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 gradient-bg hover:opacity-90 text-white font-alata rounded-lg transition-all duration-200"
              >
                <FaTwitter className="mr-2" />
                Follow @_Investor_Feed_
              </a>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mb-16">
            <h3 id="stats-section" className="text-3xl lg:text-4xl font-alata text-foreground mb-8 text-center pt-20">Our <span className="gradient-text">Impact</span></h3>
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-primary w-6 h-6 mr-2" />
                </div>
                <div className="text-3xl font-alata text-foreground font-bold">
                  {followers.toLocaleString()}+
                </div>
                <div className="text-sm text-muted-foreground font-alata">Followers</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="text-cyan-500 w-6 h-6 mr-2" />
                </div>
                <div className="text-3xl font-alata text-foreground font-bold">
                  {(impressions / 1000000).toFixed(1)}M+
                </div>
                <div className="text-sm text-muted-foreground font-alata">Impressions</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="text-pink-500 w-6 h-6 mr-2" />
                </div>
                <div className="text-3xl font-alata text-foreground font-bold">
                  {(likes / 1000).toFixed(0)}K+
                </div>
                <div className="text-sm text-muted-foreground font-alata">Likes</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bookmark className="text-primary w-6 h-6 mr-2" />
                </div>
                <div className="text-3xl font-alata text-foreground font-bold">
                  {(bookmarks / 1000).toFixed(0)}K+
                </div>
                <div className="text-sm text-muted-foreground font-alata">Bookmarks</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="text-cyan-500 w-6 h-6 mr-2" />
                </div>
                <div className="text-3xl font-alata text-foreground font-bold">
                  {(posts / 1000).toFixed(0)}K+
                </div>
                <div className="text-sm text-muted-foreground font-alata">Posts</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-muted rounded-lg">
                <span className="text-primary font-alata text-sm font-medium mr-2">Engagement Rate:</span>
                <span className="text-foreground font-alata text-sm font-bold">4.5%</span>
              </div>
            </div>
            </div>
          </div>



          {/* Contact & Support Section */}
          <div id="contact-section" className="mt-16 bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-2xl font-alata text-foreground mb-6 text-center">Get in Touch</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h4 className="text-lg font-alata text-foreground mb-3">Contact Us</h4>
                <p className="text-muted-foreground font-alata mb-4">Have questions or suggestions?</p>
                <a
                  href="mailto:investor@investorfeed.in"
                  className="inline-flex items-center px-6 py-3 bg-muted hover:bg-muted/80 text-primary font-alata rounded-lg transition-colors duration-200"
                >
                  investor@investorfeed.in
                </a>
              </div>

              <div className="text-center">
                <h4 className="text-lg font-alata text-foreground mb-3">Support Our Work</h4>
                <p className="text-muted-foreground font-alata mb-4">Help us continue providing valuable insights</p>
                <a
                  href="https://pages.razorpay.com/pl_PWmbKVx0mTStf4/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 gradient-bg hover:opacity-90 text-white font-alata rounded-lg transition-all duration-200"
                >
                  Tip Us
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <div className="mb-4 flex justify-center space-x-6">
              <a
                href="/terms"
                className="text-muted-foreground hover:text-primary font-alata text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="text-muted-foreground hover:text-primary font-alata text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-muted-foreground font-alata text-sm">
              &copy; 2025 Investor Feed. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
