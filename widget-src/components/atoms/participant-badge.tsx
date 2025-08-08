const { widget } = figma;
const { AutoLayout, Text } = widget;

export interface ParticipantBadgeProps {
  userName: string;
  hasVoted: boolean;
  isSpectator: boolean;
}

export function ParticipantBadge(props: ParticipantBadgeProps) {
  const getBackgroundColor = () => {
    if (props.hasVoted) return "#28A745"; // Green
    if (props.isSpectator) return "#6C757D"; // Gray
    return "#FFC107"; // Yellow for pending
  };

  const getDisplayText = () => {
    if (props.isSpectator) return `${props.userName} 👁️`;
    if (props.hasVoted) return `${props.userName} ✓`;
    return props.userName;
  };

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
