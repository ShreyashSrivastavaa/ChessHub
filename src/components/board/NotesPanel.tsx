"use client";

import React, { useState, useEffect } from "react";
import { Share2, BookmarkPlus, Trash2, Check, ExternalLink, BookOpen } from "lucide-react";

export interface SavedLesson {
  id: string;
  title: string;
  fen: string;
  pgn: string;
  notes: string;
  createdAt: number;
}

interface NotesPanelProps {
  currentFen: string;
  currentPgn: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  onLoadPosition: (fen: string, notes?: string) => void;
  onClearAnnotations: () => void;
  isCoachOrAdmin?: boolean;
}

const STORAGE_KEY = "chesshub_saved_lessons";

export function NotesPanel({
  currentFen,
  currentPgn,
  notes,
  onNotesChange,
  onLoadPosition,
  onClearAnnotations,
  isCoachOrAdmin = false,
}: NotesPanelProps) {
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load saved positions from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedLessons(JSON.parse(data));
      }
    } catch {
      // storage parsing error
    }
  }, []);

  const handleSaveLesson = () => {
    if (!lessonTitle.trim()) return;

    const newLesson: SavedLesson = {
      id: `lesson_${Date.now()}`,
      title: lessonTitle.trim(),
      fen: currentFen,
      pgn: currentPgn,
      notes,
      createdAt: Date.now(),
    };

    const updated = [newLesson, ...savedLessons];
    setSavedLessons(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setLessonTitle("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedLessons.filter((l) => l.id !== id);
    setSavedLessons(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSharePosition = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + "/board");
    url.searchParams.set("fen", currentFen);
    navigator.clipboard.writeText(url.toString());
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#141416] border border-[#2e2e36] rounded-xl overflow-hidden divide-y divide-[#2e2e36]">
      {/* Top action bar: Share position & clear annotations */}
      <div className="p-3.5 bg-[#1a1a1e] flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-[#f5f3ef]">Teaching Notes & Share</div>
          <div className="text-[11px] text-[#a8a39a] font-mono">
            Right-click drag on board to draw arrows
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearAnnotations}
            className="px-2.5 py-1 rounded bg-[#222228] hover:bg-[#2e2e36] text-[11px] font-mono text-[#dcd8d0] transition-colors"
            title="Clear all drawn arrows and square highlights"
          >
            Clear Arrows
          </button>
          <button
            onClick={handleSharePosition}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#cfa859] hover:bg-[#e0b86a] text-[#0e0e10] text-[11px] font-mono font-medium transition-colors"
            title="Copy URL containing position to send to student"
          >
            {copiedShareUrl ? <Check size={12} /> : <Share2 size={12} />}
            <span>{copiedShareUrl ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* Coach Notes Textarea */}
      <div className="p-3.5 space-y-2 bg-[#141416]">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#cfa859]">
          Lesson / Position Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write lesson notes, strategic questions, key candidate moves, or student homework..."
          rows={4}
          className="w-full bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg p-2.5 text-[12px] font-mono focus:outline-hidden focus:border-[#cfa859] resize-none leading-relaxed"
        />
      </div>

      {/* Save Position Section */}
      <div className="p-3.5 space-y-2.5 bg-[#141416]">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#cfa859] uppercase tracking-wider">Save Lesson / Position</span>
          <span className="text-[#6e6a64]">(Stored locally in browser)</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Italian Game - Evans Gambit Defense"
            className="flex-1 bg-[#1a1a1e] border border-[#2e2e36] text-[#f5f3ef] rounded-lg px-2.5 py-1.5 text-[12px] font-mono focus:outline-hidden focus:border-[#cfa859]"
          />
          <button
            onClick={handleSaveLesson}
            disabled={!lessonTitle.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222228] hover:bg-[#2e2e36] text-[#f5f3ef] disabled:opacity-40 disabled:pointer-events-none text-[11px] font-mono transition-colors"
          >
            {savedSuccess ? <Check size={13} className="text-[#4e8765]" /> : <BookmarkPlus size={13} />}
            <span>{savedSuccess ? "Saved!" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Saved Lessons List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 bg-[#141416]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#a8a39a] block">
          Saved Lessons ({savedLessons.length})
        </span>

        {savedLessons.length === 0 ? (
          <div className="py-8 text-center text-[#6e6a64] text-[12px] font-mono flex flex-col items-center gap-1">
            <BookOpen size={20} className="text-[#2e2e36]" />
            <span>No saved positions yet.</span>
            <span className="text-[11px]">Save standard drills or openings above to quickly recall them.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {savedLessons.map((item) => (
              <div
                key={item.id}
                onClick={() => onLoadPosition(item.fen, item.notes)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859]/50 hover:bg-[#222228] transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-[12px] font-medium text-[#f5f3ef] truncate group-hover:text-[#cfa859] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#a8a39a] font-mono truncate">
                    {new Date(item.createdAt).toLocaleDateString()} · {item.fen.slice(0, 30)}...
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteLesson(item.id, e)}
                  className="p-1.5 text-[#6e6a64] hover:text-[#b3261e] transition-colors"
                  title="Delete saved lesson"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
