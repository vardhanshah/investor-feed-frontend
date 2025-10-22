import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, TrendingUp, Building2, TrendingUpIcon, PieChart, Layers } from 'lucide-react';
import { feedsApi, profilesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import PostCard, { Post } from '@/components/PostCard';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/lib/api';

export default function ProfilePage() {
  const [match, params] = useRoute('/profiles/:profileId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 20;

  // Fetch profile details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!params?.profileId) return;

      setIsLoadingProfile(true);
      try {
        const profileData = await profilesApi.getProfile(parseInt(params.profileId));
        setProfile(profileData);
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [params?.profileId, toast]);

  // Fetch posts for this profile
  useEffect(() => {
    const fetchPosts = async () => {
      if (!params?.profileId) return;

      setIsLoadingPosts(true);
      try {
        const response = await feedsApi.getProfileFeed(
          parseInt(params.profileId),
          LIMIT,
          0
        );
        setPosts(response.posts);
        setHasMore(response.posts.length === LIMIT);
        setOffset(response.posts.length);
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [params?.profileId, toast]);

  const handleLoadMore = async () => {
    if (!params?.profileId || isLoadingPosts || !hasMore) return;

    setIsLoadingPosts(true);
    try {
      const response = await feedsApi.getProfileFeed(
        parseInt(params.profileId),
        LIMIT,
        offset
      );
      setPosts(prev => [...prev, ...response.posts]);
      setHasMore(response.posts.length === LIMIT);
      setOffset(prev => prev + response.posts.length);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => setLocation('/home')}
                className="text-foreground hover:bg-muted font-alata"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Feed
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-destructive font-alata text-lg">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation('/home')}
              className="text-foreground hover:bg-muted font-alata"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        {profile && (
          <Card className="bg-card border-border mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-3xl shrink-0">
                  {profile.title[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-alata text-foreground mb-2">{profile.title}</h1>
                  {profile.description && (
                    <p className="text-muted-foreground font-alata mb-4">{profile.description}</p>
                  )}

                  {/* Profile Attributes */}
                  {profile.attributes && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      {/* Market Cap */}
                      {profile.attributes.mcap !== null && profile.attributes.mcap !== undefined && (
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <TrendingUpIcon className="h-5 w-5 text-[hsl(280,100%,70%)]" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-alata">Market Cap</p>
                            <p className="text-lg font-alata font-bold text-foreground">
                              ₹{profile.attributes.mcap.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr
                            </p>
                          </div>
                        </div>
                      )}

                      {/* P/E Ratio */}
                      {profile.attributes.pe_ratio !== null && profile.attributes.pe_ratio !== undefined && (
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <PieChart className="h-5 w-5 text-[hsl(200,100%,70%)]" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-alata">P/E Ratio</p>
                            <p className="text-lg font-alata font-bold text-foreground">
                              {profile.attributes.pe_ratio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Sector */}
                      {profile.attributes.sector && (
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <Building2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-alata">Sector</p>
                            <p className="text-sm font-alata font-semibold text-foreground">
                              {profile.attributes.sector}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Subsector */}
                      {profile.attributes.subsector && (
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-muted/50">
                            <Layers className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-alata">Subsector</p>
                            <p className="text-sm font-alata font-semibold text-foreground">
                              {profile.attributes.subsector}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-alata text-foreground">
            Posts from {profile?.title || 'this profile'}
          </h2>

          {isLoadingPosts && posts.length === 0 ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/6"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                        <div className="h-4 bg-muted rounded w-4/6"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : posts.length === 0 ? (
            // Empty state
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-alata text-foreground mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground font-alata">
                  This profile hasn't posted anything yet
                </p>
              </CardContent>
            </Card>
          ) : (
            // Posts list
            <>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingPosts}
                    className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
                  >
                    {isLoadingPosts ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Posts'
                    )}
                  </Button>
                </div>
              )}

              {/* End of posts message */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-alata">You've seen all posts from this profile</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
