"use client";

import React from "react";
import { X, HelpCircle, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Shift + F", desc: "Toggle fullscreen mode" },
  { key: "F", desc: "Flip board orientation" },
  { key: "← / →", desc: "Navigate previous / next move" },
  { key: "Home / End", desc: "Jump to starting position / latest move" },
  { key: "U", desc: "Undo / Take back move" },
  { key: "Space", desc: "Toggle engine analysis ON / OFF" },
  { key: "Q / R / B / N", desc: "Select pawn promotion piece" },
  { key: "Right-click drag", desc: "Draw green arrow between squares" },
  { key: "Shift + Right-click drag", desc: "Draw blue arrow" },
  { key: "Ctrl + Right-click drag", desc: "Draw red arrow" },
  { key: "Alt + Right-click drag", desc: "Draw orange arrow" },
  { key: "Right-click square", desc: "Highlight / unhighlight square" },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#141416] border border-[#2e2e36] rounded-xl p-5 shadow-2xl text-[#f5f3ef] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36]">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-[#cfa859]" />
            <h3 className="text-[16px] font-medium font-[family-name:var(--font-heading)]">
              Keyboard & Mouse Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#a8a39a] hover:text-[#f5f3ef] hover:bg-[#222228] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 text-[12px] font-mono max-h-80 overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded bg-[#1a1a1e] border border-[#2e2e36]/60"
            >
              <kbd className="px-2 py-0.5 rounded bg-[#222228] border border-[#363640] text-[#cfa859] font-bold text-[11px]">
                {s.key}
              </kbd>
              <span className="text-[#dcd8d0] text-right ml-3">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-[#cfa859] text-[#0e0e10] hover:bg-[#e0b86a] font-medium text-[12px] font-mono transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
