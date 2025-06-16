"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
export const useStopStreamOnRouteChange = () => {
  const apiUrl = "http://localhost:8000";
  const [isClient, setIsClient] = useState(false);

  const pathname = usePathname();

  const stopVideoStream = async () => {
    try {
      const response = await fetch(`${apiUrl}/video-stream`, { method: "DELETE" });
      if (response.ok) {
        const data = await response.json();
        console.log("[Route Change] Video stream stopped:", data.message);
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: Failed to stop video stream`);
      }
    } catch (error) {
      console.error("[Route Change] Error stopping video stream:", error);
      throw error;
    }
  };
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (pathname !== "/camera" && pathname !== "/config") {
      stopVideoStream();
    }
  }, [pathname, isClient]);

  return { stopVideoStream };
};
