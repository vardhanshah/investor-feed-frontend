import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Loader2, TrendingUp, Radio, Sun, Moon, Plus, X, Edit2, ArrowUp } from 'lucide-react';
import { FaCog as FaCogIcon } from 'react-icons/fa';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { feedsApi, feedConfigApi, subscriptionsApi, adsApi, FeedConfiguration, Subscription, ProfilesAttributesMetadata, PostAttributesMetadata, AdsConfig } from '@/lib/api';
import { AdUnit } from '@/components/AdUnit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getErrorMessage } from '@/lib/errorHandler';
import { getInitials } from '@/lib/utils';
import PostCard, { Post } from '@/components/PostCard';
import { useToast } from '@/hooks/use-toast';
import { FEED_MESSAGES } from '@/lib/messages';
import FeedSidebar from '@/components/FeedSidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { ProfileSearch } from '@/components/ProfileSearch';
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
  const { user, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [profilesAttributesMetadata, setProfilesAttributesMetadata] = useState<ProfilesAttributesMetadata | undefined>();
  const [postsAttributesMetadata, setPostsAttributesMetadata] = useState<PostAttributesMetadata | undefined>();
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
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [showNewPostsButton, setShowNewPostsButton] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const latestPostId = useRef<number | null>(null);
  const touchStartY = useRef<number>(0);

  // Login prompt state for unauthenticated users
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptFeature, setLoginPromptFeature] = useState('');

  const LIMIT = 20;
  const NEW_POSTS_CHECK_INTERVAL = 30000; // Check for new posts every 30 seconds
  const PULL_THRESHOLD = 80; // Pixels to pull before triggering refresh

  // Public mode - when user is not authenticated
  const isPublicMode = !user;

  // Fetch ads configuration after initial render - deferred to improve LCP
  useEffect(() => {
    // Defer ads config fetch to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      adsApi.getConfig()
        .then(setAdsConfig)
        .catch(err => console.error('Failed to load ads config:', err));
    }, 100); // Small delay to let initial content render first

    return () => clearTimeout(timeoutId);
  }, []);

  // Load all feed configurations (only for authenticated users)
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
          if (errorInfo.title) {
            setError(errorInfo.message);
            toast({
              variant: 'destructive',
              title: errorInfo.title,
              description: errorInfo.message,
            });
          }
        } finally {
          setIsLoadingFeeds(false);
        }
      } else {
        // For public mode, no feed configs needed
        setIsLoadingFeeds(false);
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

  // Fetch posts from a feed (or public feed for unauthenticated users)
  const fetchPosts = async (feedId: number | null, currentOffset: number = 0, sort_by?: string, sort_order?: 'asc' | 'desc') => {
    try {
      setError(null);

      // Use public feed API for unauthenticated users, otherwise use user's feed
      const response = isPublicMode
        ? await feedsApi.getPublicFeedPosts(LIMIT, currentOffset, sort_by, sort_order)
        : await feedsApi.getFeedPosts(feedId!, LIMIT, currentOffset, sort_by, sort_order);

      if (currentOffset === 0) {
        // Initial load
        setPosts(response.posts);
        // Store response-level metadata
        setProfilesAttributesMetadata(response.profiles_attributes_metadata);
        setPostsAttributesMetadata(response.posts_attributes_metadata);
        // Track latest post ID for new posts detection
        if (response.posts.length > 0) {
          latestPostId.current = response.posts[0].id;
        }
        setShowNewPostsButton(false);
        setNewPostsCount(0);
      } else {
        // Load more
        setPosts(prev => [...prev, ...response.posts]);
      }

      // Check if there are more posts
      setHasMore(response.posts.length === LIMIT);
      setOffset(currentOffset + response.posts.length);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      if (errorInfo.title) {
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Load posts when feed is selected or sort changes (or on initial load for public mode)
  useEffect(() => {
    const loadPosts = async () => {
      // For public mode, load immediately without needing a selected feed
      // For authenticated mode, wait for a feed to be selected
      if (isPublicMode || selectedFeedId) {
        setIsLoadingPosts(true);
        setOffset(0);
        await fetchPosts(selectedFeedId, 0, sortBy, sortOrder);
      }
    };

    loadPosts();
  }, [selectedFeedId, sortBy, sortOrder, isPublicMode]);

  // Scroll detection for "new posts" button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsAtTop(scrollTop < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pull-to-refresh touch handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const diff = touchY - touchStartY.current;

      if (diff > 0 && window.scrollY === 0) {
        // Apply resistance - pull distance is less than actual finger movement
        const resistance = 0.4;
        setPullDistance(Math.min(diff * resistance, PULL_THRESHOLD * 1.5));

        // Prevent default scroll when pulling
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= PULL_THRESHOLD && selectedFeedId && !isRefreshing) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD); // Keep showing spinner

        try {
          setShowNewPostsButton(false);
          setNewPostsCount(0);
          setOffset(0);
          await fetchPosts(selectedFeedId, 0, sortBy, sortOrder);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Reset without refresh
        setPullDistance(0);
      }
      setIsPulling(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance, selectedFeedId, sortBy, sortOrder]);

  // Periodic check for new posts by polling the API
  useEffect(() => {
    // For authenticated users, need selectedFeedId; for public mode, always run
    if (!isPublicMode && !selectedFeedId) return;

    const checkForNewPosts = async () => {
      try {
        // Fetch just 1 post to check if there's something newer
        const response = isPublicMode
          ? await feedsApi.getPublicFeedPosts(1, 0, sortBy, sortOrder)
          : await feedsApi.getFeedPosts(selectedFeedId!, 1, 0, sortBy, sortOrder);

        if (response.posts.length > 0 && latestPostId.current !== null) {
          const newestPostId = response.posts[0].id;

          // If the newest post ID is different and greater than what we have, there are new posts
          if (newestPostId !== latestPostId.current && newestPostId > latestPostId.current) {
            // Count how many new posts (fetch a few more to count)
            const countResponse = isPublicMode
              ? await feedsApi.getPublicFeedPosts(10, 0, sortBy, sortOrder)
              : await feedsApi.getFeedPosts(selectedFeedId!, 10, 0, sortBy, sortOrder);
            let count = 0;
            for (const post of countResponse.posts) {
              if (post.id > latestPostId.current!) {
                count++;
              } else {
                break;
              }
            }
            setNewPostsCount(count);
            setShowNewPostsButton(true);
          }
        }
      } catch (err) {
        // Silently fail - don't disrupt user experience
        console.error('Failed to check for new posts:', err);
      }
    };

    const checkInterval = setInterval(checkForNewPosts, NEW_POSTS_CHECK_INTERVAL);

    return () => clearInterval(checkInterval);
  }, [selectedFeedId, isPublicMode, sortBy, sortOrder]);

  // Handle refresh for new posts
  const handleRefreshPosts = useCallback(async () => {
    // For public mode, don't need selectedFeedId
    if (!isPublicMode && !selectedFeedId) return;

    setShowNewPostsButton(false);
    setNewPostsCount(0);
    setIsLoadingPosts(true);
    setOffset(0);
    await fetchPosts(selectedFeedId, 0, sortBy, sortOrder);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedFeedId, sortBy, sortOrder, isPublicMode]);

  const handleLoadMore = () => {
    // For public mode, don't need selectedFeedId
    if (!isLoadingPosts && hasMore && (isPublicMode || selectedFeedId)) {
      setIsLoadingPosts(true);
      fetchPosts(selectedFeedId, offset, sortBy, sortOrder);
    }
  };

  const handleFeedSelect = (feedId: number) => {
    setSelectedFeedId(feedId);
    // Reset sort to default when changing feeds
    setSortBy(undefined);
    setSortOrder(undefined);
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

      toast(FEED_MESSAGES.DELETED(feedToDelete.name));

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
      if (errorInfo.title) {
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (feed: FeedConfiguration, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent feed selection when clicking edit
    setEditingFeedId(feed.id);
    setIsSidebarOpen(true);
  };

  const handleFeedCreated = async (feedId?: number) => {
    // Reload feed configurations and refresh the feed posts
    try {
      const configs = await feedConfigApi.listFeedConfigurations();
      setFeedConfigs(configs);

      if (feedId) {
        // Select the created/updated feed by its ID
        setSelectedFeedId(feedId);
        // Reset sort to default for new/updated feed
        setSortBy(undefined);
        setSortOrder(undefined);
        localStorage.setItem('selectedFeedId', feedId.toString());

        // Reload posts for the feed (useEffect will handle this due to state changes)
        setIsLoadingPosts(true);
        setOffset(0);
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      if (errorInfo.title) {
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      }
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setEditingFeedId(null);
  };

  const handleNewFeedClick = () => {
    // Navigate to full-page filters for creating new feed
    // Login is only required when trying to save the feed on /filters
    setLocation('/filters');
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
        toast(FEED_MESSAGES.UNSUBSCRIBED(feed.name));
      } else {
        await subscriptionsApi.subscribeToFeed(feed.id);
        setSubscribedFeeds(prev => new Set(prev).add(feed.id));
        toast(FEED_MESSAGES.SUBSCRIBED(feed.name));
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      if (errorInfo.title) {
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      }
    }
  };

  // Show skeleton while checking auth - improves LCP by showing content structure immediately
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background transition-colors overflow-x-hidden">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg gradient-bg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-alata font-bold text-foreground">
                  Investor Feed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Feed tabs skeleton */}
            <div className="mb-4 flex space-x-2">
              <div className="h-8 w-24 rounded-md bg-muted animate-pulse"></div>
              <div className="h-8 w-32 rounded-md bg-muted animate-pulse"></div>
            </div>

            {/* Posts skeleton */}
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setLocation('/')}
            >
              <div className="p-1.5 rounded-lg gradient-bg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-alata font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[hsl(280,100%,70%)] group-hover:to-[hsl(200,100%,70%)] transition-all">
                Investor Feed
              </span>
              {user?.isPremium && (
                <Badge className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black text-xs">
                  PRO
                </Badge>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-1">
              {/* Theme toggle - always show */}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-8 w-8" />
                ) : (
                  <Moon className="h-8 w-8" />
                )}
              </Button>

              {user ? (
                // Authenticated user actions
                <>
                  <NotificationBell />
                  <ProfileSearch />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setLocation('/settings')}
                  >
                    <FaCogIcon className="h-8 w-8" />
                  </Button>

                  {/* User Profile Button */}
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ml-1"
                      onClick={() => setLocation(`/users/${user.user_id}`)}
                      title="My Profile"
                    />
                  ) : (
                    <div
                      className="h-10 w-10 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity ml-1"
                      onClick={() => setLocation(`/users/${user.user_id}`)}
                      title="My Profile"
                    >
                      {getInitials(user.full_name)}
                    </div>
                  )}
                </>
              ) : (
                // Unauthenticated user actions
                <>
                  <ProfileSearch />
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground font-alata"
                    onClick={() => setLocation('/login')}
                  >
                    Log In
                  </Button>
                  <Button
                    className="gradient-bg text-black font-alata"
                    onClick={() => setLocation('/signup')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex justify-center items-center overflow-hidden transition-all duration-200"
          style={{ height: pullDistance }}
        >
          <div
            className={`flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
              transform: `rotate(${isRefreshing ? 0 : (pullDistance / PULL_THRESHOLD) * 180}deg)`,
            }}
          >
            {isRefreshing ? (
              <Loader2 className="h-6 w-6 text-[hsl(280,100%,70%)]" />
            ) : (
              <ArrowUp
                className={`h-6 w-6 transition-colors ${
                  pullDistance >= PULL_THRESHOLD ? 'text-[hsl(280,100%,70%)]' : 'text-muted-foreground'
                }`}
              />
            )}
          </div>
        </div>
      )}

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
            ) : isPublicMode ? (
              // Public mode: Show single "Live Feed" tab + Create button
              <div className="mb-4 overflow-x-auto">
                <div className="flex items-center space-x-2 pb-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black font-alata border-0 whitespace-nowrap"
                  >
                    <span className="relative mr-1.5">
                      <Radio className="h-3.5 w-3.5" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                      </span>
                    </span>
                    Live Feed
                  </Button>

                  {/* Create New Feed Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewFeedClick}
                    className="border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted font-alata whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Your Own Feed
                  </Button>
                </div>
              </div>
            ) : feedConfigs.length > 0 ? (
              // Authenticated mode: Show user's feed tabs
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
                            ? `bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black font-alata border-0 whitespace-nowrap ${feed.is_default ? '' : 'pr-20'}`
                            : `border-border text-muted-foreground hover:text-foreground hover:bg-muted font-alata whitespace-nowrap ${feed.is_default ? '' : 'pr-20'}`
                        }
                      >
                        {feed.is_default && (
                          <span className="relative mr-1.5">
                            <Radio className="h-3.5 w-3.5" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                            </span>
                          </span>
                        )}
                        {feed.name}
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
                    Create Your Own Feed
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Sort Controls */}
            <div className="mb-4 flex justify-end items-center">
              {/* Sort Dropdown - only show if more than one option */}
              {selectedFeedId && (() => {
                const selectedFeed = feedConfigs.find(f => f.id === selectedFeedId);
                if (!selectedFeed?.sort_options?.length) return null;

                // Build combined options: field + order (using per-field orders)
                const combinedOptions: { value: string; label: string }[] = [];
                selectedFeed.sort_options.forEach(opt => {
                  (opt.orders || ['desc', 'asc']).forEach(order => {
                    const orderLabel = opt.type === 'date'
                      ? (order === 'desc' ? 'Newest first' : 'Oldest first')
                      : opt.type === 'number'
                        ? (order === 'desc' ? 'Highest first' : 'Lowest first')
                        : (order === 'desc' ? 'Z to A' : 'A to Z');
                    combinedOptions.push({
                      value: `${opt.field}:${order}`,
                      label: `${opt.label} (${orderLabel})`,
                    });
                  });
                });

                // Don't show dropdown if only one option
                if (combinedOptions.length <= 1) return null;

                const currentValue = sortBy && sortOrder
                  ? `${sortBy}:${sortOrder}`
                  : `${selectedFeed.default_sort}:${selectedFeed.default_order}`;

                return (
                  <Select
                    value={currentValue}
                    onValueChange={(value) => {
                      const [field, order] = value.split(':');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                  >
                    <SelectTrigger className="w-[200px] border-border text-foreground font-alata">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {combinedOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="font-alata">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>

            {/* New Posts Button - Twitter style */}
            {showNewPostsButton && (
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleRefreshPosts}
                  className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  {newPostsCount > 1
                    ? `${newPostsCount} new posts`
                    : newPostsCount === 1
                      ? '1 new post'
                      : 'New posts available'}
                </Button>
              </div>
            )}

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
                        await fetchPosts(selectedFeedId, 0, sortBy, sortOrder);
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
              {posts.map((post, index) => (
                <div key={post.id}>
                  <PostCard
                    post={post}
                    profilesAttributesMetadata={profilesAttributesMetadata}
                    postsAttributesMetadata={postsAttributesMetadata}
                  />

                  {/* Show ad after every N posts based on frequency */}
                  {adsConfig?.enabled &&
                   adsConfig.ad_client &&
                   adsConfig.ad_slot &&
                   adsConfig.ad_layout_key &&
                   (index + 1) % adsConfig.frequency === 0 && (
                    <AdUnit
                      key={`ad-${index}`}
                      adClient={adsConfig.ad_client}
                      adSlot={adsConfig.ad_slot}
                      adFormat={adsConfig.ad_format}
                      adLayoutKey={adsConfig.ad_layout_key}
                    />
                  )}
                </div>
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

          {/* Vertical Divider - hidden on mobile */}
          {isSidebarOpen && (
            <div className="hidden md:block w-px bg-border flex-shrink-0 animate-in fade-in duration-500"></div>
          )}

          {/* Right Side - Sidebar (fullscreen on mobile, side panel on desktop) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto md:w-[480px] flex-shrink-0 animate-in slide-in-from-right duration-500">
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

      {/* Login Required Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-alata">Login Required</DialogTitle>
            <DialogDescription className="text-muted-foreground font-alata">
              Sign in to {loginPromptFeature} and unlock all features of Investor Feed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginPrompt(false)}
              className="border-border text-foreground hover:bg-muted font-alata"
            >
              Maybe Later
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/login')}
              className="border-border text-foreground hover:bg-muted font-alata"
            >
              Log In
            </Button>
            <Button
              onClick={() => setLocation('/signup')}
              className="gradient-bg text-black font-alata"
            >
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
