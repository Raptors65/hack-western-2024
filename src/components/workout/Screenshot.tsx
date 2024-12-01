import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

type ScreenshotProps = {
  hidden: boolean;
  getScreenshots: () => string[];
}

const Screenshot = (props: ScreenshotProps) => {
  let stream;
  const screenRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [screenshots, setScreenshots] = useState([]);
  const [screenshotId, setScreenshotId] = useState(0);
  
  // const init = async () => {
  //   const options = {
  //     video: true,
  //     audio: false,
  //     selfBrowserSurface: "exclude",
  //     surfaceSwitching: "include", // or exclude
  //   }

  //   try {
  //     stream = await navigator.mediaDevices.getDisplayMedia(options);
  //     screenRef.current.srcObject = stream;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // useEffect(() => {
  //   if (props.numScreenshots > 0) {
  //     captureFrame();
  //   }
  // }, [props.numScreenshots]);

  // const captureFrame = async () => {
  //   // canvasRef.current.width = screenRef.current.videoWidth;
  //   // canvasRef.current.height = screenRef.current.videoHeight;
  //   canvasRef.current.getContext('2d').
  //     drawImage(screenRef.current, 0, 0, window.innerWidth, window.innerHeight);
  //   setScreenshots(x => [...x, canvasRef.current.toDataURL()]);
  // }

  // useEffect(() => {
  //   init();
  // }, []);

  const screenshots = props.getScreenshots();

  const incrementScreenshotId = () => {
    setScreenshotId(x => (screenshotId + 1 == screenshots.length ? 0 : x + 1));
  }

  return (
    <div className={cn("overflow-hidden", { "hidden": props.hidden })}>
      <video ref={screenRef} autoPlay width={window.innerWidth} height={window.innerHeight} hidden />
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} hidden />
      {screenshots.length > 0 &&
        <div className="relative flex w-[95vw] items-center h-[90vh] justify-center">
          <img className="absolute top-5 left-5" src={screenshots[screenshotId]} onClick={incrementScreenshotId} />
          <div className="absolute top-10 left-10 flex justify-center">
            <p className="outlined text-white font-medium text-[28px]">gym bros were impressed 😳</p>
          </div>
        </div>
      }
    </div>
  )
}

export default Screenshot;