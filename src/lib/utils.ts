import { Landmark, NormalizedLandmark, NormalizedLandmarkList } from "@mediapipe/holistic";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dist2 = (dx, dy, dz) => {
  return dx ** 2 + dy ** 2 + dz ** 2;
}

export const calculateAngle = (p1: NormalizedLandmark, p2: NormalizedLandmark, p3: NormalizedLandmark) => {
  const a2 = dist2(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
  const b2 = dist2(p2.x - p3.x, p2.y - p3.y, p2.z - p3.z);
  const c2 = dist2(p1.x - p3.x, p1.y - p3.y, p1.z - p3.z);
  const angle = Math.acos((a2 + b2 - c2) / (2 * Math.sqrt(a2) * Math.sqrt(b2)));
  return angle * 180 / Math.PI;
}

export const calculateAngles = (poseLandmarks: NormalizedLandmarkList) => {
  // console.log(poseLandmarks);
  // const lst = [
  //   [12, 14, 16],
  //   [11, 12, 14],
  //   [12, 11, 13],
  //   [11, 13, 15],
  //   [14, 12, 24],
  //   [13, 11, 23],
  //   [12, 24, 23],
  //   [11, 23, 24],
  //   [12, 24, 26],
  //   [11, 23, 25],
  //   [24, 26, 28],
  //   [23, 25, 27],
  // ]

  const lst = [
    [11, 13, 15],
    [12, 14, 16],
    [23, 25, 27],
    [24, 26, 28],
  ]

  const angles = [];
  for (let p of lst) {
    if (poseLandmarks[p[0]].visibility > 0.9 && poseLandmarks[p[1]].visibility > 0.9 && poseLandmarks[p[2]].visibility > 0.9) {
      angles.push(calculateAngle(poseLandmarks[p[0]], poseLandmarks[p[1]], poseLandmarks[p[2]]));
    } else {
      angles.push(null);
    }
  }
  return angles as (number | null)[];
}

let vidAnglesBuffer: number[][] = [];
let userAnglesBuffer: number[][] = [];

const BUFFER_SIZE = 30;

export const calculateScore = (userAngles: (number | null)[], vidAngles: (number | null)[]) => {
  let sum = 0, count = 0;
  for (let i=0; i<userAngles.length; ++i) {
    if (userAngles[i] && vidAngles[i]) {
      sum += Math.abs(userAngles[i] - vidAngles[i]);
      count++;
    }
  }

  let maxScore = 1000 - sum * (1000 / 180) / count;
  let minScore = maxScore;

  for (let prev = 0; prev < vidAnglesBuffer.length; prev++) {
    // take average of absolute difference of each pair of angles
    let sum = 0, count = 0;
    for (let i=0; i<userAngles.length; ++i) {
      if (userAngles[i] && vidAnglesBuffer[prev][i]) {
        sum += Math.abs(userAngles[i] - vidAnglesBuffer[prev][i]);
        count++;
      }
    }
    maxScore = Math.max(maxScore, 1000 - sum * (1000 / 180) / count);
    minScore = Math.min(maxScore, 1000 - sum * (1000 / 180) / count);
  }

  let score = (maxScore + minScore) / 2;

  // Giving bonus points for same direction
  if (userAnglesBuffer.length >= BUFFER_SIZE) {
    for (let i = 0; i < userAnglesBuffer[BUFFER_SIZE - 1].length; i++) {
      if (!userAnglesBuffer[BUFFER_SIZE - 1][i] || !userAngles[i] || !vidAnglesBuffer[BUFFER_SIZE - 1][i] || !vidAngles[i]) {
        continue;
      }

      const userAngleDelta = userAngles[i] - userAnglesBuffer[BUFFER_SIZE - 1][i];
      const vidAngleDelta = vidAngles[i] - vidAnglesBuffer[BUFFER_SIZE - 1][i];

      // console.log(vidAngleDelta)

      // Check if the vid angle changed "significantly"
      if (Math.abs(vidAngleDelta) > 3) {
        // Check if signs are the same
        if (userAngleDelta * vidAngleDelta > 0) {
          score += (1000 / userAnglesBuffer[BUFFER_SIZE - 1].length);
        } else if (userAngleDelta * vidAngleDelta < 0) {
          score -= (1000 / userAnglesBuffer[BUFFER_SIZE - 1].length);
        }
      }
    }
  }

  if (vidAnglesBuffer.length >= BUFFER_SIZE) {
    vidAnglesBuffer = [vidAngles, ...vidAnglesBuffer.slice(0, BUFFER_SIZE - 1)];
    userAnglesBuffer = [userAngles, ...userAnglesBuffer.slice(0, BUFFER_SIZE - 1)];
  } else {
    vidAnglesBuffer = [vidAngles, ...vidAnglesBuffer];
    userAnglesBuffer = [userAngles, ...userAnglesBuffer]
  }

  return score;
}