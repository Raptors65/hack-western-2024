import { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import { useReactMediaRecorder } from "react-media-recorder";
import { calculateAngle, calculateAngles, calculateScore, cn } from "@/lib/utils";
import InstructorVideo from "./InstructorVideo";
import WebcamFeed from "./WebcamFeed";
import AlignmentGrid from "./AlignmentGrid";
import VideoControls from "./VideoControls";
import LayoutToggle from "./LayoutToggle";
import GridToggle from "./GridToggle";
import YouTubeInput from "./YouTubeInput";
import { Pose, Results, ResultsListener, VERSION } from "@mediapipe/pose";
import Screenshot from "./Screenshot";

interface VideoContainerProps {
  className?: string;
  isCameraEnabled?: boolean;
}

// Keep a reference to the active stream and its initialization promise
let globalStream: MediaStream | null = null;
let streamInitPromise: Promise<MediaStream> | null = null;

const getStream = async (callback: () => void): Promise<MediaStream> => {
  if (streamInitPromise) return streamInitPromise;

  streamInitPromise = navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
      frameRate: { ideal: 20, max: 20 },
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

const VideoContainer = ({
  className = "",
  isCameraEnabled = false,
}: VideoContainerProps) => {
  const [layout, setLayout] = useState<"split" | "mini">("split");
  const [showGrid, setShowGrid] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<Error | null>(null);
  const [webcamError, setWebcamError] = useState<Error | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const youtubePlayerRef = useRef<any>(null);
  const intervalRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [userResults, setUserResults] = useState<Results | null>(null);
  const [vidResults, setVidResults] = useState<Results | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [numScreenshotsTaken, setNumScreenshotsTaken] = useState(0);
  const [workoutIsDone, setWorkoutIsDone] = useState(false);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);
  // const [screenshots, setScreenshots] = useState<string[]>([]);

  // const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } =
  //   useReactMediaRecorder({ screen: true });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const screenshotsRef = useRef<string[]>([]);

  const dist2 = (dx: number, dy: number, dz: number) => {
    return dx ** 2 + dy ** 2 + dz ** 2;
  }

  const calculateAngle = (p1: any, p2: any, p3: any) => {
    const a2 = dist2(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    const b2 = dist2(p2.x - p3.x, p2.y - p3.y, p2.z - p3.z);
    const c2 = dist2(p1.x - p3.x, p1.y - p3.y, p1.z - p3.z);
    const angle = Math.acos((a2 + b2 - c2) / (2 * Math.sqrt(a2) * Math.sqrt(b2)));
    return angle * 180 / Math.PI;
  }

  const handAngles = (handLandmarks: any) => {
    if (handLandmarks === undefined) return [360,360,360,360,360];
    const lst = [
      [1, 3, 4], //finger 1
      [5, 7, 8], //finger 2
      [9, 11, 12], //finger 3
      [13, 15, 16], //finger 4
      [17, 19, 20] //finger 5
    ];

    const angles = [];

    for (let p of lst){
      angles.push(calculateAngle(handLandmarks[p[0]], handLandmarks[p[1]], handLandmarks[p[2]]));
    }
    return angles;
  }

  const bothHandsRaised = (results: any) => {
    const leftAngles = handAngles(results.leftHandLandmarks);
    const rightAngles = handAngles(results.rightHandLandmarks);

    for (let a of leftAngles){
      if (Math.abs(a - 180) > 20){
        return false;
      }
    }
    for (let a of rightAngles){
      if (Math.abs(a - 180) > 20){
        return false;
      }
    }

    return true;
  }

  const initializeRecording = async () => {
    setIsLoading(true);
    setError(null);

    const holistic = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onVidResults);

    const sendToMediaPipe = async () => {
      if (videoRef.current) {
        if (videoRef.current.videoWidth) {
          if (contextRef.current) {
            contextRef.current.save();
            
            contextRef.current.drawImage(
              videoRef.current,
              0,
              225,
              640,
              720,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );

            // console.log(videoRef.current,
            //   0,
            //   0,
            //   640,
            //   720,
            //   0,
            //   0,
            //   canvasRef.current.width,
            //   canvasRef.current.height);
      
            // contextRef.current.drawImage(results.image, 0, 0, videoRef.current.width, videoRef.current.height, -100, 0, canvasRef.current.width, canvasRef.current.height);
            // contextRef.current.restore();
          }

          if (numScreenshotsTaken < 5 && Math.random() < (1 / 100) && fullCanvasRef.current) {
            fullCanvasRef.current.getContext("2d").drawImage(
              videoRef.current,
              0,
              90,
              window.innerWidth,
              window.innerHeight,
              0,
              0,
              window.innerWidth,
              window.innerHeight
            );

            // console.log("hey!", fullCanvasRef.current.toDataURL(), screenshots);
            screenshotsRef.current.push(fullCanvasRef.current.toDataURL());
            // take screenshot
            setNumScreenshotsTaken((prev) => prev + 1);
          }

          await holistic.send({ image: canvasRef.current });
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
        // onStreamReady(stream);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to get recording");
      
      setError(error);
      setIsLoading(false);
      // onError(error);
    }
  };

  const onVidResults: ResultsListener = (results) => {
    // console.log("results from vid", results);
    setVidResults(results);
  };

  const onUserResults: ResultsListener = (results) => {
    // console.log("results from user", results);
    setUserResults(results);
  };

  useEffect(() => {
    // if (vidResults?.poseWorldLandmarks) console.log(calculateAngle(vidResults.poseWorldLandmarks[11], vidResults.poseWorldLandmarks[13], vidResults.poseWorldLandmarks[15]));
    // console.log("hey", vidResults)
    if (!userResults?.poseWorldLandmarks || !vidResults?.poseWorldLandmarks) return;
    
    const score = calculateScore(calculateAngles(userResults.poseWorldLandmarks), calculateAngles(vidResults.poseWorldLandmarks)) / 10;

    // console.log(score);
    if (!isNaN(score) && !bothHandsRaised(userResults)) {
      setTotalScore((prev) => prev + score);
    }
    console.log("total", totalScore);
  }, [userResults, vidResults]);

  useEffect(() => {
    let mounted = true;

    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
      // console.log("context set")
    }

    const init = async () => {
      if (!mounted) return;
      await initializeRecording();
    };

    init();

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [youtubeVideoId]);

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

  const handlePlayPause = () => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEndWorkout = () => {
    setWorkoutIsDone(true);
  }

  const handleReset = () => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(0);
      youtubePlayerRef.current.pauseVideo();
      setCurrentTime(0);
      setIsPlaying(false);
      setIsEnded(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (youtubeVideoId && youtubePlayerRef.current) {
      const newTime = value[0];
      youtubePlayerRef.current.seekTo(newTime);
      setCurrentTime(newTime);
      if (newTime < duration) {
        setIsEnded(false);
      }
    }
  };

  const handleYouTubeReady = (event: any) => {
    youtubePlayerRef.current = event.target;
    setDuration(event.target.getDuration());
    setIsVideoLoading(false);
  };

  const handleYouTubeStateChange = (event: any) => {
    switch (event.data) {
      case 0: // ended
        setIsPlaying(false);
        setIsEnded(true);
        break;
      case 1: // playing
        setIsPlaying(true);
        break;
      case 2: // paused
        setIsPlaying(false);
        break;
      default:
        break;
    }
  };

  const handleYouTubeError = (error: any) => {
    console.error("YouTube player error:", error);
    setVideoError(new Error("Failed to load YouTube video"));
    setIsVideoLoading(false);
  };

  const handleYouTubePlaybackTime = () => {
    if (youtubePlayerRef.current) {
      setCurrentTime(youtubePlayerRef.current.getCurrentTime());
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Start time update interval when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(handleYouTubePlaybackTime, 1000);
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // useEffect(() => {
  //   setScreenshots(screenshotsRef.current)
  // }, [screenshotsRef.current]);

  const getScreenshots = () => screenshotsRef.current;

  return (
    <>
    {!workoutIsDone &&
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full bg-background overflow-hidden",
          isFullscreen && "fixed inset-0 z-50",
          className,
        )}
      >
        <div className="absolute top-3 left-4 right-4 z-30">
          <YouTubeInput onSubmit={setYoutubeVideoId} isPlaying={isPlaying} score={totalScore} maxScore={100000} onEndWorkout={handleEndWorkout} />
        </div>

        

        <video
          ref={videoRef}
          className={cn(
            "absolute h-screen w-[50vw] object-cover -z-20 object-left",
            (isLoading || error) && "opacity-50",
          )}
          style={{
            transform: "scaleX(-1)",
          }}
        />

        <canvas ref={fullCanvasRef} className="absolute w-full h-full" width={window.innerWidth} height={window.innerHeight} hidden></canvas>

        <canvas ref={canvasRef} className={cn(
            "absolute -z-50 object-cover w-[50vw] h-screen left-[55rem]",
          )}
          style={{
            transform: "scaleX(-1)",
          }}
          width={640}
          height={720}></canvas>

        <div className="relative w-full h-full flex mt-16">
          {/* Main Container */}
          <div className="relative flex w-full h-full transition-all duration-300 ease-in-out">
            {/* Video Container */}
            <div
              className={cn(
                "relative h-full transition-all duration-300 ease-in-out",
                layout === "split" && !isFullscreen ? "w-1/2" : "w-full",
              )}
              style={{ minHeight: "400px" }}
            >
              {youtubeVideoId && (
                <div className="absolute inset-0">
                  <YouTube
                    videoId={youtubeVideoId}
                    opts={{
                      playerVars: {
                        autoplay: 0,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        playsinline: 1,
                        enablejsapi: 1,
                      },
                      width: "100%",
                      height: "100%",
                    }}
                    onReady={handleYouTubeReady}
                    onStateChange={handleYouTubeStateChange}
                    onError={handleYouTubeError}
                    className="w-full h-full"
                    iframeClassName="w-full h-full absolute inset-0"
                  />
                </div>
              )}

              {!youtubeVideoId && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Enter a YouTube URL to begin
                </div>
              )}
            </div>

            {/* Webcam Feed */}
            {layout === "split" && (
              <div
                className={cn(
                  "relative h-full transition-all duration-300 ease-in-out",
                  !isFullscreen
                    ? "w-1/2"
                    : "absolute top-4 right-4 w-[320px] h-[180px]",
                )}
                style={!isFullscreen ? { minHeight: "400px" } : {}}
              >
                <div
                  className={cn(
                    "w-full h-full",
                    isFullscreen &&
                      "rounded-lg overflow-hidden shadow-lg border border-border",
                  )}
                >
                  <WebcamFeed
                    key="split-webcam"
                    isEnabled={isCameraEnabled}
                    className="w-full h-full"
                    onError={setWebcamError}
                    onResult={onUserResults}
                  />
                </div>
              </div>
            )}

            {/* Mini Webcam Overlay */}
            {layout === "mini" && isCameraEnabled && !webcamError && (
              <div className="absolute top-4 right-4 w-[320px] h-[180px] rounded-lg overflow-hidden shadow-lg border border-border">
                <WebcamFeed
                  key="mini-webcam"
                  isEnabled={isCameraEnabled}
                  className="w-full h-full"
                  onError={setWebcamError}
                  onResult={setUserResults}
                />
              </div>
            )}
          </div>

          {/* Floating Controls */}
          <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
            {isCameraEnabled && !webcamError && (
              <LayoutToggle layout={layout} onChange={setLayout} />
            )}
            <GridToggle showGrid={showGrid} onChange={setShowGrid} />
          </div>

          {/* Alignment Grid Overlay */}
          {showGrid && <AlignmentGrid />}

          {/* Video Controls */}
          {youtubeVideoId && (
            <div className="absolute bottom-0 left-0 right-0">
              <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                layout={layout}
                showGrid={showGrid}
                isFullscreen={isFullscreen}
                onPlayPause={handlePlayPause}
                onReset={handleReset}
                onSeek={handleSeek}
                onLayoutToggle={() =>
                  setLayout(layout === "split" ? "mini" : "split")
                }
                onGridToggle={() => setShowGrid(!showGrid)}
                onFullscreenToggle={toggleFullscreen}
                disabled={isVideoLoading}
              />
            </div>
          )}
        </div>
      </div>
      }
      <Screenshot score = {totalScore} getScreenshots={getScreenshots} hidden={!workoutIsDone} />
    </>
  );
};

export default VideoContainer;
