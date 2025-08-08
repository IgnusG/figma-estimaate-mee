const { widget } = figma;
const { AutoLayout, Text, Image } = widget;

export interface JokerCardProps {
  value: string;
  title: string;
  emoji: string;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  cardScale?: number;
  assetPath?: string;
}

export function JokerCard(props: JokerCardProps) {
  const scale = props.cardScale || 1.0;
  const baseWidth = 88; // Increased from 58
  const baseHeight = 120; // Increased from 78
  const baseTitleFontSize = 10; // Increased from 8

  const scaledWidth = Math.round(baseWidth * scale);
  const scaledHeight = Math.round(baseHeight * scale);
  const scaledTitleFontSize = Math.round(baseTitleFontSize * scale);

  // For now, we'll use a placeholder background until assets are optimized
  const backgroundColor = props.isSelected ? "#FF6B35" : "#FFF8F5";
  const borderColor = "#FF6B35";

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={Math.round(12 * scale)}
      width={scaledWidth}
      height={scaledHeight}
      fill={backgroundColor}
      stroke={borderColor}
      strokeWidth={props.isSelected ? 3 : 2}
      cornerRadius={Math.round(12 * scale)}
      onClick={props.onClick}
      tooltip={props.tooltip}
      hoverStyle={{
        fill: props.isSelected ? "#E5501F" : "#FFE8DC",
        stroke: "#FF6B35",
      }}
    >
      {/* Main content area - this is where the asset image will go */}
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        width="fill-parent"
        height="fill-parent"
        spacing={Math.round(8 * scale)}
      >
        {/* Asset image or placeholder */}
        {props.assetPath ? (
          <Image
            src={props.assetPath}
            width={Math.round(64 * scale)}
            height={Math.round(64 * scale)}
          />
        ) : (
          <AutoLayout
            width={Math.round(56 * scale)}
            height={Math.round(56 * scale)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            fill="#FFFFFF"
            cornerRadius={Math.round(8 * scale)}
          >
            <Text
              fontSize={Math.round(24 * scale)}
              fill={props.isSelected ? "#FF6B35" : "#FF6B35"}
              fontWeight="bold"
            >
              {props.value}
            </Text>
          </AutoLayout>
        )}
        
        {/* Title - always visible */}
        <Text
          fontSize={scaledTitleFontSize}
          horizontalAlignText="center"
          fill={props.isSelected ? "#FFFFFF" : "#FF6B35"}
          width="fill-parent"
        >
          {props.title}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}
