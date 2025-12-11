import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, MessageCircle, ExternalLink, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi, reactionsApi, commentsApi, PostAttributes, PostAttributesMetadata, ProfilesAttributesMetadata } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { formatTimeAgoTwoUnits } from '@/lib/dateUtils';

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

interface Thread {
  id: number;
  user_id: number;
  content: string;
  reaction_count: number;
  user_liked?: boolean;
  created_at: string;
}

interface Comment {
  id: number;
  user_id: number;
  content: string;
  reaction_count: number;
  user_liked?: boolean;
  thread: Thread[];
  created_at: string;
}

interface PostProfile {
  id: number;
  title: string;
  external_id?: string;
  attributes?: Record<string, any>;
}

interface PostDetail {
  id: number;
  content: string;
  profile: PostProfile;
  source: string | null;
  submission_date?: string;
  created_at: string;
  images: string[];
  reaction_count: number;
  comment_count: number;
  user_liked: boolean;
  attributes?: PostAttributes | null;
  attributes_metadata?: PostAttributesMetadata;
  // Response-level metadata
  profiles_attributes_metadata?: ProfilesAttributesMetadata;
  posts_attributes_metadata?: PostAttributesMetadata;
}

export default function PostDetailPage() {
  const [match, params] = useRoute('/posts/:postId');
  const [, setLocationPath] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [replyContent, setReplyContent] = useState<{ [commentId: number]: string }>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [commentId: number]: boolean }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [commentId: number]: boolean }>({});

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Comment and thread like states
  const [commentLikes, setCommentLikes] = useState<{ [key: number]: boolean }>({});
  const [threadLikes, setThreadLikes] = useState<{ [key: string]: boolean }>({});
  const [likingInProgress, setLikingInProgress] = useState<{ [key: string]: boolean }>({});

  // Image lightbox state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null || !post?.images) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft' && post.images.length > 1) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev - 1 + post.images.length) % post.images.length : 0
        );
      } else if (e.key === 'ArrowRight' && post.images.length > 1) {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev + 1) % post.images.length : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, post?.images]);

  // Pagination state
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 40;

  // Fetch post details and initial comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!params?.postId) return;

      setIsLoadingPost(true);
      setError(null);

      try {
        const postId = parseInt(params.postId);

        // Fetch post details (without comments)
        const postData = await postsApi.getPost(postId);
        setPost(postData);
        setIsLiked(postData.user_liked);
        setLikeCount(postData.reaction_count);

        // Fetch first page of comments separately
        const commentsResponse = await commentsApi.getComments(postId, 1, PAGE_SIZE);
        setComments(commentsResponse.comments);

        // Initialize like states for comments and threads
        const commentLikesInit: { [key: number]: boolean } = {};
        const threadLikesInit: { [key: string]: boolean } = {};

        commentsResponse.comments.forEach((comment: Comment) => {
          commentLikesInit[comment.id] = comment.user_liked || false;
          if (comment.thread) {
            comment.thread.forEach((thread: Thread) => {
              threadLikesInit[`${comment.id}-${thread.id}`] = thread.user_liked || false;
            });
          }
        });

        setCommentLikes(commentLikesInit);
        setThreadLikes(threadLikesInit);
        setPageNo(1);
        setTotalPages(commentsResponse.total_pages);
        setHasMore(1 < commentsResponse.total_pages);
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        setError(errorInfo.message);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPostAndComments();
  }, [params?.postId, toast]);

  // Load more comments
  const loadMoreComments = useCallback(async () => {
    if (!params?.postId || isLoadingComments || !hasMore) return;

    setIsLoadingComments(true);
    try {
      const nextPage = pageNo + 1;
      const response = await commentsApi.getComments(parseInt(params.postId), nextPage, PAGE_SIZE);

      setComments(prev => [...prev, ...response.comments]);
      setPageNo(nextPage);
      setTotalPages(response.total_pages);
      setHasMore(nextPage < response.total_pages);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsLoadingComments(false);
    }
  }, [params?.postId, pageNo, hasMore, isLoadingComments, toast]);

  // Handle like
  const handleLike = async () => {
    if (isLiking || !post) return;

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

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || isSubmittingComment || !post) return;

    setIsSubmittingComment(true);
    try {
      await commentsApi.addComment(post.id, commentContent.trim());

      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted.',
      });

      setCommentContent('');

      // Reload first page of comments
      const commentsResponse = await commentsApi.getComments(post.id, 1, PAGE_SIZE);
      setComments(commentsResponse.comments);
      setPageNo(1);
      setTotalPages(commentsResponse.total_pages);
      setHasMore(1 < commentsResponse.total_pages);

      // Update post to get new comment count
      const postData = await postsApi.getPost(post.id);
      setPost(postData);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (commentId: number) => {
    if (!replyContent[commentId]?.trim() || isSubmittingReply[commentId] || !post) return;

    setIsSubmittingReply({ ...isSubmittingReply, [commentId]: true });
    try {
      await commentsApi.addThreadReply(post.id, commentId, replyContent[commentId].trim());

      toast({
        title: 'Reply added!',
        description: 'Your reply has been posted.',
      });

      setReplyContent({ ...replyContent, [commentId]: '' });
      setShowReplyInput({ ...showReplyInput, [commentId]: false });

      // Reload current page of comments to get updated threads
      const commentsResponse = await commentsApi.getComments(post.id, pageNo, PAGE_SIZE);
      setComments(prev => {
        // If we're on page 1, just replace all comments
        if (pageNo === 1) return commentsResponse.comments;

        // Otherwise, we need to reload all pages up to current page
        // For simplicity, just reload from page 1 to maintain consistency
        return commentsResponse.comments;
      });
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsSubmittingReply({ ...isSubmittingReply, [commentId]: false });
    }
  };

  // Scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (commentsEndRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        // Check if scrolled near bottom (within 200px)
        if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingComments) {
          loadMoreComments();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingComments, loadMoreComments]);

  if (authLoading || isLoadingPost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button
                variant="ghost"
                onClick={() => setLocationPath('/home')}
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
              <p className="text-destructive font-alata text-lg">{error || 'Post not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeAgo = formatTimeAgoTwoUnits(post.submission_date || post.created_at);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => setLocationPath('/home')}
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
        {/* Post Card */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setLocationPath(`/profiles/${post.profile.id}`)}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                {post.profile.meta_attributes?.logo_url ? (
                  <img
                    src={post.profile.meta_attributes.logo_url}
                    alt={post.profile.title || 'Profile'}
                    className="w-10 h-10 rounded-full object-cover bg-muted"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold">
                    {post.profile.title ? post.profile.title[0].toUpperCase() : 'P'}
                  </div>
                )}
                <div className="text-left">
                  <h3 className="text-foreground font-alata font-medium hover:text-[hsl(280,100%,70%)] transition-colors">
                    {post.profile.title || `Profile #${post.profile.id}`}
                  </h3>
                  <p className="text-xs text-muted-foreground font-alata">{timeAgo}</p>
                </div>
              </button>
            </div>

            {/* Profile Attributes */}
            {post.profile.attributes && Object.keys(post.profile.attributes).length > 0 && post.profiles_attributes_metadata && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(post.profile.attributes).map(([key, value]) => {
                  const metadata = post.profiles_attributes_metadata?.[key];
                  if (!metadata || value === null || value === undefined) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-alata bg-muted text-muted-foreground"
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
              <p className="text-foreground font-alata whitespace-pre-wrap text-lg">{post.content}</p>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="rounded-lg w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImageIndex(index)}
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
                className="inline-flex items-center text-sm text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] mb-4 font-alata"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Source
              </a>
            )}

            {/* Attribute Badges */}
            {post.attributes && (post.attributes_metadata || post.posts_attributes_metadata) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(post.attributes).map(([key, value]) => {
                  // Use post-level metadata first, fall back to response-level metadata
                  const metadata = post.attributes_metadata?.[key] || post.posts_attributes_metadata?.[key];
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

            {/* Engagement Stats */}
            <div className="flex items-center space-x-6 pt-4 border-t border-border">
              <button
                onClick={handleLike}
                disabled={!user}
                className={`flex items-center space-x-2 transition-colors cursor-pointer ${
                  isLiked
                    ? 'text-[hsl(280,100%,70%)]'
                    : 'text-muted-foreground hover:text-[hsl(280,100%,70%)]'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-alata">{likeCount}</span>
              </button>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-alata">{post.comment_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-alata text-foreground">
            Comments ({post.comment_count})
          </h2>

          {/* Add Comment (if logged in) */}
          {user && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <Input
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write your comment..."
                    className="bg-background border-border text-foreground font-alata focus:border-[hsl(280,100%,70%)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={!commentContent.trim() || isSubmittingComment}
                    className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata self-end"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Comment'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => setLocationPath(`/users/${comment.user_id}`)}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        U
                      </button>
                      <div className="flex-1">
                        <div className="mb-1">
                          <button
                            onClick={() => setLocationPath(`/users/${comment.user_id}`)}
                            className="text-sm font-medium text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] font-alata transition-colors"
                          >
                            User #{comment.user_id}
                          </button>
                        </div>
                        <p className="text-foreground font-alata">{comment.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-xs text-muted-foreground font-alata">
                            {formatTimeAgo(comment.created_at)}
                          </p>
                          {user && (
                            <>
                              <button
                                onClick={async () => {
                                  if (!post || likingInProgress[`comment-${comment.id}`]) return;

                                  const likeKey = `comment-${comment.id}`;
                                  const wasLiked = commentLikes[comment.id];

                                  // Set liking in progress
                                  setLikingInProgress(prev => ({ ...prev, [likeKey]: true }));

                                  // Optimistic update
                                  setCommentLikes(prev => ({ ...prev, [comment.id]: !wasLiked }));
                                  setComments(prev => prev.map(c =>
                                    c.id === comment.id
                                      ? { ...c, reaction_count: wasLiked ? c.reaction_count - 1 : c.reaction_count + 1 }
                                      : c
                                  ));

                                  try {
                                    await commentsApi.addCommentReaction(post.id, comment.id);
                                    if (!wasLiked) {
                                      toast({
                                        title: 'Liked!',
                                        description: 'Your reaction has been recorded.',
                                      });
                                    }
                                  } catch (err) {
                                    // Revert on error
                                    setCommentLikes(prev => ({ ...prev, [comment.id]: wasLiked }));
                                    setComments(prev => prev.map(c =>
                                      c.id === comment.id
                                        ? { ...c, reaction_count: wasLiked ? c.reaction_count + 1 : c.reaction_count - 1 }
                                        : c
                                    ));

                                    const errorInfo = getErrorMessage(err);
                                    toast({
                                      variant: 'destructive',
                                      title: errorInfo.title,
                                      description: errorInfo.message,
                                    });
                                  } finally {
                                    setLikingInProgress(prev => ({ ...prev, [likeKey]: false }));
                                  }
                                }}
                                className={`flex items-center space-x-1 text-xs font-alata transition-all ${
                                  commentLikes[comment.id]
                                    ? 'text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,75%)]'
                                    : 'text-muted-foreground hover:text-[hsl(280,100%,70%)]'
                                } ${likingInProgress[`comment-${comment.id}`] ? 'opacity-50 cursor-wait' : ''}`}
                                disabled={likingInProgress[`comment-${comment.id}`]}
                              >
                                <Heart className={`h-3 w-3 transition-all ${
                                  commentLikes[comment.id] ? 'fill-current scale-110' : ''
                                }`} />
                                <span>{comment.reaction_count}</span>
                              </button>
                              <button
                                onClick={() => setShowReplyInput({ ...showReplyInput, [comment.id]: !showReplyInput[comment.id] })}
                                className="text-xs text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] font-alata"
                              >
                                Reply
                              </button>
                            </>
                          )}
                          {!user && comment.reaction_count > 0 && (
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Heart className="h-3 w-3" />
                              <span className="text-xs font-alata">{comment.reaction_count}</span>
                            </div>
                          )}
                        </div>

                        {/* Thread Replies */}
                        {comment.thread && comment.thread.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-border">
                            {comment.thread.map((reply: any) => (
                              <div key={reply.id} className="flex items-start space-x-2">
                                <button
                                  onClick={() => setLocationPath(`/users/${reply.user_id}`)}
                                  className="w-6 h-6 rounded-full bg-gradient-to-r from-[hsl(200,100%,70%)] to-[hsl(280,100%,70%)] flex items-center justify-center text-black font-alata text-xs font-bold flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  U
                                </button>
                                <div className="flex-1">
                                  <div className="mb-1">
                                    <button
                                      onClick={() => setLocationPath(`/users/${reply.user_id}`)}
                                      className="text-xs font-medium text-[hsl(200,100%,70%)] hover:text-[hsl(200,100%,80%)] font-alata transition-colors"
                                    >
                                      User #{reply.user_id}
                                    </button>
                                  </div>
                                  <p className="text-foreground font-alata text-sm">{reply.content}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <p className="text-xs text-muted-foreground font-alata">
                                      {formatTimeAgo(reply.created_at)}
                                    </p>
                                    {user && (
                                      <button
                                        onClick={async () => {
                                          if (!post || likingInProgress[`thread-${comment.id}-${reply.id}`]) return;

                                          const likeKey = `thread-${comment.id}-${reply.id}`;
                                          const threadKey = `${comment.id}-${reply.id}`;
                                          const wasLiked = threadLikes[threadKey];

                                          // Set liking in progress
                                          setLikingInProgress(prev => ({ ...prev, [likeKey]: true }));

                                          // Optimistic update
                                          setThreadLikes(prev => ({ ...prev, [threadKey]: !wasLiked }));
                                          setComments(prev => prev.map(c =>
                                            c.id === comment.id
                                              ? {
                                                  ...c,
                                                  thread: c.thread.map(t =>
                                                    t.id === reply.id
                                                      ? { ...t, reaction_count: wasLiked ? t.reaction_count - 1 : t.reaction_count + 1 }
                                                      : t
                                                  )
                                                }
                                              : c
                                          ));

                                          try {
                                            await commentsApi.addThreadReaction(post.id, comment.id, reply.id);
                                            if (!wasLiked) {
                                              toast({
                                                title: 'Liked!',
                                                description: 'Your reaction has been recorded.',
                                              });
                                            }
                                          } catch (err) {
                                            // Revert on error
                                            setThreadLikes(prev => ({ ...prev, [threadKey]: wasLiked }));
                                            setComments(prev => prev.map(c =>
                                              c.id === comment.id
                                                ? {
                                                    ...c,
                                                    thread: c.thread.map(t =>
                                                      t.id === reply.id
                                                        ? { ...t, reaction_count: wasLiked ? t.reaction_count + 1 : t.reaction_count - 1 }
                                                        : t
                                                    )
                                                  }
                                                : c
                                            ));

                                            const errorInfo = getErrorMessage(err);
                                            toast({
                                              variant: 'destructive',
                                              title: errorInfo.title,
                                              description: errorInfo.message,
                                            });
                                          } finally {
                                            setLikingInProgress(prev => ({ ...prev, [likeKey]: false }));
                                          }
                                        }}
                                        className={`flex items-center space-x-1 text-xs font-alata transition-all ${
                                          threadLikes[`${comment.id}-${reply.id}`]
                                            ? 'text-[hsl(200,100%,70%)] hover:text-[hsl(200,100%,75%)]'
                                            : 'text-muted-foreground hover:text-[hsl(200,100%,70%)]'
                                        } ${likingInProgress[`thread-${comment.id}-${reply.id}`] ? 'opacity-50 cursor-wait' : ''}`}
                                        disabled={likingInProgress[`thread-${comment.id}-${reply.id}`]}
                                      >
                                        <Heart className={`h-3 w-3 transition-all ${
                                          threadLikes[`${comment.id}-${reply.id}`] ? 'fill-current scale-110' : ''
                                        }`} />
                                        <span>{reply.reaction_count}</span>
                                      </button>
                                    )}
                                    {!user && reply.reaction_count > 0 && (
                                      <div className="flex items-center space-x-1 text-muted-foreground">
                                        <Heart className="h-3 w-3" />
                                        <span className="text-xs font-alata">{reply.reaction_count}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {user && showReplyInput[comment.id] && (
                          <div className="mt-3 flex flex-col space-y-2">
                            <Input
                              value={replyContent[comment.id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                              placeholder="Write your reply..."
                              className="bg-background border-border text-foreground font-alata focus:border-[hsl(280,100%,70%)] text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleReplySubmit(comment.id);
                                }
                              }}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleReplySubmit(comment.id)}
                                disabled={!replyContent[comment.id]?.trim() || isSubmittingReply[comment.id]}
                                className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata text-sm h-8"
                                size="sm"
                              >
                                {isSubmittingReply[comment.id] ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Posting...
                                  </>
                                ) : (
                                  'Post Reply'
                                )}
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowReplyInput({ ...showReplyInput, [comment.id]: false });
                                  setReplyContent({ ...replyContent, [comment.id]: '' });
                                }}
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted font-alata text-sm h-8"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground font-alata">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          )}

          {/* Loading More Indicator */}
          {isLoadingComments && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(280,100%,70%)]" />
            </div>
          )}

          {/* End of Comments Marker */}
          {!hasMore && comments.length > 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground font-alata text-sm">You've reached the end of comments</p>
            </div>
          )}

          <div ref={commentsEndRef} />
        </div>
      </div>

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
    </div>
  );
}
