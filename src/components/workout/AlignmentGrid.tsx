import { Grid } from "lucide-react";

interface AlignmentGridProps {
  visible?: boolean;
  gridSize?: number;
  color?: string;
}

const AlignmentGrid = ({
  visible = true,
  gridSize = 4,
  color = "rgba(255, 255, 255, 0.2)",
}: AlignmentGridProps) => {
  if (!visible) return null;

  const gridLines = [];
  const cellWidth = 100 / gridSize;

  // Vertical lines
  for (let i = 1; i < gridSize; i++) {
    gridLines.push(
      <div
        key={`v-${i}`}
        className="absolute top-0 bottom-0"
        style={{
          left: `${cellWidth * i}%`,
          width: "1px",
          backgroundColor: color,
        }}
      />,
    );
  }

  // Horizontal lines
  for (let i = 1; i < gridSize; i++) {
    gridLines.push(
      <div
        key={`h-${i}`}
        className="absolute left-0 right-0"
        style={{
          top: `${cellWidth * i}%`,
          height: "1px",
          backgroundColor: color,
        }}
      />,
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none bg-black/5">
      {/* Grid Icon Watermark */}
      <div className="absolute top-4 right-4 text-white/30">
        <Grid className="w-6 h-6" />
      </div>

      {/* Grid Lines */}
      {gridLines}

      {/* Center Lines */}
      <div
        className="absolute left-1/2 top-0 bottom-0"
        style={{
          width: "2px",
          backgroundColor: `${color}`,
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="absolute top-1/2 left-0 right-0"
        style={{
          height: "2px",
          backgroundColor: `${color}`,
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

export default AlignmentGrid;
