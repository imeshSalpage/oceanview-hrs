"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Building2, ShieldCheck, Trash2 } from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";
import type { RoomTypeDetails } from "@/lib/types";

interface RoomTypeFormState extends RoomTypeDetails {
  amenitiesText: string;
  facilitiesText: string;
  imageFiles: File[];
}

const toFormState = (room: RoomTypeDetails): RoomTypeFormState => ({
  ...room,
  amenitiesText: room.amenities.join(", "),
  facilitiesText: room.facilities.join(", "),
  imageFiles: [],
});

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function RoomTypesPage() {
  const guard = useRoleGuard(["ADMIN", "RECEPTION"], "/login");
  const [rooms, setRooms] = useState<RoomTypeFormState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ roomIndex: number; imageIndex: number } | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<RoomTypeDetails[]>("/api/rooms/manage")
      .then((data) => {
        if (active) {
          setRooms(data.map(toFormState));
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load room types");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!guard.isClient || !guard.isAllowed) {
    return null;
  }

  const updateField = (index: number, key: keyof RoomTypeFormState, value: string | number | File[]) => {
    setRooms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value } as RoomTypeFormState;
      return next;
    });
  };

  const handleFilesChange = (index: number, files: FileList | null) => {
    if (!files) {
      updateField(index, "imageFiles", []);
      return;
    }

    const selectedFiles = Array.from(files);
    if (selectedFiles.length > 5) {
      setError("You can upload a maximum of 5 photos per room type");
      return;
    }

    const currentSavedCount = rooms[index]?.imageUrls.length ?? 0;
    if (currentSavedCount + selectedFiles.length > 5) {
      setError("Total photos (saved + new) cannot exceed 5");
      return;
    }

    updateField(index, "imageFiles", selectedFiles);
  };

  const confirmDeleteImage = () => {
    if (!deleteTarget) {
      return;
    }

    const { roomIndex, imageIndex } = deleteTarget;
    const room = rooms[roomIndex];
    if (!room) {
      setDeleteTarget(null);
      return;
    }

    const nextImages = room.imageUrls.filter((_, index) => index !== imageIndex);
    const totalAfterDelete = nextImages.length + room.imageFiles.length;
    if (totalAfterDelete < 1) {
      setError("At least one photo is required. Upload a new image before deleting this one.");
      setDeleteTarget(null);
      return;
    }

    setRooms((prev) => {
      const next = [...prev];
      next[roomIndex] = { ...next[roomIndex], imageUrls: nextImages };
      return next;
    });
    setDeleteTarget(null);
  };

  const handleSave = async (room: RoomTypeFormState, index: number) => {
    setSaving(room.roomType);
    setError(null);
    try {
      if (room.imageFiles.length > 5) {
        throw new Error("You can upload a maximum of 5 photos per room type");
      }

      if (room.imageFiles.length === 0 && room.imageUrls.length === 0) {
        throw new Error("At least one photo is required for each room type");
      }

      const payload = {
        name: room.name,
        description: room.description,
        ratePerNight: Number(room.ratePerNight),
        totalRooms: Number(room.totalRooms),
        maxGuests: Number(room.maxGuests),
        sizeSqm: Number(room.sizeSqm),
        bedType: room.bedType,
        amenities: splitList(room.amenitiesText),
        facilities: splitList(room.facilitiesText),
        existingImageUrls: room.imageUrls,
      };

      const formData = new FormData();
      formData.append(
        "payload",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      room.imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const updated = await api.put<RoomTypeDetails>(`/api/rooms/${room.roomType}`, formData);
      setRooms((prev) => {
        const next = [...prev];
        next[index] = toFormState(updated);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update room type");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="ocean-wave min-h-screen">
      <SiteHeader />
      <DashboardNav />

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Delete this photo?</h3>
                <p className="text-sm text-slate-600">
                  Are you sure you want to remove this image from the room type?
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmDeleteImage}>
                Delete image
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
        <div className="space-y-1">
          <span className="ocean-pill inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Management</span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Manage Room Types</h1>
          <p className="text-slate-600">Update room counts, rates, and public-facing details.</p>
        </div>

        {error ? (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 border border-rose-200">{error}</p>
        ) : null}

        <section className="grid gap-6">
          {rooms.map((room, index) => (
            <div key={room.roomType} className="card-ocean rounded-2xl overflow-hidden">
              {/* Header band */}
              <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/60 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="ocean-pill inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{room.roomType}</span>
                  <h2 className="text-base font-bold text-slate-900">{room.name}</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(room, index)}
                  disabled={saving === room.roomType}
                >
                  {saving === room.roomType ? "Saving…" : "Save changes"}
                </Button>
              </div>

              {/* Fields */}
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                  <input className="ocean-input" value={room.name}
                    onChange={(e) => updateField(index, "name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bed type</label>
                  <input className="ocean-input" value={room.bedType}
                    onChange={(e) => updateField(index, "bedType", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
                  <textarea
                    className="ocean-input min-h-20 resize-y"
                    value={room.description}
                    onChange={(e) => updateField(index, "description", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rate per night</label>
                  <input type="number" className="ocean-input" value={room.ratePerNight}
                    onChange={(e) => updateField(index, "ratePerNight", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total rooms</label>
                  <input type="number" className="ocean-input" value={room.totalRooms}
                    onChange={(e) => updateField(index, "totalRooms", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Max guests</label>
                  <input type="number" className="ocean-input" value={room.maxGuests}
                    onChange={(e) => updateField(index, "maxGuests", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Size (m²)</label>
                  <input type="number" className="ocean-input" value={room.sizeSqm}
                    onChange={(e) => updateField(index, "sizeSqm", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amenities (comma separated)</label>
                  <input className="ocean-input" value={room.amenitiesText}
                    onChange={(e) => updateField(index, "amenitiesText", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Facilities (comma separated)</label>
                  <input className="ocean-input" value={room.facilitiesText}
                    onChange={(e) => updateField(index, "facilitiesText", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Room photos (1 to 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="ocean-input file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-200"
                    onChange={(e) => handleFilesChange(index, e.target.files)}
                  />
                  <p className="text-xs text-slate-500">
                    {room.imageUrls.length} saved image(s). You can delete saved images and add new files (max 5 total).
                  </p>
                  {room.imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {room.imageUrls.slice(0, 5).map((url, imageIndex) => (
                        <div key={`${room.roomType}-${imageIndex}`} className="relative">
                          <img
                            src={url}
                            alt={`${room.name} preview ${imageIndex + 1}`}
                            className="h-16 w-full rounded-lg border border-sky-100 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ roomIndex: index, imageIndex })}
                            className="absolute -right-1 -top-1 rounded-full border border-rose-200 bg-white p-1 text-rose-600 shadow-sm transition hover:bg-rose-50"
                            aria-label="Delete image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
