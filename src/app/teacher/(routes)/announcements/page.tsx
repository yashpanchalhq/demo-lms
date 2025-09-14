"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// UploadThing hooks if using it:
// import { useUploadThing } from "@/lib/uploadthing-client"; // adapt to your wrapper

// Mock uploadFileAndGetUrl for now
async function uploadFileAndGetUrl(file: File): Promise<string> {
  console.log("Uploading file:", file.name);
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Return a dummy URL
  return `https://example.com/uploads/${file.name}`;
}

function AnnouncementCard({ item, onEdit, onDelete }: any) {
  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between">
        <h3 className="font-semibold">{item.title}</h3>
        <small className="text-xs text-muted-foreground">
          {new Date(item.created_at).toLocaleString()}
        </small>
      </div>
      <div className="mt-2 text-sm">{item.body}</div>
      {item.attachment_url && (
        <a
          className="text-sm text-sky-600 mt-2 block"
          href={item.attachment_url}
          target="_blank"
          rel="noreferrer"
        >
          Attachment
        </a>
      )}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function TeacherAnnouncements() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    const res = await fetch("/api/teacher/announcements");
    const json = await res.json();
    setList(json ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, attachmentUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");
      toast.success("Announcement created");
      setOpen(false);
      setTitle("");
      setBody("");
      setAttachmentUrl(null);
      fetchList();
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  // placeholder UploadThing integration:
  async function handleUpload(file: File) {
    // your UploadThing client flow: upload -> get url
    const url = await uploadFileAndGetUrl(file); // implement wrapper
    setAttachmentUrl(url);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-3 w-full"
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write announcement..."
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && handleUpload(e.target.files[0])
                  }
                />
                {attachmentUrl && (
                  <a href={attachmentUrl} target="_blank" rel="noreferrer">
                    Uploaded
                  </a>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {Array.isArray(list) &&
          list.map((a) => (
            <AnnouncementCard
              key={a.id}
              item={a}
              onEdit={() => {}}
              onDelete={async (it) => {
                if (!confirm("Delete announcement?")) return;
                const res = await fetch(`/api/teacher/announcements/${it.id}`, {
                  method: "DELETE",
                });
                if (res.ok) {
                  toast.success("Deleted");
                  fetchList();
                } else {
                  toast.error("Delete failed");
                }
              }}
            />
          ))}
      </div>
    </div>
  );
}
