const { widget } = figma;
const { AutoLayout, Text } = widget;

import { VoteResultGroup } from "./vote-result-group";
import { ActionButton } from "../atoms/action-button";
import { CardDisplay } from "../atoms/card-display";
import {
  VoteResult,
  Participant,
  Vote,
  SyncedMapLike,
  PokerWinner,
} from "../../utils/types";
import {
  determinePokerWinner,
  getPokerHandName,
  sortCards,
} from "../../utils/card-utils";

export interface ResultsViewProps {
  voteResults: VoteResult[];
  onReset: () => void;
  participantsSnapshot?: Participant[];
  votes: SyncedMapLike<Vote>;
  showPokerResults?: boolean;
  onRevealCards?: () => void;
  onReplaceRandomCard?: () => void;
}

export function ResultsView(props: ResultsViewProps) {
  // Get non-voters from the snapshot
  const nonVoters =
    props.participantsSnapshot?.filter(
      (participant) => !props.votes.get(participant.userId),
    ) || [];

  // Calculate consensus and spread metrics
  const totalVotes = props.voteResults.reduce(
    (sum, result) => sum + result.count,
    0,
  );
  const hasConsensus = props.voteResults.length === 1 && nonVoters.length === 0;
  const mostVotes = Math.max(...props.voteResults.map((r) => r.count));
  const topChoice = props.voteResults.find((r) => r.count === mostVotes);
  const isSpread = props.voteResults.length > 2;

  // Get result message and emoji based on voting pattern
  const getResultSummary = () => {
    if (hasConsensus) {
      return { emoji: "🎯", message: "Perfect Consensus!", color: "#28A745" };
    } else if (props.voteResults.length === 2) {
      return { emoji: "⚖️", message: "Split Decision", color: "#FFC107" };
    } else if (isSpread) {
      return {
        emoji: "🌈",
        message: "Wide Range of Opinions",
        color: "#17A2B8",
      };
    } else {
      return { emoji: "🤔", message: "Mixed Results", color: "#6C757D" };
    }
  };

  const summary = getResultSummary();

  // Get participants with cards for poker game
  const participantsWithCards = (props.participantsSnapshot || [])
    .filter((participant) => participant.cards && participant.cards.length > 0)
    .map((participant) => ({
      userId: participant.userId,
      userName: participant.userName,
      cards: participant.cards!,
    }));

  // Determine poker winner if showing poker results
  const pokerWinner: PokerWinner | null =
    props.showPokerResults && participantsWithCards.length > 0
      ? determinePokerWinner(participantsWithCards)
      : null;

  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
      horizontalAlignItems="center"
    >
      <AutoLayout
        direction="vertical"
        spacing={8}
        horizontalAlignItems="center"
      >
        <Text fontSize={32} horizontalAlignText="center">
          {summary.emoji}
        </Text>
        <Text
          fontSize={24}
          fontWeight="bold"
          horizontalAlignText="center"
          fill={summary.color}
        >
          {summary.message}
        </Text>
        <Text fontSize={16} fill="#666666" horizontalAlignText="center">
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""} •{" "}
          {props.voteResults.length} unique value
          {props.voteResults.length !== 1 ? "s" : ""}
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
          <Text
            fontSize={14}
            fontWeight="bold"
            fill="#0C5AA6"
            horizontalAlignText="center"
          >
            💡 Most Popular: {topChoice.value} ({topChoice.count} vote
            {topChoice.count !== 1 ? "s" : ""})
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

      {/* Poker Cards Section */}
      {participantsWithCards.length > 0 &&
        !props.showPokerResults &&
        props.onRevealCards && (
          <AutoLayout
            direction="vertical"
            spacing={8}
            padding={12}
            fill="#F0F8FF"
            cornerRadius={8}
            width="fill-parent"
          >
            <Text
              fontSize={16}
              fontWeight="bold"
              fill="#0C5AA6"
              horizontalAlignText="center"
            >
              🃏 Poker Cards Ready!
            </Text>
            <Text fontSize={14} fill="#0C5AA6" horizontalAlignText="center">
              {participantsWithCards.length} player
              {participantsWithCards.length !== 1 ? "s" : ""} have cards
            </Text>
            <ActionButton
              text="Reveal Cards & Determine Winner"
              variant="secondary"
              size="medium"
              onClick={props.onRevealCards}
            />
          </AutoLayout>
        )}

      {/* Poker Results */}
      {props.showPokerResults && pokerWinner && (
        <AutoLayout
          direction="vertical"
          spacing={12}
          padding={16}
          fill="#E8F5E8"
          cornerRadius={8}
          width="fill-parent"
          horizontalAlignItems="center"
        >
          <AutoLayout
            direction="vertical"
            spacing={8}
            horizontalAlignItems="center"
          >
            <Text fontSize={24}>🏆</Text>
            <Text
              fontSize={18}
              fontWeight="bold"
              fill="#28A745"
              horizontalAlignText="center"
            >
              Poker Winner: {pokerWinner.userName}
            </Text>
            <Text fontSize={14} fill="#28A745" horizontalAlignText="center">
              {getPokerHandName(pokerWinner.hand.hand)}
            </Text>
            <AutoLayout
              direction="horizontal"
              spacing={8}
              horizontalAlignItems="center"
            >
              <Text fontSize={12} fill="#666">
                Cards:
              </Text>
              {sortCards(pokerWinner.cards).map((card) => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </AutoLayout>
          </AutoLayout>

          {/* Show all participants' cards */}
          <AutoLayout
            direction="vertical"
            spacing={8}
            horizontalAlignItems="center"
          >
            <Text
              fontSize={14}
              fontWeight="bold"
              fill="#28A745"
              horizontalAlignText="center"
            >
              All Player Cards:
            </Text>
            {participantsWithCards
              .sort((a, b) => {
                if (a.userId === pokerWinner.userId) return -1;
                if (b.userId === pokerWinner.userId) return 1;
                return a.userName.localeCompare(b.userName);
              })
              .map((participant) => (
                <AutoLayout
                  key={participant.userId}
                  direction="horizontal"
                  spacing={8}
                  padding={8}
                  fill={
                    participant.userId === pokerWinner.userId
                      ? "#D4F5D4"
                      : "#F5F5F5"
                  }
                  cornerRadius={4}
                  width="hug-contents"
                  horizontalAlignItems="center"
                >
                  <Text fontSize={12} fontWeight="bold" fill="#333">
                    {participant.userName}:
                  </Text>
                  <AutoLayout
                    direction="horizontal"
                    spacing={6}
                    horizontalAlignItems="center"
                  >
                    {sortCards(participant.cards).map((card) => (
                      <CardDisplay key={card.id} card={card} />
                    ))}
                  </AutoLayout>
                </AutoLayout>
              ))}
          </AutoLayout>
        </AutoLayout>
      )}

      <ActionButton
        text="Start New Round"
        variant="primary"
        size="medium"
        onClick={props.onReset}
      />
    </AutoLayout>
  );
}
