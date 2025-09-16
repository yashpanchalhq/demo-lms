
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, Database } from "@/lib/supabase";
import { Tables } from "@/lib/database.types";

interface ChapterRow extends Tables<'Chapter'> {}

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(req);
    const { courseId } = context.params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: course, error: courseError } = await supabase
      .from('Course')
      .select(
        `
        *,
        Chapter (*)
        `
      )
      .eq('id', courseId)
      .eq('userId', userId)
      .single();

    if (courseError || !course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const hasPublishedChapter = course.Chapter.some(
      (chapter: ChapterRow) => chapter.isPublished
    );

    const requiredFields = [
      course.title,
      course.description,
      course.imageUrl,
      course.categoryId,
      hasPublishedChapter,
    ];

    const isComplete = requiredFields.every(Boolean);

    if (!isComplete) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const { data: publishedCourse, error: publishError } = await supabase
      .from('Course')
      .update({ isPublished: true })
      .eq('id', courseId)
      .select()
      .single();

    if (publishError) {
      console.log("[COURSE_PUBLISH]", publishError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[COURSE_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
