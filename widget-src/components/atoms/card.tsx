const { widget } = figma;
const { AutoLayout, Text, Image, Frame } = widget;

export interface EstimationCardProps {
  value: number | string;
  title: string;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  assetPath?: string;
}

export function Card(props: EstimationCardProps) {
  const cardVariant = typeof props.value === 'string' ? 'joker' : 'story'; 

  // 2:3 aspect ratio (width:height)
  const baseWidth = 120;
  const baseHeight = 180;

  if (props.assetPath) {
    // When we have an asset, use it as the full background
    return (
      <Frame
        width={baseWidth}
        height={baseHeight}
        onClick={props.onClick}
        tooltip={props.tooltip}
        fill="#F8F9FA"
        stroke="#E1E8ED"
        strokeWidth={2}
        cornerRadius={12}
        hoverStyle={{
          fill: "#FFFFFF",
          stroke: cardVariant === 'joker' ? "#FF6B35" : "#007AFF"
        }}
        effect={[{
          type: "drop-shadow",
          color: "#00000015",
          offset: { x: 0, y: 4 },
          blur: 8,
          spread: 0,
        }]}
      >
        {/* Normal image - visible by default, hidden on hover */}
        <Image
          src={props.assetPath}
          width={baseWidth}
          height={baseHeight}
          opacity={1}
          hoverStyle={{
            opacity: 0
          }}
        />
        {/* Blurred image - hidden by default, visible on hover */}
        <Image
          src={props.assetPath}
          width={baseWidth}
          height={baseHeight}
          x={0}
          y={0}
          opacity={0}
          effect={[{
            type: "layer-blur",
            blur: 12,
            visible: true
          }]}
          hoverStyle={{
            opacity: 1
          }}
        />
        {/* Text overlay on hover - background only */}
        <AutoLayout
          x={0}
          y={0}
          width={baseWidth}
          height={baseHeight}
          fill="#000000"
          opacity={0}
          hoverStyle={{
            opacity: 0.3
          }}
        />
        {/* Text overlay on hover - text only */}
        <AutoLayout
          x={0}
          y={0}
          width={baseWidth}
          height={baseHeight}
          direction="vertical"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          opacity={0}
          hoverStyle={{
            opacity: 1
          }}
          padding={16}
          spacing={4}
        >
          {cardVariant === 'story' && (
            <Text
              fontSize={32}
              fill="#FFFFFF"
              fontWeight="bold"
              horizontalAlignText="center"
            >
              {props.value}
            </Text>
          )}
          <Text
            fontSize={cardVariant === 'story' ? 14 : 16}
            fill="#FFFFFF"
            fontWeight="bold"
            horizontalAlignText="center"
            width="fill-parent"
          >
            {props.title}
          </Text>
        </AutoLayout>
      </Frame>
    );
  }

  // Fallback when no asset is available
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={8}
      width={baseWidth}
      height={baseHeight}
      fill="#F8F9FA"
      stroke="#E1E8ED"
      strokeWidth={2}
      cornerRadius={12}
      onClick={props.onClick}
      tooltip={props.tooltip}
      hoverStyle={{
        fill: "#FFFFFF",
        stroke: cardVariant === 'joker' ? "#FF6B35" : "#007AFF"
      }}
      effect={[{
        type: "drop-shadow",
        color: "#00000015",
        offset: { x: 0, y: 4 },
        blur: 8,
        spread: 0,
      }]}
    >
      <Text
        fontSize={28}
        fill="#333333"
        fontWeight="bold"
      >
        {props.value}
      </Text>
    </AutoLayout>
  );
}
