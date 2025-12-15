import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { confidenceApi, ProfileConfidence } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';

interface CompanyConfidenceProps {
  profileId: number;
  confidence: ProfileConfidence | null;
  onVoteSuccess?: (newConfidence: ProfileConfidence) => void;
  size?: 'sm' | 'md';
}

export default function CompanyConfidence({
  profileId,
  confidence,
  onVoteSuccess,
  size = 'sm',
}: CompanyConfidenceProps) {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [localConfidence, setLocalConfidence] = useState<ProfileConfidence | null>(confidence);

  const handleVote = async (e: React.MouseEvent, vote: 'yes' | 'no') => {
    e.stopPropagation(); // Prevent card navigation
    if (isVoting) return;

    // Don't allow voting the same option again
    if (localConfidence?.user_vote === vote) return;

    setIsVoting(true);
    const previousConfidence = localConfidence;

    // Optimistic update
    const optimisticConfidence: ProfileConfidence = {
      yes_percentage: vote === 'yes' ? 100 : 0,
      no_percentage: vote === 'no' ? 100 : 0,
      total_votes: (localConfidence?.total_votes || 0) + (localConfidence?.user_vote ? 0 : 1),
      user_vote: vote,
    };
    setLocalConfidence(optimisticConfidence);

    try {
      const response = await confidenceApi.vote(profileId, vote);

      // Update with actual server response
      const newConfidence: ProfileConfidence = {
        yes_percentage: response.yes_percentage,
        no_percentage: response.no_percentage,
        total_votes: response.total_votes,
        user_vote: response.vote,
      };
      setLocalConfidence(newConfidence);
      onVoteSuccess?.(newConfidence);

      toast({
        title: 'Vote recorded',
        description: response.message,
      });
    } catch (err) {
      // Revert on error
      setLocalConfidence(previousConfidence);

      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsVoting(false);
    }
  };

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = isSmall ? 'text-sm' : 'text-base';
  const buttonPadding = isSmall ? 'px-2 py-1' : 'px-3 py-1.5';

  const hasVotes = localConfidence && localConfidence.total_votes > 0;
  const userVote = localConfidence?.user_vote;

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <span className={`text-muted-foreground font-alata ${textSize} whitespace-nowrap`}>
        Company Confidence?
      </span>

      {/* YES Button */}
      <button
        onClick={(e) => handleVote(e, 'yes')}
        disabled={isVoting}
        className={`
          flex items-center gap-1 rounded-full font-alata font-medium transition-all
          ${buttonPadding} ${textSize}
          ${userVote === 'yes'
            ? 'bg-green-500/20 text-green-500 border border-green-500/50'
            : 'bg-muted/50 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 border border-transparent'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isVoting && userVote !== 'yes' ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <ThumbsUp className={`${iconSize} ${userVote === 'yes' ? 'fill-current' : ''}`} />
        )}
        <span>YES</span>
        {hasVotes && localConfidence.yes_percentage !== null && (
          <span className="opacity-75">{localConfidence.yes_percentage}%</span>
        )}
      </button>

      {/* NO Button */}
      <button
        onClick={(e) => handleVote(e, 'no')}
        disabled={isVoting}
        className={`
          flex items-center gap-1 rounded-full font-alata font-medium transition-all
          ${buttonPadding} ${textSize}
          ${userVote === 'no'
            ? 'bg-red-500/20 text-red-500 border border-red-500/50'
            : 'bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-transparent'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isVoting && userVote !== 'no' ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <ThumbsDown className={`${iconSize} ${userVote === 'no' ? 'fill-current' : ''}`} />
        )}
        <span>NO</span>
        {hasVotes && localConfidence.no_percentage !== null && (
          <span className="opacity-75">{localConfidence.no_percentage}%</span>
        )}
      </button>
    </div>
  );
}
