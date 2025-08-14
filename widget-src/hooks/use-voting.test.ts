import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVoting } from "./use-voting";
import { Vote, SyncedMapLike } from "../utils/types";

// Mock figma global
global.figma = {
  currentUser: {
    id: "user-123",
    name: "Test User",
  },
} as any;

describe("useVoting hook", () => {
  let mockVotes: SyncedMapLike<Vote>;
  let mockSetCount: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock votes map
    const votesData = new Map<string, Vote>();
    mockVotes = {
      get: (key: string) => votesData.get(key),
      set: (key: string, value: Vote) => votesData.set(key, value),
      delete: (key: string) => votesData.delete(key),
      has: (key: string) => votesData.has(key),
      clear: () => votesData.clear(),
      keys: () => Array.from(votesData.keys()),
      values: () => Array.from(votesData.values()),
      entries: () => Array.from(votesData.entries()),
      get size() {
        return votesData.size;
      },
    } as SyncedMapLike<Vote>;

    mockSetCount = vi.fn();
  });

  describe("vote selection and deselection", () => {
    it("should set a vote when a card value is provided", () => {
      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // Select a card with value 5
      handleVote("user-123", 5);

      // Verify vote is stored
      const vote = mockVotes.get("user-123");
      expect(vote).toBeDefined();
      expect(vote?.value).toBe(5);
      expect(vote?.userId).toBe("user-123");
      expect(vote?.userName).toBe("Test User");
      expect(mockSetCount).toHaveBeenCalledWith(1);
    });

    it("should clear vote when undefined is passed (deselect)", () => {
      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // First, select a card
      handleVote("user-123", 5);
      expect(mockVotes.get("user-123")).toBeDefined();

      // Then deselect by passing undefined
      handleVote("user-123", undefined);

      // Verify vote is cleared
      expect(mockVotes.get("user-123")).toBeUndefined();
      expect(mockSetCount).toHaveBeenCalledTimes(2);
      expect(mockSetCount).toHaveBeenLastCalledWith(1);
    });

    it("should allow reselection after clearing", () => {
      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // Select card 5
      handleVote("user-123", 5);
      expect(mockVotes.get("user-123")?.value).toBe(5);

      // Deselect
      handleVote("user-123", undefined);
      expect(mockVotes.get("user-123")).toBeUndefined();

      // Select card 8
      handleVote("user-123", 8);
      expect(mockVotes.get("user-123")?.value).toBe(8);

      expect(mockSetCount).toHaveBeenCalledTimes(3);
    });

    it("should handle string values (joker cards)", () => {
      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // Select a joker card
      handleVote("user-123", "?");
      expect(mockVotes.get("user-123")?.value).toBe("?");

      // Deselect
      handleVote("user-123", undefined);
      expect(mockVotes.get("user-123")).toBeUndefined();

      // Select another joker card
      handleVote("user-123", "∞");
      expect(mockVotes.get("user-123")?.value).toBe("∞");
    });

    it("should update existing vote when selecting different card", () => {
      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // Select card 3
      handleVote("user-123", 3);
      const firstVote = mockVotes.get("user-123");
      expect(firstVote?.value).toBe(3);
      const firstTimestamp = firstVote?.timestamp;

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        // Select card 5 (without deselecting first)
        handleVote("user-123", 5);
        const secondVote = mockVotes.get("user-123");
        expect(secondVote?.value).toBe(5);
        expect(secondVote?.timestamp).toBeGreaterThan(firstTimestamp!);
      }, 10);
    });

    it("should return current user vote correctly", () => {
      const { handleVote, currentUserVote } = useVoting(
        mockVotes,
        0,
        mockSetCount,
      );

      // Initially no vote
      expect(currentUserVote).toBeUndefined();

      // After voting
      handleVote("user-123", 13);
      const voteAfter = mockVotes.get("user-123");
      expect(voteAfter?.value).toBe(13);
    });

    it("should handle errors gracefully", () => {
      // Create a mock that throws on delete
      const errorVotes = {
        ...mockVotes,
        delete: vi.fn(() => {
          throw new Error("Delete failed");
        }),
      } as SyncedMapLike<Vote>;

      const { handleVote } = useVoting(errorVotes, 0, mockSetCount);

      // Should not throw when delete fails
      expect(() => handleVote("user-123", undefined)).not.toThrow();
      // The error is now logged via debug.error which won't show unless debug is enabled
      // Just verify the count was still updated despite the error
      expect(mockSetCount).toHaveBeenCalledWith(1);
    });
  });

  describe("multi-user voting", () => {
    it("should preserve other users' votes when clearing own vote", () => {
      // Add votes from other users
      mockVotes.set("user-456", {
        userId: "user-456",
        userName: "User 2",
        value: 8,
        timestamp: Date.now(),
      });
      mockVotes.set("user-789", {
        userId: "user-789",
        userName: "User 3",
        value: 3,
        timestamp: Date.now(),
      });

      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);

      // Add own vote
      handleVote("user-123", 5);
      expect(mockVotes.get("user-123")?.value).toBe(5);
      expect(mockVotes.get("user-456")?.value).toBe(8);
      expect(mockVotes.get("user-789")?.value).toBe(3);

      // Clear own vote
      handleVote("user-123", undefined);

      // Own vote should be cleared, others preserved
      expect(mockVotes.get("user-123")).toBeUndefined();
      expect(mockVotes.get("user-456")?.value).toBe(8);
      expect(mockVotes.get("user-789")?.value).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("should handle missing currentUserId", () => {
      const { handleVote, currentUserVote, groupedResults } = useVoting(
        mockVotes,
        0,
        mockSetCount,
      );

      // Should return noop function when userId is empty
      handleVote("", 5);
      expect(mockSetCount).not.toHaveBeenCalled();
      expect(currentUserVote).toBeUndefined();
      expect(groupedResults).toEqual([]);
    });

    it("should handle null currentUser in figma global", () => {
      const originalUser = global.figma.currentUser;
      global.figma.currentUser = null as any;

      const { handleVote } = useVoting(mockVotes, 0, mockSetCount);
      handleVote("user-123", 5);

      const vote = mockVotes.get("user-123");
      expect(vote?.userName).toBe("Anonymous");

      global.figma.currentUser = originalUser;
    });
  });
});
