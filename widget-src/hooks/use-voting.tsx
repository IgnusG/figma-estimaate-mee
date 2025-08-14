import { Vote, VoteResult, SyncedMapLike } from "../utils/types";
import { groupVotesByValue } from "../utils/vote-utils";
import { debug } from "../utils/debug";

export interface UseVotingReturn {
  votes: SyncedMapLike<Vote>;
  handleVote: (currentUserId: string, value: number | string | undefined) => void;
  groupedResults: VoteResult[];
}

export function useVoting(
  votes: SyncedMapLike<Vote>,
  count: number,
  setCount: (count: number) => void,
  addRecentVote?: (userId: string, timestamp: number) => void,
): UseVotingReturn {

  const handleVote = (currentUserId: string, value: number | string | undefined) => {
    try {
      // Validate currentUserId
      if (!currentUserId || currentUserId.trim() === "") {
        debug.log("Invalid userId provided, skipping vote");
        return;
      }

      // Only use the currentUserId argument - no fallback
      const userId = currentUserId;
      const userName = figma.currentUser?.name || "Anonymous";

      debug.log("Handling vote:", { userId, userName, value, currentUserId });

      if (value === undefined) {
        // Clear the vote by removing it from the map
        debug.log("Clearing vote for user:", userId);
        votes.delete(userId);
      } else {
        // Set the vote
        const timestamp = Date.now();
        debug.log("Storing vote:", { userId, userName, value });
        votes.set(userId, {
          userId,
          userName,
          value,
          timestamp,
        });
        
        // Track recent vote for sync indicator
        if (addRecentVote) {
          addRecentVote(userId, timestamp);
        }
      }

      setCount(count + 1);
    } catch (error) {
      debug.error("Error in vote handler:", error);
      // Fallback without map storage
      setCount(count + 1);
    }
  };

  const groupedResults = groupVotesByValue(votes);

  return {
    votes,
    handleVote,
    groupedResults,
  };
}
