import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getCategoryColor } from "@/lib/utils";
import { formatTimeAgoTwoUnits } from "@/lib/dateUtils";
import { PublicPost } from "@/lib/api";

export default function LiveFeedPreview() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/feeds/public/posts');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPosts(data.posts.slice(0, 6));
      } catch (err) {
        setError('Failed to load feed');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const visibleItems = posts.slice(0, 3);
  const blurredItems = posts.slice(3, 6);

  return (
    <section id="live-feed-preview" className="py-20 bg-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 mb-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-alata text-green-700 dark:text-green-300">Live Feed</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-alata text-foreground mb-4">
            Real-Time Market <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-muted-foreground font-alata max-w-2xl mx-auto">
            See the latest stock exchange filings as they happen. Our system processes thousands of documents daily.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 text-muted-foreground font-alata">
            {error}
          </div>
        )}

        {/* Feed Container */}
        {!loading && !error && (
          <div className="relative">
            {/* Visible Feed Items */}
            <div className="space-y-4">
              {visibleItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getCategoryColor(item.attributes.category)} border font-alata text-xs`}>
                        {item.attributes.category || 'Update'}
                      </Badge>
                      <span className="text-muted-foreground font-alata text-sm">{item.profile.attributes.sector}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm font-alata">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {formatTimeAgoTwoUnits(item.submission_date)}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-alata text-foreground font-medium text-lg mb-1">
                        {item.profile.title}
                        <span className="text-muted-foreground text-sm ml-2">({item.profile.meta_attributes.symbol})</span>
                      </h4>
                      <p className="text-muted-foreground font-alata text-sm leading-relaxed line-clamp-3">
                        {item.content}
                      </p>
                    </div>
                    {item.attributes.growth_related && (
                      <div className="flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Blurred Feed Items with Overlay */}
            {blurredItems.length > 0 && (
              <div className="relative mt-4">
                <div className="space-y-4 blur-sm pointer-events-none select-none">
                  {blurredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-card rounded-xl border border-border"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getCategoryColor(item.attributes.category)} border font-alata text-xs`}>
                            {item.attributes.category || 'Update'}
                          </Badge>
                          <span className="text-muted-foreground font-alata text-sm">{item.profile.attributes.sector}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm font-alata">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {formatTimeAgoTwoUnits(item.submission_date)}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-alata text-foreground font-medium text-lg mb-1">
                            {item.profile.title}
                            <span className="text-muted-foreground text-sm ml-2">({item.profile.meta_attributes.symbol})</span>
                          </h4>
                          <p className="text-muted-foreground font-alata text-sm leading-relaxed line-clamp-3">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overlay CTA */}
                <div className="absolute inset-0 bg-gradient-to-t from-muted via-muted/90 to-transparent flex flex-col items-center justify-center">
                  <div className="text-center px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 border border-purple-200 dark:border-purple-800 rounded-full mb-4">
                      <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-alata text-foreground mb-2">
                      Unlock Full Feed Access
                    </h3>
                    <p className="text-muted-foreground font-alata mb-6 max-w-md">
                      Create an account to see all updates, set alerts, and never miss important company updates.
                    </p>
                    <Link href="/signup">
                      <Button
                        size="lg"
                        className="gradient-bg hover:opacity-90 text-white font-alata px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Create Account to Unlock
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
