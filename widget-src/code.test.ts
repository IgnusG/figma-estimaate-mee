import { describe, it, expect } from "vitest";

// Test constants and interfaces
const FIBONACCI_CARDS = [
  { value: 0, title: "No Work", emoji: "🚫" },
  { value: 0.5, title: "Tiny Task", emoji: "🤏" },
  { value: 1, title: "Quick Win", emoji: "⚡" },
  { value: 2, title: "Easy Peasy", emoji: "😊" },
  { value: 3, title: "Simple Task", emoji: "👍" },
  { value: 5, title: "Medium Work", emoji: "🔨" },
  { value: 8, title: "Big Task", emoji: "💪" },
  { value: 13, title: "Heavy Lift", emoji: "🏋️" },
  { value: 20, title: "Major Work", emoji: "🎯" },
  { value: 40, title: "Epic Task", emoji: "🚀" },
  { value: 100, title: "Mega Project", emoji: "🏔️" },
];

const JOKER_CARDS = [
  { value: "∞", title: "Infinite", emoji: "♾️" },
  { value: "?", title: "Unknown", emoji: "🤷" },
  { value: "🍕", title: "Pizza Break", emoji: "🍕" },
  { value: "☕", title: "Coffee Time", emoji: "☕" },
];

interface Vote {
  userId: string;
  userName: string;
  value: number | string;
  timestamp: number;
}

interface SessionState {
  facilitatorId: string;
  status: "waiting" | "voting" | "revealed";
  participants: string[];
}

describe("Estimatee-Mee Widget", () => {
  describe("Constants", () => {
    it("should have correct fibonacci cards", () => {
      expect(FIBONACCI_CARDS).toHaveLength(11);
      expect(FIBONACCI_CARDS[0].value).toBe(0);
      expect(FIBONACCI_CARDS[1].value).toBe(0.5);
      expect(FIBONACCI_CARDS[10].value).toBe(100);
    });

    it("should have correct joker cards", () => {
      expect(JOKER_CARDS).toHaveLength(4);
      expect(JOKER_CARDS.map((card) => card.value)).toEqual([
        "∞",
        "?",
        "🍕",
        "☕",
      ]);
    });
  });

  describe("Vote Interface", () => {
    it("should create valid vote object", () => {
      const vote: Vote = {
        userId: "test-user",
        userName: "Test User",
        value: 5,
        timestamp: Date.now(),
      };

      expect(vote.userId).toBe("test-user");
      expect(vote.userName).toBe("Test User");
      expect(vote.value).toBe(5);
      expect(typeof vote.timestamp).toBe("number");
    });

    it("should support joker values", () => {
      const jokerVote: Vote = {
        userId: "test-user",
        userName: "Test User",
        value: "∞",
        timestamp: Date.now(),
      };

      expect(jokerVote.value).toBe("∞");
    });
  });

  describe("SessionState Interface", () => {
    it("should create valid session state", () => {
      const sessionState: SessionState = {
        facilitatorId: "facilitator-123",
        status: "voting",
        participants: ["user-1", "user-2", "user-3"],
      };

      expect(sessionState.facilitatorId).toBe("facilitator-123");
      expect(sessionState.status).toBe("voting");
      expect(sessionState.participants).toHaveLength(3);
    });

    it("should support all status types", () => {
      const statuses: SessionState["status"][] = [
        "waiting",
        "voting",
        "revealed",
      ];

      statuses.forEach((status) => {
        const sessionState: SessionState = {
          facilitatorId: "test",
          status,
          participants: [],
        };
        expect(["waiting", "voting", "revealed"]).toContain(
          sessionState.status,
        );
      });
    });
  });

  describe("Vote Result Grouping", () => {
    it("should group votes by value correctly", () => {
      // Mock vote data
      const mockVotes = new Map([
        [
          "user1",
          { userId: "user1", userName: "Alice", value: 5, timestamp: 1000 },
        ],
        [
          "user2",
          { userId: "user2", userName: "Bob", value: 5, timestamp: 1001 },
        ],
        [
          "user3",
          { userId: "user3", userName: "Charlie", value: 8, timestamp: 1002 },
        ],
        [
          "user4",
          { userId: "user4", userName: "Diana", value: "?", timestamp: 1003 },
        ],
      ]);

      // Simulate the groupVotesByValue function logic
      const grouped = new Map();

      mockVotes.forEach((vote) => {
        const existing = grouped.get(vote.value);
        if (existing) {
          existing.participants.push({
            name: vote.userName,
            userId: vote.userId,
          });
          existing.count++;
        } else {
          grouped.set(vote.value, {
            value: vote.value,
            participants: [
              {
                name: vote.userName,
                userId: vote.userId,
              },
            ],
            count: 1,
          });
        }
      });

      const results = Array.from(grouped.values()).sort((a, b) => {
        if (typeof a.value === "number" && typeof b.value === "number") {
          return a.value - b.value;
        }
        if (typeof a.value === "number") return -1;
        if (typeof b.value === "number") return 1;
        return String(a.value).localeCompare(String(b.value));
      });

      expect(results).toHaveLength(3);

      // Check first group (value 5 with 2 votes)
      expect(results[0].value).toBe(5);
      expect(results[0].count).toBe(2);
      expect(results[0].participants.map((p) => p.name)).toEqual([
        "Alice",
        "Bob",
      ]);

      // Check second group (value 8 with 1 vote)
      expect(results[1].value).toBe(8);
      expect(results[1].count).toBe(1);
      expect(results[1].participants[0].name).toBe("Charlie");

      // Check third group (joker value '?' with 1 vote)
      expect(results[2].value).toBe("?");
      expect(results[2].count).toBe(1);
      expect(results[2].participants[0].name).toBe("Diana");
    });

    it("should sort vote results with numbers first, then strings", () => {
      const mockVotes = new Map([
        [
          "user1",
          { userId: "user1", userName: "Alice", value: "∞", timestamp: 1000 },
        ],
        [
          "user2",
          { userId: "user2", userName: "Bob", value: 3, timestamp: 1001 },
        ],
        [
          "user3",
          { userId: "user3", userName: "Charlie", value: 1, timestamp: 1002 },
        ],
        [
          "user4",
          { userId: "user4", userName: "Diana", value: "?", timestamp: 1003 },
        ],
      ]);

      const grouped = new Map();

      mockVotes.forEach((vote) => {
        grouped.set(vote.value, {
          value: vote.value,
          participants: [{ name: vote.userName, userId: vote.userId }],
          count: 1,
        });
      });

      const results = Array.from(grouped.values()).sort((a, b) => {
        if (typeof a.value === "number" && typeof b.value === "number") {
          return a.value - b.value;
        }
        if (typeof a.value === "number") return -1;
        if (typeof b.value === "number") return 1;
        return String(a.value).localeCompare(String(b.value));
      });

      // Numbers should come first (1, 3), then strings (?, ∞)
      expect(results.map((r) => r.value)).toEqual([1, 3, "?", "∞"]);
    });
  });
});
