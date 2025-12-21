import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ExternalLink, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reactionsApi, Post, PostProfile, ProfilesAttributesMetadata, PostAttributesMetadata } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useLocation } from 'wouter';
import { formatTimeAgoTwoUnits } from '@/lib/dateUtils';
import CompanyConfidence from './CompanyConfidence';
import { POST_MESSAGES } from '@/lib/messages';

export type { Post, PostProfile };

interface PostCardProps {
  post: Post;
  profilesAttributesMetadata?: ProfilesAttributesMetadata;
  postsAttributesMetadata?: PostAttributesMetadata;
  showConfidence?: boolean;
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

export default function PostCard({ post, profilesAttributesMetadata, postsAttributesMetadata, showConfidence = true }: PostCardProps) {
  const timeAgo = formatTimeAgoTwoUnits(post.submission_date || post.created_at);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLiked, setIsLiked] = useState(post.user_liked);
  const [likeCount, setLikeCount] = useState(post.reaction_count);
  const [isLiking, setIsLiking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Character limit for truncation
  const CONTENT_CHAR_LIMIT = 280;
  const shouldTruncate = post.content.length > CONTENT_CHAR_LIMIT;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.slice(0, CONTENT_CHAR_LIMIT).trimEnd() + '...'
    : post.content;

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft' && post.images && post.images.length > 1) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + post.images.length) % post.images.length : 0
        );
      } else if (e.key === 'ArrowRight' && post.images && post.images.length > 1) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % post.images.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, post.images]);

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
      // No toast needed - button fill animation provides sufficient feedback
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
    // Don't navigate if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    setLocation(`/posts/${post.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setLocation(`/profiles/${post.profile.id}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const postUrl = `${window.location.origin}/posts/${post.id}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      toast(POST_MESSAGES.LINK_COPIED);
    } catch (err) {
      toast(POST_MESSAGES.LINK_COPY_FAILED);
    }
  };

  return (
    <>
    <Card
      className="bg-card border-border hover:border-[hsl(280,100%,70%)]/50 transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Profile Header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity flex-1 min-w-0"
            onClick={handleProfileClick}
          >
            {post.profile.meta_attributes?.logo_url ? (
              <img
                src={post.profile.meta_attributes.logo_url}
                alt={post.profile.title || 'Profile'}
                className="w-10 h-10 rounded-full object-cover bg-muted shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-base shrink-0">
                {post.profile.title ? post.profile.title[0].toUpperCase() : 'P'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground font-alata font-semibold text-base truncate">
                {post.profile.title || `Profile #${post.profile.id}`}
              </h3>
              <p className="text-sm text-muted-foreground font-alata">{timeAgo}</p>
            </div>
          </div>

          {/* Company Confidence - Desktop (right side) */}
          {showConfidence && (
            <div className="hidden md:block shrink-0" onClick={(e) => e.stopPropagation()}>
              <CompanyConfidence
                profileId={post.profile.id}
                confidence={post.confidence || null}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Profile Attributes */}
        {post.profile.attributes && Object.keys(post.profile.attributes).length > 0 && profilesAttributesMetadata && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(post.profile.attributes).map(([key, value]) => {
              const metadata = profilesAttributesMetadata[key];
              if (!metadata || value === null || value === undefined) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-alata bg-muted text-muted-foreground"
                >
                  <span className="text-foreground/60">{metadata.label}:</span>
                  <span className="ml-1 text-foreground">{formatAttributeValue(value, metadata)}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground font-alata whitespace-pre-wrap text-base leading-relaxed">{displayContent}</p>
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] font-alata text-sm mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
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
            className="inline-flex items-center text-sm text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] mb-4 font-alata"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            View Source
          </a>
        )}

        {/* Attribute Badges */}
        {post.attributes && (post.attributes_metadata || postsAttributesMetadata) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(post.attributes).map(([key, value]) => {
              // Use post-level metadata first, fall back to response-level metadata
              const metadata = post.attributes_metadata?.[key] || postsAttributesMetadata?.[key];
              if (value === true && metadata) {
                return (
                  <Badge
                    key={key}
                    variant="outline"
                    className="border-[hsl(280,100%,70%)]/30 bg-[hsl(280,100%,70%)]/5 text-[hsl(280,100%,70%)] text-sm font-alata px-2.5 py-0.5"
                  >
                    {metadata.label}
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Company Confidence - Mobile (attachment at bottom of post) */}
        {showConfidence && (
          <div className="md:hidden mb-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
            <CompanyConfidence
              profileId={post.profile.id}
              confidence={post.confidence || null}
              size="sm"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className={`flex flex-col gap-3 pt-4 ${showConfidence ? 'md:border-t md:border-border/50' : 'border-t border-border/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all cursor-pointer group/like ${
                  isLiked
                    ? 'text-[hsl(280,100%,70%)]'
                    : 'text-muted-foreground hover:text-[hsl(280,100%,70%)]'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : 'group-hover/like:scale-110 transition-transform'}`} />
                <span className="text-base font-alata font-medium">{likeCount}</span>
              </button>
              <button
                onClick={() => setLocation(`/posts/${post.id}?comment=true`)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-[hsl(200,100%,70%)] transition-colors cursor-pointer group/comment"
              >
                <MessageCircle className="h-5 w-5 group-hover/comment:scale-110 transition-transform" />
                <span className="text-base font-alata">{post.comment_count}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-muted-foreground hover:text-[hsl(200,100%,70%)] transition-colors cursor-pointer group/share"
              >
                <Share2 className="h-5 w-5 group-hover/share:scale-110 transition-transform" />
              </button>
            </div>

            {/* Trending Indicator (if high engagement) */}
            {likeCount > 10 && (
              <div className="flex items-center space-x-1 text-[hsl(280,100%,70%)] text-sm font-alata">
                <span className="animate-pulse">🔥</span>
                <span>Trending</span>
              </div>
            )}
          </div>
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
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10"
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
