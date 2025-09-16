import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * POST /api/teacher/quizzes/:id/submit
 * - Enforces attempts_allowed
 * - Grades (server-side)
 * - Persists attempt
 * - If passed -> creates a certificate row and returns it
 *
 * NOTE: we cast supabase to any in places to avoid TS 'never' table typing.
 */

type QuestionRow = { id: string; correct: string | null; points?: number | null };
type QuizRow = {
  id: string;
  passing_percent?: number | null;
  attempts_allowed?: number | null;
  course_id?: string | null;
};

export async function POST(req: Request, context: any) { // Using any for context
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const answers: Record<string, any> = body.answers ?? {};
  const timeTakenSec: number | null = body.timeTakenSec ?? null;

  const supabase = getSupabaseClient();

  // 1) load quiz metadata (including attempts_allowed + course_id)
  const { data: quizData, error: quizErr } = await supabase
    .from("quizzes")
    .select("id, passing_percent, attempts_allowed, course_id")
    .eq("id", context.params.quizId) // Corrected access to quizId
    .single();

  if (quizErr || !quizData) {
    console.error("Quiz fetch error:", quizErr);
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  const quiz = quizData as QuizRow;

  // 2) check attempts count for this user
  // use select with count: 'exact' — cast to any for TS
  const attemptsCountResp = await (supabase as any)
    .from("quiz_attempts")
    .select("id", { count: "exact" })
    .eq("quiz_id", context.params.quizId) // Corrected access to quizId
    .eq("user_id", userId);
  const attemptsSoFar = (attemptsCountResp?.count ?? 0) as number;
  const allowed = quiz.attempts_allowed ?? 1;
  const attemptsLeft = Math.max(allowed - attemptsSoFar, 0);

  if (allowed > 0 && attemptsSoFar >= allowed) {
    return NextResponse.json({ error: "No attempts left", attemptsLeft: 0 }, { status: 403 });
  }

  // 3) fetch full questions (including correct) server-side
  const { data: questionsData, error: qqErr } = await supabase
    .from("quiz_questions")
    .select("id, correct, points")
    .eq("quiz_id", context.params.quizId); // Corrected access to quizId

  if (qqErr) {
    console.error("Questions fetch error:", qqErr);
    return NextResponse.json({ error: "Failed to grade quiz" }, { status: 500 });
  }
  const questions = (questionsData ?? []) as QuestionRow[];

  // 4) grade (single-answer MCQ; adapt for multi-select later)
  let correctCount = 0;
  let totalPoints = 0;
  let scoredPoints = 0;
  const totalQuestions = questions.length;

  for (const q of questions) {
    const qPoints = q.points ?? 1;
    totalPoints += qPoints;
    const userAns = answers[q.id];
    if (userAns !== undefined && String(userAns) === String(q.correct)) {
      correctCount++;
      scoredPoints += qPoints;
    }
  }

  const scorePercent = totalPoints === 0 ? 0 : Math.round((scoredPoints / totalPoints) * 100);
  const passed = scorePercent >= (quiz.passing_percent ?? 70);

  // 5) persist attempt
  const insertPayload = {
    user_id: userId,
    quiz_id: context.params.quizId, // Corrected access to quizId
    score: scorePercent,
    correct_count: correctCount,
    total_questions: totalQuestions,
    answers,
    finished_at: new Date().toISOString(),
    time_taken_sec: timeTakenSec,
  };

  const { data: attempt, error: insertErr } = await (supabase as any)
    .from("quiz_attempts")
    .insert([insertPayload])
    .select()
    .single();

  if (insertErr) {
    console.error("Attempt insert error:", insertErr);
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  // 6) If passed -> create a certificate row (simple record). You can add PDF generation later.
  let certificate: any = null;
  if (passed) {
    // Ensure you have a certificates table (seed SQL below creates this).
    const certPayload = {
      user_id: userId,
      course_id: quiz.course_id ?? null,
      issued_at: new Date().toISOString(),
      file_url: null, // update later when PDF is ready
      issued_by: null,
    };

    const { data: certData, error: certErr } = await (supabase as any)
      .from("certificates")
      .insert([certPayload])
      .select()
      .single();

    if (certErr) {
      console.error("Certificate insert error:", certErr);
      // don't fail attempt if cert creation fails; just log
    } else {
      certificate = certData;
    }
  }

  // 7) compute new attemptsLeft
  const newAttemptsLeft = Math.max(allowed - (attemptsSoFar + 1), 0);

  return NextResponse.json({
    attemptId: (attempt as any)?.id,
    score: scorePercent,
    correctCount,
    totalQuestions,
    passed,
    attemptsLeft: newAttemptsLeft,
    certificate: certificate ? { id: certificate.id, fileUrl: certificate.file_url, issuedAt: certificate.issued_at } : null,
  });
}