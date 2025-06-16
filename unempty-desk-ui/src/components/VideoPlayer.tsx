"use client";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";

export const VideoPlayer: React.FC<{
  setVideoPlayerBounds?: Dispatch<SetStateAction<{ width: number; height: number } | null>>;
  hidden?: boolean;
}> = ({ setVideoPlayerBounds, hidden = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const videoStream = new Image();
    videoStream.src = "http://localhost:8000/video-stream";
    videoStream.style.width = "100%";
    videoStream.style.height = "100%";
    videoStream.style.objectFit = "contain";

    videoStream.onload = () => {
      if (setVideoPlayerBounds) {
        const bounds = videoStream.getBoundingClientRect();
        setVideoPlayerBounds({ width: bounds.width, height: bounds.height });
      }
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(videoStream);
      videoRef.current = videoStream;
    }
  }, [setVideoPlayerBounds]);

  return (
    <div className="flex flex-col items-center h-full w-full relative">
      <div
        ref={containerRef}
        className="radius:100 overflow-hidden w-full h-full rounded-md"
        style={hidden ? { visibility: "hidden", height: 0 } : {}}
      />
    </div>
  );
};

export default VideoPlayer;
