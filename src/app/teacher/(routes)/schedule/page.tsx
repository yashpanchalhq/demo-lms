"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  mode?: string;
  location?: string;
}

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop<ScheduleEvent>(Calendar);

export default function TeacherSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    fetch("/api/teacher/schedule")
      .then((res) => res.json())
      .then((data) => {
        setEvents(
          data.map((session: any) => ({
            id: session.id,
            title: session.title,
            start: new Date(session.start_time),
            end: new Date(session.end_time),
            mode: session.mode,
            location: session.location,
          }))
        );
      });
  }, []);

  const handleEventResize = async (args: { event: ScheduleEvent; start: Date; end: Date }) => {
    const { event, start, end } = args;
    await fetch(`/api/teacher/schedule/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_time: start, end_time: end }),
    });
    setEvents(
      events.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  };

  const handleEventDrop = async (args: { event: ScheduleEvent; start: Date; end: Date }) => {
    const { event, start, end } = args;
    await fetch(`/api/teacher/schedule/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_time: start, end_time: end }),
    });
    setEvents(
      events.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  };

  return (
    <div className="p-6 bg-background">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        resizable
        draggableAccessor={() => true}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />
    </div>
  );
}
