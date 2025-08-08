const { widget } = figma;
const { AutoLayout, Text, Image } = widget;

export interface EstimationCardProps {
  value: number;
  title: string;
  emoji: string;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  cardScale?: number;
  assetPath?: string;
}

export function EstimationCard(props: EstimationCardProps) {
  const scale = props.cardScale || 1.0;
  // 2:3 aspect ratio (width:height) - Made bigger for more impact
  const baseWidth = 100;
  const baseHeight = 150; // 100 * 1.5 = 150 for 2:3 ratio
  // const baseTitleFontSize = 11; // Unused after removing title

  // Fixed container dimensions to prevent layout shifts
  const maxScale = 1.2; // Maximum scale we expect
  const containerWidth = Math.round(baseWidth * maxScale);
  const containerHeight = Math.round(baseHeight * maxScale);
  
  // Scaled content dimensions
  const scaledWidth = Math.round(baseWidth * scale);
  const scaledHeight = Math.round(baseHeight * scale);
  // const scaledTitleFontSize = Math.round(baseTitleFontSize * scale); // Unused after removing title
  
  // Center the scaled content within the fixed container
  // Note: Centering is handled by AutoLayout alignment properties
  // const contentOffsetX = Math.round((containerWidth - scaledWidth) / 2);
  // const contentOffsetY = Math.round((containerHeight - scaledHeight) / 2);

  if (props.assetPath) {
    // When we have an asset, use it as the full background
    const layoutProps = {
      direction: "vertical" as const,
      horizontalAlignItems: "center" as const,
      verticalAlignItems: "center" as const,
      width: containerWidth,
      height: containerHeight,
      onClick: props.onClick,
      tooltip: props.tooltip
    };
    
    return (
      <AutoLayout {...layoutProps}>
        {/* Container for scaled image to center it */}
        <AutoLayout
          direction="vertical"
          horizontalAlignItems="center"
          verticalAlignItems="center"
          width={scaledWidth}
          height={scaledHeight}
          cornerRadius={Math.round(12 * scale)}
          overflow="hidden"
          // Move border and effects to the scaled container
          stroke={props.isSelected ? "#007AFF" : "#E1E8ED"}
          strokeWidth={props.isSelected ? 3 : 2}
          effect={[
            {
              type: "drop-shadow" as const,
              color: props.isSelected ? "#007AFF25" : "#00000015",
              offset: { x: 0, y: Math.round(4 * scale) },
              blur: Math.round(8 * scale),
              spread: 0,
            },
            {
              type: "drop-shadow" as const,
              color: "#00000008",
              offset: { x: 0, y: Math.round(2 * scale) },
              blur: Math.round(16 * scale),
              spread: 0,
            }
          ]}
        >
          <Image
            src={props.assetPath}
            width={scaledWidth}
            height={scaledHeight}
          />
        </AutoLayout>
        
        {/* Optional overlay for title on hover - could be implemented later */}
      </AutoLayout>
    );
  }

  // Fallback when no asset is available - use fixed container approach
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={containerWidth}
      height={containerHeight}
      onClick={props.onClick}
      tooltip={props.tooltip}
    >
      {/* Scaled content container */}
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        padding={Math.round(8 * scale)}
        width={scaledWidth}
        height={scaledHeight}
        fill={props.isSelected ? "#007AFF" : "#F8F9FA"}
        stroke={props.isSelected ? "#007AFF" : "#E1E8ED"}
        strokeWidth={props.isSelected ? 3 : 2}
        cornerRadius={Math.round(12 * scale)}
        effect={[
          {
            type: "drop-shadow" as const,
            color: props.isSelected ? "#007AFF25" : "#00000015",
            offset: { x: 0, y: Math.round(4 * scale) },
            blur: Math.round(8 * scale),
            spread: 0,
          },
          {
            type: "drop-shadow" as const,
            color: "#00000008",
            offset: { x: 0, y: Math.round(2 * scale) },
            blur: Math.round(16 * scale),
            spread: 0,
          }
        ]}
      >
        <Text
          fontSize={Math.round(28 * scale)}
          fill={props.isSelected ? "#FFFFFF" : "#333333"}
          fontWeight="bold"
        >
          {props.value}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}
