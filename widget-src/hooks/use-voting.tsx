import { Vote, VoteResult, SyncedMapLike } from "../utils/types";
import { groupVotesByValue } from "../utils/vote-utils";

export interface UseVotingReturn {
  votes: SyncedMapLike<Vote>;
  handleVote: (value: number | string) => void;
  groupedResults: VoteResult[];
  currentUserVote?: Vote;
}

export function useVoting(
  votes: SyncedMapLike<Vote>,
  currentUserId: string,
  count: number,
  setCount: (count: number) => void,
): UseVotingReturn {
  const handleVote = (value: number | string) => {
    try {
      // Use consistent user ID - prefer currentUserId parameter, fallback to figma.currentUser?.id
      const userId = currentUserId || figma.currentUser?.id || `voter-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      console.log("Storing vote:", { userId, userName, value, currentUserId });

      votes.set(userId, {
        userId,
        userName,
        value,
        timestamp: Date.now(),
      });

      setCount(count + 1);
    } catch (error) {
      console.error("Error in vote handler:", error);
      // Fallback without map storage
      setCount(count + 1);
    }
  };

  const groupedResults = groupVotesByValue(votes);

  const currentUserVote = currentUserId ? votes.get(currentUserId) : undefined;

  return {
    votes,
    handleVote,
    groupedResults,
    currentUserVote,
  };
}
