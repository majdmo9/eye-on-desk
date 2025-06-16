export const stopVideoStream = async () => {
  try {
    await fetch("http://localhost:8000/video-stream", { method: "DELETE" });
  } catch (error) {
    console.error("Error stopping video stream:", error);
  }
};
