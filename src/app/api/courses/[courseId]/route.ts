
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(req);
    const { courseId } = context.params;
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: course, error } = await supabase
      .from('Course')
      .update(values)
      .eq('id', courseId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.log("[COURSE_ID_PATCH]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
    const { data: deletedCourse, error } = await supabase
      .from('Course')
      .delete()
      .eq('id', courseId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.log("[COURSE_ID_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
