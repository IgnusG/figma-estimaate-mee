const { widget } = figma;
const { AutoLayout } = widget;

import { ActionButton } from "../atoms/action-button";

export interface FacilitatorControlsProps {
  onRevealResults: () => void;
  onResetSession?: () => void;
  showResetButton?: boolean;
}

export function FacilitatorControls(props: FacilitatorControlsProps) {
  return (
    <AutoLayout direction="horizontal" spacing={8}>
      <ActionButton
        text="Reveal Results"
        variant="success"
        size="small"
        onClick={props.onRevealResults}
      />
      {props.showResetButton && props.onResetSession && (
        <ActionButton
          text="Start New Round"
          variant="primary"
          size="small"
          onClick={props.onResetSession}
        />
      )}
    </AutoLayout>
  );
}
