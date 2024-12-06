import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  className?: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  disabled?: boolean;
  onPlayPause?: () => void;
  onReset?: () => void;
  onSeek?: (value: number[]) => void;
}

const PlaybackControls = ({
  className = "",
  isPlaying = false,
  currentTime = 0,
  duration = 100,
  disabled = false,
  onPlayPause = () => {},
  onReset = () => {},
  onSeek = () => {},
}: PlaybackControlsProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Progress Slider */}
      <Slider
        value={[currentTime]}
        min={0}
        max={duration}
        step={0.1}
        onValueChange={onSeek}
        className={cn("w-full", disabled && "opacity-50 cursor-not-allowed")}
        disabled={disabled}
      />

      {/* Controls Row */}
      <div className="flex items-center gap-2">
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
        <div className={cn("text-white text-sm", disabled && "opacity-50")}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
