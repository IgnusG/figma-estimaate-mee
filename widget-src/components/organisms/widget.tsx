const { widget } = figma;
const { useSyncedState, useSyncedMap, useEffect, AutoLayout, Text } = widget;

import { SessionState, Vote, Participant } from "../../utils/types";
import { FIBONACCI_CARDS, JOKER_CARDS } from "../../utils/constants";
import { useSessionState } from "../../hooks/use-session-state";
import { useVoting } from "../../hooks/use-voting";
import { useUserPolling } from "../../hooks/use-user-polling";
import { WelcomeContent } from "../molecules/welcome-content";
import { VotingInterface } from "../molecules/voting-interface";
import { ParticipantStatus } from "../molecules/participant-status";
import { FacilitatorControls } from "../molecules/facilitator-controls";
import { ResultsView } from "../molecules/results-view";

export function Widget() {
  const [count, setCount] = useSyncedState("count", 0);
  const [sessionStateData, setSessionStateData] = useSyncedState<SessionState>(
    "session",
    {
      status: "waiting",
      facilitatorId: "",
      participants: [],
    },
  );
  const [myUserId, setMyUserId] = useSyncedState<string>("myUserId", "");
  const [activeUserIds, setActiveUserIds] = useSyncedState<string[]>(
    "activeUserIds",
    [],
  );
  const [pollingTrigger, setPollingTrigger] = useSyncedState<number>(
    "pollingTrigger",
    0,
  );
  const votes = useSyncedMap<Vote>("votes");
  const participants = useSyncedMap<Participant>("participants");


  // Initialize current user ID
  useEffect(() => {
    try {
      const userId = figma.currentUser?.id;
      const userName = figma.currentUser?.name || "Anonymous";

      if (userId && userId !== myUserId) {
        console.log("Setting current user ID:", { userId, userName });
        setMyUserId(userId);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
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


  const sessionControls = useSessionState(
    sessionStateData,
    setSessionStateData,
    participants,
    votes,
  );

  // Check if current user needs to join
  const currentUserId = myUserId || sessionStateData.facilitatorId;
  
  const votingControls = useVoting(votes, currentUserId, count, setCount);
  const currentParticipant = currentUserId
    ? participants.get(currentUserId)
    : null;

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
      />
    );
  }

  // Main voting interface
  // Use pollingTrigger to ensure fresh renders for participant counts
  const _trigger = pollingTrigger;
  const eligibleVoters = activeUserIds.filter((id) => {
    const participant = participants.get(id);
    return !participant?.isSpectator;
  });
  const totalEligibleVoters =
    eligibleVoters.length > 0
      ? eligibleVoters.length
      : sessionStateData.participants.filter(
          (id) => !participants.get(id)?.isSpectator,
        ).length;

  const participantStatusData = activeUserIds
    .map((userId) => {
      const participant = participants.get(userId);
      const hasVoted = votes.get(userId) !== undefined;
      if (!participant) return null;

      return {
        userId,
        userName: participant.userName,
        hasVoted,
        isSpectator: participant.isSpectator,
      };
    })
    .filter(Boolean) as Array<{
    userId: string;
    userName: string;
    hasVoted: boolean;
    isSpectator: boolean;
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
      <Text fontSize={16} fontWeight="bold">
        Choose your estimate
      </Text>

      <ParticipantStatus
        currentVotes={votes.size}
        totalParticipants={totalEligibleVoters}
        participants={participantStatusData}
      />

      {/* Facilitator Controls */}
      {currentUserId === sessionStateData.facilitatorId && (
        <FacilitatorControls onRevealResults={sessionControls.revealResults} />
      )}

      <VotingInterface
        fibonacciCards={FIBONACCI_CARDS}
        jokerCards={JOKER_CARDS}
        selectedValue={votingControls.currentUserVote?.value}
        onCardClick={(value) => {
          if (currentParticipant && !currentParticipant.isSpectator) {
            votingControls.handleVote(value);
          }
        }}
        disabled={currentParticipant?.isSpectator}
      />
    </AutoLayout>
  );
}
