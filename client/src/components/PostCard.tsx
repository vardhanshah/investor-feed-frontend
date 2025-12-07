import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ExternalLink, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reactionsApi, Post, PostProfile, ProfilesAttributesMetadata, PostAttributesMetadata } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useLocation } from 'wouter';
import { formatTimeAgoTwoUnits } from '@/lib/dateUtils';

export type { Post, PostProfile };

interface PostCardProps {
  post: Post;
  profilesAttributesMetadata?: ProfilesAttributesMetadata;
  postsAttributesMetadata?: PostAttributesMetadata;
}

// Helper to format attribute value with unit
function formatAttributeValue(value: any, metadata?: { unit?: string | null; type?: string }): string {
  if (value === null || value === undefined) return '';

  // Format numbers with Indian locale
  if (metadata?.type === 'number' && typeof value === 'number') {
    const formatted = value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    if (metadata.unit) {
      return `${formatted} ${metadata.unit}`;
    }
    return formatted;
  }

  return String(value);
}

export default function PostCard({ post, profilesAttributesMetadata, postsAttributesMetadata }: PostCardProps) {
  const timeAgo = formatTimeAgoTwoUnits(post.submission_date || post.created_at);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(post.user_liked);
  const [likeCount, setLikeCount] = useState(post.reaction_count);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
    <>
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
        {post.profile.attributes && Object.keys(post.profile.attributes).length > 0 && profilesAttributesMetadata && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(post.profile.attributes).map(([key, value]) => {
              const metadata = profilesAttributesMetadata[key];
              if (!metadata || value === null || value === undefined) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-alata bg-muted text-muted-foreground"
                >
                  <span className="text-foreground/60">{metadata.label}:</span>
                  <span className="ml-1 text-foreground">{formatAttributeValue(value, metadata)}</span>
                </span>
              );
            })}
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
                className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(index);
                }}
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
        {post.attributes && (post.attributes_metadata || postsAttributesMetadata) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(post.attributes).map(([key, value]) => {
              // Use post-level metadata first, fall back to response-level metadata
              const metadata = post.attributes_metadata?.[key] || postsAttributesMetadata?.[key];
              if (value === true && metadata) {
                return (
                  <Badge
                    key={key}
                    variant="outline"
                    className="border-[hsl(280,100%,70%)]/30 bg-[hsl(280,100%,70%)]/5 text-[hsl(280,100%,70%)] text-xs font-alata"
                  >
                    {metadata.label}
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

    {/* Image Lightbox with navigation */}
    {selectedImageIndex !== null && post.images && (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
        onClick={() => setSelectedImageIndex(null)}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
          onClick={() => setSelectedImageIndex(null)}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Previous button */}
        {post.images.length > 1 && (
          <button
            className="absolute left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev !== null ? (prev - 1 + post.images.length) % post.images.length : 0
              );
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Image */}
        <img
          src={post.images[selectedImageIndex]}
          alt="Full size"
          className="max-w-4xl w-full h-auto max-h-[90vh] object-contain rounded-lg cursor-default px-4"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Next button */}
        {post.images.length > 1 && (
          <button
            className="absolute right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImageIndex((prev) =>
                prev !== null ? (prev + 1) % post.images.length : 0
              );
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        {/* Image counter */}
        {post.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-alata">
            {selectedImageIndex + 1} / {post.images.length}
          </div>
        )}
      </div>
    )}
  </>
  );
}
