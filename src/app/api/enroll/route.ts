import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { courseId } = await req.json();

    if (!courseId) {
      return new NextResponse("Missing courseId", { status: 400 });
    }

    // Verify course exists
    const { data: courseData, error: courseError } = await supabase
      .from("Course")
      .select("id")
      .eq("id", courseId)
      .single();

    if (courseError || !courseData) {
      console.error("[API_ENROLL_POST] Course not found:", courseError);
      return new NextResponse(`Course with ID ${courseId} not found`, { status: 404 });
    }

    // Get the internal Supabase userId for the current user
    const { data: user, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("clerkId", clerkUserId)
      .single();

    if (userError || !user) {
      console.error("[API_ENROLL_POST] User not found:", userError);
      return new NextResponse("User not found", { status: 404 });
    }

    const internalUserId = user.id;

    // Check if enrollment already exists
    const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
      .from("Enrollment")
      .select("id")
      .eq("user_id", internalUserId)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollmentError && existingEnrollmentError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("[API_ENROLL_POST] Error checking existing enrollment:", existingEnrollmentError);
      return new NextResponse("Error checking existing enrollment", { status: 500 });
    }

    if (existingEnrollment) {
      return new NextResponse("Already enrolled in this course", { status: 409 });
    }

    // Insert new enrollment
    const { data: enrollment, error } = await supabase
      .from("Enrollment")
      .insert([
        { user_id: internalUserId, course_id: courseId }
      ])
      .select()
      .single();

    if (error) {
      console.error("[API_ENROLL_POST] Error creating enrollment:", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("[API_ENROLL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
