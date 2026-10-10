import React from "react";
import Link from "next/link";

export interface ChessHubLogoProps {
  variant?: "full" | "icon" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  withTagline?: boolean;
  href?: string;
  className?: string;
  lightMode?: boolean;
}

export function ChessHubKnightIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chLogoGoldMane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="25%" stopColor="#E5C158" />
          <stop offset="60%" stopColor="#CFA859" />
          <stop offset="85%" stopColor="#A67C1E" />
          <stop offset="100%" stopColor="#73500B" />
        </linearGradient>
        <linearGradient id="chLogoGoldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#996E14" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="80%" stopColor="#FCE38A" />
          <stop offset="100%" stopColor="#E5C158" />
        </linearGradient>
        <linearGradient id="chLogoGoldBase" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#80570F" />
          <stop offset="25%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFF0A8" />
          <stop offset="75%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#80570F" />
        </linearGradient>
        <linearGradient id="chLogoDarkHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2A2A34" />
          <stop offset="50%" stopColor="#141418" />
          <stop offset="100%" stopColor="#08080B" />
        </linearGradient>
      </defs>

      {/* 1. Outer Golden Mane Crest */}
      <path
        d="M 33 13 C 37 8, 45 10, 52 14 C 64 22, 73 36, 75 52 C 77 68, 71 83, 62 96 C 59 100, 54 102, 49 102 C 55 98, 62 89, 64 78 C 66 64, 60 48, 50 36 C 44 28, 38 21, 33 13 Z"
        fill="url(#chLogoGoldMane)"
      />

      {/* 2. Dark Knight Head & Neck Body */}
      <path
        d="M 31 16 
           C 32 12, 28 8, 25 9 
           C 24 13, 26 18, 26 21 
           L 21 27 
           C 16 33, 11 39, 13 46 
           C 14 49, 17 50, 20 48 
           C 22 47, 21 44, 19 44 
           C 17 44, 16 42, 17 40 
           C 19 36, 23 32, 26 31 
           C 24 37, 23 44, 25 50 
           C 28 58, 34 68, 38 78 
           C 41 85, 43 94, 44 102 
           L 52 102 
           C 52 92, 48 81, 44 71 
           C 40 60, 36 50, 35 39 
           C 34 32, 35 25, 33 18 
           Z"
        fill="url(#chLogoDarkHead)"
        stroke="url(#chLogoGoldAccent)"
        strokeWidth="0.6"
      />

      {/* 3. Golden Ear / Crown Accent */}
      <path d="M 27 8 C 30 7, 34 11, 32 17 C 28 17, 25 13, 27 8 Z" fill="url(#chLogoGoldAccent)" />

      {/* 4. Inner Golden Neck Muscle Sweep */}
      <path
        d="M 36 29 C 40 37, 44 47, 44 58 C 44 71, 39 84, 34 94 C 38 88, 41 78, 41 68 C 41 57, 38 47, 33 39 C 32 37, 34 32, 36 29 Z"
        fill="url(#chLogoGoldAccent)"
      />

      {/* 5. Stylized Eye Slit */}
      <path d="M 24 29 C 26 29, 28 31, 26 33 C 24 33, 22 31, 24 29 Z" fill="#FFF2B2" />

      {/* 6. Pedestal Upper Collar Ring */}
      <rect x="22" y="103" width="38" height="5" rx="2.5" fill="url(#chLogoGoldBase)" />

      {/* 7. Pedestal Lower Plinth Foot */}
      <path
        d="M 17 113 C 17 110, 20 109, 23 109 L 59 109 C 62 109, 65 110, 65 113 C 65 114, 64 115, 62 115 L 20 115 C 18 115, 17 114, 17 113 Z"
        fill="url(#chLogoGoldBase)"
      />
    </svg>
  );
}

export function ChessHubLogo({
  variant = "full",
  size = "md",
  withTagline = true,
  href = "/",
  className = "",
  lightMode = false,
}: ChessHubLogoProps) {
  // Dimensions map
  const sizeConfig = {
    sm: {
      icon: "w-7 h-7",
      chess: "text-[18px]",
      hub: "text-[18px]",
      tagline: "text-[7.5px] tracking-[0.24em]",
      gap: "gap-2",
      lineW: "w-4",
    },
    md: {
      icon: "w-9 h-9",
      chess: "text-[21px]",
      hub: "text-[21px]",
      tagline: "text-[8.5px] tracking-[0.26em]",
      gap: "gap-2.5",
      lineW: "w-5",
    },
    lg: {
      icon: "w-11 h-11",
      chess: "text-[26px]",
      hub: "text-[26px]",
      tagline: "text-[10px] tracking-[0.28em]",
      gap: "gap-3",
      lineW: "w-6",
    },
    xl: {
      icon: "w-16 h-16",
      chess: "text-[36px]",
      hub: "text-[36px]",
      tagline: "text-[12px] tracking-[0.3em]",
      gap: "gap-4",
      lineW: "w-8",
    },
  }[size];

  const content = (
    <div
      className={`inline-flex items-center select-none ${
        variant === "stacked" ? "flex-col text-center" : "flex-row"
      } ${sizeConfig.gap} ${className}`}
    >
      {/* Golden Knight Icon */}
      <ChessHubKnightIcon className={sizeConfig.icon} />

      {variant !== "icon" && (
        <div className="flex flex-col justify-center leading-none">
          {/* Wordmark: CHESS (white/dark) + HUB (gold) */}
          <div className="flex items-center tracking-[0.02em] font-extrabold font-sans">
            <span
              className={`${sizeConfig.chess} ${
                lightMode ? "text-[#0e0e10]" : "text-[#ffffff]"
              }`}
            >
              CHESS
            </span>
            <span
              className={`${sizeConfig.hub} bg-gradient-to-r from-[#ffe599] via-[#cfa859] to-[#a67c1e] bg-clip-text text-transparent ml-0.5`}
            >
              HUB
            </span>
          </div>

          {/* Subtitle / Tagline: — LEARN PLAY IMPROVE — */}
          {withTagline && size !== "sm" && (
            <div className="flex items-center gap-1.5 mt-1 text-[#a8a39a]">
              <span className={`${sizeConfig.lineW} h-[1px] bg-[#cfa859]/60 shrink-0`} />
              <span
                className={`${sizeConfig.tagline} font-semibold uppercase text-[#dcd8d0] whitespace-nowrap`}
              >
                LEARN PLAY IMPROVE
              </span>
              <span className={`${sizeConfig.lineW} h-[1px] bg-[#cfa859]/60 shrink-0`} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group transition-opacity hover:opacity-95 focus-visible:outline-hidden"
        aria-label="ChessHub — Learn. Play. Improve."
      >
        {content}
      </Link>
    );
  }

  return content;
}
