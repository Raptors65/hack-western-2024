import { Button } from "@/components/ui/button";
import { Layout, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutToggleProps {
  layout?: "split" | "mini";
  onChange?: (layout: "split" | "mini") => void;
  className?: string;
}

const LayoutToggle = ({
  layout = "split",
  onChange = () => {},
  className = "",
}: LayoutToggleProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onChange(layout === "split" ? "mini" : "split")}
      className={cn(
        "flex items-center gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/70",
        className,
      )}
    >
      {layout === "split" ? (
        <>
          <Minimize2 className="h-4 w-4" />
          <span className="text-sm">Minimize</span>
        </>
      ) : (
        <>
          <Layout className="h-4 w-4" />
          <span className="text-sm">Split View</span>
        </>
      )}
    </Button>
  );
};

export default LayoutToggle;
