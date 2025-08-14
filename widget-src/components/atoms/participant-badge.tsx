const { widget } = figma;
const { AutoLayout, Text } = widget;

import { PlayingCard } from "../../utils/types";

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

    return text;
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
        <Text fontSize={12} fill="#FFFFFF" fontWeight="bold">
          {getDisplayText()}
        </Text>
        <Text fontSize={12} fill="#FFFFFF">
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
      <Text fontSize={12} fill="#FFFFFF" fontWeight="bold">
        {getDisplayText()}
      </Text>
    </AutoLayout>
  );
}
