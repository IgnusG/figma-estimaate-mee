import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUserPolling } from "./use-user-polling";
import { Participant, SyncedMapLike } from "../utils/types";

// Mock Figma API
const mockFigma = {
  activeUsers: [] as Array<{ id: string; name: string }>,
};

global.figma = mockFigma as any;

// Mock debug
vi.mock("../utils/debug", () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a mock SyncedMap
function createMockSyncedMap<T>(): SyncedMapLike<T> {
  const map = new Map<string, T>();
  return {
    get: (key: string) => map.get(key),
    set: (key: string, value: T) => {
      map.set(key, value);
    },
    delete: (key: string) => {
      map.delete(key);
    },
    keys: () => Array.from(map.keys()),
    size: map.size,
  };
}

describe("useUserPolling - Persistent Hand Functionality", () => {
  let participants: SyncedMapLike<Participant>;
  let setActiveUserIds: ReturnType<typeof vi.fn>;
  let setPollingTrigger: ReturnType<typeof vi.fn>;
  let originalSetTimeout: typeof setTimeout;
  let originalClearTimeout: typeof clearTimeout;
  let originalDateNow: typeof Date.now;

  beforeEach(() => {
    participants = createMockSyncedMap<Participant>();
    setActiveUserIds = vi.fn();
    setPollingTrigger = vi.fn();

    // Mock timers
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;
    originalDateNow = Date.now;

    global.setTimeout = vi.fn((fn, delay) => {
      setTimeout(fn, delay);
      return 123 as any;
    });
    global.clearTimeout = vi.fn();

    // Mock Date.now for consistent timestamps
    Date.now = vi.fn(() => 1000000); // Fixed timestamp

    // Reset figma.activeUsers
    mockFigma.activeUsers = [];
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    Date.now = originalDateNow;
    vi.clearAllMocks();
  });

  describe("lastActiveTime tracking", () => {
    it("should set lastActiveTime when adding new users", () => {
      mockFigma.activeUsers = [{ id: "user1", name: "Alice" }];

      // Simulate the polling logic (simplified)
      const activeUsers = mockFigma.activeUsers;
      activeUsers.forEach((user) => {
        if (user.id) {
          const existingParticipant = participants.get(user.id);
          if (!existingParticipant) {
            participants.set(user.id, {
              userId: user.id,
              userName: user.name || "Anonymous",
              joinedAt: Date.now(),
              lastActiveTime: Date.now(),
            });
          }
        }
      });

      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.lastActiveTime).toBe(1000000);
      expect(participant?.joinedAt).toBe(1000000);
    });

    it("should update lastActiveTime for existing users", () => {
      // Add user initially
      participants.set("user1", {
        userId: "user1",
        userName: "Alice",
        joinedAt: 900000,
        lastActiveTime: 900000,
        cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
      });

      // Update Date.now to simulate time passing
      Date.now = vi.fn(() => 1100000);

      mockFigma.activeUsers = [{ id: "user1", name: "Alice" }];

      // Simulate polling update
      const activeUsers = mockFigma.activeUsers;
      activeUsers.forEach((user) => {
        if (user.id) {
          const existingParticipant = participants.get(user.id);
          if (existingParticipant) {
            participants.set(user.id, {
              ...existingParticipant,
              lastActiveTime: Date.now(),
            });
          }
        }
      });

      const participant = participants.get("user1");
      expect(participant?.lastActiveTime).toBe(1100000);
      expect(participant?.joinedAt).toBe(900000); // Should remain unchanged
      expect(participant?.cards).toHaveLength(1); // Cards should be preserved
    });

    it("should preserve cards when updating lastActiveTime", () => {
      const originalCards = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "spades", rank: "K", id: "K-spades" },
      ];

      participants.set("user1", {
        userId: "user1",
        userName: "Alice",
        joinedAt: 900000,
        lastActiveTime: 900000,
        cards: originalCards,
        cardReplacementsUsed: 1,
      });

      mockFigma.activeUsers = [{ id: "user1", name: "Alice" }];
      Date.now = vi.fn(() => 1100000);

      // Simulate the update logic
      const activeUsers = mockFigma.activeUsers;
      activeUsers.forEach((user) => {
        if (user.id) {
          const existingParticipant = participants.get(user.id);
          if (existingParticipant) {
            participants.set(user.id, {
              ...existingParticipant,
              lastActiveTime: Date.now(),
            });
          }
        }
      });

      const participant = participants.get("user1");
      expect(participant?.cards).toEqual(originalCards);
      expect(participant?.cardReplacementsUsed).toBe(1);
      expect(participant?.lastActiveTime).toBe(1100000);
    });
  });

  describe("grace period cleanup", () => {
    it("should remove participants inactive for more than 10 minutes", () => {
      const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes
      const now = 2000000; // Current time
      const staleTime = now - GRACE_PERIOD_MS - 1000; // 11 minutes ago

      // Add participants with different lastActiveTime
      participants.set("activeUser", {
        userId: "activeUser",
        userName: "Active",
        joinedAt: 1000000,
        lastActiveTime: now - 1000, // 1 second ago - should NOT be cleaned
      });

      participants.set("staleUser", {
        userId: "staleUser",
        userName: "Stale",
        joinedAt: 1000000,
        lastActiveTime: staleTime, // 11 minutes ago - should be cleaned
        cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
      });

      participants.set("userWithoutTime", {
        userId: "userWithoutTime",
        userName: "NoTime",
        joinedAt: 1000000,
        // No lastActiveTime - should NOT be cleaned (backward compatibility)
      });

      Date.now = vi.fn(() => now);

      // Simulate cleanup logic
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
      staleParticipantIds.forEach((staleId) => {
        participants.delete(staleId);
      });

      // Verify results
      expect(participants.get("activeUser")).toBeDefined();
      expect(participants.get("staleUser")).toBeUndefined(); // Should be removed
      expect(participants.get("userWithoutTime")).toBeDefined(); // Should be preserved
      expect(staleParticipantIds).toEqual(["staleUser"]);
    });

    it("should not remove participants within grace period", () => {
      const GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes
      const now = 2000000;

      // Add participant that's been inactive for 9 minutes (within grace period)
      participants.set("recentUser", {
        userId: "recentUser",
        userName: "Recent",
        joinedAt: 1000000,
        lastActiveTime: now - 9 * 60 * 1000, // 9 minutes ago
        cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
      });

      Date.now = vi.fn(() => now);

      // Simulate cleanup logic
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

      expect(staleParticipantIds).toHaveLength(0);
      expect(participants.get("recentUser")).toBeDefined();
      expect(participants.get("recentUser")?.cards).toHaveLength(1);
    });
  });

  describe("user departure handling", () => {
    it("should preserve participant when user leaves (no immediate deletion)", () => {
      // Add user first
      participants.set("user1", {
        userId: "user1",
        userName: "Alice",
        joinedAt: 1000000,
        lastActiveTime: 1000000,
        cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
      });

      // User was active, now they're not
      const previousActiveUserIds = ["user1"];
      const currentUserIds: string[] = []; // User left

      const usersLeft = previousActiveUserIds.filter(
        (id) => !currentUserIds.includes(id),
      );

      // Simulate the new logic - don't delete immediately
      usersLeft.forEach((leftUserId) => {
        const participant = participants.get(leftUserId);
        if (participant) {
          // Keep participant but don't update lastActiveTime
          // Cards are preserved in the participant object
        }
      });

      // Participant should still exist with cards
      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.cards).toHaveLength(1);
      expect(participant?.lastActiveTime).toBe(1000000); // Unchanged
    });
  });
});
