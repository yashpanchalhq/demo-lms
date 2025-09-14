// src/app/api/teacher/quizzes/[id]/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient, Database } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  // Fetch quiz metadata
  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .select("id, title, description, passing_percent, duration_sec, attempts_allowed, available_from, available_to")
    .eq("id", params.id)
    .returns<Database["public"]["Tables"]["quizzes"]["Row"]>()
    .single();

  if (qErr || !quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Fetch questions but DO NOT return the 'correct' column to client
  const { data: questions, error: qqErr } = await supabase
    .from("quiz_questions")
    .select("id, ordering, type, question, choices, points")
    .eq("quiz_id", params.id)
    .order("ordering", { ascending: true })
    .returns<Array<Omit<Database["public"]["Tables"]["quiz_questions"]["Row"], "correct">>>();

  if (qqErr) {
    console.error("questions fetch error", qqErr);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }

  return NextResponse.json({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingPercent: quiz.passing_percent,
    durationSec: quiz.duration_sec,
    attemptsAllowed: quiz.attempts_allowed,
    availableFrom: quiz.available_from,
    availableTo: quiz.available_to,
    questions: questions ?? [],
  });
}