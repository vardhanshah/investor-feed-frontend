import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Calendar, Activity, MessageCircle, Heart, ExternalLink, Camera } from 'lucide-react';
import { userActivityApi, authApi, UserActivityResponse, UserActivity } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { formatTimeAgo, formatLocalizedDate } from '@/lib/dateUtils';

export default function UserActivityPage() {
  const [match, params] = useRoute('/users/:userId');
  const [, setLocation] = useLocation();
  const { user: authUser, refreshUser } = useAuth();
  const { toast } = useToast();

  const [activityData, setActivityData] = useState<UserActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [allActivities, setAllActivities] = useState<UserActivity[]>([]);

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const userId = params?.userId ? parseInt(params.userId) : authUser?.user_id;
  const isOwnProfile = authUser && userId === authUser.user_id;
  const LIMIT = 40;

  // Handle avatar file selection
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, GIF)',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setIsUploadingAvatar(true);
    try {
      await authApi.updateAvatar(file);
      await refreshUser();
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarPreview(null);
      toast({
        title: 'Upload failed',
        description: 'Failed to update your profile picture. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get avatar URL to display
  const displayAvatarUrl = avatarPreview || authUser?.avatar_url;

  // Fetch user activity (includes user profile data)
  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId) {
        setError('No user ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentOffset(0);
      setAllActivities([]);

      try {
        console.log('[UserActivity] Fetching activity for user:', userId);
        const activity = await userActivityApi.getUserActivity(userId, LIMIT, 0);
        console.log('[UserActivity] Received activity data:', activity);
        setActivityData(activity);
        setAllActivities(activity.activities || []);
      } catch (err) {
        console.error('[UserActivity] Failed to fetch activity:', err);
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: 'Failed to load user data',
          description: errorInfo.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [userId, toast]);

  // Load more activities
  const loadMoreActivities = async () => {
    if (!userId || !activityData || isLoadingMore) return;

    const newOffset = currentOffset + LIMIT;

    setIsLoadingMore(true);
    try {
      console.log('[UserActivity] Loading more activities, offset:', newOffset);
      const moreActivity = await userActivityApi.getUserActivity(userId, LIMIT, newOffset);
      console.log('[UserActivity] Received more activity data:', moreActivity);

      // Append new activities to existing ones
      setAllActivities(prev => [...prev, ...(moreActivity.activities || [])]);
      setActivityData(moreActivity);
      setCurrentOffset(newOffset);
    } catch (err) {
      console.error('[UserActivity] Failed to load more activity:', err);
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: 'Failed to load more',
        description: errorInfo.message,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'thread':
        return <MessageCircle className="h-4 w-4" />;
      case 'reaction':
        return <Heart className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBorderColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'border-[hsl(280,100%,70%)]';
      case 'thread':
        return 'border-[hsl(200,100%,70%)]';
      case 'reaction':
        return 'border-pink-500';
      default:
        return 'border-muted';
    }
  };

  const renderActivity = (activity: UserActivity) => {
    return (
      <div
        key={activity.id}
        className={`border-l-2 ${getActivityBorderColor(activity.type)} pl-4 py-3`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getActivityIcon(activity.type)}
              <span className="text-sm font-medium text-muted-foreground capitalize">
                {activity.type === 'thread' ? 'Reply' : activity.type}
              </span>
            </div>

            {/* Content based on type */}
            {activity.type === 'comment' && activity.content && (
              <p className="text-foreground font-alata mb-2">{activity.content}</p>
            )}

            {activity.type === 'thread' && activity.content && (
              <>
                <p className="text-foreground font-alata mb-2">{activity.content}</p>
                {activity.comment_content && (
                  <div className="text-sm text-muted-foreground mb-2 pl-3 border-l-2 border-muted">
                    replying to: "<span className="italic">{activity.comment_content}</span>"
                  </div>
                )}
              </>
            )}

            {activity.type === 'reaction' && activity.reaction_emoji && (
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{activity.reaction_emoji}</span>
                <span className="text-foreground font-alata">
                  reacted to "{activity.post.content.substring(0, 100)}
                  {activity.post.content.length > 100 ? '...' : ''}"
                </span>
              </div>
            )}

            {/* Post context */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              <span>
                on post by{' '}
                <span className="text-foreground font-medium">{activity.post.profile.title}</span>
              </span>
              <span>•</span>
              <span>{formatTimeAgo(activity.created_at)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setLocation(`/posts/${activity.post.id}`)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  if (error || !activityData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => setLocation('/home')}
                className="text-foreground hover:bg-muted font-alata"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-destructive font-alata text-lg">
                {error || 'Failed to load user data'}
              </p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation('/home')}
              className="text-foreground hover:bg-muted font-alata"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-xl font-alata text-foreground">
              {isOwnProfile ? 'My Profile' : `User #${userId}`}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {isOwnProfile && displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt={activityData.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-3xl">
                    {getInitials(activityData.full_name)}
                  </div>
                )}

                {/* Upload Button - only for own profile */}
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[hsl(280,100%,70%)] hover:bg-[hsl(280,100%,75%)] text-black flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-alata text-foreground mb-2">{activityData.full_name}</h2>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-alata">Joined {formatLocalizedDate(activityData.created_at)}</span>
                  </div>
                  {activityData.total_count > 0 && (
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      <span className="font-alata">{activityData.total_count} activities</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        {allActivities && allActivities.length > 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground font-alata flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Activity Timeline
                </span>
                <span className="text-sm text-muted-foreground font-normal">
                  {activityData.total_count} total activities
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allActivities.map((activity) => renderActivity(activity))}
              </div>

              {/* Load More / Pagination */}
              {allActivities.length < activityData.total_count && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Showing {allActivities.length} of {activityData.total_count} activities
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={loadMoreActivities}
                      disabled={isLoadingMore}
                      className="bg-[hsl(280,100%,70%)] hover:bg-[hsl(280,100%,60%)] text-white font-alata"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More (${activityData.total_count - allActivities.length} remaining)`
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* All loaded */}
              {allActivities.length > 0 && allActivities.length === activityData.total_count && (
                <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                  All {activityData.total_count} activities loaded
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-alata text-foreground mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground font-alata">
                {isOwnProfile
                  ? 'Start engaging with posts by commenting and reacting!'
                  : "This user hasn't been active yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
