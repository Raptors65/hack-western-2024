import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PersonStanding, Gamepad, BarChart3 } from "lucide-react";
import VoiceflowWidget from "./VoiceFlow";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12">Workout Mirror</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fitness Mode */}
          <Button
            variant="outline"
            className="group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] overflow-hidden relative"
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
            className="group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-hidden relative"
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
            className="group min-h-[200px] flex flex-col items-center justify-center gap-6 p-8 border-2 transition-all duration-300 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] overflow-hidden relative"
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
      <VoiceflowWidget/>
    </div>
  );
}

export default Home;
