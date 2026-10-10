import React, { Suspense } from "react";
import { Metadata } from "next";
import { BoardStudio } from "@/components/board/BoardStudio";

export const metadata: Metadata = {
  title: "Chess Board Studio | Free Interactive Analysis & Engine | ChessHub",
  description:
    "Free in-browser chess board studio with Stockfish 19 WASM engine analysis, interactive position editor, move quality badges, evaluation bar, and teaching tools for coaches and students.",
};

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-[#a8a39a] font-mono text-[13px]">
          Loading Chess Board Studio...
        </div>
      }
    >
      <BoardStudio />
    </Suspense>
  );
}
