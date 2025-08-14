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

export function useUserPolling(
  sessionStatus: SessionStatus,
  participants: SyncedMapLike<Participant>,
  activeUserIds: string[],
  setActiveUserIds: (ids: string[]) => void,
  setPollingTrigger: (fn: (prev: number) => number) => void,
): UseUserPollingReturn {
  useEffect(() => {
    if (sessionStatus === "voting") {
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

        // Always sync participants
        activeUsers.forEach((user) => {
          if (user.id && !participants.get(user.id)) {
            debug.log(`➕ Adding user:`, {
              userId: user.id,
              userName: user.name,
            });
            participants.set(user.id, {
              userId: user.id,
              userName: user.name || "Anonymous",
              joinedAt: Date.now(),
            });
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

          // Remove users who left (preserve votes)
          usersLeft.forEach((leftUserId) => {
            const participant = participants.get(leftUserId);
            const hasVoted = false; // We don't have access to votes here, but this is handled in main component
            if (participant && !hasVoted) {
              debug.log(`➖ Removing user:`, leftUserId);
              participants.delete(leftUserId);
            }
          });

          // Update active user IDs
          setActiveUserIds([...currentUserIds]);
        }

        // Schedule next poll cycle using waitForTask + timeout + re-render
        debug.log(`⏰ Scheduling next poll cycle in 2 second`);

        let promiseResolve: () => void;

        waitForTask(
          new Promise<void>((resolve) => {
            promiseResolve = resolve;
          }),
        );

        currentTimeout = setTimeout(() => {
          if (sessionStatus === "voting") {
            debug.log(`🔄 Timeout fired - triggering re-render`);
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
      }
    }
  });

  return {
    activeUserIds,
    isPolling: sessionStatus === "voting" && globalPollingCount > 0,
    participantCount: participants.size,
  };
}
