"use client";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { SpaceStatusType } from "@unempty-desk-ui/types/SpaceStatusType";

interface Props {
  spaceStatus: SpaceStatusType;
}

const DurationPredict = ({ spaceStatus }: Props) => {
  const [predictedDuration, setPredictedDuration] = useState<number | null>(
    localStorage.getItem("predictedDuration") ? parseFloat(localStorage.getItem("predictedDuration")!) : null
  );
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchPredictedDuration = async () => {
    try {
      if (spaceStatus !== "available" && predictedDuration === null) {
        const response = await fetch("http://localhost:8000/predict_duration");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPredictedDuration(data.predicted_duration);
        setLoading(false);
      } else if (spaceStatus === "available") {
        setPredictedDuration(null);
        localStorage.removeItem("predictedDuration");
        setLoading(false);
      } else setLoading(false);
    } catch (error) {
      console.error("Error fetching predicted duration:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceStatus) fetchPredictedDuration();
  }, [spaceStatus]);

  useEffect(() => {
    if (predictedDuration !== null) {
      let durationInSeconds = predictedDuration * 60;
      const interval = setInterval(() => {
        durationInSeconds -= 1;
        setPredictedDuration(parseFloat((durationInSeconds / 60).toFixed(2)));
        localStorage.setItem("predictedDuration", (durationInSeconds / 60).toFixed(2));
        if (durationInSeconds <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval); // Cleanup when unmounting or re-running effect
    }
  }, [predictedDuration]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full items-center justify-center font-bold text-sm">
      {predictedDuration && predictedDuration > 0 ? (
        <p>Desk will be empty after: {` ${predictedDuration}`} minutes</p>
      ) : predictedDuration && predictedDuration <= 0 ? (
        <p>Desk will be empty soon</p>
      ) : (
        <p>Desk is available</p>
      )}
    </div>
  );
};

export default DurationPredict;
