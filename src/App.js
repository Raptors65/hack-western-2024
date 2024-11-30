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

  const dist2 = (dx, dy, dz) => {
    return dx ** 2 + dy ** 2 + dz ** 2;
  }

  const calculateAngle = (p1, p2, p3) => {
    const a2 = dist2(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    const b2 = dist2(p2.x - p3.x, p2.y - p3.y, p2.z - p3.z);
    const c2 = dist2(p1.x - p3.x, p1.y - p3.y, p1.z - p3.z);
    const angle = Math.acos((a2 + b2 - c2) / (2 * Math.sqrt(a2) * Math.sqrt(b2)));
    return angle * 180 / Math.PI;
  }

  const calculateAngles = (poseLandmarks) => {
    // console.log(poseLandmarks);
    const lst = [
      [12, 14, 16],
      [11, 12, 14],
      [12, 11, 13],
      [11, 13, 15],
      [14, 12, 24],
      [13, 11, 23],
      [12, 24, 23],
      [11, 23, 24],
      [12, 24, 26],
      [11, 23, 25],
      [24, 26, 28],
      [23, 25, 27],
    ]

    const angles = [];
    for (let p of lst) {
      angles.push(calculateAngle(poseLandmarks[p[0]], poseLandmarks[p[1]], poseLandmarks[p[2]]));
    }
    return angles;
  }

  const calculateScore = (angles1, angles2) => {
    // take average of absolute difference of each pair of angles
    let sum = 0, count = angles1.length;
    for (let i=0; i<count; ++i) {
      sum += Math.abs(angles1[i] - angles2[i]);
    }
    return sum / count;
  }

  const handAngles = (handLandmarks) => {
    if (handLandmarks === undefined) return [0,0,0,0,0];
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

  const bothHandsRaised = (results) => {
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

      calculateAngles(results.poseLandmarks);
      console.log(bothHandsRaised(results));
      
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