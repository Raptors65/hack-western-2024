import React, { useEffect, useState } from "react";
import WebcamFeed from "./WebcamFeed";
import { NormalizedLandmarkList } from "@mediapipe/holistic";
import { calculateAngle } from "@/lib/utils";

interface PosePromptingProps {
    numberOfPoses?: number; // Default: 10
    repsPerPose?: number; // Default: 10
}

const PosePrompting = ({
    numberOfPoses = 10,
    repsPerPose = 5,
}: PosePromptingProps) => {
    const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
    const [currentReps, setCurrentReps] = useState(0);
    const [finished, setFinished] = useState(0); //not finished
    const [currentPoseStatus, setCurrentPoseStatus] = useState(0);//not performed

    // List of possible moves/poses
    const posesList = [
        "Squats",
        "Jumping Jacks",
        "Right Side Lunges",
        "Left Side Lunges"
    ];

    const sessionPoses = Array.from({ length: numberOfPoses }, () =>
        posesList[Math.floor(Math.random() * posesList.length)]
    );

    useEffect(() => {
        console.log(currentReps);
    }, [currentReps])

    useEffect(() => {
        if (currentReps < repsPerPose) return;

        setCurrentReps(0);
        setCurrentPoseIndex(prev => prev + 1)
    }, [currentReps])

    const handleNext = () => {
        console.log("finished jump");

        setCurrentReps((prevReps) => {
            return prevReps + 1;
        })

        // setCurrentReps((prevReps) => {
        //     if (prevReps < repsPerPose) {
        //         console.log(`Next rep: ${prevReps + 1}`);
        //         return prevReps + 1; // Increment repetitions
        //     }
        //     setCurrentPoseIndex((prevIndex) => {
        //         if (prevIndex < sessionPoses.length - 1) {
        //             console.log(`Next pose: ${prevIndex + 1}`);
        //             return prevIndex + 1; // Increment pose
        //         }

        //         console.log("Workout complete");
        //         setFinished(1); // Mark workout as finished
        //         setCurrentReps(1); // Reset reps
        //         return 0; // Reset pose index
        //     });

        //     return 1; // Reset repetitions when moving to the next pose
        // });
    };

    useEffect(() => {
        console.log(currentPoseStatus);

        if (currentPoseStatus != 2) return;
        handleNext();
        console.log(`finished rep, ${currentReps}`);
        setCurrentPoseStatus(0);
    }, [currentPoseStatus]);


    const evaluatePose = (poseLandmarks: NormalizedLandmarkList, currentPose: string) => {
        // Calculate knee angles
        const leftKneeAngle = calculateAngle(poseLandmarks[23], poseLandmarks[25], poseLandmarks[27]);
        const rightKneeAngle = calculateAngle(poseLandmarks[24], poseLandmarks[26], poseLandmarks[28]);
        const rightPitAngle = calculateAngle(poseLandmarks[14], poseLandmarks[12], poseLandmarks[24]);
        const leftPitAngle = calculateAngle(poseLandmarks[13], poseLandmarks[11], poseLandmarks[23]);

        const VISIBILITY_THRESHOLD = 0.9;

        // Helper to check landmark visibility
        const areLandmarksVisible = (landmarks: number[]) =>
            landmarks.every((index) => poseLandmarks[index].visibility > VISIBILITY_THRESHOLD);

        let isPoseCorrect = false;

        if (currentPose === "Squats") {
            const leftVisible = areLandmarksVisible([23, 25, 27]);
            const rightVisible = areLandmarksVisible([24, 26, 28]);
            if (leftVisible && rightVisible) {
                const leftKneeCorrect = leftKneeAngle <= 110; // Threshold: 90 + 20
                const rightKneeCorrect = rightKneeAngle <= 110;
                isPoseCorrect = leftKneeCorrect && rightKneeCorrect;
            }
        } else if (currentPose === "Right Side Lunges") {
            const leftVisible = areLandmarksVisible([23, 25, 27]);
            const rightVisible = areLandmarksVisible([24, 26, 28]);
            if (leftVisible && rightVisible) {
                const leftKneeCorrect = leftKneeAngle >= 160; // Threshold: 180 - 20
                const rightKneeCorrect = rightKneeAngle <= 110;
                isPoseCorrect = leftKneeCorrect && rightKneeCorrect;
            }
        } else if (currentPose === "Left Side Lunges") {
            const leftVisible = areLandmarksVisible([23, 25, 27]);
            const rightVisible = areLandmarksVisible([24, 26, 28]);
            if (leftVisible && rightVisible) {
                const leftKneeCorrect = leftKneeAngle <= 110;
                const rightKneeCorrect = rightKneeAngle >= 160; // Threshold: 180 - 20
                isPoseCorrect = leftKneeCorrect && rightKneeCorrect;
            }
        } else if (currentPose === "Jumping Jacks") {
            const leftVisible = areLandmarksVisible([14, 12, 24]);
            const rightVisible = areLandmarksVisible([13, 11, 23]);
            if (leftVisible && rightVisible) {
                const leftPitCorrect = leftPitAngle >= 110; // Threshold: 165 - 20
                const rightPitCorrect = rightPitAngle >= 110;
                isPoseCorrect = leftPitCorrect && rightPitCorrect;
                // console.log(`correct: ${rightPitCorrect}, ${rightPitAngle}, ${rightPitAngle > 110}`)
            }
        }

        return isPoseCorrect;
    };

    const handleResults = (results: any) => {
        if (results.poseLandmarks) {
            const isCorrectPose = evaluatePose(results.poseLandmarks, sessionPoses[currentPoseIndex]);

            setCurrentPoseStatus((prevStatus) => {
                // console.log(prevStatus)
                if (prevStatus === 1 && !isCorrectPose) {
                    console.log("Performed negative");
                    // handleNext(); // Proceed to the next repetition or pose
                    return 2; // Reset to the negative state
                }
                if (prevStatus === 0 && isCorrectPose) {
                    console.log("Performed positive");
                    return 1; // Switch to positive state
                }
                return prevStatus; // No change
            });
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md">
                <h1 className="text-2xl font-bold mb-4">Pose Prompting</h1>
                <div className="text-lg font-medium text-center mb-6">
                    <p>Current Pose:</p>
                    <p className="text-green-600">{sessionPoses[currentPoseIndex]}</p>
                </div>
                <div className="text-sm text-gray-700 mb-4">
                    <p>
                        Repetition: <span className="font-bold">{currentReps}</span> / {repsPerPose}
                    </p>
                    <p>
                        Move: <span className="font-bold">{currentPoseIndex + 1}</span> / {sessionPoses.length}
                    </p>
                    <p>{currentPoseStatus}</p>
                </div>
            </div>

            <div className="w-screen h-screen">
                <WebcamFeed
                    key="split-webcam"
                    isEnabled={true}
                    className="w-full h-full"
                    onError={() => { }}
                    onResult={handleResults}
                />
            </div>
        </>
    );
};

export default PosePrompting;
