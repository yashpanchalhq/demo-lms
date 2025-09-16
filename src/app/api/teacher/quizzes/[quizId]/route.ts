// src/app/api/teacher/quizzes/[id]/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types"; // Corrected import path for Database

export async function GET(_: Request, context: any) { // Using any for context
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  // Fetch quiz metadata
  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .select("id, title, description, passing_percent, duration_sec, attempts_allowed, available_from, available_to")
    .eq("id", context.params.quizId) // Corrected access to quizId
    .returns<Database["public"]["Tables"]["quizzes"]["Row"]>()
    .single();

  if (qErr || !quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  // Assert that quiz is of the expected type after the null check
  const typedQuiz = quiz as Database["public"]["Tables"]["quizzes"]["Row"];

  // Fetch questions but DO NOT return the 'correct' column to client
  const { data: questions, error: qqErr } = await supabase
    .from("quiz_questions")
    .select("id, ordering, type, question, choices, points")
    .eq("quiz_id", context.params.quizId) // Corrected access to quizId
    .order("ordering", { ascending: true })
    .returns<Array<Omit<Database["public"]["Tables"]["quiz_questions"]["Row"], "correct">>>();

  if (qqErr) {
    console.error("questions fetch error", qqErr);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }

  return NextResponse.json({
    id: typedQuiz.id,
    title: typedQuiz.title,
    description: typedQuiz.description,
    passingPercent: typedQuiz.passing_percent,
    durationSec: typedQuiz.duration_sec,
    attemptsAllowed: typedQuiz.attempts_allowed,
    availableFrom: typedQuiz.available_from,
    availableTo: typedQuiz.available_to,
    questions: questions ?? [],
  });
}