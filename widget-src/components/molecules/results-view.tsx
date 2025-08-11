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
      (participant) => !props.votes.get(participant.userId),
    ) || [];

  // Calculate consensus and spread metrics
  const totalVotes = props.voteResults.reduce((sum, result) => sum + result.count, 0);
  const hasConsensus = props.voteResults.length === 1 && nonVoters.length === 0;
  const mostVotes = Math.max(...props.voteResults.map(r => r.count));
  const topChoice = props.voteResults.find(r => r.count === mostVotes);
  const isSpread = props.voteResults.length > 2;
  
  // Get result message and emoji based on voting pattern
  const getResultSummary = () => {
    if (hasConsensus) {
      return { emoji: "🎯", message: "Perfect Consensus!", color: "#28A745" };
    } else if (props.voteResults.length === 2) {
      return { emoji: "⚖️", message: "Split Decision", color: "#FFC107" };
    } else if (isSpread) {
      return { emoji: "🌈", message: "Wide Range of Opinions", color: "#17A2B8" };
    } else {
      return { emoji: "🤔", message: "Mixed Results", color: "#6C757D" };
    }
  };

  const summary = getResultSummary();

  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
    >
      <AutoLayout direction="vertical" spacing={8} horizontalAlignItems="center">
        <Text fontSize={32} horizontalAlignText="center">
          {summary.emoji}
        </Text>
        <Text fontSize={24} fontWeight="bold" horizontalAlignText="center" fill={summary.color}>
          {summary.message}
        </Text>
        <Text fontSize={16} fill="#666666" horizontalAlignText="center">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} • {props.voteResults.length} unique value{props.voteResults.length !== 1 ? 's' : ''}
        </Text>
      </AutoLayout>

      {/* Quick insights */}
      {!hasConsensus && topChoice && (
        <AutoLayout
          direction="vertical"
          spacing={4}
          padding={12}
          fill="#E8F4FD"
          cornerRadius={8}
          width="fill-parent"
        >
          <Text fontSize={14} fontWeight="bold" fill="#0C5AA6" horizontalAlignText="center">
            💡 Most Popular: {topChoice.value} ({topChoice.count} vote{topChoice.count !== 1 ? 's' : ''})
          </Text>
          {isSpread && (
            <Text fontSize={12} fill="#0C5AA6" horizontalAlignText="center">
              Consider discussing the range - what's driving the differences?
            </Text>
          )}
        </AutoLayout>
      )}

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
