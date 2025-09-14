"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Question = {
  id: string;
  ordering?: number;
  type?: string;
  question: string;
  choices: { id: string; label: string }[];
  points?: number | null;
};

type QuizPayload = {
  id: string;
  title: string;
  description?: string | null;
  passingPercent?: number | null;
  durationSec?: number | null;
  questions: Question[];
};

export default function QuizPlayer({ quizId, onClose, onFinish }: { quizId: string; onClose: () => void; onFinish?: (result: { quizId: string; score: number; attemptsLeft?: number; certificate?: any }) => void; }) {
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [certificate, setCertificate] = useState<any | null>(null);

  // timer state
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const startTimestampRef = React.useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/quizzes/${quizId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load quiz");
        const json = await res.json();
        if (!mounted) return;
        setQuiz(json);
        if (json?.durationSec) {
          setRemainingSec(json.durationSec);
          startTimestampRef.current = Date.now();
        } else {
          setRemainingSec(null);
          startTimestampRef.current = null;
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load quiz.");
        onClose();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [quizId, onClose]);

  // timer effect
  useEffect(() => {
    if (remainingSec == null) return;
    const interval = setInterval(() => {
      setRemainingSec((v) => {
        if (v == null) return null;
        if (v <= 1) {
          clearInterval(interval);
          handleSubmitAuto();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSec]);

  const formattedTime = useMemo(() => {
    if (remainingSec == null) return null;
    const m = Math.floor(remainingSec / 60).toString().padStart(2, "0");
    const s = Math.floor(remainingSec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingSec]);

  async function handleSubmitAuto() {
    if (submitting || result) return;
    const timeTakenSec = startTimestampRef.current ? Math.round((Date.now() - startTimestampRef.current) / 1000) : null;
    await submitAnswers(timeTakenSec);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const timeTakenSec = startTimestampRef.current ? Math.round((Date.now() - startTimestampRef.current) / 1000) : null;
    await submitAnswers(timeTakenSec);
  }

  async function submitAnswers(timeTakenSec: number | null) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTakenSec }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error || "Submit failed");
        throw new Error(json?.error || "Submit failed");
      }

      // success: show toast and set local result
      setResult(json);
      if (json?.attemptsLeft !== undefined) {
        toast.success(`Score ${json.score}%. Attempts left: ${json.attemptsLeft}`);
      } else {
        toast.success(`Score ${json.score}%`);
      }

      // certificate handling
      if (json?.certificate) {
        setCertificate(json.certificate);
        if (json.certificate.fileUrl) {
          toast.success("Certificate available — click to download");
        } else {
          toast.success("Certificate issued (processing). Check Certificates page shortly.");
        }
      }

      if (onFinish) onFinish({ quizId, score: json.score, attemptsLeft: json.attemptsLeft, certificate: json.certificate });
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !quiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white p-6 rounded shadow">Loading quiz…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[85vh]">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">{quiz.title}</div>
            <div className="text-xs text-muted-foreground">{quiz.description}</div>
          </div>
          <div className="flex items-center gap-2">
            {formattedTime && <div className="text-sm font-mono">{formattedTime}</div>}
            <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>

        <div className="p-6">
          {result ? (
            <div className="space-y-4">
              <div className="text-lg font-semibold">Result: {result.score}%</div>
              <div className="text-sm text-muted-foreground">Correct: {result.correctCount} / {result.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Attempts left: {result.attemptsLeft ?? "—"}</div>

              {certificate ? (
                <div className="mt-3">
                  {certificate.fileUrl ? (
                    <a href={certificate.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded">Download Certificate</a>
                  ) : (
                    <div className="text-sm">Certificate issued (processing). You can check it on the Certificates page shortly.</div>
                  )}
                </div>
              ) : null}

              <div className="flex gap-2 mt-4">
                <button onClick={() => { onClose(); }} className="px-4 py-2 bg-sky-600 text-white rounded">Done</button>
                <button onClick={() => { setResult(null); setAnswers({}); if (quiz.durationSec) { setRemainingSec(quiz.durationSec); startTimestampRef.current = Date.now(); } }} className="px-4 py-2 border rounded">Retry / Review</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="p-3 border rounded">
                  <div className="font-medium">{idx + 1}. {q.question}</div>
                  <div className="mt-2 grid gap-2">
                    {q.choices.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={c.id}
                          checked={answers[q.id] === c.id}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: c.id }))}
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-600 text-white rounded">
                  {submitting ? "Submitting…" : "Submit Quiz"}
                </button>
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}