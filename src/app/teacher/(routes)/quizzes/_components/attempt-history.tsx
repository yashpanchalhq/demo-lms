"use client";

import React, { useEffect, useState } from "react";

type Attempt = {
  id: string;
  score: number;
  finished_at: string | null;
  time_taken_sec: number | null;
};

export default function AttemptHistory({ quizId }: { quizId: string }) {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/teacher/quizzes/${quizId}/attempts`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const json = await res.json();
        if (mounted) setAttempts(json);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [quizId]);

  if (!attempts) return <div className="text-sm text-muted-foreground">Loading attempts…</div>;
  if (attempts.length === 0) return <div className="text-sm text-muted-foreground">No attempts yet.</div>;

  return (
    <ul className="space-y-2 text-sm">
      {attempts.map(a => (
        <li key={a.id} className="p-2 border rounded flex justify-between items-center">
          <div>
            <div className="font-medium">{a.score}%</div>
            <div className="text-xs text-muted-foreground">{new Date(a.finished_at ?? "").toLocaleString()}</div>
          </div>
          <div className="text-xs text-muted-foreground">{a.time_taken_sec ? `${a.time_taken_sec}s` : "—"}</div>
        </li>
      ))}
    </ul>
  );
}