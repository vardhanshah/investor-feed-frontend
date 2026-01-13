import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Loader2, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useLocation } from "wouter";
import { getCategoryColor } from "@/lib/utils";
import { formatTimeAgoTwoUnits } from "@/lib/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { PublicPost, API_BASE_URL } from "@/lib/api";
import SEO from "@/components/SEO";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect authenticated users to feed
  useEffect(() => {
    if (!authLoading && user) {
      setLocation('/home');
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/feeds/public/posts');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPosts(data.posts.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Show loading while checking auth to prevent flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      <SEO
        title="Welcome"
        description="Cut through market noise with Investor Feed. Real-time company filings delivered within 1-2 minutes."
        canonical="/welcome"
      />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Branding - Always first */}
          <div className="order-1 lg:order-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 gradient-bg rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-alata font-semibold text-foreground">
                Investor Feed
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-alata text-foreground leading-tight">
              See Through<br />
              <span className="gradient-text">the Noise.</span>
            </h1>
            {/* Value props - subtle badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-muted-foreground font-alata px-2 py-1 bg-muted rounded-full">
                Real-time updates
              </span>
              <span className="text-xs text-muted-foreground font-alata px-2 py-1 bg-muted rounded-full">
                Track company journeys
              </span>
              <span className="text-xs text-muted-foreground font-alata px-2 py-1 bg-muted rounded-full">
                Smart filters
              </span>
            </div>
          </div>

          {/* Login Form - order-2 on mobile, order-2 on desktop (right column, spans 2 rows) */}
          <div className="flex justify-center lg:justify-end order-2 lg:order-2 lg:row-span-2">
            <div className="w-full max-w-md">
              <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
                <h2 className="text-xl font-alata text-foreground mb-6 text-center">
                  Get started with Investor Feed
                </h2>

                {/* Social Login Options */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 border-border bg-card text-foreground hover:bg-muted font-alata text-base rounded-lg flex items-center justify-center gap-3"
                    onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
                  >
                    <FaGoogle className="w-5 h-5 text-[#4285F4]" />
                    Continue with Google
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12 border-border bg-card text-foreground hover:bg-muted font-alata text-base rounded-lg flex items-center justify-center gap-3"
                    onClick={() => window.location.href = `${API_BASE_URL}/auth/twitter`}
                  >
                    <FaXTwitter className="w-5 h-5" />
                    Continue with X
                  </Button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-alata">or</span>
                  </div>
                </div>

                {/* Manual Login/Signup */}
                <div className="space-y-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-border bg-card text-foreground hover:bg-muted font-alata text-base rounded-lg flex items-center justify-center gap-3"
                    >
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      Sign in with Email
                    </Button>
                  </Link>

                  <Link href="/signup">
                    <Button
                      className="w-full h-12 gradient-bg hover:opacity-90 text-white font-alata text-base rounded-lg"
                    >
                      Create new account
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground font-alata">
                <a
                  href="https://twitter.com/_Investor_Feed_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  9.5K+ Investors
                </a>
              </div>
            </div>
          </div>

          {/* Live Feed Preview - order-3 on mobile, order-3 on desktop (left column) */}
          <div className="order-3 lg:order-3">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-alata text-muted-foreground">Live Feed</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-alata">Real-time updates</span>
                </div>
                {/* Filter chips - showing filtering capability */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-alata px-2 py-0.5 bg-muted rounded border border-border">
                    All Companies
                  </span>
                  <span className="text-[10px] text-muted-foreground font-alata px-2 py-0.5 bg-muted rounded border border-border">
                    All Updates
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`px-4 py-3 hover:bg-muted transition-colors ${index >= 3 ? 'opacity-50 blur-[2px]' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-alata font-medium text-foreground text-sm truncate">
                              {post.profile.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {post.profile.meta_attributes.symbol}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-alata line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge className={`${getCategoryColor(post.attributes.category)} border font-alata text-xs px-2 py-0.5`}>
                            {post.attributes.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgoTwoUnits(post.submission_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-alata">
            <Link href="/terms">
              <span className="hover:text-primary cursor-pointer">Terms</span>
            </Link>
            <Link href="/privacy">
              <span className="hover:text-primary cursor-pointer">Privacy</span>
            </Link>
            <Link href="/contact">
              <span className="hover:text-primary cursor-pointer">Contact</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground font-alata">
            &copy; 2025 Investor Feed
          </p>
        </div>
      </footer>
      </div>
    </>
  );
}
