import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PoseDetectionProps {
  videoElement: HTMLVideoElement | null;
  className?: string;
}

const PoseDetection = ({
  videoElement,
  className = "",
}: PoseDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    fps: 0,
    canvasSize: "",
    landmarks: 0,
  });

  useEffect(() => {
    if (!videoElement || !canvasRef.current) {
      console.log("Missing video or canvas element");
      return;
    }

    let detector: poseDetection.PoseDetector | null = null;
    let frameId: number | null = null;
    let isActive = true;
    let frameCount = 0;
    let lastTime = performance.now();

    const setupTF = async () => {
      try {
        console.log("Starting TensorFlow initialization...");

        // Initialize TensorFlow.js with WebGL backend
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("TensorFlow.js initialized with backend:", tf.getBackend());

        // Create detector with specific configuration
        console.log("Creating pose detector...");
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
            minPoseScore: 0.2,
          },
        );
        console.log("Pose detector created successfully");

        setIsModelLoading(false);

        // Start detection loop
        const detectFrame = async () => {
          if (!isActive || !detector || !videoElement || !canvasRef.current) {
            console.log("Detection loop stopped:", {
              isActive,
              hasDetector: !!detector,
              hasVideo: !!videoElement,
              hasCanvas: !!canvasRef.current,
            });
            return;
          }

          try {
            // Check if video is ready
            if (videoElement.readyState < 2) {
              frameId = requestAnimationFrame(detectFrame);
              return;
            }

            const poses = await detector.estimatePoses(videoElement, {
              flipHorizontal: true,
              maxPoses: 1,
            });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw poses
            poses.forEach((pose) => {
              if (pose.keypoints) {
                console.log(
                  "Drawing pose with keypoints:",
                  pose.keypoints.length,
                );
                drawPose(ctx, pose.keypoints);
              }
            });

            // Update FPS counter
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
              setDebugInfo((prev) => ({
                ...prev,
                fps: Math.round((frameCount * 1000) / (now - lastTime)),
                landmarks: poses[0]?.keypoints?.length || 0,
              }));
              frameCount = 0;
              lastTime = now;
            }
          } catch (err) {
            console.error("Detection error:", err);
          }

          frameId = requestAnimationFrame(detectFrame);
        };

        console.log("Starting detection loop");
        detectFrame();
      } catch (err) {
        console.error("Setup error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize pose detection",
        );
        setIsModelLoading(false);
      }
    };

    setupTF();

    return () => {
      console.log("Cleaning up pose detection");
      isActive = false;
      if (frameId) cancelAnimationFrame(frameId);
      if (detector) detector.dispose();
    };
  }, [videoElement]);

  // Update canvas size
  useEffect(() => {
    if (!videoElement || !canvasRef.current) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !videoElement) return;

      canvas.width = videoElement.videoWidth || videoElement.clientWidth;
      canvas.height = videoElement.videoHeight || videoElement.clientHeight;
      console.log("Canvas size updated:", canvas.width, "x", canvas.height);

      setDebugInfo((prev) => ({
        ...prev,
        canvasSize: `${canvas.width}x${canvas.height}`,
      }));
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(videoElement);
    videoElement.addEventListener("loadedmetadata", updateCanvasSize);

    return () => {
      resizeObserver.disconnect();
      videoElement.removeEventListener("loadedmetadata", updateCanvasSize);
    };
  }, [videoElement]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 z-10 pointer-events-none", className)}
        style={{ transform: "scaleX(-1)" }}
      />
      <div className="absolute top-2 left-2 z-20 bg-black/50 text-white p-2 rounded text-sm font-mono">
        {isModelLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading model...
          </div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : (
          <>
            <div>FPS: {debugInfo.fps}</div>
            <div>Canvas: {debugInfo.canvasSize}</div>
            <div>Landmarks: {debugInfo.landmarks}</div>
          </>
        )}
      </div>
    </div>
  );
};

const drawPose = (
  ctx: CanvasRenderingContext2D,
  keypoints: poseDetection.Keypoint[],
) => {
  // Draw points
  keypoints.forEach((keypoint) => {
    if (keypoint.score && keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#00ff00";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Draw connections
  const connections = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["right_shoulder", "right_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["right_hip", "right_knee"],
    ["left_knee", "left_ankle"],
    ["right_knee", "right_ankle"],
  ];

  connections.forEach(([start, end]) => {
    const startPoint = keypoints.find((kp) => kp.name === start);
    const endPoint = keypoints.find((kp) => kp.name === end);

    if (
      startPoint?.score &&
      endPoint?.score &&
      startPoint.score > 0.3 &&
      endPoint.score > 0.3
    ) {
      // Draw glow effect
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw main line
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
};

export default PoseDetection;
