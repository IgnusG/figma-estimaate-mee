const { widget } = figma;
const { AutoLayout, Text } = widget;

import { PlayingCard, Vote, SyncedMapLike } from "../../utils/types";
import { sortCards, getCardSymbol } from "../../utils/card-utils";

export interface ParticipantBadgeProps {
  userName: string;
  hasVoted: boolean;
  showSyncIndicator?: boolean;
  cards?: PlayingCard[];
  userId: string;
  votes: SyncedMapLike<Vote>;
}

export function ParticipantBadge(props: ParticipantBadgeProps) {
  const getBackgroundColor = () => {
    if (props.hasVoted) return "#28A745"; // Green
    return "#FFC107"; // Yellow for pending
  };

  const getDisplayText = () => {
    let text = props.userName;

    if (props.hasVoted && props.showSyncIndicator) {
      text += " ⚡";
    } else if (props.hasVoted) {
      text += " ✓";
    }

    return text;
  };

  const handleCardClick = () => {
    return new Promise<void>((resolve) => {
      // Check if this is the current user clicking their own cards
      if (
        props.userId === figma.currentUser?.id &&
        props.cards &&
        props.cards.length > 0
      ) {
        const sortedCards = sortCards(props.cards);
        const cardSymbols = sortedCards.map((card) => getCardSymbol(card));
        figma.notify(`Your cards: ${cardSymbols.join(", ")}`, {
          timeout: 4000,
        });
      }
      resolve();
    });
  };

  const handleBadgeClick = () => {
    return new Promise<void>((resolve) => {
      // Check if this is the current user clicking their own badge
      if (props.userId === figma.currentUser?.id) {
        const userVote = props.votes.get(props.userId);
        if (userVote) {
          figma.notify(`Your estimate: ${userVote.value}`, {
            timeout: 3000,
          });
        } else {
          figma.notify("You haven't voted yet", {
            timeout: 3000,
          });
        }
      }
      resolve();
    });
  };

  if (props.cards && props.cards.length > 0) {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={4}
        padding={{ vertical: 4, horizontal: 8 }}
        fill={getBackgroundColor()}
        cornerRadius={12}
        horizontalAlignItems="center"
      >
        <Text
          fontSize={12}
          fill="#FFFFFF"
          fontWeight="bold"
          onClick={handleBadgeClick}
        >
          {getDisplayText()}
        </Text>
        <Text fontSize={12} fill="#FFFFFF" onClick={handleCardClick}>
          🃏
        </Text>
      </AutoLayout>
    );
  }

  return (
    <AutoLayout
      padding={{ vertical: 4, horizontal: 8 }}
      fill={getBackgroundColor()}
      cornerRadius={12}
    >
      <Text
        fontSize={12}
        fill="#FFFFFF"
        fontWeight="bold"
        onClick={handleBadgeClick}
      >
        {getDisplayText()}
      </Text>
    </AutoLayout>
  );
}
