import { forwardRef, useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstructorVideoProps {
  videoUrl?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onLoadedData?: () => void;
  className?: string;
}

const InstructorVideo = forwardRef<HTMLVideoElement, InstructorVideoProps>(
  (
    {
      videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      onTimeUpdate = () => {},
      onDurationChange = () => {},
      onEnded = () => {},
      onError = () => {},
      onLoadedData = () => {},
      className = "",
    },
    ref,
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
    }, [videoUrl]);

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onTimeUpdate(e.currentTarget.currentTime);
    };

    const handleLoadedMetadata = (
      e: React.SyntheticEvent<HTMLVideoElement>,
    ) => {
      onDurationChange(e.currentTarget.duration);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      onLoadedData();
    };

    const handleProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (e.currentTarget.buffered.length > 0) {
        const buffered = e.currentTarget.buffered.end(0);
        const duration = e.currentTarget.duration;
        const progress = (buffered / duration) * 100;
        setLoadingProgress(Math.min(progress, 100));
      }
    };

    const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const error = new Error(
        e.currentTarget.error?.message || "Failed to load video",
      );
      setError(error);
      setIsLoading(false);
      onError(error);
    };

    return (
      <div
        className={cn(
          "relative w-full h-full bg-black overflow-hidden",
          className,
        )}
      >
        <video
          ref={ref}
          className={cn(
            "w-full h-full object-contain",
            (isLoading || error) && "opacity-50",
          )}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onProgress={handleProgress}
          onError={handleError}
          onEnded={onEnded}
          playsInline
          preload="auto"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            {loadingProgress > 0 && (
              <div className="text-sm text-white/80">
                Loading: {Math.round(loadingProgress)}%
              </div>
            )}
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm p-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive mb-1">
                Failed to Load Video
              </h3>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

InstructorVideo.displayName = "InstructorVideo";

export default InstructorVideo;
