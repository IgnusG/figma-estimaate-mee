const { widget } = figma;
const { AutoLayout } = widget;

import { VoteCounter } from "../atoms/vote-counter";
import { ParticipantBadge } from "../atoms/participant-badge";

export interface ParticipantStatusProps {
  currentVotes: number;
  totalParticipants: number;
  participants: Array<{
    userId: string;
    userName: string;
    hasVoted: boolean;
    showSyncIndicator?: boolean;
  }>;
}

export function ParticipantStatus(props: ParticipantStatusProps) {
  return (
    <AutoLayout direction="vertical" spacing={6} horizontalAlignItems="center">
      <VoteCounter
        currentVotes={props.currentVotes}
        totalParticipants={props.totalParticipants}
      />
      <AutoLayout
        direction="horizontal"
        spacing={8}
        wrap
        horizontalAlignItems="center"
      >
        {props.participants.map((participant) => (
          <ParticipantBadge
            key={participant.userId}
            userName={participant.userName}
            hasVoted={participant.hasVoted}
            showSyncIndicator={participant.showSyncIndicator}
          />
        ))}
      </AutoLayout>
    </AutoLayout>
  );
}
