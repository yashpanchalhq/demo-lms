// src/app/api/teacher/quizzes/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types"; // Corrected import path for Database

export async function GET() {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient(); // server-side client (service role)

  // 1) find courses user is enrolled in
  const { data: enrollRows, error: enrollErr } = await supabase
    .from("Enrollment")
    .select("course_id")
    .eq("user_id", user.id)
    .returns<Database["public"]["Tables"]["enrollments"]["Row"][]>();

  if (enrollErr) {
    console.error("enroll fetch error", enrollErr);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }

  const courseIds = (enrollRows ?? []).map((r) => r.course_id).filter(Boolean) as string[];
  if (courseIds.length === 0) {
    return NextResponse.json([]);
  }

  // 2) fetch quizzes for those courses
  const { data: quizzes, error: quizErr } = await supabase
    .from("quizzes")
    .select("id, title, description, course_id, passing_percent, attempts_allowed, duration_sec, is_active, available_from, available_to, created_at")
    .in("course_id", courseIds)
    .order("created_at", { ascending: false })
    .returns<Database["public"]["Tables"]["quizzes"]["Row"][]>();

  if (quizErr) {
    console.error("quizzes fetch error", quizErr);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }

  const quizIds = (quizzes ?? []).map((q) => q.id);
  // 3) fetch attempts for these quizzes by this user (single batched query)
  const { data: attemptsRows, error: attemptsErr } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, score, finished_at")
    .in("quiz_id", quizIds)
    .eq("user_id", user.id)
    .order("finished_at", { ascending: false })
    .returns<Database["public"]["Tables"]["quiz_attempts"]["Row"][]>();

  if (attemptsErr) {
    console.error("attempts fetch error", attemptsErr);
    // non-fatal, continue with empty attempts
  }

  const attemptsByQuiz = (attemptsRows ?? []).filter(a => a.quiz_id !== null).reduce<Record<string, Database["public"]["Tables"]["quiz_attempts"]["Row"][]>>((acc, a) => {
    (acc[a.quiz_id as string] ||= []).push(a);
    return acc;
  }, {});

  // map to lightweight shape for client
  const result = (quizzes ?? []).map((q) => {
    const attempts = attemptsByQuiz[q.id] ?? [];
    const best = attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;
    return {
      id: q.id,
      title: q.title,
      courseId: q.course_id,
      description: q.description,
      passingPercent: q.passing_percent,
      attemptsAllowed: q.attempts_allowed,
      bestScore: best,
      attemptsCount: attempts.length,
      durationSec: q.duration_sec,
      availableFrom: q.available_from,
      availableTo: q.available_to,
      isActive: q.is_active,
    };
  });

  return NextResponse.json(result);
}