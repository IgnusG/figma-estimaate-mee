const { widget } = figma;
const { AutoLayout, Text } = widget;

import { ActionButton } from "../atoms/action-button";

export interface WelcomeContentProps {
  onStartSession: () => void;
}

export function WelcomeContent(props: WelcomeContentProps) {
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={32}
      spacing={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
    >
      <Text fontSize={32} fontWeight="bold">
        🎯 Estimatee-Mee
      </Text>
      <Text fontSize={20} fill="#666666" horizontalAlignText="center">
        Start a planning poker session
      </Text>
      <ActionButton
        text="Start Session"
        variant="primary"
        size="large"
        onClick={props.onStartSession}
      />
    </AutoLayout>
  );
}
