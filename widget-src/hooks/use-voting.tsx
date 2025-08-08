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
      // Store vote in SyncedMap
      const userId = figma.currentUser?.id || `voter-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      console.log("Storing vote:", { userId, userName, value });

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
