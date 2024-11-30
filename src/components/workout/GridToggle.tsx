import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface GridToggleProps {
  showGrid?: boolean;
  onChange?: (show: boolean) => void;
  className?: string;
}

const GridToggle = ({
  showGrid = false,
  onChange = () => {},
  className = "",
}: GridToggleProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onChange(!showGrid)}
      className={cn(
        "flex items-center gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/70",
        showGrid && "bg-background/70",
        className,
      )}
    >
      <Grid className="h-4 w-4" />
      <span className="text-sm">{showGrid ? "Hide Grid" : "Show Grid"}</span>
    </Button>
  );
};

export default GridToggle;
