const { widget } = figma;
const { AutoLayout, Text } = widget;

import { VoteResultGroup } from "./vote-result-group";
import { ActionButton } from "../atoms/action-button";
import {
  VoteResult,
  Participant,
  Vote,
  SyncedMapLike,
} from "../../utils/types";

export interface ResultsViewProps {
  voteResults: VoteResult[];
  onReset: () => void;
  participantsSnapshot?: Participant[];
  votes: SyncedMapLike<Vote>;
}

export function ResultsView(props: ResultsViewProps) {
  // Get non-voters from the snapshot
  const nonVoters =
    props.participantsSnapshot?.filter(
      (participant) =>
        !participant.isSpectator && !props.votes.get(participant.userId),
    ) || [];

  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
    >
      <Text fontSize={24} fontWeight="bold" horizontalAlignText="center">
        🎯 Results Revealed
      </Text>

      <Text fontSize={18} fill="#666666" horizontalAlignText="center">
        Here's how everyone voted:
      </Text>

      <AutoLayout direction="vertical" spacing={12}>
        {props.voteResults.map((result) => (
          <VoteResultGroup
            key={result.value}
            value={result.value}
            count={result.count}
            participants={result.participants}
          />
        ))}

        {/* Non-voters section */}
        {nonVoters.length > 0 && (
          <AutoLayout
            direction="vertical"
            spacing={6}
            padding={12}
            fill="#FFF3CD"
            cornerRadius={6}
            width="fill-parent"
          >
            <AutoLayout
              direction="horizontal"
              spacing={8}
              horizontalAlignItems="center"
            >
              <Text fontSize={18} fontWeight="bold" fill="#856404">
                No Vote
              </Text>
              <Text fontSize={14} fill="#856404">
                ({nonVoters.length} participant
                {nonVoters.length !== 1 ? "s" : ""})
              </Text>
            </AutoLayout>
            <AutoLayout direction="vertical" spacing={2}>
              {nonVoters.map((participant) => (
                <Text key={participant.userId} fontSize={14} fill="#856404">
                  • {participant.userName}
                </Text>
              ))}
            </AutoLayout>
          </AutoLayout>
        )}
      </AutoLayout>

      <ActionButton
        text="Start New Round"
        variant="primary"
        size="medium"
        onClick={props.onReset}
      />
    </AutoLayout>
  );
}
