const { widget } = figma;
const { AutoLayout, Text } = widget;

import { Suit as SuitType } from "../../utils/types";

export interface SuitProps {
  value: SuitType;
}

export function Suit(props: SuitProps) {
  const baseFontSize = 12;

  // Get the suit symbol and adjust size for visual consistency
  const getSuitConfig = () => {
    switch (props.value) {
      case "clubs":
        return { symbol: "♣", fontSize: baseFontSize };
      case "diamonds":
        return { symbol: "♦", fontSize: baseFontSize };
      case "hearts":
        return { symbol: "♥", fontSize: baseFontSize + 3 }; // Slightly larger for visual consistency
      case "spades":
        return { symbol: "♠", fontSize: baseFontSize };
      default:
        return { symbol: "?", fontSize: baseFontSize };
    }
  };

  const config = getSuitConfig();

  if (props.value === "hearts") {
    return (
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        verticalAlignItems="end"
        width="hug-contents"
        height={config.fontSize + 2}
      >
        <Text fontSize={config.fontSize + 1} fill="#464c4f">
          {config.symbol}
        </Text>
      </AutoLayout>
    );
  }

  return <Text fontSize={config.fontSize}>{config.symbol}</Text>;
}
