"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  X,
  FileText,
  User,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";

export interface BookingWithDetails {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  level: string;
  priceRupees: number;
  date: string;
  timeSlot: string;
  status: string;
  message?: string | null;
  adminNotes?: string | null;
  createdAt: string | Date;
  events: {
    id: string;
    eventType: string;
    performedBy: string;
    details?: string | null;
    createdAt: string | Date;
  }[];
}

export interface AvailableSlotOption {
  id: string;
  date: string;
  startTime: string;
  remainingCapacity: number;
}

export interface AdminBookingsManagerProps {
  initialBookings: BookingWithDetails[];
  availableSlots: AvailableSlotOption[];
}

export function AdminBookingsManager({
  initialBookings,
  availableSlots,
}: AdminBookingsManagerProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Booking for Detail Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  // Note editing state
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Confirmation Dialog State
  const [confirmAction, setConfirmAction] = useState<"CONFIRM" | "CANCEL" | "COMPLETE" | "RESCHEDULE" | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Filtered Bookings
  const filtered = bookings.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.reference.toLowerCase().includes(query) ||
      b.fullName.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.phone.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const matchesLevel = levelFilter === "ALL" || b.level.toLowerCase() === levelFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openBookingModal = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setNoteText(booking.adminNotes || "");
    setConfirmAction(null);
    setActionError("");
    setCancelReason("");
    setRescheduleSlotId("");
  };

  const handleAction = async (action: "CONFIRM" | "CANCEL" | "COMPLETE" | "RESCHEDULE") => {
    if (!selectedBooking) return;
    setActionLoading(true);
    setActionError("");

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "CANCEL" ? cancelReason : undefined,
          newSlotId: action === "RESCHEDULE" ? rescheduleSlotId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action execution failed");
      }

      // Update state locally
      const updated = data.booking;
      setBookings((prev) =>
        prev.map((item) =>
          item.id === selectedBooking.id
            ? {
                ...item,
                status: updated.status,
                date: updated.date,
                timeSlot: updated.timeSlot,
                adminNotes: updated.adminNotes,
              }
            : item
        )
      );

      // Refresh selected booking
      setSelectedBooking((prev) =>
        prev ? { ...prev, status: updated.status, date: updated.date, timeSlot: updated.timeSlot } : null
      );
      setConfirmAction(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute action.";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedBooking) return;
    setIsSavingNote(true);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NOTE",
          note: noteText,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");

      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? { ...b, adminNotes: noteText } : b))
      );
      setSelectedBooking((prev) => (prev ? { ...prev, adminNotes: noteText } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. FILTER BAR */}
      <div className="p-5 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-[400px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a39a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student, reference, email..."
            className="w-full h-[40px] pl-10 pr-4 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[14px] text-[#f5f3ef] placeholder:text-[#6e6a64] focus:border-[#cfa859] outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0e0e10] border border-[#2e2e36]">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-[family-name:var(--font-mono)] uppercase transition-colors ${
                  statusFilter === st
                    ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                    : "text-[#a8a39a] hover:text-[#f5f3ef]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[38px] px-3 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[12px] font-[family-name:var(--font-mono)] text-[#dcd8d0] outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="beginner">Beginner (₹500)</option>
            <option value="advanced">Advanced (₹800)</option>
          </select>
        </div>
      </div>

      {/* 2. BOOKINGS REGISTER TABLE */}
      <div className="rounded-2xl border border-[#2e2e36] bg-[#141418] overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-[#0e0e10] border-b border-[#2e2e36] text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
          <span className="col-span-3">Reference / Session</span>
          <span className="col-span-3">Student / Contact</span>
          <span className="col-span-2">Level / Fee</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#2e2e36]">
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-[#a8a39a] text-[14px]">
              No bookings found matching your search or filters.
            </div>
          ) : (
            paginated.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center hover:bg-[#1a1a1e] transition-colors"
              >
                {/* Ref & Date */}
                <div className="lg:col-span-3">
                  <span className="text-[15px] font-[family-name:var(--font-mono)] font-semibold text-[#cfa859] block">
                    {b.reference}
                  </span>
                  <span className="text-[13px] text-[#f5f3ef] font-[family-name:var(--font-mono)]">
                    {b.date} at {b.timeSlot}
                  </span>
                </div>

                {/* Student */}
                <div className="lg:col-span-3">
                  <span className="text-[14px] font-medium text-[#f5f3ef] block">
                    {b.fullName}
                  </span>
                  <span className="text-[12px] text-[#a8a39a]">
                    {b.email} · {b.phone}
                  </span>
                </div>

                {/* Level & Fee */}
                <div className="lg:col-span-2 text-[13px]">
                  <span className="text-[#f5f3ef] block capitalize font-medium">{b.level}</span>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                    ₹{b.priceRupees}
                  </span>
                </div>

                {/* Status */}
                <div className="lg:col-span-2">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-[family-name:var(--font-mono)] uppercase font-semibold ${
                      b.status === "CONFIRMED"
                        ? "bg-[#2e5a44]/30 text-[#4e8765] border border-[#2e5a44]"
                        : b.status === "PENDING"
                        ? "bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/50"
                        : b.status === "COMPLETED"
                        ? "bg-[#1a1a1e] text-[#dcd8d0] border border-[#2e2e36]"
                        : "bg-[#b3261e]/20 text-[#ff6b6b] border border-[#b3261e]/40"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Action button */}
                <div className="lg:col-span-2 w-full lg:w-auto flex justify-end">
                  <button
                    onClick={() => openBookingModal(b)}
                    className="w-full lg:w-auto px-4 py-1.5 rounded-xl border border-[#2e2e36] bg-[#0e0e10] hover:border-[#cfa859] hover:text-[#cfa859] text-[12px] font-[family-name:var(--font-mono)] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Manage</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[13px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of{" "}
            {filtered.length} bookings
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-[#2e2e36] disabled:opacity-30"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-[#2e2e36] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 4. DETAIL / ACTION MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0e10]/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-3xl bg-[#141418] border border-[#2e2e36] p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2e2e36]">
              <div>
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#cfa859]">
                  Booking Reference
                </span>
                <h3 className="text-[26px] font-[family-name:var(--font-mono)] font-semibold text-[#f5f3ef]">
                  {selectedBooking.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-9 h-9 rounded-full border border-[#2e2e36] flex items-center justify-center text-[#dcd8d0] hover:text-[#f5f3ef]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error in modal */}
            {actionError && (
              <div className="p-3.5 rounded-xl bg-[#b3261e]/15 border border-[#b3261e]/50 text-[#ff6b6b] text-[13px] flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Overview Details */}
            <div className="grid grid-cols-2 gap-4 text-[13px] p-4 rounded-xl bg-[#0e0e10] border border-[#2e2e36]">
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Student Name
                </span>
                <span className="text-[#f5f3ef] font-medium">{selectedBooking.fullName}</span>
              </div>
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Status
                </span>
                <span className="font-[family-name:var(--font-mono)] uppercase font-semibold text-[#cfa859]">
                  {selectedBooking.status}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Email
                </span>
                <a href={`mailto:${selectedBooking.email}`} className="text-[#f5f3ef] hover:underline">
                  {selectedBooking.email}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Phone
                </span>
                <a href={`tel:${selectedBooking.phone}`} className="text-[#f5f3ef] hover:underline">
                  {selectedBooking.phone}
                </a>
              </div>
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Date & Slot
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[#f5f3ef]">
                  {selectedBooking.date} at {selectedBooking.timeSlot}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                  Level & Fee
                </span>
                <span className="text-[#f5f3ef] capitalize font-medium">
                  {selectedBooking.level} (₹{selectedBooking.priceRupees})
                </span>
              </div>
            </div>

            {/* Student Note */}
            {selectedBooking.message && (
              <div className="p-4 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] text-[13px]">
                <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a] block mb-1">
                  Student Note / Goals:
                </span>
                <p className="text-[#dcd8d0]">{selectedBooking.message}</p>
              </div>
            )}

            {/* Admin Private Notes */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#cfa859]">
                Private Admin Notes (Visible only to coaches)
              </span>
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Discussed payment via UPI on phone, student confirmed."
                className="w-full p-3 rounded-xl bg-[#0e0e10] border border-[#2e2e36] text-[13px] text-[#f5f3ef] outline-none focus:border-[#cfa859] resize-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="self-end px-3 py-1 rounded-lg bg-[#2e2e36] hover:bg-[#363640] text-[12px] font-[family-name:var(--font-mono)] text-[#f5f3ef]"
              >
                {isSavingNote ? "Saving..." : "Save Note"}
              </button>
            </div>

            {/* Action Confirmation Panel */}
            {confirmAction && (
              <div className="p-4 rounded-2xl bg-[#0e0e10] border-2 border-[#cfa859]/50 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#cfa859] font-medium text-[14px]">
                  <AlertTriangle size={16} />
                  <span>
                    Confirm {confirmAction} for {selectedBooking.reference}?
                  </span>
                </div>

                {confirmAction === "CANCEL" && (
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)..."
                    className="w-full p-2.5 rounded-lg bg-[#141418] border border-[#2e2e36] text-[13px] text-[#f5f3ef] outline-none"
                  />
                )}

                {confirmAction === "RESCHEDULE" && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[12px] text-[#a8a39a]">Choose new open slot:</span>
                    <select
                      value={rescheduleSlotId}
                      onChange={(e) => setRescheduleSlotId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-[#141418] border border-[#2e2e36] text-[13px] text-[#f5f3ef] outline-none"
                    >
                      <option value="">Select an available slot...</option>
                      {availableSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.date} at {s.startTime} ({s.remainingCapacity} spots)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-lg border border-[#2e2e36] text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(confirmAction)}
                    disabled={actionLoading || (confirmAction === "RESCHEDULE" && !rescheduleSlotId)}
                    className="px-4 py-1.5 rounded-lg bg-[#cfa859] hover:bg-[#e0b86a] text-[#0e0e10] text-[12px] font-[family-name:var(--font-mono)] font-semibold"
                  >
                    {actionLoading ? "Processing..." : "Confirm Action"}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Row */}
            {!confirmAction && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2e2e36]">
                {selectedBooking.status === "PENDING" && (
                  <button
                    onClick={() => setConfirmAction("CONFIRM")}
                    className="px-4 py-2 rounded-xl bg-[#2e5a44] hover:bg-[#3d7056] text-[#f5f3ef] text-[12px] font-[family-name:var(--font-mono)] uppercase font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Confirm Booking</span>
                  </button>
                )}

                {selectedBooking.status === "CONFIRMED" && (
                  <button
                    onClick={() => setConfirmAction("COMPLETE")}
                    className="px-4 py-2 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859] text-[#f5f3ef] text-[12px] font-[family-name:var(--font-mono)] uppercase font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Completed</span>
                  </button>
                )}

                {selectedBooking.status !== "CANCELLED" && (
                  <button
                    onClick={() => setConfirmAction("RESCHEDULE")}
                    className="px-4 py-2 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859] text-[#dcd8d0] text-[12px] font-[family-name:var(--font-mono)] uppercase font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Reschedule</span>
                  </button>
                )}

                {selectedBooking.status !== "CANCELLED" && (
                  <button
                    onClick={() => setConfirmAction("CANCEL")}
                    className="px-4 py-2 rounded-xl bg-[#b3261e]/20 border border-[#b3261e]/40 hover:bg-[#b3261e]/30 text-[#ff6b6b] text-[12px] font-[family-name:var(--font-mono)] uppercase font-medium flex items-center gap-1.5 ml-auto"
                  >
                    <XCircle size={14} />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            )}

            {/* History Events Timeline */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#2e2e36]">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
                Activity & Status History
              </span>
              <div className="flex flex-col gap-2 text-[12px] font-[family-name:var(--font-mono)]">
                {selectedBooking.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg bg-[#0e0e10] border border-[#2e2e36] flex items-center justify-between text-[#a8a39a]"
                  >
                    <div>
                      <span className="text-[#cfa859] font-medium mr-2">[{ev.eventType}]</span>
                      <span>{ev.details || "Status changed"}</span>
                    </div>
                    <span className="text-[11px] opacity-75">
                      {format(new Date(ev.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
