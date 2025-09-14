"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "sonner";
import EventModal from "./_components/EventModal";
import AdminCreateEventForm from "./_components/AdminCreateEventForm";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

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

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/teacher/schedule");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // map to react-big-calendar shapes
      setEvents(
        (data ?? []).map((s: EventItem) => ({
          id: s.id,
          title: s.title,
          start: new Date(s.start_time),
          end: new Date(s.end_time),
          resource: s,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load schedule");
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleEventDrop({ event, start, end }: any) {
    const id = event.id;
    try {
      const body = {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      };
      const res = await fetch(`/api/teacher/schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, start, end } : e))
      );
      toast.success("Event rescheduled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule");
      await fetchEvents();
    }
  }

  async function handleEventResize({ event, start, end }: any) {
    await handleEventDrop({ event, start, end });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1 rounded bg-sky-600 text-white"
          >
            + Create Session
          </button>
        </div>
      </div>

      <div className="p-4">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          selectable
          resizable
          onSelectEvent={(ev: any) => setSelectedEvent(ev.resource)}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          draggableAccessor={() => true}
        />
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            fetchEvents();
          }}
          onDeleted={() => {
            setSelectedEvent(null);
            fetchEvents();
          }}
        />
      )}

      {showCreate && (
        <AdminCreateEventForm
          onClose={() => {
            setShowCreate(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
