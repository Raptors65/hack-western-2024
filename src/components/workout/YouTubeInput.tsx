import React, { useState } from "react";
import { Progress } from "../ui/progress";

type YouTubeInputProps = {
  onSubmit: (s: string) => void;
  isPlaying: boolean;
  score: number;
  maxScore: number;
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
        <span className="text-xl">0</span>
        <Progress value={props.score / props.maxScore * 100} />
        <span className="text-xl">{props.maxScore.toLocaleString()}</span>
        <button
          disabled={!url}
          className="px-4 py-2 w-36 bg-green-500 text-white rounded disabled:opacity-50"
        >
          End Workout
        </button>
      </div>
      }
    </>
  );
};

export default YouTubeInput;
