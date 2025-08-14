const { widget } = figma;
const { AutoLayout, Text } = widget;

import { PlayingCard } from "../../utils/types";
import { sortCards, getCardSymbol } from "../../utils/card-utils";

export interface ParticipantBadgeProps {
  userName: string;
  hasVoted: boolean;
  showSyncIndicator?: boolean;
  cards?: PlayingCard[];
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
    
    // Add card indicator if user has cards
    if (props.cards && props.cards.length > 0) {
      text += " 🃏";
    }
    
    return text;
  };

  const getTooltipText = () => {
    if (!props.cards || props.cards.length === 0) return "";
    
    const sortedCards = sortCards(props.cards);
    const cardSymbols = sortedCards.map(card => getCardSymbol(card));
    return `Cards: ${cardSymbols.join(", ")}`;
  };

  return (
    <AutoLayout
      padding={{ vertical: 4, horizontal: 8 }}
      fill={getBackgroundColor()}
      cornerRadius={12}
      tooltip={getTooltipText()}
    >
      <Text fontSize={12} fill="#FFFFFF" fontWeight="bold">
        {getDisplayText()}
      </Text>
    </AutoLayout>
  );
}
