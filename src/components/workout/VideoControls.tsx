import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Layout,
  Minimize2,
  Grid,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  className?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  layout?: "split" | "mini";
  showGrid?: boolean;
  isFullscreen?: boolean;
  disabled?: boolean;
  onPlayPause?: () => void;
  onReset?: () => void;
  onSeek?: (value: number[]) => void;
  onLayoutToggle?: () => void;
  onGridToggle?: () => void;
  onFullscreenToggle?: () => void;
}

const VideoControls = ({
  className = "",
  isPlaying = false,
  currentTime = 0,
  duration = 100,
  layout = "split",
  showGrid = false,
  isFullscreen = false,
  disabled = false,
  onPlayPause = () => {},
  onReset = () => {},
  onSeek = () => {},
  onLayoutToggle = () => {},
  onGridToggle = () => {},
  onFullscreenToggle = () => {},
}: VideoControlsProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "w-full p-4 bg-gradient-to-t from-black/80 to-transparent",
        className,
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Progress Slider */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={onSeek}
          className="w-full"
          disabled={disabled}
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Playback Controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20"
              disabled={disabled}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="text-white hover:bg-white/20"
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Time Display */}
            <div className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Layout Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLayoutToggle}
              className="text-white hover:bg-white/20"
              disabled={disabled}
            >
              {layout === "split" ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Layout className="h-4 w-4" />
              )}
            </Button>

            {/* Grid Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onGridToggle}
              className={cn(
                "text-white hover:bg-white/20",
                showGrid && "bg-white/20",
              )}
              disabled={disabled}
            >
              <Grid className="h-4 w-4" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreenToggle}
              className="text-white hover:bg-white/20"
              disabled={disabled}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
