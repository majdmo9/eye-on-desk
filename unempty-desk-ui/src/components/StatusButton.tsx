import { StatusButtonType } from "@unempty-desk-ui/types/SpaceStatusType";
import React from "react";
import tinycolor from "tinycolor2";
import DurationPredict from "./DurationPredict";
import { BadgeCheck, UserPen, UserX } from "lucide-react";

const StatusButton = ({ type }: { type: StatusButtonType }) => {
  const lightenBg = tinycolor(type.color).lighten(25).toString();
  const lightText = tinycolor(type.color).lighten(0).toString();

  return (
    <div className="flex flex-wrap gap-3 w-full items-center justify-center">
      {Array.from({ length: 10 }).map((_, index) =>
        index === 0 ? (
          <div
            key={index}
            className="flex flex-col items-center justify-center py-2 px-4 shadow-md rounded-md font-semibold w-60 h-40 uppercase hover:scale-105 transition-transform duration-300 ease-in-out"
            style={{ backgroundColor: lightenBg, color: lightText }}
          >
            {type.name === "available" ? <BadgeCheck size={64} key={index} /> : <UserPen size={64} key={index} />}
            <DurationPredict spaceStatus={type.name} />
          </div>
        ) : (
          <div
            key={index}
            className="flex flex-col items-center justify-center py-2 px-4 shadow-md rounded-md font-semibold w-60 h-40 uppercase bg-slate-500 text-slate-600 hover:scale-105 transition-transform duration-300 ease-in-out cursor-not-allowed"
          >
            <UserX size={64} key={index} />
            <span className="text-xs">Unavailable</span>
          </div>
        )
      )}
    </div>
  );
};

export default StatusButton;
