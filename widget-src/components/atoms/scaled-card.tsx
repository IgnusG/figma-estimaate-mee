const { widget: _widget } = figma;

// Type equivalent to React.ReactNode for Figma widget context
type FigmaWidgetNode = string | number | boolean | null | undefined | object;

export interface ScaledCardProps {
  children: FigmaWidgetNode;
  scale: number;
  isSelected: boolean;
  selectedIndex: number;
  currentIndex: number;
}

export function ScaledCard(props: ScaledCardProps) {
  // Calculate scale based on distance from selected card
  const calculateScale = (): number => {
    if (props.selectedIndex === -1) {
      // No selection - all cards same size
      return 1.0;
    } else {
      // Selection exists - scale down based on distance from selected card
      const distanceFromSelected = Math.abs(
        props.currentIndex - props.selectedIndex,
      );
      // Selected card = 1.2 scale, others decrease by 0.1 per step
      return props.isSelected
        ? 1.2
        : Math.max(0.7, 1.0 - distanceFromSelected * 0.1);
    }
  };

  const _scale = calculateScale();

  // Simple wrapper that passes through children
  // This component is kept as an atom for future extensibility
  return props.children;
}
