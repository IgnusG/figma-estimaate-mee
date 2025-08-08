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
  return (
    <AutoLayout
      direction="vertical"
      spacing={6}
      padding={12}
      fill="#F8F9FA"
      cornerRadius={6}
      width="fill-parent"
    >
      <AutoLayout
        direction="horizontal"
        spacing={8}
        horizontalAlignItems="center"
      >
        <Text fontSize={16} fontWeight="bold">
          {props.value}
        </Text>
        <Text fontSize={12} fill="#666666">
          ({props.count} vote{props.count !== 1 ? "s" : ""})
        </Text>
      </AutoLayout>
      <AutoLayout direction="vertical" spacing={2}>
        {props.participants.map((participant) => (
          <Text key={participant.userId} fontSize={12} fill="#333333">
            • {participant.name}
          </Text>
        ))}
      </AutoLayout>
    </AutoLayout>
  );
}
