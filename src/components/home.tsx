import { useState, useEffect } from "react";
import VideoContainer from "./workout/VideoContainer";
import CameraPermissionHandler from "./workout/CameraPermissionHandler";

function Home() {
  const [cameraPermission, setCameraPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  // Check initial camera permission state
  const checkInitialPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      if (videoDevices.length === 0) {
        setCameraPermission("denied");
        return;
      }

      const permission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      setCameraPermission(permission.state as "prompt" | "granted" | "denied");

      permission.addEventListener("change", () => {
        setCameraPermission(
          permission.state as "prompt" | "granted" | "denied",
        );
      });
    } catch (error) {
      console.error("Error checking camera permission:", error);
      setCameraPermission("prompt");
    }
  };

  // Handle camera permission granted
  const handlePermissionGranted = () => {
    setCameraPermission("granted");
  };

  // Check permission on mount
  useEffect(() => {
    checkInitialPermission();
  }, []);

  return (
    <div className="w-screen h-screen bg-background">
      <VideoContainer
        className="w-full h-full"
        isCameraEnabled={cameraPermission === "granted"}
        videoUrl="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
      <CameraPermissionHandler
        permissionState={cameraPermission}
        onPermissionGranted={handlePermissionGranted}
      />
    </div>
  );
}

export default Home;
