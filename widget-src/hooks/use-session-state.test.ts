import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSessionState } from "./use-session-state";
import {
  Participant,
  Vote,
  SessionState,
  VoteResult,
  SyncedMapLike,
} from "../utils/types";

// Mock Figma API
const mockFigma = {
  currentUser: { id: "user1", name: "Alice" },
  notify: vi.fn(),
};

global.figma = mockFigma as any;

// Mock debug
vi.mock("../utils/debug", () => ({
  debug: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock card utils
vi.mock("../utils/card-utils", () => ({
  addCardToParticipantWithQuality: vi.fn(() => ({
    cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
    reason: "Test card added",
    isSpecialPenalty: false,
  })),
  replaceRandomCard: vi.fn((cards) => cards),
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
    values: () => Array.from(map.values()),
    size: map.size,
  };
}

describe("useSessionState - Card Preservation", () => {
  let participants: SyncedMapLike<Participant>;
  let votes: SyncedMapLike<Vote>;
  let sessionState: SessionState;
  let setSessionState: ReturnType<typeof vi.fn>;
  let setShowPokerResults: ReturnType<typeof vi.fn>;
  let voteResults: VoteResult[];
  let originalDateNow: typeof Date.now;

  beforeEach(() => {
    participants = createMockSyncedMap<Participant>();
    votes = createMockSyncedMap<Vote>();
    sessionState = {
      status: "waiting",
      participants: [],
    };
    setSessionState = vi.fn();
    setShowPokerResults = vi.fn();
    voteResults = [];

    // Mock Date.now for consistent timestamps
    originalDateNow = Date.now;
    Date.now = vi.fn(() => 1000000);

    // Reset figma mocks
    mockFigma.currentUser = { id: "user1", name: "Alice" };
    mockFigma.notify = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe("startSession", () => {
    it("should preserve existing cards when user starts session", () => {
      // Pre-existing participant with cards
      const existingCards = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "spades", rank: "K", id: "K-spades" },
      ];

      participants.set("user1", {
        userId: "user1",
        userName: "Alice",
        joinedAt: 900000,
        lastActiveTime: 950000,
        cards: existingCards,
        cardReplacementsUsed: 1,
      });

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.startSession();

      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.cards).toEqual(existingCards); // Cards preserved
      expect(participant?.cardReplacementsUsed).toBe(1); // State preserved
      expect(participant?.joinedAt).toBe(900000); // Original joinedAt preserved
      expect(participant?.lastActiveTime).toBe(1000000); // Updated to current time
    });

    it("should create new participant when no existing participant found", () => {
      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.startSession();

      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.cards).toBeUndefined(); // No cards initially
      expect(participant?.cardReplacementsUsed).toBeUndefined();
      expect(participant?.joinedAt).toBe(1000000);
      expect(participant?.lastActiveTime).toBe(1000000);
    });
  });

  describe("joinSession", () => {
    it("should preserve cards when existing user rejoins", () => {
      const existingCards = [
        { suit: "hearts", rank: "A", id: "A-hearts" },
        { suit: "clubs", rank: "Q", id: "Q-clubs" },
        { suit: "diamonds", rank: "J", id: "J-diamonds" },
      ];

      // Set up existing participant
      participants.set("user1", {
        userId: "user1",
        userName: "Alice",
        joinedAt: 900000,
        lastActiveTime: 950000,
        cards: existingCards,
        cardReplacementsUsed: 2,
      });

      sessionState = {
        status: "voting",
        participants: ["user2"], // user1 not in session participants list
      };

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.joinSession();

      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.cards).toEqual(existingCards); // Cards preserved
      expect(participant?.cardReplacementsUsed).toBe(2); // State preserved
      expect(participant?.userName).toBe("Alice"); // Name updated
      expect(participant?.lastActiveTime).toBe(1000000); // Updated to current time
      expect(participant?.joinedAt).toBe(900000); // Original time preserved
    });

    it("should create new participant when user joins for first time", () => {
      sessionState = {
        status: "voting",
        participants: [],
      };

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.joinSession();

      const participant = participants.get("user1");
      expect(participant).toBeDefined();
      expect(participant?.cards).toBeUndefined(); // No cards for new user
      expect(participant?.cardReplacementsUsed).toBeUndefined();
      expect(participant?.joinedAt).toBe(1000000);
      expect(participant?.lastActiveTime).toBe(1000000);
    });

    it("should update session participants list when user joins", () => {
      sessionState = {
        status: "voting",
        participants: ["user2"],
      };

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.joinSession();

      expect(setSessionState).toHaveBeenCalledWith({
        status: "voting",
        participants: ["user2", "user1"],
      });
    });

    it("should handle user name changes on rejoin", () => {
      // Set up existing participant with old name
      participants.set("user1", {
        userId: "user1",
        userName: "OldName",
        joinedAt: 900000,
        lastActiveTime: 950000,
        cards: [{ suit: "hearts", rank: "A", id: "A-hearts" }],
      });

      // Current user has new name
      mockFigma.currentUser = { id: "user1", name: "NewName" };

      sessionState = {
        status: "voting",
        participants: ["user1"],
      };

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.joinSession();

      const participant = participants.get("user1");
      expect(participant?.userName).toBe("NewName"); // Name updated
      expect(participant?.cards).toHaveLength(1); // Cards preserved
    });
  });

  describe("fallback behavior", () => {
    it("should handle missing currentUser gracefully", () => {
      mockFigma.currentUser = null;
      Date.now = vi.fn(() => 1234567);

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.startSession();

      // Should create fallback user
      const fallbackUserId = "user-1234567";
      const participant = participants.get(fallbackUserId);
      expect(participant).toBeDefined();
      expect(participant?.userName).toBe("Anonymous");
      expect(participant?.lastActiveTime).toBe(1234567);
    });

    it("should preserve cards for fallback user if rejoining", () => {
      const fallbackUserId = "user-1234567";
      const existingCards = [{ suit: "hearts", rank: "A", id: "A-hearts" }];

      // Set up existing fallback participant
      participants.set(fallbackUserId, {
        userId: fallbackUserId,
        userName: "Anonymous",
        joinedAt: 900000,
        lastActiveTime: 950000,
        cards: existingCards,
      });

      mockFigma.currentUser = null;
      Date.now = vi.fn(() => 1234567);

      const sessionStateHook = useSessionState(
        sessionState,
        setSessionState,
        participants,
        votes,
        voteResults,
        setShowPokerResults,
        true,
      );

      sessionStateHook.startSession();

      const participant = participants.get(fallbackUserId);
      expect(participant?.cards).toEqual(existingCards); // Cards preserved
      expect(participant?.joinedAt).toBe(900000); // Original time preserved
      expect(participant?.lastActiveTime).toBe(1234567); // Updated
    });
  });
});
