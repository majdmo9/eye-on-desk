"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Footer from "@unempty-desk-ui/components/Footer";
import NavBar from "@unempty-desk-ui/components/NavBar";
import StatusButtons from "@unempty-desk-ui/components/StatusButtons";
import { SpaceStatusType } from "@unempty-desk-ui/types/SpaceStatusType";

const VideoPlayer = dynamic(() => import("@unempty-desk-ui/components/VideoPlayer"), {
  ssr: false,
});
export default function Dashboard() {
  const [spaceStatus, setSpaceStatus] = useState<SpaceStatusType>();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/space-status/stream");

    eventSource.onmessage = event => {
      setSpaceStatus(event.data.split(":")[1].trim());
    };

    eventSource.onerror = err => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <main className="min-h-screen h-full flex flex-col items-center justify-between">
      <NavBar />
      <div className="flex flex-col w-full items-center justify-center gap-6 mb-4">
        <StatusButtons spaceStatus={spaceStatus} />
      </div>
      <VideoPlayer hidden />
      <Footer />
    </main>
  );
}
