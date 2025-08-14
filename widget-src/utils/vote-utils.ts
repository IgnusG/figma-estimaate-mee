import { VoteResult, Participant, Vote, SyncedMapLike } from "./types";

export function groupVotesByValue(votes: SyncedMapLike<Vote>): VoteResult[] {
  const grouped = new Map<number | string, VoteResult>();

  for (const key of votes.keys()) {
    const vote = votes.get(key);
    if (!vote) continue;
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
  }

  return Array.from(grouped.values()).sort((a, b) => {
    // Sort by value (numbers first, then strings)
    if (typeof a.value === "number" && typeof b.value === "number") {
      return a.value - b.value;
    }
    if (typeof a.value === "number") return -1;
    if (typeof b.value === "number") return 1;
    return String(a.value).localeCompare(String(b.value));
  });
}

export function getEligibleVoters(participants: Participant[]): Participant[] {
  return participants; // All participants are eligible to vote
}

export function calculateVoteProgress(votes: number, total: number): string {
  return `${votes}/${total}`;
}
