import { describe, it, expect } from "vitest";
import { groupVotesByValue, getEligibleVoters, calculateVoteProgress } from "./vote-utils";
import { Vote, Participant } from "./types";

// Mock SyncedMapLike implementation for testing
class MockSyncedMap<T> {
  private map = new Map<string, T>();
  
  set(key: string, value: T): void {
    this.map.set(key, value);
  }
  
  get(key: string): T | undefined {
    return this.map.get(key);
  }
  
  keys(): string[] {
    return Array.from(this.map.keys());
  }
  
  delete(key: string): void {
    this.map.delete(key);
  }
  
  get size(): number {
    return this.map.size;
  }
}

describe("Vote Utils", () => {
  describe("groupVotesByValue", () => {
    it("should group votes correctly", () => {
      const mockVotes = new MockSyncedMap<Vote>();
      mockVotes.set("user1", { userId: "user1", userName: "Alice", value: 5, timestamp: 1000 });
      mockVotes.set("user2", { userId: "user2", userName: "Bob", value: 5, timestamp: 1001 });
      mockVotes.set("user3", { userId: "user3", userName: "Charlie", value: 8, timestamp: 1002 });
      mockVotes.set("user4", { userId: "user4", userName: "Diana", value: "?", timestamp: 1003 });

      const results = groupVotesByValue(mockVotes);

      expect(results).toHaveLength(3);
      
      // First group (value 5 with 2 votes)
      expect(results[0].value).toBe(5);
      expect(results[0].count).toBe(2);
      expect(results[0].participants.map(p => p.name)).toEqual(["Alice", "Bob"]);
      
      // Second group (value 8 with 1 vote)
      expect(results[1].value).toBe(8);
      expect(results[1].count).toBe(1);
      expect(results[1].participants[0].name).toBe("Charlie");
      
      // Third group (joker value)
      expect(results[2].value).toBe("?");
      expect(results[2].count).toBe(1);
      expect(results[2].participants[0].name).toBe("Diana");
    });

    it("should sort results with numbers first, then strings", () => {
      const mockVotes = new MockSyncedMap<Vote>();
      mockVotes.set("user1", { userId: "user1", userName: "Alice", value: "∞", timestamp: 1000 });
      mockVotes.set("user2", { userId: "user2", userName: "Bob", value: 3, timestamp: 1001 });
      mockVotes.set("user3", { userId: "user3", userName: "Charlie", value: 1, timestamp: 1002 });
      mockVotes.set("user4", { userId: "user4", userName: "Diana", value: "?", timestamp: 1003 });

      const results = groupVotesByValue(mockVotes);

      // Numbers should come first (1, 3), then strings (?, ∞)
      expect(results.map(r => r.value)).toEqual([1, 3, "?", "∞"]);
    });

    it("should handle empty votes", () => {
      const mockVotes = new MockSyncedMap<Vote>();
      const results = groupVotesByValue(mockVotes);
      expect(results).toHaveLength(0);
    });

    it("should handle undefined votes in map", () => {
      const mockVotes = new MockSyncedMap<Vote>();
      mockVotes.set("user1", { userId: "user1", userName: "Alice", value: 5, timestamp: 1000 });
      
      // Mock a case where get returns undefined
      const originalGet = mockVotes.get.bind(mockVotes);
      mockVotes.get = (key: string) => {
        if (key === "undefined-user") return undefined;
        return originalGet(key);
      };
      mockVotes.set("undefined-user", { userId: "undefined-user", userName: "Ghost", value: 3, timestamp: 1000 });
      
      const results = groupVotesByValue(mockVotes);
      expect(results).toHaveLength(1); // Should skip undefined votes
      expect(results[0].value).toBe(5);
    });
  });

  describe("getEligibleVoters", () => {
    it("should filter out spectators", () => {
      const participants: Participant[] = [
        { userId: "user1", userName: "Alice", isSpectator: false, joinedAt: 1000 },
        { userId: "user2", userName: "Bob", isSpectator: true, joinedAt: 1001 },
        { userId: "user3", userName: "Charlie", isSpectator: false, joinedAt: 1002 },
      ];

      const eligibleVoters = getEligibleVoters(participants);
      expect(eligibleVoters).toHaveLength(2);
      expect(eligibleVoters.map(p => p.userName)).toEqual(["Alice", "Charlie"]);
    });

    it("should return empty array when all are spectators", () => {
      const participants: Participant[] = [
        { userId: "user1", userName: "Alice", isSpectator: true, joinedAt: 1000 },
        { userId: "user2", userName: "Bob", isSpectator: true, joinedAt: 1001 },
      ];

      const eligibleVoters = getEligibleVoters(participants);
      expect(eligibleVoters).toHaveLength(0);
    });

    it("should return empty array for empty input", () => {
      const eligibleVoters = getEligibleVoters([]);
      expect(eligibleVoters).toHaveLength(0);
    });
  });

  describe("calculateVoteProgress", () => {
    it("should format vote progress correctly", () => {
      expect(calculateVoteProgress(3, 5)).toBe("3/5");
      expect(calculateVoteProgress(0, 10)).toBe("0/10");
      expect(calculateVoteProgress(7, 7)).toBe("7/7");
    });

    it("should handle zero total", () => {
      expect(calculateVoteProgress(0, 0)).toBe("0/0");
    });
  });
});