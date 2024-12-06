import React, { useState } from "react";
import { Progress } from "../ui/progress";
import { Home } from "lucide-react";

type YouTubeInputProps = {
  onSubmit: (s: string) => void;
  isPlaying: boolean;
  score: number;
  maxScore: number;
  onEndWorkout: () => void;
}

const YouTubeInput = (props: YouTubeInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) {
      props.onSubmit(videoId);
      setUrl("");
    }
  };

  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <>
      {!props.isPlaying ? 
        <form onSubmit={handleSubmit} className="flex gap-2">
          <a href="/" className="flex items-center ml-1 mr-3">
            <Home className="w-6 h-6" />
          </a>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-1 px-3 py-2 rounded border border-gray-300"
          />
          <button
            type="submit"
            disabled={!url}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Load Video
          </button>
        </form>
      :
      <div className="flex items-center gap-x-5">
        <a href="/" className="flex items-center ml-1 mr-3">
          <Home className="w-6 h-6" />
        </a>
        <span className="text-xl w-56 text-right">{Math.round(props.score).toLocaleString()} / {props.maxScore.toLocaleString()}</span>
        <Progress value={props.score / props.maxScore * 100} />
        <button
          className="px-4 py-2 w-40 bg-green-500 text-white rounded disabled:opacity-50"
          onClick={props.onEndWorkout}
        >
          End Workout
        </button>
      </div>
      }
    </>
  );
};

export default YouTubeInput;
