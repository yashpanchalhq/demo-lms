
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(req);
    const { courseId, chapterId } = context.params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: courseOwner, error: courseError } = await supabase
      .from('Course')
      .select('id')
      .eq('id', courseId)
      .eq('userId', userId)
      .single();

    if (courseError || !courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: chapter, error: chapterError } = await supabase
      .from('Chapter')
      .update({ isPublished: true })
      .eq('id', chapterId)
      .eq('courseId', courseId)
      .select()
      .single();

    if (chapterError) {
      console.log("[CHAPTER_PUBLISH]", chapterError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Check if the course has at least one published chapter
    const { count: publishedChaptersCount, error: countError } = await supabase
      .from('Chapter')
      .select('id', { count: 'exact' })
      .eq('courseId', courseId)
      .eq('isPublished', true);

    if (countError) {
      console.log("[CHAPTER_PUBLISH]", countError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    if (publishedChaptersCount === 0) {
      // If no published chapters, the course cannot be published
      await supabase
        .from('Course')
        .update({ isPublished: false })
        .eq('id', courseId);
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTER_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
