"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export const VideoPlayer: React.FC<{
  setVideoPlayerBounds?: Dispatch<SetStateAction<{ width: number; height: number } | null>>;
  hidden?: boolean;
}> = ({ setVideoPlayerBounds, hidden = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const videoStream = new Image();
    videoStream.src = "http://localhost:8000/video-stream";
    videoStream.style.width = "100%";
    videoStream.style.height = "100%";
    videoStream.style.objectFit = "contain";

    // Add crossOrigin to prevent CORS issues
    videoStream.crossOrigin = "anonymous";

    const handleLoad = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(videoStream);
        videoRef.current = videoStream;
        setIsLoaded(true);

        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          const bounds = videoStream.getBoundingClientRect();
          if (setVideoPlayerBounds && bounds.width > 0 && bounds.height > 0) {
            setVideoPlayerBounds({ width: bounds.width, height: bounds.height });
          }
        });
      }
    };

    videoStream.onload = handleLoad;

    return () => {
      videoStream.onload = null;
      videoStream.onerror = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [setVideoPlayerBounds]);

  return (
    <div className="flex flex-col items-center h-full w-full relative">
      <div
        ref={containerRef}
        className="radius:100 overflow-hidden w-full h-full rounded-md"
        style={hidden ? { visibility: "hidden", height: 0 } : { minHeight: "400px" }}
      />
      {!isLoaded && !hidden && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-md">
          <div className="text-slate-300">Loading video stream...</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
