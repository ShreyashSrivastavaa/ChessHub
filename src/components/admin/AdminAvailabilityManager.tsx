"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Shield,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

export interface SlotData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  isBlocked: boolean;
  isSoldOut: boolean;
  activeBookings: number;
  remainingCapacity: number;
  bookings: {
    id: string;
    reference: string;
    fullName: string;
    status: string;
  }[];
}

export interface RuleData {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  isActive: boolean;
}

export interface BlockedDateData {
  id: string;
  date: string;
  isBlocked: boolean;
  reason?: string | null;
}

export interface AdminAvailabilityManagerProps {
  initialSlots: SlotData[];
  initialRules: RuleData[];
  initialBlockedDates: BlockedDateData[];
}

export function AdminAvailabilityManager({
  initialSlots,
  initialRules,
  initialBlockedDates,
}: AdminAvailabilityManagerProps) {
  const [slots, setSlots] = useState<SlotData[]>(initialSlots);
  const [rules, setRules] = useState<RuleData[]>(initialRules);
  const [blockedDates, setBlockedDates] = useState<BlockedDateData[]>(initialBlockedDates);

  // Active view tab: "SLOTS" or "RULES"
  const [activeTab, setActiveTab] = useState<"SLOTS" | "RULES">("SLOTS");

  // Selected date filter for slots
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Add/Edit Slot Modal state
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotStartTime, setSlotStartTime] = useState("10:00");
  const [slotDuration, setSlotDuration] = useState(60);
  const [slotCapacity, setSlotCapacity] = useState(1);
  const [slotIsBlocked, setSlotIsBlocked] = useState(false);
  const [slotIsSoldOut, setSlotIsSoldOut] = useState(false);

  // Add Rule state
  const [newRuleDay, setNewRuleDay] = useState(1);
  const [newRuleStart, setNewRuleStart] = useState("10:00");
  const [newRuleEnd, setNewRuleEnd] = useState("18:00");
  const [newRuleDuration, setNewRuleDuration] = useState(60);
  const [newRuleCapacity, setNewRuleCapacity] = useState(1);

  // Horizon state for recurring generator
  const [horizonDays, setHorizonDays] = useState(30);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Filter slots for currently selected date
  const dateSlots = slots.filter((s) => s.date === selectedDate);
  const isDateCurrentlyBlocked = blockedDates.some((b) => b.date === selectedDate && b.isBlocked);

  const clearFeedback = () => {
    setSuccessMsg("");
    setErrorMsg("");
    setConflicts([]);
  };

  // Block / Unblock entire date
  const handleToggleBlockDate = async () => {
    clearFeedback();
    setLoading(true);

    try {
      const action = isDateCurrentlyBlocked ? "UNBLOCK_DATE" : "BLOCK_DATE";
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          date: selectedDate,
          reason: isDateCurrentlyBlocked ? undefined : "Blocked by administrator",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.conflictingBookings) {
          setConflicts(data.conflictingBookings);
        }
        throw new Error(data.error || "Failed to update date availability.");
      }

      setSuccessMsg(isDateCurrentlyBlocked ? `Date ${selectedDate} reopened.` : `Date ${selectedDate} blocked.`);
      setBlockedDates((prev) => {
        const without = prev.filter((b) => b.date !== selectedDate);
        return [...without, { id: data.record.id, date: selectedDate, isBlocked: !isDateCurrentlyBlocked }];
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating date block";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Upsert Slot (Add or Edit)
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPSERT_SLOT",
          id: editingSlotId || undefined,
          date: selectedDate,
          startTime: slotStartTime,
          durationMinutes: Number(slotDuration),
          capacity: Number(slotCapacity),
          isBlocked: slotIsBlocked,
          isSoldOut: slotIsSoldOut,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.conflictingBookings) setConflicts(data.conflictingBookings);
        throw new Error(data.error || "Failed to save slot.");
      }

      setSuccessMsg("Slot saved successfully.");
      setSlotModalOpen(false);

      // Refresh slots state
      setSlots((prev) => {
        const existingIdx = prev.findIndex(
          (s) => s.id === data.slot.id || (s.date === data.slot.date && s.startTime === data.slot.startTime)
        );
        const transformed: SlotData = {
          id: data.slot.id,
          date: data.slot.date,
          startTime: data.slot.startTime,
          endTime: data.slot.endTime,
          durationMinutes: data.slot.durationMinutes,
          capacity: data.slot.capacity,
          isBlocked: data.slot.isBlocked,
          isSoldOut: data.slot.isSoldOut,
          activeBookings: editingSlotId ? prev[existingIdx]?.activeBookings || 0 : 0,
          remainingCapacity: Math.max(0, data.slot.capacity - (prev[existingIdx]?.activeBookings || 0)),
          bookings: prev[existingIdx]?.bookings || [],
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = transformed;
          return updated;
        }
        return [...prev, transformed];
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving slot";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Generate recurring slots from rules
  const handleGenerateRecurring = async () => {
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_RECURRING",
          horizonDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate slots.");

      setSuccessMsg(`Generated ${data.generatedCount} new slots over the next ${horizonDays} days!`);
      // Trigger a page refresh to pull all updated slots
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error generating slots";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Add rule
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_RULE",
          dayOfWeek: newRuleDay,
          startTime: newRuleStart,
          endTime: newRuleEnd,
          duration: newRuleDuration,
          capacity: newRuleCapacity,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add weekly rule.");

      setSuccessMsg("Weekly availability rule added.");
      setRules((prev) => [...prev, data.rule]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding rule";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete rule
  const handleDeleteRule = async (ruleId: string) => {
    clearFeedback();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_RULE",
          ruleId,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete rule");
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setSuccessMsg("Rule deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting rule";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141418] border border-[#2e2e36] w-fit">
        <button
          onClick={() => setActiveTab("SLOTS")}
          className={`px-4 py-2 rounded-xl text-[13px] font-[family-name:var(--font-mono)] uppercase transition-colors ${
            activeTab === "SLOTS"
              ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
              : "text-[#dcd8d0] hover:text-[#f5f3ef]"
          }`}
        >
          Dates & Daily Slots
        </button>
        <button
          onClick={() => setActiveTab("RULES")}
          className={`px-4 py-2 rounded-xl text-[13px] font-[family-name:var(--font-mono)] uppercase transition-colors ${
            activeTab === "RULES"
              ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
              : "text-[#dcd8d0] hover:text-[#f5f3ef]"
          }`}
        >
          Recurring Weekly Rules
        </button>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#2e5a44]/20 border border-[#2e5a44] text-[#4e8765] text-[14px] flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#b3261e]/20 border border-[#b3261e] text-[#ff6b6b] text-[14px] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          {conflicts.length > 0 && (
            <div className="pl-6 text-[12px] font-[family-name:var(--font-mono)]">
              <span>Conflicting active bookings:</span>
              <ul className="list-disc pl-4 mt-1">
                {conflicts.map((c) => (
                  <li key={c.id}>
                    {c.reference} — {c.fullName} ({c.status})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: DATES & SLOTS */}
      {activeTab === "SLOTS" && (
        <div className="flex flex-col gap-6">
          {/* Date Picker Bar & Controls */}
          <div className="p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-[#cfa859]" />
              <div className="flex flex-col">
                <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
                  Managing Date
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#0e0e10] border border-[#2e2e36] rounded-lg px-3 py-1.5 text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none focus:border-[#cfa859]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleToggleBlockDate}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-[12px] font-[family-name:var(--font-mono)] uppercase flex items-center gap-1.5 transition-colors ${
                  isDateCurrentlyBlocked
                    ? "bg-[#2e5a44] text-[#f5f3ef] hover:bg-[#3d7056]"
                    : "bg-[#b3261e]/20 text-[#ff6b6b] border border-[#b3261e]/50 hover:bg-[#b3261e]/30"
                }`}
              >
                {isDateCurrentlyBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{isDateCurrentlyBlocked ? "Reopen Entire Date" : "Block Entire Date"}</span>
              </button>

              <button
                onClick={() => {
                  setEditingSlotId(null);
                  setSlotStartTime("10:00");
                  setSlotDuration(60);
                  setSlotCapacity(1);
                  setSlotIsBlocked(false);
                  setSlotIsSoldOut(false);
                  setSlotModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#cfa859] text-[#0e0e10] font-semibold text-[12px] font-[family-name:var(--font-mono)] uppercase flex items-center gap-1.5 hover:bg-[#e0b86a]"
              >
                <Plus size={15} />
                <span>Add Slot on this Date</span>
              </button>
            </div>
          </div>

          {/* Slots Table for Selected Date */}
          <div className="rounded-2xl border border-[#2e2e36] bg-[#141418] overflow-hidden">
            <div className="p-4 bg-[#0e0e10] border-b border-[#2e2e36] flex items-center justify-between">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
                Slots on {selectedDate} ({dateSlots.length} total)
              </span>
              {isDateCurrentlyBlocked && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#b3261e]/20 border border-[#b3261e]/40 text-[#ff6b6b] text-[11px] font-[family-name:var(--font-mono)] uppercase font-semibold">
                  Date is Blocked
                </span>
              )}
            </div>

            <div className="divide-y divide-[#2e2e36]">
              {dateSlots.length === 0 ? (
                <div className="py-12 text-center text-[#a8a39a] text-[14px]">
                  No slots configured for {selectedDate}. Click &ldquo;Add Slot&rdquo; above or use Recurring Rules.
                </div>
              ) : (
                dateSlots.map((slot) => {
                  const isSoldOut = slot.isSoldOut || slot.remainingCapacity === 0;

                  return (
                    <div
                      key={slot.id}
                      className="p-4 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center hover:bg-[#1a1a1e] transition-colors"
                    >
                      <div className="sm:col-span-3">
                        <span className="text-[16px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-[12px] text-[#a8a39a] block font-[family-name:var(--font-mono)]">
                          Duration: {slot.durationMinutes} min
                        </span>
                      </div>

                      <div className="sm:col-span-3">
                        <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                          Booked vs Total Capacity
                        </span>
                        <span className="text-[15px] font-[family-name:var(--font-mono)] font-medium text-[#f5f3ef]">
                          {slot.activeBookings} booked / {slot.capacity} total
                        </span>
                      </div>

                      <div className="sm:col-span-3 flex flex-wrap gap-1.5">
                        {slot.isBlocked && (
                          <span className="px-2 py-0.5 rounded-full bg-[#b3261e]/20 text-[#ff6b6b] text-[11px] font-[family-name:var(--font-mono)] uppercase">
                            Blocked
                          </span>
                        )}
                        {isSoldOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#1a1a1e] border border-[#2e2e36] text-[#a8a39a] text-[11px] font-[family-name:var(--font-mono)] uppercase">
                            Sold Out
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#2e5a44]/30 text-[#4e8765] text-[11px] font-[family-name:var(--font-mono)] uppercase">
                            {slot.remainingCapacity} Open
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-3 flex justify-end">
                        <button
                          onClick={() => {
                            setEditingSlotId(slot.id);
                            setSlotStartTime(slot.startTime);
                            setSlotDuration(slot.durationMinutes);
                            setSlotCapacity(slot.capacity);
                            setSlotIsBlocked(slot.isBlocked);
                            setSlotIsSoldOut(slot.isSoldOut);
                            setSlotModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-[#2e2e36] text-[12px] font-[family-name:var(--font-mono)] text-[#dcd8d0] hover:border-[#cfa859] hover:text-[#cfa859] flex items-center gap-1.5"
                        >
                          <Edit2 size={13} />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECURRING WEEKLY RULES */}
      {activeTab === "RULES" && (
        <div className="flex flex-col gap-6">
          {/* Horizon Generator Panel */}
          <div className="p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                Generate Slots from Weekly Rules
              </h3>
              <p className="text-[13px] text-[#a8a39a] mt-0.5">
                Automatically generate concrete slots into the future based on your rules, respecting blocked date overrides.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={horizonDays}
                onChange={(e) => setHorizonDays(Number(e.target.value))}
                className="bg-[#0e0e10] border border-[#2e2e36] rounded-xl px-3 py-2 text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
              >
                <option value={14}>14 Days Horizon</option>
                <option value={30}>30 Days Horizon</option>
                <option value={60}>60 Days Horizon</option>
              </select>
              <button
                onClick={handleGenerateRecurring}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#cfa859] text-[#0e0e10] font-semibold text-[13px] font-[family-name:var(--font-mono)] uppercase flex items-center gap-1.5 hover:bg-[#e0b86a]"
              >
                <RefreshCw size={14} />
                <span>Generate Slots</span>
              </button>
            </div>
          </div>

          {/* Active Rules List */}
          <div className="rounded-2xl border border-[#2e2e36] bg-[#141418] overflow-hidden">
            <div className="p-4 bg-[#0e0e10] border-b border-[#2e2e36]">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
                Active Weekly Recurring Availability Rules
              </span>
            </div>

            <div className="divide-y divide-[#2e2e36]">
              {rules.length === 0 ? (
                <div className="py-8 text-center text-[#a8a39a] text-[14px]">
                  No weekly rules defined. Add one below to automate slot generation.
                </div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-[#1a1a1e]">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#f5f3ef]">
                        {dayNames[rule.dayOfWeek]}
                      </span>
                      <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                        Window: {rule.startTime} – {rule.endTime} · Step: {rule.duration}m · Capacity: {rule.capacity}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 rounded-lg text-[#a8a39a] hover:text-[#ff6b6b] hover:bg-[#b3261e]/10 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Rule Form */}
          <div className="p-6 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <h3 className="text-[16px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-4">
              Add New Weekly Availability Rule
            </h3>
            <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  Day of Week
                </label>
                <select
                  value={newRuleDay}
                  onChange={(e) => setNewRuleDay(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[13px] text-[#f5f3ef] outline-none"
                >
                  {dayNames.map((d, idx) => (
                    <option key={d} value={idx}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newRuleStart}
                  onChange={(e) => setNewRuleStart(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={newRuleEnd}
                  onChange={(e) => setNewRuleEnd(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  Slot Duration (min)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={newRuleDuration}
                  onChange={(e) => setNewRuleDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[42px] rounded-xl bg-[#cfa859] text-[#0e0e10] font-semibold text-[13px] font-[family-name:var(--font-mono)] uppercase hover:bg-[#e0b86a]"
              >
                Add Rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / CONFIGURE SLOT */}
      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0e10]/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-[500px] rounded-3xl bg-[#141418] border border-[#2e2e36] p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36]">
              <h3 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                {editingSlotId ? "Configure Slot" : "Add Slot on " + selectedDate}
              </h3>
              <button
                onClick={() => setSlotModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#2e2e36] flex items-center justify-center text-[#dcd8d0]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  required
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                    Slot Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={slotCapacity}
                    onChange={(e) => setSlotCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[14px] font-[family-name:var(--font-mono)] text-[#f5f3ef] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#2e2e36]">
                <label className="flex items-center gap-2.5 text-[13px] text-[#f5f3ef] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slotIsBlocked}
                    onChange={(e) => setSlotIsBlocked(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0e0e10] border-[#2e2e36] text-[#cfa859]"
                  />
                  <span>Block this slot (unavailable for students)</span>
                </label>

                <label className="flex items-center gap-2.5 text-[13px] text-[#f5f3ef] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slotIsSoldOut}
                    onChange={(e) => setSlotIsSoldOut(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0e0e10] border-[#2e2e36] text-[#cfa859]"
                  />
                  <span>Manually mark as sold out</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e2e36]">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2e2e36] text-[13px] font-[family-name:var(--font-mono)] text-[#a8a39a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#cfa859] hover:bg-[#e0b86a] text-[#0e0e10] font-semibold text-[13px] font-[family-name:var(--font-mono)]"
                >
                  {loading ? "Saving..." : "Save Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
