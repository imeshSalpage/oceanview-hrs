"use client";

import { useEffect, useMemo, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";
import type { ReservationResponse, ReservationStatus, RoomType } from "@/lib/types";

const roomTypes: RoomType[] = ["SINGLE", "DOUBLE", "DELUXE", "SUITE"];
const statuses: ReservationStatus[] = ["BOOKED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];

const statusColor: Record<string, "default" | "success" | "warning" | "danger"> = {
  BOOKED: "default",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  CANCELLED: "danger",
};

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

  const filtered = useMemo(() => {
    return reservations.filter((reservation) => {
      if (search && !reservation.reservationNo.toLowerCase().includes(search.toLowerCase())) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage bookings, update statuses, and track arrivals.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create reservation</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={createReservation}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Customer ID (optional)</Label>
                  <Input
                    value={createData.customerId}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, customerId: event.target.value }))
                    }
                    placeholder="MongoDB user id"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guest name</Label>
                  <Input
                    value={createData.guestName}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, guestName: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input
                    value={createData.contactNo}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, contactNo: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={createData.address}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, address: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room type</Label>
                  <select
                    value={createData.roomType}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, roomType: event.target.value as RoomType }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={createData.checkInDate}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, checkInDate: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={createData.checkOutDate}
                    onChange={(event) =>
                      setCreateData((prev) => ({ ...prev, checkOutDate: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit">Create reservation</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All reservations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                placeholder="Search by reservation no"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
              <select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">All rooms</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading reservations...</p>
            ) : error ? (
              <p className="text-sm text-rose-500">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reservation</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((reservation) => (
                    <TableRow key={reservation.reservationNo}>
                      <TableCell className="font-medium">{reservation.reservationNo}</TableCell>
                      <TableCell>{reservation.guestName}</TableCell>
                      <TableCell>
                        {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
                      </TableCell>
                      <TableCell>{reservation.roomType}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor[reservation.status] || "default"}>
                          {reservation.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          value={reservation.status}
                          onChange={(event) =>
                            updateStatus(reservation.reservationNo, event.target.value as ReservationStatus)
                          }
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
