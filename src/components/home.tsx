import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonStanding, Gamepad, BarChart3 } from "lucide-react";
import VoiceflowWidget from "./VoiceFlow";
import WebcamFeed2 from "./workout/WebcamFeed2";
import { cn } from "@/lib/utils";

function Home() {
  const navigate = useNavigate();
  
  const [fingersRaised, setFingersRaised] = useState(0);
  const [fingerHistory, setFingerHistory] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [selected, setSelected] = useState(-1);

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

  const distancesToWrist = (hand: any) => {
    const fingertips = [4,8,12,16,20];
    const wrist = 0;
    const dists = [];
    // console.log(hand);

    for (let i of fingertips){
      let dx = hand[i].x - hand[wrist].x;
      let dy = hand[i].y - hand[wrist].y;
      let dz = hand[i].z - hand[wrist].z;
      dists.push(Math.sqrt(dist2(dx, dy, dz)));
    }

    // console.log(dists);
    return dists;
  }

  const countFingers = (hand) => {
    let ret = 0;
    hand = handAngles(hand);
    for (let i=1; i<=5; i++){
      if (Math.abs(hand[i] - 180) < 20){
        ret ++;
      }
    }
    // console.log(hand);

    return ret;
  }

  const calculateFingersRaised = (results: any) => {
    const fingers = countFingers(results.leftHandLandmarks) + countFingers(results.rightHandLandmarks);
    // console.log(fingers);
    return fingers;
  }

  const updateSelected = () => {
    var flag = -1;
    for (let i=0; i<=8; i++){
      flag = i;
      for (let k=0; k<fingerHistory.length; k++){
        // console.log(fingerHistory);
        if (fingerHistory[k] !== i){
          flag = -1;
          break;
        }
      }
      if (flag === i){
        // console.log("DONE", flag);
        return flag;
      }
    }

    return -1;
  }

  const onResults = (results: any) => {
      let newFingers = calculateFingersRaised(results)
      setFingersRaised(newFingers);

      let newHistory = fingerHistory;
      newHistory.shift();
      newHistory.push(newFingers);

      setFingerHistory(newHistory);

      // setSelected(updateSelected());
      let x = updateSelected()
      if (x === 1){
        navigate("/preview");
      }

      else if (x === 2){
        navigate("/game");
      }

      else if (x === 3){
        navigate("/profile")
      }
      
    }


  return (
    <div className="w-screen h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12">BeFit</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fitness Mode */}
          <Button
            variant="outline"
            className={cn({"group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden relative": fingerHistory[29] !== 1,
              "group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden relative": fingerHistory[29] === 1
            })}
            onClick={() => navigate("/preview")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-500/20">
              <PersonStanding className="w-8 h-8 text-primary transition-all duration-300 group-hover:text-purple-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold transition-all duration-300 group-hover:text-purple-500">
                Fitness - Perfect Your Form
              </h2>
              <p className="text-sm text-muted-foreground leading-tight">
                Watch yourself alongside workout videos
              </p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 animate-gradient-x" />
            </div>
          </Button>

          {/* Game Mode */}
          <Button
            variant="outline"
            className={cn({"group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden relative": fingerHistory[29] !== 2,
              "group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden relative": fingerHistory[29] === 2
            })}
            onClick={() => navigate("/game")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-cyan-500/20">
              <Gamepad className="w-8 h-8 text-primary transition-all duration-300 group-hover:text-cyan-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold transition-all duration-300 group-hover:text-cyan-500">
                Fun & Focus
              </h2>
              <p className="text-sm text-muted-foreground leading-tight">
                Match poses in an interactive game
              </p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 animate-gradient-x" />
            </div>
          </Button>

          {/* Profile */}
          <Button
            variant="outline"
            className={cn({"group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] overflow-hidden relative": fingerHistory[29] !== 3,
              "group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] overflow-hidden relative": fingerHistory[29] === 3
            })}
            onClick={() => navigate("/profile")}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500/20">
              <BarChart3 className="w-8 h-8 text-primary transition-all duration-300 group-hover:text-amber-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold transition-all duration-300 group-hover:text-amber-500">
                Figures - Your Profile
              </h2>
              <p className="text-sm text-muted-foreground leading-tight">
                View your stats and progress
              </p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 animate-gradient-x" />
            </div>
          </Button>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 w-[320px] h-[180px] rounded-lg overflow-hidden shadow-lg border border-border">
        <WebcamFeed2
          key="mini-webcam"
          isEnabled={true}
          className="w-full h-full"
          onError={() => {}}
          onResult={onResults}
        />
      </div>
      <VoiceflowWidget/>
    </div>
  );

};

export default Home;
