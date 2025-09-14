import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  mode?: "online" | "offline" | null;
  teacher_id?: string | null;
  course_id?: string | null;
};

export default function EventModal({
  event,
  onClose,
  onDeleted,
}: {
  event: EventItem;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: event.title || "",
    description: event.description || "",
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location || "",
    mode: event.mode || "online",
  });
  const startsAt = useMemo(() => new Date(event.start_time), [event.start_time]);
  const endsAt = useMemo(() => new Date(event.end_time), [event.end_time]);

  async function handleDelete() {
    if (!confirm("Delete this session?")) return;
    try {
      const res = await fetch(`/api/teacher/schedule/${event.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Session deleted");
      onDeleted();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete");
    }
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        location: form.location,
        mode: form.mode,
      };
      const res = await fetch(`/api/teacher/schedule/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Session updated");
      setEditing(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update");
    } finally {
      // setSubmitting(false); // This was missing in the provided code, but good practice
    }
  }

  const handleJoin = () => {
    if (event.mode === "online" && event.location) {
      // In a real app, you'd check if the session is live and then redirect
      window.open(event.location, "_blank");
    } else {
      toast.info("This is an offline session or no join link available.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded shadow overflow-auto max-h-[85vh]">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <div className="text-sm text-muted-foreground">
              {startsAt.toLocaleString()} — {endsAt.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onClose()} className="px-3 py-1 border rounded">Close</button>
            <button onClick={() => setEditing((s) => !s)} className="px-3 py-1 border rounded">
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium">Start</label>
                  <input type="datetime-local" value={new Date(form.start_time).toISOString().slice(0,16)} onChange={(e)=>setForm({...form, start_time: new Date(e.target.value).toISOString()})} className="w-full border rounded px-3 py-2"/>
                </div>
                <div>
                  <label className="block text-sm font-medium">End</label>
                  <input type="datetime-local" value={new Date(form.end_time).toISOString().slice(0,16)} onChange={(e)=>setForm({...form, end_time: new Date(e.target.value).toISOString()})} className="w-full border rounded px-3 py-2"/>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded">Save</button>
                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              <div>{event.description}</div>
              <div>Mode: {event.mode}</div>
              <div>Location: {event.location ?? "—"}</div>
              <div className="mt-4">
                {/* If online and currently live, show Join button */}
                {event.mode === "online" && (() => {
                  const now = new Date();
                  if (now >= startsAt && now <= endsAt) {
                    return <a href={event.location || "#"} className="px-3 py-2 bg-green-600 text-white rounded">Join Now</a>;
                  } else {
                    return <span className="text-muted-foreground">Session not live</span>;
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}