const { widget } = figma;
const { useSyncedState, useSyncedMap, useEffect, AutoLayout, Text } = widget;

import { SessionState, Vote, Participant } from "../../utils/types";
import { STORY_POINT_CARDS, JOKER_CARDS } from "../../utils/constants";
import { useSessionState } from "../../hooks/use-session-state";
import { useVoting } from "../../hooks/use-voting";
import { useUserPolling } from "../../hooks/use-user-polling";
import { WelcomeContent } from "../molecules/welcome-content";
import { CardGrid } from "../molecules/card-grid";
import { ParticipantStatus } from "../molecules/participant-status";
import { SessionControls } from "../molecules/session-controls";
import { ResultsView } from "../molecules/results-view";
import { debug } from "../../utils/debug";

export function Widget() {
  const [count, setCount] = useSyncedState("count", 0);
  const [debugEnabled, setDebugEnabled] = useSyncedState("debugEnabled", false);
  const [sessionStateData, setSessionStateData] = useSyncedState<SessionState>(
    "session",
    {
      status: "waiting",
      participants: [],
    },
  );
  const [activeUserIds, setActiveUserIds] = useSyncedState<string[]>(
    "activeUserIds",
    [],
  );
  const [_pollingTrigger, setPollingTrigger] = useSyncedState<number>(
    "pollingTrigger",
    0,
  );
  const [recentVotes, setRecentVotes] = useSyncedState<Record<string, number>>(
    "recentVotes",
    {},
  );
  const [showPokerResults, setShowPokerResults] = useSyncedState<boolean>(
    "showPokerResults",
    false,
  );
  const [pokerEnabled, setPokerEnabled] = useSyncedState<boolean>(
    "pokerEnabled",
    true,
  );
  const votes = useSyncedMap<Vote>("votes");
  const participants = useSyncedMap<Participant>("participants");

  // Sync debug state
  useEffect(() => {
    if (debugEnabled) {
      debug.enable();
    } else {
      debug.disable();
    }
  });

  // Ensure current user is always in participant map after myUserId is set
  useEffect(() => {
    if (figma.currentUser?.id && sessionStateData.status !== "waiting") {
      // Check if current user is in participant map
      const currentParticipant = participants.get(figma.currentUser.id);
      if (!currentParticipant) {
        // Register current user as participant
        const userName = figma.currentUser?.name || "Anonymous";
        debug.log("Registering current user in participant map:", {
          id: figma.currentUser.id,
          userName,
        });

        participants.set(figma.currentUser.id, {
          userId: figma.currentUser.id,
          userName: userName,
          joinedAt: Date.now(),
        });

        // Also ensure they're in the session participants list
        if (!sessionStateData.participants.includes(figma.currentUser.id)) {
          setSessionStateData({
            ...sessionStateData,
            participants: [
              ...sessionStateData.participants,
              figma.currentUser.id,
            ],
          });
        }
      }
    }
  });

  // Use polling hook to manage active users
  useUserPolling(
    sessionStateData.status,
    participants,
    activeUserIds,
    setActiveUserIds,
    setPollingTrigger,
  );

  // Handle user cleanup for votes when users leave
  useEffect(() => {
    if (sessionStateData.status === "voting") {
      // Remove users who left (preserve votes)
      const activeUsers = figma.activeUsers || [];
      const currentUserIds = activeUsers
        .map((u) => u.id)
        .filter((id) => id != null) as string[];

      const usersLeft = activeUserIds.filter(
        (id) => !currentUserIds.includes(id),
      );

      usersLeft.forEach((leftUserId) => {
        const participant = participants.get(leftUserId);
        const hasVoted = votes.get(leftUserId);
        if (participant && !hasVoted) {
          participants.delete(leftUserId);
        }
      });
    }
  });

  // Custom function to add recent votes
  const addRecentVote = (userId: string, timestamp: number) => {
    setRecentVotes({ ...recentVotes, [userId]: timestamp });
  };

  const votingControls = useVoting(votes, count, setCount, addRecentVote);

  const sessionControls = useSessionState(
    sessionStateData,
    setSessionStateData,
    participants,
    votes,
    votingControls.groupedResults,
    setShowPokerResults,
    pokerEnabled,
  );

  // Reveal cards handler
  const handleRevealCards = () => {
    setShowPokerResults(true);
  };

  // Poker toggle handler
  const handlePokerToggle = () => {
    const newPokerEnabled = !pokerEnabled;
    setPokerEnabled(newPokerEnabled);

    if (!newPokerEnabled) {
      // Clear all cards and poker results when disabling
      setShowPokerResults(false);
      for (const participantId of participants.keys()) {
        const participant = participants.get(participantId);
        if (participant && participant.cards) {
          participants.set(participantId, {
            ...participant,
            cards: undefined,
          });
        }
      }
    }
  };

  // Clear recent votes after 1 second
  useEffect(() => {
    const currentTime = Date.now();
    const updatedRecentVotes = { ...recentVotes };
    let hasChanges = false;

    Object.keys(updatedRecentVotes).forEach((userId) => {
      if (currentTime - updatedRecentVotes[userId] > 1000) {
        delete updatedRecentVotes[userId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setRecentVotes(updatedRecentVotes);
    }
  });

  // Render different views based on session state
  if (sessionStateData.status === "waiting") {
    return <WelcomeContent onStartSession={sessionControls.startSession} />;
  }

  if (sessionStateData.status === "revealed") {
    return (
      <ResultsView
        voteResults={votingControls.groupedResults}
        onReset={sessionControls.resetSession}
        participantsSnapshot={sessionStateData.participantsSnapshot}
        votes={votes}
        showPokerResults={showPokerResults}
        onRevealCards={handleRevealCards}
        pokerEnabled={pokerEnabled}
      />
    );
  }

  // Main voting interface - all participants are voters
  const totalEligibleVoters =
    activeUserIds.length > 0
      ? activeUserIds.length
      : sessionStateData.participants.length;

  const participantStatusData = activeUserIds
    .map((userId) => {
      const participant = participants.get(userId);
      const hasVoted = votes.get(userId) !== undefined;
      const showSyncIndicator = recentVotes[userId] !== undefined;
      if (!participant) return null;

      return {
        userId,
        userName: participant.userName,
        hasVoted,
        showSyncIndicator,
        cards: participant.cards,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.userName.localeCompare(b!.userName)) as Array<{
    userId: string;
    userName: string;
    hasVoted: boolean;
    showSyncIndicator: boolean;
    cards?: import("../../utils/types").PlayingCard[];
  }>;

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
    >
      <AutoLayout
        direction="horizontal"
        width="fill-parent"
        horizontalAlignItems="center"
        verticalAlignItems="center"
      >
        <Text fontSize={18} fontWeight="bold">
          Choose your estimate
        </Text>
        <AutoLayout horizontalAlignItems="end" width="fill-parent" spacing={8}>
          <AutoLayout direction="horizontal" spacing={8}>
            <AutoLayout
              onClick={handlePokerToggle}
              padding={4}
              cornerRadius={4}
              fill={pokerEnabled ? "#E8F5E8" : "#FFEBEE"}
              stroke={pokerEnabled ? "#4CAF50" : "#F44336"}
              strokeWidth={1}
            >
              <Text fontSize={10} fill={pokerEnabled ? "#2E7D32" : "#C62828"}>
                {pokerEnabled ? "🃏 Poker on" : "🚫 Poker off"}
              </Text>
            </AutoLayout>
            <AutoLayout
              onClick={() => setDebugEnabled(!debugEnabled)}
              padding={4}
              cornerRadius={4}
              fill={debugEnabled ? "#E6F7FF" : "#F5F5F5"}
              stroke={debugEnabled ? "#1890FF" : "#D9D9D9"}
              strokeWidth={1}
            >
              <Text fontSize={10} fill={debugEnabled ? "#1890FF" : "#8C8C8C"}>
                {debugEnabled ? "🐛 Debug on" : "Debug off"}
              </Text>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      <ParticipantStatus
        currentVotes={votes.size}
        totalParticipants={totalEligibleVoters}
        participants={participantStatusData}
      />

      {/* Session Controls */}
      <SessionControls
        onRevealResults={sessionControls.revealResults}
        disableReveal={votes.size === 0}
      />

      <CardGrid
        cards={[...STORY_POINT_CARDS, ...JOKER_CARDS]}
        onCardClick={(value) => {
          if (!figma.currentUser?.id) return;
          votingControls.handleVote(figma.currentUser.id, value);
        }}
      />
    </AutoLayout>
  );
}
