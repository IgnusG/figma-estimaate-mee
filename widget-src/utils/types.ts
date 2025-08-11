export interface Vote {
  userId: string;
  userName: string;
  value: number | string;
  timestamp: number;
}

export interface SessionState {
  status: "waiting" | "voting" | "revealed";
  facilitatorId: string;
  participants: string[];
  participantsSnapshot?: Participant[]; // Snapshot of participants when results revealed
}

export interface Participant {
  userId: string;
  userName: string;
  joinedAt: number;
}

export interface VoteResult {
  value: number | string;
  participants: Array<{
    name: string;
    userId: string;
  }>;
  count: number;
}

export type SessionStatus = "waiting" | "voting" | "revealed";

export interface CardData {
  value: number | string;
  title: string;
  tooltip: string;
  assetPath: string;
}

// Type for Figma SyncedMap which doesn't fully match Map interface
export type SyncedMapLike<T> = {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  delete(key: string): void;
  keys(): string[];
  size: number;
};
