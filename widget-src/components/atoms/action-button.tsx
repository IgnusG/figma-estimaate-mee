const { widget } = figma;
const { AutoLayout, Text } = widget;

export interface ActionButtonProps {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success";
  size?: "small" | "medium" | "large";
}

export function ActionButton(props: ActionButtonProps) {
  const variant = props.variant || "primary";
  const size = props.size || "medium";

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return { fill: "#28A745" };
      case "secondary":
        return { fill: "#6C757D" };
      case "primary":
      default:
        return { fill: "#007AFF" };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: { vertical: 6, horizontal: 12 },
          fontSize: 12,
        };
      case "large":
        return {
          padding: { vertical: 16, horizontal: 32 },
          fontSize: 18,
        };
      case "medium":
      default:
        return {
          padding: { vertical: 10, horizontal: 20 },
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AutoLayout
      padding={sizeStyles.padding}
      fill={variantStyles.fill}
      cornerRadius={6}
      onClick={props.onClick}
      horizontalAlignItems="center"
    >
      <Text fontSize={sizeStyles.fontSize} fill="#FFFFFF" fontWeight="bold">
        {props.text}
      </Text>
    </AutoLayout>
  );
}
