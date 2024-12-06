import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CameraOff } from "lucide-react";

interface CameraPermissionHandlerProps {
  onPermissionGranted?: () => void;
  permissionState?: "prompt" | "granted" | "denied";
}

const CameraPermissionHandler = ({
  onPermissionGranted = () => {},
  permissionState = "prompt",
}: CameraPermissionHandlerProps) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      onPermissionGranted();
    } catch (error) {
      console.error("Camera permission denied:", error);
    }
    setIsRequesting(false);
  };

  if (permissionState === "granted") {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 space-y-6 text-center shadow-lg">
        {permissionState === "denied" ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Camera Access Denied
            </h2>
            <p className="text-muted-foreground">
              Please enable camera access in your browser settings to use the
              workout mirror feature.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Retry Camera Access
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Camera Access Required
            </h2>
            <p className="text-muted-foreground">
              We need access to your camera to show your workout form alongside
              the instructor.
            </p>
            <Button
              className="w-full"
              onClick={handleRequestPermission}
              disabled={isRequesting}
            >
              {isRequesting ? "Requesting Access..." : "Enable Camera"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default CameraPermissionHandler;
