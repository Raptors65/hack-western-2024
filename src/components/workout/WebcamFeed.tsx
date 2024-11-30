import { useEffect, useRef, useState } from "react";
import { Camera, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PoseDetection from "./PoseDetection";
import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, VERSION } from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface WebcamFeedProps {
  isEnabled?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// Keep a reference to the active stream and its initialization promise
let globalStream: MediaStream | null = null;
let streamInitPromise: Promise<MediaStream> | null = null;

const getStream = async (callback: () => void): Promise<MediaStream> => {
  if (streamInitPromise) return streamInitPromise;

  streamInitPromise = navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
      frameRate: { ideal: 30, max: 30 },
      aspectRatio: { ideal: 16 / 9 },
    },
  });

  try {
    globalStream = await streamInitPromise;
    callback();
    return globalStream;
  } catch (error) {
    streamInitPromise = null;
    throw error;
  }
};

const WebcamFeed = ({
  isEnabled = true,
  onStreamReady = () => {},
  onError = () => {},
  className = "",
}: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [streamReady, setStreamReady] = useState(false);

  const onResults = (results) => {
    if (contextRef.current) {
      contextRef.current.save();
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      drawConnectors(contextRef.current, results.poseLandmarks, POSE_CONNECTIONS,
        {color: '#00FF00', lineWidth: 4});
      drawLandmarks(contextRef.current, results.poseLandmarks,
            {color: '#FF0000', lineWidth: 2});
      drawConnectors(contextRef.current, results.faceLandmarks, FACEMESH_TESSELATION,
              {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(contextRef.current, results.leftHandLandmarks, HAND_CONNECTIONS,
              {color: '#CC0000', lineWidth: 5});
      drawLandmarks(contextRef.current, results.leftHandLandmarks,
            {color: '#00FF00', lineWidth: 2});
      drawConnectors(contextRef.current, results.rightHandLandmarks, HAND_CONNECTIONS,
              {color: '#00CC00', lineWidth: 5});
      drawLandmarks(contextRef.current, results.rightHandLandmarks,
       {color: '#FF0000', lineWidth: 2});
      
      contextRef.current.restore();
    }
  };

  const initializeWebcam = async () => {
    setIsLoading(true);
    setError(null);

    const holistic = new Holistic({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@${VERSION}/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (!isEnabled) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsLoading(false);
      return;
    }

    const sendToMediaPipe = async () => {
      if (videoRef.current) {
        if (videoRef.current.videoWidth) {
          await holistic.send({ image: videoRef.current });
        }
        requestAnimationFrame(sendToMediaPipe);
      }
    };

    try {
      const stream = await getStream(sendToMediaPipe);

      if (videoRef.current && stream.active) {
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve) => {
          if (!videoRef.current) return;
          videoRef.current.onloadedmetadata = () => resolve();
        });

        setIsLoading(false);
        setStreamReady(true);
        onStreamReady(stream);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to access webcam");
      setError(error);
      setIsLoading(false);
      onError(error);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }

    const init = async () => {
      if (!mounted) return;
      await initializeWebcam();
    };

    init();

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isEnabled]);

  // Cleanup global stream when the window is about to unload
  useEffect(() => {
    const cleanup = () => {
      if (globalStream) {
        globalStream.getTracks().forEach((track) => {
          track.stop();
        });
        globalStream = null;
        streamInitPromise = null;
      }
    };

    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  const handleRetry = () => {
    initializeWebcam();
  };

  return (
    <div
      className={cn(
        "relative w-full h-full bg-black overflow-hidden relative",
        className,
      )}
    >
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full object-cover absolute z-0",
          (isLoading || error) && "opacity-50",
        )}
        style={{
          transform: "scaleX(-1)",
        }}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          "w-full h-full object-cover absolute z-10",
          (isLoading || error) && "opacity-50",
        )}
        style={{
          transform: "scaleX(-1)",
        }}
        width={1280}
        height={720}
      />

      {/* Pose Detection Overlay */}
      {/* {!isLoading && !error && streamReady && videoRef.current && (
        <PoseDetection videoElement={videoRef.current} />
      )} */}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Camera className="h-8 w-8 text-primary" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-sm p-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Camera Access Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button
              variant="secondary"
              onClick={handleRetry}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
