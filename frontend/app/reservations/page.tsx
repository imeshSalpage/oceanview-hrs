"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheck, CircleX, ClipboardList, FileText, Shield } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { BillResponse, ReservationResponse, ReservationStatus, RoomType } from "@/lib/types";

const roomTypes: RoomType[] = ["SINGLE", "DOUBLE", "DELUXE", "SUITE"];
const statuses: ReservationStatus[] = ["BOOKED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];

const statusColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BOOKED: "default",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  CANCELLED: "danger",
};

const csvEscape = (value: string) => `"${value.replaceAll('"', '""')}"`;
const htmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export default function ReservationsPage() {
  const guard = useRoleGuard(["ADMIN", "RECEPTION"], "/login");
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "info" } | null>(null);

  const [createData, setCreateData] = useState({
    customerId: "",
    guestName: "",
    address: "",
    contactNo: "",
    roomType: "SINGLE" as RoomType,
    checkInDate: "",
    checkOutDate: "",
  });

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ReservationResponse[]>("/api/reservations");
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reservations.filter((reservation) => {
      if (
        term &&
        ![
          reservation.reservationNo,
          reservation.guestName,
          reservation.contactNo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      if (statusFilter && reservation.status !== statusFilter) {
        return false;
      }
      if (roomFilter && reservation.roomType !== roomFilter) {
        return false;
      }
      if (startDate && reservation.checkInDate < startDate) {
        return false;
      }
      if (endDate && reservation.checkOutDate > endDate) {
        return false;
      }
      return true;
    });
  }, [reservations, search, statusFilter, roomFilter, startDate, endDate]);

  const summary = useMemo(() => {
    const checkedIn = filtered.filter((reservation) => reservation.status === "CHECKED_IN").length;
    const checkedOut = filtered.filter((reservation) => reservation.status === "CHECKED_OUT").length;
    const cancelled = filtered.filter((reservation) => reservation.status === "CANCELLED").length;
    return {
      total: filtered.length,
      checkedIn,
      checkedOut,
      cancelled,
    };
  }, [filtered]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRoomFilter("");
    setStartDate("");
    setEndDate("");
  };

  const exportFilteredCsv = () => {
    const headers = [
      "Reservation No",
      "Guest Name",
      "Contact No",
      "Room Type",
      "Check In",
      "Check Out",
      "Status",
    ];

    const rows = filtered.map((reservation) => [
      reservation.reservationNo,
      reservation.guestName,
      reservation.contactNo,
      reservation.roomType,
      reservation.checkInDate,
      reservation.checkOutDate,
      reservation.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => csvEscape(String(value))).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: "Reservations CSV downloaded", tone: "success" });
  };

  const printReceipt = async (reservation: ReservationResponse) => {
    try {
      const bill = await api.get<BillResponse>(`/api/reservations/${reservation.reservationNo}/bill`);
      const receiptWindow = window.open("", "_blank", "width=900,height=700");
      if (!receiptWindow) {
        setError("Unable to open print window. Please allow popups for this site.");
        return;
      }

      const createdOn = formatDate(reservation.createdAt);
      const checkIn = formatDate(reservation.checkInDate);
      const checkOut = formatDate(reservation.checkOutDate);

      receiptWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Receipt - ${htmlEscape(bill.reservationNo)}</title>
            <style>
              body { font-family: Inter, Arial, sans-serif; margin: 32px; color: #0f172a; }
              .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; }
              .title { font-size: 28px; font-weight: 800; margin: 0; color: #0369a1; }
              .muted { color: #475569; font-size: 13px; }
              .card { border: 1px solid #cfe8f7; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
              .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
              .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 4px; }
              .value { font-size: 14px; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 14px; }
              th { color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              .total { font-size: 20px; font-weight: 800; color: #0c4a6e; }
              .footer { margin-top: 20px; font-size: 12px; color: #64748b; }
              @media print { body { margin: 16px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Ocean Breeze Hotel Receipt</h1>
              <div class="muted">Printed: ${htmlEscape(new Date().toLocaleString())}</div>
            </div>

            <div class="card grid">
              <div>
                <div class="label">Reservation No</div>
                <div class="value">${htmlEscape(bill.reservationNo)}</div>
              </div>
              <div>
                <div class="label">Created On</div>
                <div class="value">${htmlEscape(createdOn)}</div>
              </div>
              <div>
                <div class="label">Guest Name</div>
                <div class="value">${htmlEscape(bill.guestName)}</div>
              </div>
              <div>
                <div class="label">Contact No</div>
                <div class="value">${htmlEscape(reservation.contactNo)}</div>
              </div>
              <div>
                <div class="label">Check-in</div>
                <div class="value">${htmlEscape(checkIn)}</div>
              </div>
              <div>
                <div class="label">Check-out</div>
                <div class="value">${htmlEscape(checkOut)}</div>
              </div>
            </div>

            <div class="card">
              <table>
                <thead>
                  <tr>
                    <th>Room Type</th>
                    <th>Nights</th>
                    <th>Rate / Night</th>
                    <th>Subtotal</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${htmlEscape(bill.roomType)}</td>
                    <td>${htmlEscape(String(bill.nights))}</td>
                    <td>${htmlEscape(formatCurrency(bill.ratePerNight))}</td>
                    <td>${htmlEscape(formatCurrency(bill.subtotal))}</td>
                    <td class="total">${htmlEscape(formatCurrency(bill.total))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">This is a system-generated receipt for academic demonstration.</div>

            <script>
              window.onload = function () {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      setToast({ message: `Print dialog opened for ${reservation.reservationNo}`, tone: "info" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load receipt data");
    }
  };

  const downloadReceiptPdf = async (reservation: ReservationResponse) => {
    try {
      const bill = await api.get<BillResponse>(`/api/reservations/${reservation.reservationNo}/bill`);
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const createdOn = formatDate(reservation.createdAt);
      const checkIn = formatDate(reservation.checkInDate);
      const checkOut = formatDate(reservation.checkOutDate);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(3, 105, 161);
      doc.text("Ocean Breeze Hotel Receipt", 40, 56);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 76);

      doc.setDrawColor(207, 232, 247);
      doc.setFillColor(248, 252, 255);
      doc.roundedRect(40, 94, 515, 150, 8, 8, "FD");

      const infoRows: Array<[string, string]> = [
        ["Reservation No", bill.reservationNo],
        ["Created On", createdOn],
        ["Guest Name", bill.guestName],
        ["Contact No", reservation.contactNo],
        ["Check-in", checkIn],
        ["Check-out", checkOut],
      ];

      let y = 120;
      for (const [label, value] of infoRows) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), 56, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(value, 200, y);
        y += 22;
      }

      doc.setFillColor(240, 249, 255);
      doc.roundedRect(40, 264, 515, 142, 8, 8, "FD");

      const lineItems: Array<[string, string]> = [
        ["Room Type", bill.roomType],
        ["Nights", String(bill.nights)],
        ["Rate / Night", formatCurrency(bill.ratePerNight)],
        ["Subtotal", formatCurrency(bill.subtotal)],
        ["Total", formatCurrency(bill.total)],
      ];

      y = 292;
      for (const [label, value] of lineItems) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        doc.text(label, 56, y);

        doc.setFont("helvetica", label === "Total" ? "bold" : "normal");
        doc.setFontSize(label === "Total" ? 16 : 12);
        doc.setTextColor(label === "Total" ? 12 : 15, label === "Total" ? 74 : 23, label === "Total" ? 110 : 42);
        doc.text(value, 420, y, { align: "right" });
        y += 24;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("System-generated receipt for academic demonstration.", 40, 434);

      doc.save(`${bill.reservationNo}-receipt.pdf`);
      setToast({ message: `PDF downloaded for ${bill.reservationNo}`, tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate receipt PDF");
    }
  };

  const updateStatus = async (reservationNo: string, status: ReservationStatus) => {
    try {
      await api.patch(`/api/reservations/${reservationNo}/status`, { status });
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const createReservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/reservations", createData);
      setCreateData({
        customerId: "",
        guestName: "",
        address: "",
        contactNo: "",
        roomType: "SINGLE",
        checkInDate: "",
        checkOutDate: "",
      });
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reservation");
    }
  };

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  return (
    <div className="ocean-wave min-h-screen">
      {toast ? (
        <div className="fixed right-5 top-20 z-50" aria-live="polite" role="status">
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                : "border-sky-200 bg-sky-50/95 text-sky-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <SiteHeader />
      <DashboardNav />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-1">
          <span className="ocean-pill inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Staff Portal</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Reservations</h1>
          <p className="text-slate-600">Manage bookings, update statuses, and track arrivals.</p>
        </div>

        {/* Create reservation */}
        <div className="ocean-surface rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Create reservation</h2>
          <form className="grid gap-4" onSubmit={createReservation}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer ID (optional)</label>
                <input className="ocean-input" value={createData.customerId} placeholder="MongoDB user id"
                  onChange={(e) => setCreateData((p) => ({ ...p, customerId: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Guest name</label>
                <input className="ocean-input" required value={createData.guestName}
                  onChange={(e) => setCreateData((p) => ({ ...p, guestName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</label>
                <input className="ocean-input" required value={createData.contactNo}
                  onChange={(e) => setCreateData((p) => ({ ...p, contactNo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Address</label>
                <input className="ocean-input" value={createData.address}
                  onChange={(e) => setCreateData((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Room type</label>
                <select className="ocean-input" value={createData.roomType}
                  onChange={(e) => setCreateData((p) => ({ ...p, roomType: e.target.value as RoomType }))}>
                  {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-in</label>
                <input type="date" className="ocean-input" required value={createData.checkInDate}
                  onChange={(e) => setCreateData((p) => ({ ...p, checkInDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Check-out</label>
                <input type="date" className="ocean-input" required value={createData.checkOutDate}
                  onChange={(e) => setCreateData((p) => ({ ...p, checkOutDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Button type="submit">Create reservation</Button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="card-ocean rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Filter reservations</h2>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total shown", value: summary.total, Icon: FileText },
              { label: "Checked in", value: summary.checkedIn, Icon: ClipboardList },
              { label: "Checked out", value: summary.checkedOut, Icon: CircleCheck },
              { label: "Cancelled", value: summary.cancelled, Icon: CircleX },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-sky-100 bg-white/80 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  <item.Icon className="h-5 w-5 text-sky-700" />
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              </div>
            ))}
          </section>
          <div className="grid gap-3 md:grid-cols-4">
            <input className="ocean-input" placeholder="Search reservation, guest, or contact" value={search}
              onChange={(e) => setSearch(e.target.value)} />
            <select className="ocean-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select className="ocean-input" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
              <option value="">All rooms</option>
              {roomTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="ocean-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="ocean-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={clearFilters}>Clear filters</Button>
            <Button type="button" onClick={exportFilteredCsv} disabled={filtered.length === 0}>Export CSV</Button>
            <p className="text-xs text-slate-500">Academic demo ready: filter + export current results.</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading reservations…</p>
        ) : error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : (
          <div className="card-ocean overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sky-100 bg-sky-50/60">
                    {["Reservation", "Guest", "Dates", "Room", "Status", "Update", "Receipt"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {filtered.map((r) => (
                    <tr key={r.reservationNo} className="bg-white/70 hover:bg-sky-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{r.reservationNo}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.guestName}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="ocean-pill">{r.roomType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColor[r.status] || "default"}>
                          {r.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.reservationNo, e.target.value as ReservationStatus)}
                          className="h-8 rounded-lg border border-sky-200 bg-white px-2 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => printReceipt(r)}>
                            Print
                          </Button>
                          <Button type="button" size="sm" onClick={() => downloadReceiptPdf(r)}>
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr className="bg-white/70">
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                        No reservations found for current filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
