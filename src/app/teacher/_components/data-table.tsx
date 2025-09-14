// src/app/teacher/_components/teacher-activity-table.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Activity = {
  id: string;
  type: string;
  title: string;
  date: string;
  meta?: string;
};

export function DataTable() {
  const [items, setItems] = useState<Activity[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/teacher/activity", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (mounted) setItems(json);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!items ? (
          <div>Loading…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Meta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.title}</TableCell>
                  <TableCell>{it.type}</TableCell>
                  <TableCell>{new Date(it.date).toLocaleString()}</TableCell>
                  <TableCell>{it.meta ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
