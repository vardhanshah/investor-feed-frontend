import { useState, useEffect } from 'react';
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
  const [hoveredButton, setHoveredButton] = useState<'yes' | 'no' | null>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalConfidence(confidence);
  }, [confidence]);

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
      // No toast needed - button state change provides sufficient feedback
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
  const textSize = isSmall ? 'text-sm' : 'text-base';
  const buttonPadding = isSmall ? 'px-3 py-1' : 'px-4 py-1.5';

  const hasVotes = localConfidence && localConfidence.total_votes > 0;
  const userVote = localConfidence?.user_vote;
  const yesPercentage = localConfidence?.yes_percentage ?? null;
  const noPercentage = localConfidence?.no_percentage ?? null;
  const totalVotes = localConfidence?.total_votes ?? 0;

  // Show the percentage of the option user voted for
  const displayPercentage = userVote === 'yes' ? yesPercentage : userVote === 'no' ? noPercentage : null;

  return (
    <div
      className="flex flex-col gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: Label only - centered on mobile for better alignment */}
      <span className={`font-alata font-semibold text-foreground text-center ${isSmall ? 'text-base' : 'text-lg'}`}>
        Company Confidence?
      </span>

      {/* Polymarket-style Vote Buttons */}
      <div className="flex items-stretch gap-2">
        {/* YES Button */}
        <button
          onClick={(e) => handleVote(e, 'yes')}
          disabled={isVoting}
          className={`
            relative flex-1 flex flex-col items-center justify-center rounded-lg font-alata transition-all min-w-[70px]
            ${isSmall ? 'py-2 px-4' : 'py-2.5 px-5'}
            ${userVote === 'yes'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isVoting && userVote !== 'yes' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span className={`font-bold ${isSmall ? 'text-lg' : 'text-xl'}`}>
                {hasVotes && yesPercentage !== null ? `${yesPercentage}%` : 'Yes'}
              </span>
              {hasVotes && yesPercentage !== null && (
                <span className={`${isSmall ? 'text-xs' : 'text-sm'} opacity-80`}>Yes</span>
              )}
            </>
          )}
        </button>

        {/* NO Button */}
        <button
          onClick={(e) => handleVote(e, 'no')}
          disabled={isVoting}
          className={`
            relative flex-1 flex flex-col items-center justify-center rounded-lg font-alata transition-all min-w-[70px]
            ${isSmall ? 'py-2 px-4' : 'py-2.5 px-5'}
            ${userVote === 'no'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isVoting && userVote !== 'no' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span className={`font-bold ${isSmall ? 'text-lg' : 'text-xl'}`}>
                {hasVotes && noPercentage !== null ? `${noPercentage}%` : 'No'}
              </span>
              {hasVotes && noPercentage !== null && (
                <span className={`${isSmall ? 'text-xs' : 'text-sm'} opacity-80`}>No</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Vote count - subtle, below buttons */}
      {hasVotes && (
        <span className={`font-alata text-muted-foreground text-center ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      )}
    </div>
  );
}
