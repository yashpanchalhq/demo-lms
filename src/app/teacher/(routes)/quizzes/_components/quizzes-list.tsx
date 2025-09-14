"use client";

import React, { useMemo, useState } from "react";
import QuizPlayer from "./quiz-player";
import AttemptHistory from "./attempt-history";

export type QuizItem = {
  id: string;
  title: string;
  courseId: string;
  description?: string | null;
  attemptsAllowed?: number | null;
  bestScore?: number | null;
  attemptsCount?: number | null;
  passingPercent?: number | null;
  durationSec?: number | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  isActive?: boolean | null;
};

export default function QuizzesList({ initialQuizzes }: { initialQuizzes: QuizItem[] }) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(initialQuizzes ?? []);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"pending" | "all" | "completed">("pending");
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      if (viewMode === "pending") return (q.attemptsCount ?? 0) < (q.attemptsAllowed ?? 1);
      if (viewMode === "completed") return (q.bestScore ?? -1) >= (q.passingPercent ?? 0);
      return true;
    });
  }, [quizzes, viewMode]);

  function openQuiz(quizId: string) {
    setActiveQuizId(quizId);
  }

  async function onFinish(result: { quizId: string; score: number; attemptsLeft: number; certificate: any }) {
    // optimistic update: increment attemptsCount & update bestScore if needed
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === result.quizId
          ? {
              ...q,
              attemptsCount: (q.attemptsCount ?? 0) + 1,
              bestScore: q.bestScore != null ? Math.max(q.bestScore, result.score) : result.score,
              attemptsAllowed: (q.attemptsAllowed ?? 1) - ((q.attemptsCount ?? 0) + 1 - result.attemptsLeft), // Adjust attemptsAllowed based on new attemptsLeft
            }
          : q
      )
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 bg-muted p-1 rounded">
            <button
              className={`px-3 py-1 rounded ${viewMode === "pending" ? "bg-background" : "opacity-80"}`}
              onClick={() => setViewMode("pending")}
            >
              Pending
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === "all" ? "bg-background" : "opacity-80"}`}
              onClick={() => setViewMode("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === "completed" ? "bg-background" : "opacity-80"}`}
              onClick={() => setViewMode("completed")}
            >
              Completed
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} / {quizzes.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4 border rounded text-sm text-muted-foreground">No quizzes found for this filter.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => {
              const attemptsLeft = Math.max((q.attemptsAllowed ?? 1) - (q.attemptsCount ?? 0), 0);
              const canAttempt = (q.attemptsAllowed ?? 1) === 0 ? true : attemptsLeft > 0;
              return (
                <div key={q.id} className="p-4 border rounded flex justify-between items-center">
                  <div className="max-w-[70%]">
                    <div className="font-semibold">{q.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{q.description ?? ""}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Best: {q.bestScore ?? "—"} • Attempts: {q.attemptsCount ?? 0}
                      {q.attemptsAllowed ? ` • Allowed: ${q.attemptsAllowed}` : ""}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground">Passing: {q.passingPercent ?? "—"}%</div>

                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 border rounded text-sm"
                        onClick={() => (window.location.href = `/teacher/courses/${q.courseId}`)}
                      >
                        Open course
                      </button>

                      <button
                        className={`px-3 py-1 rounded text-sm ${canAttempt ? "bg-sky-600 text-white" : "bg-gray-200 text-muted-foreground"}`}
                        onClick={() => canAttempt && openQuiz(q.id)}
                        disabled={!canAttempt || loadingQuizId === q.id}
                      >
                        {loadingQuizId === q.id ? "Loading…" : canAttempt ? "Start / Resume" : "No attempts left"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="p-4 border rounded">
          <div className="font-medium">Quick rules</div>
          <div className="text-xs text-muted-foreground mt-2">
            Passing threshold varies per quiz. If a timer is present it will auto-submit when time runs out.
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Tip</div>
          <div className="text-xs text-muted-foreground mt-2">Your best score updates immediately after each attempt.</div>
        </div>

        {activeQuizId && (
          <div className="p-4 border rounded">
            <div className="font-medium mb-2">Attempt History</div>
            <AttemptHistory quizId={activeQuizId} />
          </div>
        )}
      </aside>

      {activeQuizId && (
        <QuizPlayer
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onFinish={(res) => {
            setQuizzes(prev => prev.map(q => q.id === res.quizId ? ({
              ...q,
              attemptsCount: (q.attemptsCount ?? 0) + 1,
              bestScore: q.bestScore != null ? Math.max(q.bestScore, res.score) : res.score,
              attemptsLeft: res.attemptsLeft ?? q.attemptsLeft,
            }) : q));
            setActiveQuizId(null);
          }}
        />
      )}
    </div>
  );
}