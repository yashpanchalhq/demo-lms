import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req); // Get Clerk user ID

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get the internal Supabase userId for the current user
    const { data: user, error: userError } = await supabase
      .from("User") // Assuming "User" table stores clerkId and internal Supabase ID
      .select("id")
      .eq("clerkId", clerkUserId)
      .single();

    if (userError || !user) {
      console.error("[TEACHER_COURSES_GET] User not found:", userError);
      return new NextResponse("User not found", { status: 404 }); // Or 500 if user should always exist
    }

    const internalUserId = user.id; // This is the internal Supabase user ID

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', internalUserId); // <--- Use internalUserId here

    if (enrollmentsError) {
      console.error("[TEACHER_COURSES_GET] Error fetching enrollments:", enrollmentsError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const courseIds = enrollments.map((enrollment) => enrollment.course_id).filter(Boolean) as string[];

    if (courseIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: courses, error: coursesError } = await supabase
      .from('Course')
      .select('id, title, description, imageUrl') // Select specific columns needed by CourseList
      .in('id', courseIds); // Filter courses by courseIds

    if (coursesError) {
      console.error("[TEACHER_COURSES_GET] Error fetching courses:", coursesError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Transform the courses data to match the EnrolledCourse type expected by CourseList
    const enrolledCourses = courses.map(course => ({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
      },
      progressPercent: 0, // Placeholder
      completedModulesCount: 0, // Placeholder
      totalModules: 0, // Placeholder
    }));

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error("[TEACHER_COURSES_GET] Uncaught error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}