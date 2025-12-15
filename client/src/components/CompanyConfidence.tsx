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
      className="flex flex-col gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        {/* Show percentage if user has voted */}
        {displayPercentage !== null && (
          <span className={`font-alata font-bold ${textSize} ${
            userVote === 'yes' ? 'text-green-500' : 'text-red-500'
          }`}>
            {displayPercentage}%
          </span>
        )}

        {/* YES Button */}
        <button
          onClick={(e) => handleVote(e, 'yes')}
          disabled={isVoting}
          className={`
            group relative flex items-center justify-center rounded font-alata font-medium transition-all
            ${buttonPadding} ${textSize}
            ${userVote === 'yes'
              ? 'bg-green-500/20 text-green-500 border border-green-500/50'
              : 'bg-muted/50 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 border border-transparent'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isVoting && userVote !== 'yes' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="group-hover:hidden">Yes</span>
              {hasVotes && yesPercentage !== null && (
                <span className="hidden group-hover:inline">{yesPercentage}%</span>
              )}
              {!hasVotes && <span className="hidden group-hover:inline">Yes</span>}
            </>
          )}
        </button>

        {/* NO Button */}
        <button
          onClick={(e) => handleVote(e, 'no')}
          disabled={isVoting}
          className={`
            group relative flex items-center justify-center rounded font-alata font-medium transition-all
            ${buttonPadding} ${textSize}
            ${userVote === 'no'
              ? 'bg-red-500/20 text-red-500 border border-red-500/50'
              : 'bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-transparent'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isVoting && userVote !== 'no' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="group-hover:hidden">No</span>
              {hasVotes && noPercentage !== null && (
                <span className="hidden group-hover:inline">{noPercentage}%</span>
              )}
              {!hasVotes && <span className="hidden group-hover:inline">No</span>}
            </>
          )}
        </button>
      </div>

      {/* Total Votes */}
      {hasVotes && (
        <span className={`text-xs text-muted-foreground font-alata`}>
          Total Votes: {totalVotes}
        </span>
      )}
    </div>
  );
}
