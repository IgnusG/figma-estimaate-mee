import {
  SessionState,
  Participant,
  Vote,
  SyncedMapLike,
  VoteResult,
} from "../utils/types";
import { debug } from "../utils/debug";
import {
  addCardToParticipantWithQuality,
  replaceRandomCard as replaceRandomCardUtil,
} from "../utils/card-utils";

export interface UseSessionStateReturn {
  sessionState: SessionState;
  startSession: () => void;
  revealResults: () => void;
  resetSession: () => void;
  joinSession: () => void;
  replaceRandomCard: () => void;
}

export function useSessionState(
  sessionState: SessionState,
  setSessionState: (state: SessionState) => void,
  participants: SyncedMapLike<Participant>,
  votes: SyncedMapLike<Vote>,
  voteResults: VoteResult[],
  setShowPokerResults?: (show: boolean) => void,
  pokerEnabled?: boolean,
): UseSessionStateReturn {
  const startSession = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      debug.log("Starting session:", { userId, userName });

      // Add user as participant (or preserve existing cards if rejoining)
      const existingParticipant = participants.get(userId);
      participants.set(userId, {
        userId,
        userName,
        joinedAt: existingParticipant?.joinedAt || Date.now(),
        lastActiveTime: Date.now(),
        cards: existingParticipant?.cards, // Preserve existing cards
        cardReplacementsUsed: existingParticipant?.cardReplacementsUsed,
      });

      setSessionState({
        status: "voting",
        participants: [userId],
      });
    } catch (error) {
      debug.error("Error starting session:", error);
      // Fallback without currentUser
      const fallbackId = `user-${Date.now()}`;
      const existingFallbackParticipant = participants.get(fallbackId);
      participants.set(fallbackId, {
        userId: fallbackId,
        userName: "Anonymous",
        joinedAt: existingFallbackParticipant?.joinedAt || Date.now(),
        lastActiveTime: Date.now(),
        cards: existingFallbackParticipant?.cards, // Preserve existing cards
        cardReplacementsUsed: existingFallbackParticipant?.cardReplacementsUsed,
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
        // Prevent revealing results if no votes exist
        if (votes.size === 0) {
          debug.log("Cannot reveal results - no votes cast");
          figma.notify("Cannot reveal results - no votes have been cast yet!", {
            timeout: 3000,
          });
          return;
        }

        debug.log("Revealing results");

        // Distribute cards to participants who voted (only if poker is enabled)
        if (pokerEnabled) {
          const voterIds = votes.keys();
          debug.log("Distributing consensus-based cards to voters:", voterIds);

          for (const voterId of voterIds) {
            const participant = participants.get(voterId);
            const vote = votes.get(voterId);
            if (participant && vote) {
              const { cards: updatedCards, reason } =
                addCardToParticipantWithQuality(
                  participant.cards,
                  vote.value,
                  voteResults,
                );

              participants.set(voterId, {
                ...participant,
                cards: updatedCards,
              });

              debug.log(
                `Added card to ${participant.userName} (voted ${vote.value}), now has ${updatedCards.length} cards - ${reason}`,
              );

              // Show personalized notification to user
              if (figma.currentUser?.id === voterId) {
                figma.notify(reason, { timeout: 5000 });
              }
            }
          }
        } else {
          debug.log("Poker disabled - skipping card distribution");
        }

        // Capture snapshot of current participants AFTER card distribution
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
                  cards: participant?.cards, // Include cards in snapshot
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

        // Reset card replacement counters for all participants
        for (const participantId of participants.keys()) {
          const participant = participants.get(participantId);
          if (participant) {
            participants.set(participantId, {
              ...participant,
              cardReplacementsUsed: 0,
            });
          }
        }

        setSessionState({
          ...sessionState,
          status: "voting",
          participantsSnapshot: undefined, // Clear the snapshot for new session
        });

        // Reset poker results
        if (setShowPokerResults) {
          setShowPokerResults(false);
        }
      }
    } catch (error) {
      debug.error("Error resetting session:", error);
    }
  };

  const joinSession = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`;
      const userName = figma.currentUser?.name || "Anonymous";

      // Add as participant or update existing participant
      const existingParticipant = participants.get(userId);
      if (!existingParticipant) {
        participants.set(userId, {
          userId,
          userName,
          joinedAt: Date.now(),
          lastActiveTime: Date.now(),
        });

        // Update session participant list
        const currentParticipants = sessionState.participants;
        if (!currentParticipants.includes(userId)) {
          setSessionState({
            ...sessionState,
            participants: [...currentParticipants, userId],
          });
        }
      } else {
        // Update lastActiveTime for existing participant (preserves cards)
        participants.set(userId, {
          ...existingParticipant,
          userName, // Update name in case it changed
          lastActiveTime: Date.now(),
        });

        debug.log(
          `👋 User rejoined with ${existingParticipant.cards?.length || 0} existing cards:`,
          userId,
        );
      }
    } catch (error) {
      debug.error("Error joining session:", error);
    }
  };

  const replaceRandomCard = () => {
    try {
      const userId = figma.currentUser?.id;
      if (!userId) return;

      const participant = participants.get(userId);
      if (
        !participant ||
        !participant.cards ||
        participant.cards.length === 0
      ) {
        debug.log("No cards to replace for user:", userId);
        figma.notify("You don't have any cards to replace.", { timeout: 5000 });
        return;
      }

      // Check if user has already replaced a card this turn
      const replacementsUsed = participant.cardReplacementsUsed || 0;
      if (replacementsUsed >= 1) {
        figma.notify(
          "You can only replace one card per turn. Wait for the next round!",
          { timeout: 5000 },
        );
        return;
      }

      const updatedCards = replaceRandomCardUtil(participant.cards);
      participants.set(userId, {
        ...participant,
        cards: updatedCards,
        cardReplacementsUsed: replacementsUsed + 1,
      });

      debug.log(
        `Replaced random card for ${participant.userName}, still has ${updatedCards.length} cards, used ${replacementsUsed + 1} replacements`,
      );
      figma.notify(
        `Replaced one card! You now have ${updatedCards.length} cards.`,
        { timeout: 5000 },
      );
    } catch (error) {
      debug.error("Error replacing random card:", error);
    }
  };

  return {
    sessionState,
    startSession,
    revealResults,
    resetSession,
    joinSession,
    replaceRandomCard,
  };
}
