"use client";
import React from "react";
import StatusButton from "./StatusButton";
import { SpaceStatusType, StatusButtonType } from "@unempty-desk-ui/types/SpaceStatusType";

const StatusButtons = ({ spaceStatus }: { spaceStatus: SpaceStatusType }) => {
  const StatusTypes: StatusButtonType[] = [
    {
      name: "available",
      color: "#4BB543",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ),
    },
    {
      name: "in use",
      color: "#f0ad4e",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      ),
    },
    {
      name: "on hold",
      color: "#bb2124",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-8 w-2/3">
      {StatusTypes.filter(type => spaceStatus === type.name).map(type => (
        <StatusButton key={type.name} type={type} />
      ))}
    </div>
  );
};

export default StatusButtons;
