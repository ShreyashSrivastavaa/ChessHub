import React, { Suspense } from "react";
import { Metadata } from "next";
import { BoardStudio } from "@/components/board/BoardStudio";
import { BoardStudioSkeleton } from "@/components/board/BoardStudioSkeleton";

export const metadata: Metadata = {
  title: "Chess Board Studio | Free Interactive Analysis & Engine | ChessHub",
  description:
    "Free in-browser chess board studio with Stockfish 19 WASM engine analysis, interactive position editor, move quality badges, evaluation bar, and teaching tools for coaches and students.",
};

export default function BoardPage() {
  return <BoardStudio />;
}
