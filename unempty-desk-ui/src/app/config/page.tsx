"use client";
import { Button } from "@unempty-desk-ui/components/Button";
import VideoPlayer from "@unempty-desk-ui/components/VideoPlayer";
import { useEffect, useState, useRef } from "react";
import { auth } from "@unempty-desk-ui/lib/firebase";
import { denormalizeRect } from "@unempty-desk-ui/utils/denormalizeRect";
import { Rect } from "@unempty-desk-ui/types/Rect";
import Loading from "@unempty-desk-ui/components/Loading";
import { DragType } from "@unempty-desk-ui/types/resizableRect";
import { clamp } from "@unempty-desk-ui/utils/clamp";
import { MIN_SIZE } from "@unempty-desk-ui/utils/constants";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
import Footer from "@unempty-desk-ui/components/Footer";
import NavBar from "@unempty-desk-ui/components/NavBar";

export default function ConfigPage() {
  const [rect, setRect] = useState<Rect>({ x: 100, y: 100, width: 200, height: 150 });
  const [rectDisabled, setRectDisabled] = useState(false);
  const [videoPlayerBounds, setVideoPlayerBounds] = useState<{ width: number; height: number } | null>(null);
  const [dragType, setDragType] = useState<DragType>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; rect: Rect } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const fetchRectCoordinates = async () => {
    try {
      const response = await fetch("http://localhost:8000/coordinates");
      if (!response.ok) {
        throw new Error("Failed to save rectangle coordinates");
      }
      const data = await response.json();
      if (data) {
        setRect(denormalizeRect(data, videoPlayerBounds?.width || 1, videoPlayerBounds?.height || 1));
        setRectDisabled(true);
      }
    } catch (error) {
      console.error("Error fetching rectangle coordinates:", error);
    }
  };

  const getVideoPlayerBounds = () => {
    if (!videoContainerRef.current) return null;
    return videoContainerRef.current.getBoundingClientRect();
  };

  const handleMouseDown = (e: React.MouseEvent, type: DragType) => {
    e.stopPropagation();
    const bounds = getVideoPlayerBounds();
    if (!bounds) return;

    setDragType(type);
    setDragStart({ x: e.clientX - bounds.left, y: e.clientY - bounds.top, rect: { ...rect } });
    setRectDisabled(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragType || !dragStart) return;

    const bounds = getVideoPlayerBounds();
    if (!bounds) return;

    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    if (dragType === "move") {
      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;
      const newX = clamp(dragStart.rect.x + dx, 0, bounds.width - dragStart.rect.width);
      const newY = clamp(dragStart.rect.y + dy, 0, bounds.height - dragStart.rect.height);
      setRect(prev => ({ ...prev, x: newX, y: newY }));
    } else if (dragType === "resize") {
      const maxWidth = bounds.width - dragStart.rect.x;
      const maxHeight = bounds.height - dragStart.rect.y;
      const newWidth = clamp(mouseX - dragStart.rect.x, MIN_SIZE, maxWidth);
      const newHeight = clamp(mouseY - dragStart.rect.y, MIN_SIZE, maxHeight);
      setRect(prev => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => {
    setDragType(null);
    setDragStart(null);
  };

  const getNormalizedRect = (rect: Rect, containerWidth: number, containerHeight: number) => {
    return {
      x: rect.x / containerWidth,
      y: rect.y / containerHeight,
      width: rect.width / containerWidth,
      height: rect.height / containerHeight,
    };
  };

  const handleSave = async () => {
    try {
      toast.loading("Saving desk space configuration...", { autoClose: false });
      setSaveLoading(true);
      const rectToPut = getNormalizedRect(rect, videoPlayerBounds?.width || 1, videoPlayerBounds?.height || 1);
      const token = (await auth.currentUser?.getIdToken()) || "";
      const res = await fetch("http://localhost:8000/coordinates", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(rectToPut),
      });
      if (!res.ok) {
        console.error("Failed to save rectangle coordinates");
      } else {
        console.log("Rectangle coordinates saved successfully");
      }
    } catch (error) {
      console.error("Error saving rectangle coordinates:", error);
    } finally {
      toast.dismiss();
      toast.success("Desk space configuration saved successfully!");
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchRectCoordinates();
  }, [videoPlayerBounds]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (!firebaseUser) {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between">
      <div
        className="flex flex-col items-center justify-center gap-8 text-slate-300"
        style={{ visibility: !videoPlayerBounds ? "hidden" : "visible" }}
      >
        <NavBar title="Configure Desk Space" />
        <div
          ref={videoContainerRef}
          style={{
            position: "relative",
            cursor: dragType === "move" ? "move" : dragType === "resize" ? "nwse-resize" : "default",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-2/3 items-center"
        >
          <div>
            <VideoPlayer setVideoPlayerBounds={setVideoPlayerBounds} />
          </div>
          <div
            style={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              border: "2px solid #f00",
              background: "rgba(255,0,0,0.1)",
              cursor: dragType === "move" ? "move" : "pointer",
              boxSizing: "border-box",
              userSelect: "none",
            }}
            onMouseDown={e => handleMouseDown(e, "move")}
          >
            <div
              style={{
                position: "absolute",
                right: -8,
                bottom: -8,
                width: 16,
                height: 16,
                background: "#fff",
                border: "2px solid #f00",
                borderRadius: 4,
                cursor: "nwse-resize",
                zIndex: 2,
              }}
              onMouseDown={e => handleMouseDown(e, "resize")}
            />
          </div>
        </div>
        <Button
          disabled={saveLoading || rectDisabled}
          onClick={handleSave}
          className="px-4 py-2 w-2/3 text-lg font-semibold flex flex-row items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </Button>
      </div>
      <Footer />
    </main>
  );
}
