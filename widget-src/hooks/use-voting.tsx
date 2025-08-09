import { Vote, VoteResult, SyncedMapLike } from "../utils/types";
import { groupVotesByValue } from "../utils/vote-utils";
import { debug } from "../utils/debug";

export interface UseVotingReturn {
  votes: SyncedMapLike<Vote>;
  handleVote: (value: number | string | undefined) => void;
  groupedResults: VoteResult[];
  currentUserVote?: Vote;
}

export function useVoting(
  votes: SyncedMapLike<Vote>,
  currentUserId: string,
  count: number,
  setCount: (count: number) => void,
): UseVotingReturn {
  // Early return if currentUserId is falsy (during initial loading state)
  if (!currentUserId) {
    debug.log("useVoting: currentUserId is falsy, returning noop");
    return {
      votes,
      handleVote: () => {}, // noop function
      groupedResults: [],
      currentUserVote: undefined,
    };
  }

  const handleVote = (value: number | string | undefined) => {
    try {
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
        debug.log("Storing vote:", { userId, userName, value });
        votes.set(userId, {
          userId,
          userName,
          value,
          timestamp: Date.now(),
        });
      }

      setCount(count + 1);
    } catch (error) {
      debug.error("Error in vote handler:", error);
      // Fallback without map storage
      setCount(count + 1);
    }
  };

  const groupedResults = groupVotesByValue(votes);

  // currentUserVote relies solely on currentUserId
  const currentUserVote = votes.get(currentUserId);

  return {
    votes,
    handleVote,
    groupedResults,
    currentUserVote,
  };
}
