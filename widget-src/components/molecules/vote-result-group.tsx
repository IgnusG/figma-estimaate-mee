const { widget } = figma;
const { AutoLayout, Text } = widget;

export interface VoteResultGroupProps {
  value: number | string;
  count: number;
  participants: Array<{
    name: string;
    userId: string;
  }>;
}

export function VoteResultGroup(props: VoteResultGroupProps) {
  // Add visual emphasis based on vote count
  const getVoteStyle = () => {
    if (props.count === 1) return { fill: "#F8F9FA", accent: "#6C757D" };
    if (props.count >= 3) return { fill: "#E8F5E8", accent: "#28A745" };
    return { fill: "#FFF8E1", accent: "#FFC107" };
  };

  const style = getVoteStyle();
  
  // Create visual bar for vote count
  const maxVotes = 10; // Reasonable max for bar visualization
  const barWidth = Math.min((props.count / maxVotes) * 200, 200);

  return (
    <AutoLayout
      direction="vertical"
      spacing={12}
      padding={20}
      fill={style.fill}
      cornerRadius={12}
      width="fill-parent"
      stroke={style.accent}
      strokeWidth={2}
      overflow="visible"
    >
      <AutoLayout
        direction="horizontal"
        spacing={12}
        horizontalAlignItems="center"
        width="fill-parent"
        overflow="visible"
      >
        <AutoLayout direction="vertical" spacing={6} width="fill-parent" overflow="visible">
          <AutoLayout direction="horizontal" spacing={12} horizontalAlignItems="center" width="fill-parent" overflow="visible">
            <Text fontSize={28} fontWeight="bold" fill={style.accent}>
              {props.value}
            </Text>
            <AutoLayout
              padding={{ horizontal: 8, vertical: 4 }}
              fill={style.accent}
              cornerRadius={12}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              width="hug-contents"
              height="hug-contents"
            >
              <Text fontSize={12} fontWeight="bold" fill="#FFFFFF">
                {props.count} vote{props.count !== 1 ? "s" : ""}
              </Text>
            </AutoLayout>
          </AutoLayout>
          
          {/* Visual vote bar */}
          <AutoLayout
            width={barWidth}
            height={6}
            fill={style.accent}
            cornerRadius={3}
          />
        </AutoLayout>
      </AutoLayout>
      
      {/* Participants with emojis - sorted alphabetically for consistent layout */}
      <AutoLayout direction="horizontal" spacing={10} wrap>
        {props.participants.sort((a, b) => a.name.localeCompare(b.name)).map((participant, index) => (
          <AutoLayout
            key={participant.userId}
            direction="horizontal"
            spacing={6}
            padding={{ horizontal: 10, vertical: 6 }}
            fill="#FFFFFF"
            cornerRadius={20}
            horizontalAlignItems="center"
            verticalAlignItems="center"
          >
            <Text fontSize={14}>
              {index === 0 ? "🚀" : index === 1 ? "🎉" : index === 2 ? "🎆" : "👍"}
            </Text>
            <Text fontSize={14} fontWeight={"medium"} fill={style.accent}>
              {participant.name}
            </Text>
          </AutoLayout>
        ))}
      </AutoLayout>
    </AutoLayout>
  );
}
