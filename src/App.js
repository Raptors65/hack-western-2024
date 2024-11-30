import { useEffect, useRef, useState } from 'react';
// import { Results, Hands, HAND_CONNECTIONS, VERSION } from '@mediapipe/hands';
import { Holistic, Results, HAND_CONNECTIONS, VERSION, POSE_CONNECTIONS, FACEMESH_TESSELATION } from '@mediapipe/holistic';
import {
  drawConnectors,
  drawLandmarks,
  Data,
  lerp,
} from '@mediapipe/drawing_utils';
// import './index.scss';

const HandsContainer = () => {
  const [inputVideoReady, setInputVideoReady] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const inputVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    if (!inputVideoReady) {
      return;
    }
    if (inputVideoRef.current && canvasRef.current) {
      console.log('rendering');
      contextRef.current = canvasRef.current.getContext('2d');
      const constraints = {
        video: { width: { min: 1280 }, height: { min: 720 } },
      };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        if (inputVideoRef.current) {
          inputVideoRef.current.srcObject = stream;
        }
        sendToMediaPipe();
      });

      const holistic = new Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@${VERSION}/${file}`,
      });

      holistic.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      holistic.onResults(onResults);

      const sendToMediaPipe = async () => {
        if (inputVideoRef.current) {
          if (!inputVideoRef.current.videoWidth) {
            console.log(inputVideoRef.current.videoWidth);
            requestAnimationFrame(sendToMediaPipe);
          } else {
            await holistic.send({ image: inputVideoRef.current });
            requestAnimationFrame(sendToMediaPipe);
          }
        }
      };
    }
  }, [inputVideoReady]);

  const onResults = (results) => {
    if (canvasRef.current && contextRef.current) {
      setLoaded(true);

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

  return (
    <div className="hands-container">
      <video
        autoPlay
        ref={inputVideoRef}
      />
      <canvas ref={canvasRef} width={1280} height={720} />
      {!loaded && (
        <div className="loading">
          <div className="spinner"></div>
          <div className="message">Loading</div>
        </div>
      )}
    </div>
  );
};

export default HandsContainer;