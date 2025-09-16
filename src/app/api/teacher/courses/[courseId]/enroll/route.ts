import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: any
) {
    const { courseId } = context.params;
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return new NextResponse("Course ID missing", { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('Course')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error("[TEACHER_ENROLL_POST]", courseError);
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if already enrolled
    const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
      .from('Enrollment')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return new NextResponse("Already enrolled", { status: 409 });
    }

    if (existingEnrollmentError && existingEnrollmentError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("[TEACHER_ENROLL_POST]", existingEnrollmentError);
        return new NextResponse("Internal Error", { status: 500 });
    }


    // Enroll the teacher
    const { data: enrollment, error: enrollError } = await supabase
      .from('Enrollment')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          role: 'teacher', // Teacher self-enrolls
        },
      ])
      .select()
      .single();

    if (enrollError) {
      console.error("[TEACHER_ENROLL_POST]", enrollError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("[TEACHER_ENROLL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
