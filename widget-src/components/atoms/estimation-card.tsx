const { widget } = figma;
const { AutoLayout, Text } = widget;

export interface EstimationCardProps {
  value: number;
  title: string;
  emoji: string;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  cardScale?: number;
}

export function EstimationCard(props: EstimationCardProps) {
  const scale = props.cardScale || 1.0;
  const baseWidth = 58;
  const baseHeight = 78;
  const baseFontSize = 12;
  const baseEmojiFontSize = 14;
  const baseTitleFontSize = 8;

  const scaledWidth = Math.round(baseWidth * scale);
  const scaledHeight = Math.round(baseHeight * scale);
  const scaledFontSize = Math.round(baseFontSize * scale);
  const scaledEmojiFontSize = Math.round(baseEmojiFontSize * scale);
  const scaledTitleFontSize = Math.round(baseTitleFontSize * scale);

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={Math.round(8 * scale)}
      spacing={Math.round(4 * scale)}
      width={scaledWidth}
      height={scaledHeight}
      fill={props.isSelected ? "#007AFF" : "#FFFFFF"}
      stroke={props.isSelected ? "#007AFF" : "#E6E6E6"}
      strokeWidth={props.isSelected ? 3 : 2}
      cornerRadius={Math.round(8 * scale)}
      onClick={props.onClick}
      tooltip={props.tooltip}
      hoverStyle={{
        fill: props.isSelected ? "#0056CC" : "#F0F8FF",
        stroke: props.isSelected ? "#0056CC" : "#007AFF",
      }}
    >
      <Text fontSize={scaledEmojiFontSize}>{props.emoji}</Text>
      <Text
        fontSize={scaledFontSize}
        fontWeight="bold"
        fill={props.isSelected ? "#FFFFFF" : "#000000"}
      >
        {props.value}
      </Text>
      <Text
        fontSize={scaledTitleFontSize}
        horizontalAlignText="center"
        fill={props.isSelected ? "#FFFFFF" : "#666666"}
        width="fill-parent"
      >
        {props.title}
      </Text>
    </AutoLayout>
  );
}
