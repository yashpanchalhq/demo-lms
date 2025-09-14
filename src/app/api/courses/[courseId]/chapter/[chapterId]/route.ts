
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = getAuth(req);
    const { courseId, chapterId } = params;
    const values = await req.json();

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
      .update(values)
      .eq('id', chapterId)
      .eq('courseId', courseId)
      .select()
      .single();

    if (chapterError) {
      console.log("[CHAPTER_ID_PATCH]", chapterError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = getAuth(req);
    const { courseId, chapterId } = params;

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

    const { data: deletedChapter, error: chapterError } = await supabase
      .from('Chapter')
      .delete()
      .eq('id', chapterId)
      .eq('courseId', courseId)
      .select()
      .single();

    if (chapterError) {
      console.log("[CHAPTER_ID_DELETE]", chapterError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
