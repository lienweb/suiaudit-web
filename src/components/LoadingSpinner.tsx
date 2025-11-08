import React from "react";

interface LoadingSpinnerProps {
  readonly size?: number;
  readonly color?: string;
  readonly thickness?: number;
}

export default function LoadingSpinner({
  size = 50,
  color = "#000",
  thickness = 4,
}: LoadingSpinnerProps) {
  // Use Tailwind classes for layout, rounding and animation.
  // Numeric values (width/height/borderWidth/border colors) are set via inline style
  // so they remain configurable via props.
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: thickness,
    borderColor: "rgba(0,0,0,0.1)",
    borderTopColor: color,
    borderStyle: "solid",
    boxSizing: "border-box",
  };

  return (
    <div className="flex justify-center items-center min-h-[100px]">
      <div className="rounded-full animate-spin" style={style} />
    </div>
  );
}
