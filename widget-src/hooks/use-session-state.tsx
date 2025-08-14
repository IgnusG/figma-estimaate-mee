import { SessionState, Participant, Vote, SyncedMapLike } from "../utils/types";
import { debug } from "../utils/debug";

export interface UseSessionStateReturn {
  sessionState: SessionState;
  startSession: () => void;
  revealResults: () => void;
  resetSession: () => void;
  joinSession: () => void;
}

export function useSessionState(
  sessionState: SessionState,
  setSessionState: (state: SessionState) => void,
  participants: SyncedMapLike<Participant>,
  votes: SyncedMapLike<Vote>,
): UseSessionStateReturn {
  const startSession = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      debug.log("Starting session:", { userId, userName });

      // Add user as participant
      participants.set(userId, {
        userId,
        userName,
        joinedAt: Date.now(),
      });

      setSessionState({
        status: "voting",
        participants: [userId],
      });
    } catch (error) {
      debug.error("Error starting session:", error);
      // Fallback without currentUser
      const fallbackId = `user-${Date.now()}`;
      participants.set(fallbackId, {
        userId: fallbackId,
        userName: "Anonymous",
        joinedAt: Date.now(),
      });
      setSessionState({
        status: "voting",
        participants: [fallbackId],
      });
    }
  };

  const revealResults = () => {
    try {
      // Any participant can reveal results
      const userId = figma.currentUser?.id;
      if (userId) {
        debug.log("Revealing results");

        // Capture snapshot of current participants
        const currentParticipants: Participant[] = [];
        try {
          const activeUsers = figma.activeUsers || [];
          if (activeUsers.length > 0) {
            // Use active users as the definitive participant list
            activeUsers.forEach((user) => {
              if (user.id) {
                const participant = participants.get(user.id);
                currentParticipants.push({
                  userId: user.id,
                  userName: user.name || "Anonymous",
                  joinedAt: participant?.joinedAt || Date.now(),
                });
              }
            });
          } else {
            // Fallback to session participants
            sessionState.participants.forEach((userId) => {
              const participant = participants.get(userId);
              if (participant) {
                currentParticipants.push(participant);
              }
            });
          }
        } catch (error) {
          debug.error("Error capturing participants snapshot:", error);
          // Fallback to session participants
          sessionState.participants.forEach((userId) => {
            const participant = participants.get(userId);
            if (participant) {
              currentParticipants.push(participant);
            }
          });
        }

        setSessionState({
          ...sessionState,
          status: "revealed",
          participantsSnapshot: currentParticipants,
        });
      }
    } catch (error) {
      debug.error("Error revealing results:", error);
    }
  };

  const resetSession = () => {
    try {
      // Any participant can reset
      const userId = figma.currentUser?.id;
      if (userId) {
        debug.log("Resetting session");
        // Clear all votes
        for (const key of votes.keys()) {
          votes.delete(key);
        }
        setSessionState({
          ...sessionState,
          status: "voting",
          participantsSnapshot: undefined, // Clear the snapshot for new session
        });
      }
    } catch (error) {
      debug.error("Error resetting session:", error);
    }
  };

  const joinSession = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      // Add as participant if not already present
      if (!participants.get(userId)) {
        participants.set(userId, {
          userId,
          userName,
          joinedAt: Date.now(),
        });

        // Update session participant list
        const currentParticipants = sessionState.participants;
        if (!currentParticipants.includes(userId)) {
          setSessionState({
            ...sessionState,
            participants: [...currentParticipants, userId],
          });
        }
      }
    } catch (error) {
      debug.error("Error joining session:", error);
    }
  };

  return {
    sessionState,
    startSession,
    revealResults,
    resetSession,
    joinSession,
  };
}
