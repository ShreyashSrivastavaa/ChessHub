"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Video, Check } from "lucide-react";
import { differenceInMinutes, isBefore, isAfter } from "date-fns";

export interface MeetJoinButtonProps {
  startsAt: string | Date;
  endsAt: string | Date;
  meetUrl: string;
}

export function MeetJoinButton({ startsAt, endsAt, meetUrl }: MeetJoinButtonProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // 10s tick
    return () => clearInterval(timer);
  }, []);

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  const minutesUntilStart = differenceInMinutes(startDate, now);
  const isClassEnded = isAfter(now, endDate);
  const isClassLive = isAfter(now, startDate) && isBefore(now, endDate);
  const isJoinWindowOpen = minutesUntilStart <= 10 && !isClassEnded;

  if (isClassEnded) {
    return (
      <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/70 flex items-center gap-1.5">
        <Check size={14} strokeWidth={1.5} />
        <span>Class Concluded</span>
      </span>
    );
  }

  if (isJoinWindowOpen || isClassLive) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Button
          href={meetUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="md"
          className="flex items-center gap-2 shadow-none font-normal"
        >
          <Video size={16} strokeWidth={1.5} />
          <span>{isClassLive ? "Join Class (Live Now)" : "Join Classroom"}</span>
        </Button>
        {isClassLive && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] border border-[#000000] animate-ping" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        disabled
        variant="secondary"
        size="md"
        className="opacity-40 cursor-not-allowed flex items-center gap-2"
      >
        <Video size={16} strokeWidth={1.5} />
        <span>Join on Meet</span>
      </Button>
      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#d6d5d0]/70">
        Opens 10 min before start ({minutesUntilStart > 60 ? `${Math.floor(minutesUntilStart / 60)}h ${minutesUntilStart % 60}m` : `${minutesUntilStart}m`} remaining)
      </span>
    </div>
  );
}
