import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVoting } from "./use-voting";
import { Vote, SyncedMapLike } from "../utils/types";

// Mock figma global with multiple users
const mockUsers = {
  user1: { id: "user-1", name: "Alice" },
  user2: { id: "user-2", name: "Bob" },
  user3: { id: "user-3", name: "Charlie" },
};

describe("useVoting hook - Multi-user scenarios", () => {
  let sharedVotesMap: Map<string, Vote>;
  let mockVotesUser1: SyncedMapLike<Vote>;
  let mockVotesUser2: SyncedMapLike<Vote>;
  let mockVotesUser3: SyncedMapLike<Vote>;
  let mockSetCount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a shared votes map that all users will interact with
    sharedVotesMap = new Map<string, Vote>();

    // Create mock synced maps for each user that all reference the same underlying map
    const createUserVotesMap = () =>
      ({
        get: (key: string) => sharedVotesMap.get(key),
        set: (key: string, value: Vote) => sharedVotesMap.set(key, value),
        delete: (key: string) => sharedVotesMap.delete(key),
        has: (key: string) => sharedVotesMap.has(key),
        clear: () => sharedVotesMap.clear(),
        keys: () => Array.from(sharedVotesMap.keys()),
        values: () => Array.from(sharedVotesMap.values()),
        entries: () => Array.from(sharedVotesMap.entries()),
        get size() {
          return sharedVotesMap.size;
        },
      }) as SyncedMapLike<Vote>;

    mockVotesUser1 = createUserVotesMap();
    mockVotesUser2 = createUserVotesMap();
    mockVotesUser3 = createUserVotesMap();

    mockSetCount = vi.fn();
  });

  describe("synchronized vote selection and deselection", () => {
    it("should sync vote selection across all users", () => {
      // User 1 votes
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        mockSetCount,
      );

      handleVoteUser1("user-1", 5);

      // Verify all users see User 1's vote
      expect(mockVotesUser1.get("user-1")?.value).toBe(5);
      expect(mockVotesUser2.get("user-1")?.value).toBe(5);
      expect(mockVotesUser3.get("user-1")?.value).toBe(5);
      expect(mockVotesUser1.get("user-1")?.userName).toBe("Alice");
    });

    it("should sync vote deselection across all users", () => {
      // User 2 votes
      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        mockSetCount,
      );

      handleVoteUser2("user-2", 8);
      expect(mockVotesUser1.get("user-2")?.value).toBe(8);

      // User 2 deselects
      handleVoteUser2("user-2", undefined);

      // Verify all users see the deselection
      expect(mockVotesUser1.get("user-2")).toBeUndefined();
      expect(mockVotesUser2.get("user-2")).toBeUndefined();
      expect(mockVotesUser3.get("user-2")).toBeUndefined();
    });

    it("should handle multiple users voting and deselecting independently", () => {
      // Set up voting handlers for all users
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        vi.fn(),
      );

      global.figma = { currentUser: mockUsers.user3 } as any;
      const { handleVote: handleVoteUser3 } = useVoting(
        mockVotesUser3,
        0,
        vi.fn(),
      );

      // All users vote
      handleVoteUser1("user-1", 3);
      handleVoteUser2("user-2", 5);
      handleVoteUser3("user-3", 8);

      expect(sharedVotesMap.size).toBe(3);
      expect(mockVotesUser1.get("user-1")?.value).toBe(3);
      expect(mockVotesUser1.get("user-2")?.value).toBe(5);
      expect(mockVotesUser1.get("user-3")?.value).toBe(8);

      // User 2 deselects their vote
      handleVoteUser2("user-2", undefined);

      expect(sharedVotesMap.size).toBe(2);
      expect(mockVotesUser1.get("user-1")?.value).toBe(3);
      expect(mockVotesUser1.get("user-2")).toBeUndefined();
      expect(mockVotesUser1.get("user-3")?.value).toBe(8);

      // User 2 re-votes with a different value
      handleVoteUser2("user-2", 13);

      expect(sharedVotesMap.size).toBe(3);
      expect(mockVotesUser2.get("user-2")?.value).toBe(13);

      // All users deselect
      handleVoteUser1("user-1", undefined);
      handleVoteUser2("user-2", undefined);
      handleVoteUser3("user-3", undefined);

      expect(sharedVotesMap.size).toBe(0);
    });

    it("should handle rapid selection/deselection from multiple users", () => {
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        vi.fn(),
      );

      // Rapid changes from User 1
      handleVoteUser1("user-1", 1);
      handleVoteUser1("user-1", undefined);
      handleVoteUser1("user-1", 2);
      handleVoteUser1("user-1", 3);
      handleVoteUser1("user-1", undefined);
      handleVoteUser1("user-1", 5);

      // Concurrent changes from User 2
      handleVoteUser2("user-2", 8);
      handleVoteUser2("user-2", undefined);
      handleVoteUser2("user-2", 13);

      // Final state check
      expect(mockVotesUser1.get("user-1")?.value).toBe(5);
      expect(mockVotesUser2.get("user-2")?.value).toBe(13);
      expect(sharedVotesMap.size).toBe(2);
    });

    it("should maintain consistency when users vote for same value", () => {
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        vi.fn(),
      );

      // Both users vote for the same value
      handleVoteUser1("user-1", 5);
      handleVoteUser2("user-2", 5);

      expect(mockVotesUser1.get("user-1")?.value).toBe(5);
      expect(mockVotesUser1.get("user-2")?.value).toBe(5);
      expect(sharedVotesMap.size).toBe(2);

      // One user deselects
      handleVoteUser1("user-1", undefined);

      // Other user's vote should remain
      expect(mockVotesUser1.get("user-1")).toBeUndefined();
      expect(mockVotesUser1.get("user-2")?.value).toBe(5);
      expect(sharedVotesMap.size).toBe(1);
    });

    it("should sync joker card selections and deselections", () => {
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        vi.fn(),
      );

      // User 1 selects a joker card
      handleVoteUser1("user-1", "?");
      expect(mockVotesUser2.get("user-1")?.value).toBe("?");

      // User 2 selects a different joker card
      handleVoteUser2("user-2", "∞");
      expect(mockVotesUser1.get("user-2")?.value).toBe("∞");

      // User 1 deselects
      handleVoteUser1("user-1", undefined);
      expect(mockVotesUser2.get("user-1")).toBeUndefined();
      expect(mockVotesUser2.get("user-2")?.value).toBe("∞");

      // User 1 selects a regular card
      handleVoteUser1("user-1", 8);
      expect(mockVotesUser2.get("user-1")?.value).toBe(8);

      // Both deselect
      handleVoteUser1("user-1", undefined);
      handleVoteUser2("user-2", undefined);
      expect(sharedVotesMap.size).toBe(0);
    });
  });

  describe("vote results grouping with deselection", () => {
    it("should update grouped results when users deselect", () => {
      // Set up initial votes
      sharedVotesMap.set("user-1", {
        userId: "user-1",
        userName: "Alice",
        value: 5,
        timestamp: Date.now(),
      });
      sharedVotesMap.set("user-2", {
        userId: "user-2",
        userName: "Bob",
        value: 5,
        timestamp: Date.now(),
      });
      sharedVotesMap.set("user-3", {
        userId: "user-3",
        userName: "Charlie",
        value: 8,
        timestamp: Date.now(),
      });

      global.figma = { currentUser: mockUsers.user1 } as any;
      const voting1 = useVoting(mockVotesUser1, 0, vi.fn());

      // Check initial grouped results
      expect(voting1.groupedResults).toHaveLength(2);
      const fiveVotes = voting1.groupedResults.find((r) => r.value === 5);
      expect(fiveVotes?.count).toBe(2);
      expect(fiveVotes?.participants).toHaveLength(2);

      // User 1 deselects
      voting1.handleVote("user-1", undefined);

      // Re-fetch voting state to get updated results
      const voting1Updated = useVoting(mockVotesUser1, 0, vi.fn());

      // Check updated grouped results
      const fiveVotesUpdated = voting1Updated.groupedResults.find(
        (r) => r.value === 5,
      );
      expect(fiveVotesUpdated?.count).toBe(1);
      expect(fiveVotesUpdated?.participants).toHaveLength(1);
      expect(fiveVotesUpdated?.participants[0].userId).toBe("user-2");
    });

    it("should remove value group when all users deselect that value", () => {
      // Two users vote for same value
      sharedVotesMap.set("user-1", {
        userId: "user-1",
        userName: "Alice",
        value: 3,
        timestamp: Date.now(),
      });
      sharedVotesMap.set("user-2", {
        userId: "user-2",
        userName: "Bob",
        value: 3,
        timestamp: Date.now(),
      });

      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1, groupedResults: results1 } =
        useVoting(mockVotesUser1, 0, vi.fn());

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        vi.fn(),
      );

      expect(results1).toHaveLength(1);
      expect(results1[0].value).toBe(3);
      expect(results1[0].count).toBe(2);

      // Both users deselect
      handleVoteUser1("user-1", undefined);
      handleVoteUser2("user-2", undefined);

      // Re-fetch to get updated results
      const { groupedResults: resultsAfter } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      expect(resultsAfter).toHaveLength(0);
    });
  });

  describe("edge cases in multi-user scenarios", () => {
    it("should handle when one user's connection is lost during deselection", () => {
      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        vi.fn(),
      );

      // User votes
      handleVoteUser1("user-1", 5);
      expect(sharedVotesMap.size).toBe(1);

      // Simulate connection issue by making figma.currentUser null
      global.figma.currentUser = null as any;

      // Try to deselect with null user
      handleVoteUser1("user-1", undefined);

      // Vote should still be cleared even with null currentUser
      expect(sharedVotesMap.size).toBe(0);
    });

    it("should handle concurrent modifications safely", () => {
      const user1Count = vi.fn();
      const user2Count = vi.fn();

      global.figma = { currentUser: mockUsers.user1 } as any;
      const { handleVote: handleVoteUser1 } = useVoting(
        mockVotesUser1,
        0,
        user1Count,
      );

      global.figma = { currentUser: mockUsers.user2 } as any;
      const { handleVote: handleVoteUser2 } = useVoting(
        mockVotesUser2,
        0,
        user2Count,
      );

      // Simulate concurrent operations
      const operations = [
        () => handleVoteUser1("user-1", 5),
        () => handleVoteUser2("user-2", 8),
        () => handleVoteUser1("user-1", undefined),
        () => handleVoteUser1("user-1", 3),
        () => handleVoteUser2("user-2", undefined),
        () => handleVoteUser2("user-2", 13),
      ];

      // Execute all operations
      operations.forEach((op) => op());

      // Verify final state
      expect(mockVotesUser1.get("user-1")?.value).toBe(3);
      expect(mockVotesUser1.get("user-2")?.value).toBe(13);
      expect(user1Count).toHaveBeenCalledTimes(3);
      expect(user2Count).toHaveBeenCalledTimes(3);
    });
  });
});
