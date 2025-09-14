import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { quizId: string; attemptId: string } }
) {
  const { quizId, attemptId } = params;
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseClient();

  // delete attempt (reset)
  const { error } = await supabase
    .from("quiz_attempts")
    .delete()
    .eq("id", attemptId)
    .eq("quiz_id", quizId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Attempt reset" });
}