import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminCreateEventForm({ onClose }: { onClose: () => void; }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    mode: "offline",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create event");
      toast.success("Event created successfully");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Schedule Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <Input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
          <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <Input name="start_time" type="datetime-local" value={formData.start_time} onChange={handleChange} required />
          <Input name="end_time" type="datetime-local" value={formData.end_time} onChange={handleChange} required />
          <Input name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
          <select name="mode" value={formData.mode} onChange={handleChange} className="p-2 border rounded w-full">
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}