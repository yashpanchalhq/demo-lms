import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // fetch all attempts for a quiz
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      `
      id,
      user_id,
      quiz_id,
      score,
      correct_count,
      total_questions,
      finished_at,
      User: user_id (
        id,
        email
      )
    `
    )
    .eq("quiz_id", quizId)
    .order("finished_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data.map((a) => ({
      id: a.id,
      quizId: a.quiz_id,
      user: a.User,
      score: a.score,
      correctCount: a.correct_count,
      totalQuestions: a.total_questions,
      finishedAt: a.finished_at,
    }))
  );
}