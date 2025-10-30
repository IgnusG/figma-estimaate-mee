const { widget } = figma;
const { useEffect, waitForTask } = widget;

import { SessionStatus, Participant, SyncedMapLike } from "../utils/types";
import { debug } from "../utils/debug";

export interface UseUserPollingReturn {
  activeUserIds: string[];
  isPolling: boolean;
  participantCount: number;
}

// Global polling state
let globalPollingCount = 0;
let currentTimeout: ReturnType<typeof setTimeout> | null = null;
let isPollingActive = false;

export function useUserPolling(
  sessionStatus: SessionStatus,
  participants: SyncedMapLike<Participant>,
  activeUserIds: string[],
  setActiveUserIds: (ids: string[]) => void,
  setPollingTrigger: (fn: (prev: number) => number) => void,
): UseUserPollingReturn {
  useEffect(() => {
    if (sessionStatus === "voting") {
      // Only start polling if it's not already active
      if (isPollingActive) {
        debug.log("⏭️ Skipping useEffect - polling already active");
        return;
      }

      isPollingActive = true;
      globalPollingCount++;
      debug.log(`🔍 POLL #${globalPollingCount} - useEffect triggered`);

      // Clear any existing timeout first
      if (currentTimeout) {
        debug.log("🧹 Clearing previous timeout");
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }

      try {
        const activeUsers = figma.activeUsers || [];
        const currentUserIds = activeUsers
          .map((u) => u.id)
          .filter((id) => id != null) as string[];

        debug.log(`📊 Poll #${globalPollingCount}:`, {
          activeUsersCount: activeUsers.length,
          currentUserIds,
          previousActiveUserIds: activeUserIds,
        });

        // Always sync participants and update lastActiveTime for active users
        activeUsers.forEach((user) => {
          if (user.id) {
            const existingParticipant = participants.get(user.id);
            if (!existingParticipant) {
              debug.log(`➕ Adding new user:`, {
                userId: user.id,
                userName: user.name,
              });
              participants.set(user.id, {
                userId: user.id,
                userName: user.name || "Anonymous",
                joinedAt: Date.now(),
                lastActiveTime: Date.now(),
              });
            } else {
              // Update lastActiveTime for existing participant
              participants.set(user.id, {
                ...existingParticipant,
                lastActiveTime: Date.now(),
              });
            }
          }
        });

        // Check for changes
        const usersJoined = currentUserIds.filter(
          (id) => !activeUserIds.includes(id),
        );
        const usersLeft = activeUserIds.filter(
          (id) => !currentUserIds.includes(id),
        );

        if (
          usersJoined.length > 0 ||
          usersLeft.length > 0 ||
          JSON.stringify(currentUserIds) !== JSON.stringify(activeUserIds)
        ) {
          debug.log(`🔄 Poll #${globalPollingCount} - Users changed:`, {
            joined: usersJoined,
            left: usersLeft,
          });

          // Mark users who left as inactive (don't delete them yet)
          usersLeft.forEach((leftUserId) => {
            const participant = participants.get(leftUserId);
            if (participant) {
              debug.log(`⏰ User left, marking as inactive:`, leftUserId);
              // Keep participant but don't update lastActiveTime (it will become stale)
              // Cards are preserved in the participant object
            }
          });

          // Update active user IDs
          setActiveUserIds([...currentUserIds]);
        }

        // Periodic cleanup: Remove participants who have been inactive for more than 10 minutes
        const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes
        const now = Date.now();
        const staleParticipantIds: string[] = [];

        for (const participantId of participants.keys()) {
          const participant = participants.get(participantId);
          if (participant && participant.lastActiveTime) {
            const inactiveTime = now - participant.lastActiveTime;
            if (inactiveTime > GRACE_PERIOD_MS) {
              staleParticipantIds.push(participantId);
            }
          }
        }

        // Remove stale participants
        if (staleParticipantIds.length > 0) {
          debug.log(
            `🧹 Cleaning up ${staleParticipantIds.length} stale participants:`,
            staleParticipantIds,
          );
          staleParticipantIds.forEach((staleId) => {
            participants.delete(staleId);
          });
        }

        // Schedule next poll cycle using timeout + re-render
        debug.log(`⏰ Scheduling next poll cycle in 2 second`);

        let promiseResolve: () => void;

        // Use waitForTask to show "Running..." indicator in Figma
        waitForTask(
          new Promise<void>((resolve) => {
            promiseResolve = resolve;
          }),
        );

        currentTimeout = setTimeout(() => {
          if (sessionStatus === "voting") {
            debug.log(`🔄 Timeout fired - triggering re-render`);
            isPollingActive = false; // Reset flag before triggering next poll
            setPollingTrigger((prev) => prev + 1); // This triggers useEffect -> new poll cycle
          }
          promiseResolve();
        }, 2000);
      } catch (error) {
        debug.error(`❌ Poll #${globalPollingCount} error:`, error);
      }
    } else {
      // Reset when not in voting mode
      if (currentTimeout) {
        debug.log("🛑 Clearing timeout (not in voting mode)");
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      if (globalPollingCount > 0) {
        debug.log("🛑 Resetting polling state");
        globalPollingCount = 0;
        isPollingActive = false;
      }
    }
  });

  return {
    activeUserIds,
    isPolling: sessionStatus === "voting" && globalPollingCount > 0,
    participantCount: participants.size,
  };
}
