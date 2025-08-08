const { widget } = figma;
const { Text } = widget;

export interface SectionTitleProps {
  children: string;
  fontSize?: number;
  color?: string;
}

export function SectionTitle(props: SectionTitleProps) {
  return (
    <Text
      fontSize={props.fontSize || 14}
      fill={props.color || "#666666"}
      fontWeight="bold"
    >
      {props.children}
    </Text>
  );
}
