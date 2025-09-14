// src/components/teacher/InProgressList.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type ModuleItem = {
  id: string;
  title: string;
  type?: string | null;
  ordering?: number | null;
  storage_path?: string | null;
  course: { id: string; title: string };
};

export default function InProgressList({
  initialItems,
  total,
  userId,
}: {
  initialItems: ModuleItem[];
  total: number;
  userId: string;
}) {
  const [items, setItems] = useState<ModuleItem[]>(initialItems || []);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((it) => map.set(it.course.id, it.course.title));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [items]);

  function matchesFilter(it: ModuleItem) {
    if (courseFilter && it.course.id !== courseFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return it.title.toLowerCase().includes(q) || it.course.title.toLowerCase().includes(q);
  }

  async function markComplete(moduleId: string) {
    setLoadingMap((s) => ({ ...s, [moduleId]: true }));
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to mark complete");
      // remove module from list
      setItems((prev) => prev.filter((m) => m.id !== moduleId));
      // optionally show toast
      // if payload.completedCourse -> show congrats modal/notification
      if (payload?.completedCourse) {
        alert("Congratulations — course completed! A certificate was issued.");
      }
    } catch (err: any) {
      alert(err?.message || "Error");
    } finally {
      setLoadingMap((s) => ({ ...s, [moduleId]: false }));
    }
  }

  async function markAllForCourse(courseId: string) {
    const toComplete = items.filter((m) => m.course.id === courseId).map((m) => m.id);
    if (toComplete.length === 0) return;
    if (!confirm(`Mark ${toComplete.length} module(s) for "${items.find(i=>i.course.id===courseId)?.course.title}" as complete?`)) return;

    for (const id of toComplete) {
      // sequential to avoid race; can batch via server bulk endpoint if you implement it
      // eslint-disable-next-line no-await-in-loop
      await markComplete(id);
    }
  }

  const grouped = items.filter(matchesFilter).reduce<Record<string, ModuleItem[]>>((acc, m) => {
    (acc[m.course.id] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search modules or courses..." className="p-2 border rounded w-full" />
        <select value={courseFilter ?? ""} onChange={(e)=> setCourseFilter(e.target.value || null)} className="p-2 border rounded">
          <option value="">All courses</option>
          {courses.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}        </select>
      </div>

      {Object.keys(grouped).length === 0 && <div className="text-sm text-gray-500">No pending modules found.</div>}

      {Object.entries(grouped).map(([courseId, mods]) => (
        <div key={courseId} className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">{mods[0].course.title}</div>
              <div className="text-xs text-muted-foreground">{mods.length} pending module{mods.length===1? "":"s"}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/teacher/courses/${courseId}`} className="px-3 py-1 border rounded text-sm">Open Course</Link>
              <button onClick={()=>markAllForCourse(courseId)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Mark all complete</button>
            </div>
          </div>

          <ul className="space-y-2">
            {mods.map(m => (
              <li key={m.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.type ?? "Module"}</div>
                </div>

                <div className="flex items-center gap-2">
                  {m.storage_path && (
                    <a href={m.storage_path} target="_blank" rel="noreferrer" className="text-sm underline text-sky-600">Open</a>
                  )}
                  {/* If you have a quiz flag on module, show "Take quiz" */}
                  {/* <a href={`/teacher/courses/${courseId}/module/${m.id}/quiz`} className="text-sm underline">Take quiz</a> */}
                  <button
                    onClick={() => markComplete(m.id)}
                    disabled={!!loadingMap[m.id]}
                    className={`px-3 py-1 rounded text-sm ${loadingMap[m.id] ? "bg-gray-300" : "bg-sky-600 text-white"}`}
                  >
                    {loadingMap[m.id] ? "Marking..." : "Mark complete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Optionally show count / pagination / load more */}
      <div className="text-sm text-muted-foreground">Showing {items.length} of {total} pending module{total===1? "":"s"}.</div>
    </div>
  );
}
