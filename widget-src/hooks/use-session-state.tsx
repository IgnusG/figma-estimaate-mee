import { SessionState, Participant, Vote, SyncedMapLike } from "../utils/types";

export interface UseSessionStateReturn {
  sessionState: SessionState;
  startSession: () => void;
  revealResults: () => void;
  resetSession: () => void;
  joinSession: (asSpectator: boolean) => void;
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

      console.log("Starting session:", { userId, userName });

      // Add facilitator as participant
      participants.set(userId, {
        userId,
        userName,
        isSpectator: false,
        joinedAt: Date.now(),
      });

      setSessionState({
        status: "voting",
        facilitatorId: userId,
        participants: [userId],
      });
    } catch (error) {
      console.error("Error starting session:", error);
      // Fallback without currentUser
      const fallbackId = `user-${Date.now()}`;
      participants.set(fallbackId, {
        userId: fallbackId,
        userName: "Anonymous",
        isSpectator: false,
        joinedAt: Date.now(),
      });
      setSessionState({
        status: "voting",
        facilitatorId: fallbackId,
        participants: [fallbackId],
      });
    }
  };

  const revealResults = () => {
    try {
      // Only facilitator can reveal results
      const userId = figma.currentUser?.id || sessionState.facilitatorId;
      if (userId === sessionState.facilitatorId) {
        console.log("Revealing results");

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
                  isSpectator: participant?.isSpectator || false,
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
          console.error("Error capturing participants snapshot:", error);
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
      console.error("Error revealing results:", error);
    }
  };

  const resetSession = () => {
    try {
      // Only facilitator can reset
      const userId = figma.currentUser?.id || sessionState.facilitatorId;
      if (userId === sessionState.facilitatorId) {
        console.log("Resetting session");
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
      console.error("Error resetting session:", error);
    }
  };

  const joinSession = (asSpectator = false) => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      // Add as participant if not already present
      if (!participants.get(userId)) {
        participants.set(userId, {
          userId,
          userName,
          isSpectator: asSpectator,
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
      console.error("Error joining session:", error);
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
