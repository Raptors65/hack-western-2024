import React, { useState } from "react";

function YouTubeInput({ onSubmit }) {
  const [url, setUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) {
      onSubmit(videoId);
      setUrl("");
    }
  }

  function extractVideoId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  return (
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
  );
}

export default YouTubeInput;
