const { widget } = figma;
const { AutoLayout } = widget;

import { CardGrid } from "./card-grid";
import { JokerCardGrid } from "./joker-card-grid";
import { SectionTitle } from "../atoms/section-title";
import { CardData } from "../../utils/types";

export interface VotingInterfaceProps {
  fibonacciCards: CardData[];
  jokerCards: CardData[];
  selectedValue?: number | string;
  onCardClick: (value: number | string) => void;
  disabled?: boolean;
}

export function VotingInterface(props: VotingInterfaceProps) {
  const handleFibonacciClick = (value: number) => {
    props.onCardClick(value);
  };

  const handleJokerClick = (value: string) => {
    props.onCardClick(value);
  };

  const selectedFibonacci =
    typeof props.selectedValue === "number" ? props.selectedValue : undefined;
  const selectedJoker =
    typeof props.selectedValue === "string" ? props.selectedValue : undefined;

  return (
    <AutoLayout direction="vertical" spacing={24} horizontalAlignItems="center">
      <AutoLayout
        direction="vertical"
        spacing={16}
        horizontalAlignItems="center"
      >
        <SectionTitle color="#666666">
          📊 Story Points - Choose Your Card
        </SectionTitle>
        <CardGrid
          cards={props.fibonacciCards}
          selectedValue={selectedFibonacci}
          onCardClick={handleFibonacciClick}
          disabled={props.disabled}
        />
      </AutoLayout>

      <AutoLayout
        direction="vertical"
        spacing={16}
        horizontalAlignItems="center"
      >
        <SectionTitle color="#FF6B35">
          🃏 Special Cards - When Story Points Don't Apply
        </SectionTitle>
        <JokerCardGrid
          cards={props.jokerCards}
          selectedValue={selectedJoker}
          onCardClick={handleJokerClick}
          disabled={props.disabled}
        />
      </AutoLayout>
    </AutoLayout>
  );
}
