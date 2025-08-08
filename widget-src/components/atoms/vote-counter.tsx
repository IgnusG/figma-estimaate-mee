const { widget } = figma;
const { Text } = widget;

export interface VoteCounterProps {
  currentVotes: number;
  totalParticipants: number;
}

export function VoteCounter(props: VoteCounterProps) {
  return (
    <Text fontSize={12} fill="#666666">
      Votes: {props.currentVotes}/{props.totalParticipants}
    </Text>
  );
}
