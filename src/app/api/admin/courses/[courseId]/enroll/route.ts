import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: any
) {
  const { courseId } = context.params;
  try {
    const { userId } = getAuth(req); // This is the admin's userId
    const { teacherId } = await req.json(); // The teacher to be enrolled

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return new NextResponse("Course ID missing", { status: 400 });
    }

    if (!teacherId) {
      return new NextResponse("Teacher ID missing", { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Authorization check: Verify if the requesting user is an ADMIN
    const { data: adminUser, error: adminError } = await supabase
      .from('User')
      .select('role')
      .eq('clerkId', userId)
      .single();

    if (adminError || !adminUser || adminUser.role !== 'ADMIN') {
      console.error("[ADMIN_ENROLL_POST] Admin authorization failed", adminError);
      return new NextResponse("Forbidden: Not an admin", { status: 403 });
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('Course')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error("[ADMIN_ENROLL_POST] Course not found", courseError);
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check if the teacherId corresponds to an existing user with 'TEACHER' role
    const { data: teacherUser, error: teacherUserError } = await supabase
      .from('User')
      .select('clerkId, role')
      .eq('clerkId', teacherId)
      .single();

    if (teacherUserError || !teacherUser || teacherUser.role !== 'TEACHER') {
      console.error("[ADMIN_ENROLL_POST] Teacher user not found or not a teacher", teacherUserError);
      return new NextResponse("Teacher user not found or not a teacher", { status: 404 });
    }

    // Check if already enrolled
    const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
      .from('Enrollment')
      .select('id')
      .eq('user_id', teacherId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return new NextResponse("Teacher already enrolled in this course", { status: 409 });
    }

    if (existingEnrollmentError && existingEnrollmentError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("[ADMIN_ENROLL_POST]", existingEnrollmentError);
        return new NextResponse("Internal Error", { status: 500 });
    }

    // Enroll the teacher by admin
    const { data: enrollment, error: enrollError } = await supabase
      .from('Enrollment')
      .insert([
        {
          userId: teacherId,
          courseId: courseId,
          status: 'active', // Admin enrolls a teacher
        },
      ])
      .select()
      .single();

    if (enrollError) {
      console.error("[ADMIN_ENROLL_POST]", enrollError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_ENROLL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
