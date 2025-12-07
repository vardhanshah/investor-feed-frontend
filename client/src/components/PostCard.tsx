import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ExternalLink, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reactionsApi, Post, PostProfile } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useLocation } from 'wouter';
import { formatTimeAgoTwoUnits } from '@/lib/dateUtils';

export type { Post, PostProfile };

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = formatTimeAgoTwoUnits(post.submission_date || post.created_at);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(post.user_liked);
  const [likeCount, setLikeCount] = useState(post.reaction_count);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking like
    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;

    try {
      // Optimistic update
      setIsLiked(!wasLiked);
      setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

      await reactionsApi.addReaction(post.id);

      if (!wasLiked) {
        toast({
          title: 'Liked!',
          description: 'Your reaction has been recorded.',
        });
      }
    } catch (err) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);

      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = () => {
    setLocation(`/posts/${post.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setLocation(`/profiles/${post.profile.id}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const postUrl = `${window.location.origin}/posts/${post.id}`;

    // Try to use Web Share API if available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.profile.title || 'Investor Feed'}`,
          text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: postUrl,
        });
        toast({
          title: 'Shared!',
          description: 'Post shared successfully.',
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({
          title: 'Link Copied!',
          description: 'Post link copied to clipboard.',
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Failed to copy',
          description: 'Could not copy link to clipboard.',
        });
      }
    }
  };

  return (
    <Card
      className="bg-card border-border hover:border-[hsl(280,100%,70%)]/50 transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Profile Header - More Compact */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-sm">
              {post.profile.title ? post.profile.title[0].toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="text-foreground font-alata font-semibold text-sm">
                {post.profile.title || `Profile #${post.profile.id}`}
              </h3>
              <p className="text-xs text-muted-foreground font-alata">{timeAgo}</p>
            </div>
          </div>
        </div>

        {/* Profile Attributes */}
        {post.profile.attributes && Object.keys(post.profile.attributes).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(post.profile.attributes).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-alata bg-muted text-muted-foreground"
              >
                <span className="text-foreground/60">{key}:</span>
                <span className="ml-1 text-foreground">{String(value)}</span>
              </span>
            ))}
          </div>
        )}

        {/* Post Content - More Prominent */}
        <div className="mb-3">
          <p className="text-foreground font-alata whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg w-full h-48 object-cover"
              />
            ))}
          </div>
        )}

        {/* Source Link */}
        {post.source && (
          <a
            href={post.source}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] mb-3 font-alata"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Source
          </a>
        )}

        {/* Attribute Badges */}
        {post.attributes && post.attributes_metadata && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(post.attributes).map(([key, value]) => {
              if (value === true && post.attributes_metadata?.[key]) {
                return (
                  <Badge
                    key={key}
                    variant="outline"
                    className="border-[hsl(280,100%,70%)]/30 bg-[hsl(280,100%,70%)]/5 text-[hsl(280,100%,70%)] text-xs font-alata"
                  >
                    {post.attributes_metadata[key].label}
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Engagement Stats - Market Style */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-all cursor-pointer group/like ${
                isLiked
                  ? 'text-[hsl(280,100%,70%)]'
                  : 'text-muted-foreground hover:text-[hsl(280,100%,70%)]'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : 'group-hover/like:scale-110 transition-transform'}`} />
              <span className="text-sm font-alata font-medium">{likeCount}</span>
            </button>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-alata">{post.comment_count}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 text-muted-foreground hover:text-[hsl(200,100%,70%)] transition-colors cursor-pointer group/share"
            >
              <Share2 className="h-4 w-4 group-hover/share:scale-110 transition-transform" />
            </button>
          </div>

          {/* Trending Indicator (if high engagement) */}
          {likeCount > 10 && (
            <div className="flex items-center space-x-1 text-[hsl(280,100%,70%)] text-xs font-alata">
              <span className="animate-pulse">🔥</span>
              <span>Trending</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
