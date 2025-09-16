
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(req);
    const { title, description } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: courseOwner, error: courseError } = await supabase
      .from('Course')
      .select('id')
      .eq('id', context.params.courseId) // Use context.params.courseId
      .eq('userId', userId)
      .single();

    if (courseError || !courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: lastChapter, error: lastChapterError } = await supabase
      .from('Chapter')
      .select('position')
      .eq('courseId', context.params.courseId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    const { data: chapter, error: chapterError } = await supabase
      .from('Chapter')
      .insert([
        {
          title,
          description,
          courseId: context.params.courseId,
          position: newPosition,
        },
      ])
      .select()
      .single();

    if (chapterError) {
      console.log("[CHAPTERS]", chapterError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
