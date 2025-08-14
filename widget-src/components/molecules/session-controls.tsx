const { widget } = figma;
const { AutoLayout } = widget;

import { ActionButton } from "../atoms/action-button";

export interface SessionControlsProps {
  onRevealResults: () => void;
  onResetSession?: () => void;
  showResetButton?: boolean;
  disableReveal?: boolean;
}

export function SessionControls(props: SessionControlsProps) {
  return (
    <AutoLayout direction="horizontal" spacing={8}>
      <ActionButton
        text="Reveal Results"
        variant="success"
        size="medium"
        onClick={props.onRevealResults}
        disabled={props.disableReveal}
      />
      {props.showResetButton && props.onResetSession && (
        <ActionButton
          text="Start New Round"
          variant="primary"
          size="medium"
          onClick={props.onResetSession}
        />
      )}
    </AutoLayout>
  );
}
