import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Loader2, TrendingUp, Radio, Sun, Moon, Plus, X, Edit2 } from 'lucide-react';
import { FaCog as FaCogIcon, FaSignOutAlt as FaSignOutAltIcon } from 'react-icons/fa';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { feedsApi, feedConfigApi, subscriptionsApi, FeedConfiguration, Subscription } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import PostCard, { Post } from '@/components/PostCard';
import { useToast } from '@/hooks/use-toast';
import FeedSidebar from '@/components/FeedSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Feed() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [feedConfigs, setFeedConfigs] = useState<FeedConfiguration[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState<FeedConfiguration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingFeedId, setEditingFeedId] = useState<number | null>(null);
  const [subscribedFeeds, setSubscribedFeeds] = useState<Set<number>>(new Set());

  const LIMIT = 20;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  // Load all feed configurations
  useEffect(() => {
    const loadFeeds = async () => {
      if (user) {
        try {
          const configs = await feedConfigApi.listFeedConfigurations();
          setFeedConfigs(configs);

          // Try to restore previously selected feed from localStorage
          const savedFeedId = localStorage.getItem('selectedFeedId');
          let feedToSelect = null;

          if (savedFeedId) {
            // Check if the saved feed still exists
            feedToSelect = configs.find(f => f.id === parseInt(savedFeedId));
          }

          // If no saved feed or saved feed doesn't exist, use default or first feed
          if (!feedToSelect) {
            feedToSelect = configs.find(f => f.is_default) || configs[0];
          }

          if (feedToSelect) {
            setSelectedFeedId(feedToSelect.id);
          } else {
            setError('No feed configurations available. Please create a feed first.');
          }
        } catch (err) {
          const errorInfo = getErrorMessage(err);
          setError(errorInfo.message);
          toast({
            variant: 'destructive',
            title: errorInfo.title,
            description: errorInfo.message,
          });
        } finally {
          setIsLoadingFeeds(false);
        }
      }
    };

    loadFeeds();
  }, [user, toast]);

  // Load user subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (user) {
        try {
          const subscriptions = await subscriptionsApi.getUserSubscriptions();
          const feedIds = new Set(subscriptions.map(sub => sub.feed_id));
          setSubscribedFeeds(feedIds);
        } catch (err) {
          console.error('Failed to load subscriptions:', err);
          // Don't show error toast for subscriptions - it's not critical
        }
      }
    };

    loadSubscriptions();
  }, [user]);

  // Fetch posts from a feed
  const fetchPosts = async (feedId: number, currentOffset: number = 0) => {
    try {
      setError(null);
      const response = await feedsApi.getFeedPosts(feedId, LIMIT, currentOffset);

      if (currentOffset === 0) {
        // Initial load
        setPosts(response.posts);
      } else {
        // Load more
        setPosts(prev => [...prev, ...response.posts]);
      }

      // Check if there are more posts
      setHasMore(response.posts.length === LIMIT);
      setOffset(currentOffset + response.posts.length);
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

  // Load posts when feed is selected
  useEffect(() => {
    const loadPosts = async () => {
      if (selectedFeedId) {
        setIsLoadingPosts(true);
        setOffset(0);
        await fetchPosts(selectedFeedId, 0);
      }
    };

    loadPosts();
  }, [selectedFeedId]);

  const handleLoadMore = () => {
    if (!isLoadingPosts && hasMore && selectedFeedId) {
      setIsLoadingPosts(true);
      fetchPosts(selectedFeedId, offset);
    }
  };

  const handleFeedSelect = (feedId: number) => {
    setSelectedFeedId(feedId);
    // Save to localStorage for persistence across refreshes
    localStorage.setItem('selectedFeedId', feedId.toString());
  };

  const handleDeleteClick = (feed: FeedConfiguration, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent feed selection when clicking delete
    setFeedToDelete(feed);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedToDelete) return;

    setIsDeleting(true);
    try {
      await feedConfigApi.deleteFeedConfiguration(feedToDelete.id);

      toast({
        title: 'Success',
        description: `Feed "${feedToDelete.name}" deleted successfully`,
      });

      // Remove the feed from the list
      const updatedFeeds = feedConfigs.filter(f => f.id !== feedToDelete.id);
      setFeedConfigs(updatedFeeds);

      // If the deleted feed was selected, select another one
      if (selectedFeedId === feedToDelete.id) {
        const nextFeed = updatedFeeds.find(f => f.is_default) || updatedFeeds[0];
        if (nextFeed) {
          setSelectedFeedId(nextFeed.id);
          localStorage.setItem('selectedFeedId', nextFeed.id.toString());
        } else {
          setSelectedFeedId(null);
          localStorage.removeItem('selectedFeedId');
          setPosts([]);
        }
      }

      setDeleteDialogOpen(false);
      setFeedToDelete(null);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleEditClick = (feed: FeedConfiguration, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent feed selection when clicking edit
    setEditingFeedId(feed.id);
    setIsSidebarOpen(true);
  };

  const handleFeedCreated = async () => {
    // Reload feed configurations and refresh the feed posts
    try {
      const configs = await feedConfigApi.listFeedConfigurations();
      setFeedConfigs(configs);

      if (editingFeedId) {
        // When editing, reload posts for the current feed to show updated results
        setIsLoadingPosts(true);
        setOffset(0);
        await fetchPosts(editingFeedId, 0);
        // Keep editing state - don't close sidebar
      } else {
        // When creating, select the newly created feed (last one in the list)
        if (configs.length > 0) {
          const newFeed = configs[configs.length - 1];
          setSelectedFeedId(newFeed.id);
          localStorage.setItem('selectedFeedId', newFeed.id.toString());
        }
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setEditingFeedId(null);
  };

  const handleNewFeedClick = () => {
    setEditingFeedId(null);
    setIsSidebarOpen(true);
  };

  const handleSubscribeToggle = async (feed: FeedConfiguration, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent feed selection when clicking bell

    const isSubscribed = subscribedFeeds.has(feed.id);

    try {
      if (isSubscribed) {
        await subscriptionsApi.unsubscribeFromFeed(feed.id);
        setSubscribedFeeds(prev => {
          const newSet = new Set(prev);
          newSet.delete(feed.id);
          return newSet;
        });
        toast({
          title: 'Unsubscribed',
          description: `You will no longer receive notifications for "${feed.name}"`,
        });
      } else {
        await subscriptionsApi.subscribeToFeed(feed.id);
        setSubscribedFeeds(prev => new Set(prev).add(feed.id));
        toast({
          title: 'Subscribed',
          description: `You will now receive notifications for "${feed.name}"`,
        });
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => setLocation('/')}
            >
              <div className="flex items-center">
                <span className="text-2xl font-alata font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[hsl(280,100%,70%)] group-hover:to-[hsl(200,100%,70%)] transition-all">
                  Investor Feed
                </span>
              </div>
              {user.isPremium && (
                <Badge className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black text-xs">
                  PRO
                </Badge>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => {
                  toast({
                    title: 'Settings',
                    description: 'Settings page coming soon!',
                  });
                }}
              >
                <FaCogIcon className="h-5 w-5" />
              </Button>

              {/* User Profile Button */}
              <div
                className="h-8 w-8 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity ml-2"
                onClick={() => setLocation(`/users/${user.user_id}`)}
                title="My Profile"
              >
                {user.email[0].toUpperCase()}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-muted font-alata transition-colors"
              >
                <FaSignOutAltIcon className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className={`flex gap-6 ${isSidebarOpen ? 'max-w-full' : 'max-w-4xl mx-auto'}`}>
          {/* Left Side - Feed Content */}
          <div className={`transition-all duration-500 ease-in-out ${isSidebarOpen ? 'flex-1 min-w-0' : 'w-full'}`}>
            {/* Feed Selector */}
            {isLoadingFeeds ? (
              <div className="mb-4 flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(280,100%,70%)]" />
              </div>
            ) : feedConfigs.length > 0 ? (
              <div className="mb-4 overflow-x-auto">
                <div className="flex items-center space-x-2 pb-2">
                  {/* Feed Tabs */}
                  {feedConfigs.map((feed) => (
                    <div key={feed.id} className="relative group">
                      <Button
                        variant={selectedFeedId === feed.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFeedSelect(feed.id)}
                        className={
                          selectedFeedId === feed.id
                            ? "bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black font-alata border-0 whitespace-nowrap pr-20"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted font-alata whitespace-nowrap pr-20"
                        }
                      >
                        {feed.name}
                        {feed.is_default && (
                          <Badge className="ml-2 bg-background/20 text-inherit text-xs border-0">
                            Default
                          </Badge>
                        )}
                      </Button>
                      {/* Action buttons - show for all feeds */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Bell icon - show for all non-default feeds */}
                        {!feed.is_default && (
                          <button
                            onClick={(e) => handleSubscribeToggle(feed, e)}
                            className={`p-1 rounded-full ${
                              selectedFeedId === feed.id
                                ? 'hover:bg-black/10 text-black'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                            title={subscribedFeeds.has(feed.id) ? "Unsubscribe from notifications" : "Subscribe to notifications"}
                          >
                            {subscribedFeeds.has(feed.id) ? (
                              <Bell className="h-3 w-3 fill-current" />
                            ) : (
                              <BellOff className="h-3 w-3" />
                            )}
                          </button>
                        )}
                        {/* Edit and Delete buttons - only for non-default feeds */}
                        {!feed.is_default && (
                          <>
                            <button
                              onClick={(e) => handleEditClick(feed, e)}
                              className={`p-1 rounded-full ${
                                selectedFeedId === feed.id
                                  ? 'hover:bg-black/10 text-black'
                                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                              title="Edit feed"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(feed, e)}
                              className={`p-1 rounded-full ${
                                selectedFeedId === feed.id
                                  ? 'hover:bg-black/10 text-black'
                                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                              }`}
                              title="Delete feed"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Create New Feed Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewFeedClick}
                    className="border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted font-alata whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Feed
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Live Updates Header */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* Live Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Radio className="h-5 w-5 text-[hsl(280,100%,70%)]" />
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(280,100%,70%)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(280,100%,70%)]"></span>
                    </span>
                  </div>
                  <h1 className="text-xl font-alata font-bold text-foreground">
                    Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)]">Pulse</span>
                  </h1>
                </div>

                {/* Post Count */}
                <Badge variant="outline" className="border-border text-muted-foreground font-alata">
                  {posts.length} updates
                </Badge>
              </div>

            </div>

            {/* Posts List */}
            <div className="space-y-4">
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
          ) : error && posts.length === 0 ? (
            // Error state
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="text-destructive mb-4">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-alata mb-2 text-foreground">Failed to Load Posts</h3>
                  <p className="text-muted-foreground font-alata mb-4">{error}</p>
                  <Button
                    onClick={async () => {
                      if (selectedFeedId) {
                        setIsLoadingPosts(true);
                        await fetchPosts(selectedFeedId, 0);
                      }
                    }}
                    className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            // Empty state
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-alata text-foreground mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground font-alata">
                  Check back later for market updates and insights
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

              {/* End of feed message */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-alata">You've reached the end of your feed</p>
                </div>
              )}
            </>
          )}
            </div>
          </div>

          {/* Vertical Divider */}
          {isSidebarOpen && (
            <div className="w-px bg-border flex-shrink-0 animate-in fade-in duration-500"></div>
          )}

          {/* Right Side - Sidebar */}
          {isSidebarOpen && (
            <div className="w-[480px] flex-shrink-0 animate-in slide-in-from-right duration-500">
              <FeedSidebar
                isOpen={isSidebarOpen}
                onClose={handleSidebarClose}
                onFeedCreated={handleFeedCreated}
                editingFeedId={editingFeedId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-alata">Delete Feed</DialogTitle>
            <DialogDescription className="text-muted-foreground font-alata">
              Are you sure you want to delete "{feedToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-border text-foreground hover:bg-muted font-alata"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-alata"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
