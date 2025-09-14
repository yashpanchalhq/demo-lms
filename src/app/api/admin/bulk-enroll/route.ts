import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { checkRole } from "@/utils/roles";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Check if the requesting user is an admin
    if (!checkRole("admin")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { enrollments: enrollmentData } = await req.json();

    if (!Array.isArray(enrollmentData) || enrollmentData.length === 0) {
      return new NextResponse("Invalid or empty enrollment data", { status: 400 });
    }

    const successfulEnrollments: any[] = [];
    const failedEnrollments: any[] = [];

    for (const entry of enrollmentData) {
      const { teacherClerkId, courseId } = entry;

      if (!teacherClerkId || !courseId) {
        failedEnrollments.push({ ...entry, reason: "Missing teacherClerkId or courseId" });
        continue;
      }

      // Get the internal Supabase userId for the teacher
      const { data: teacherUser, error: teacherUserError } = await supabase
        .from("User")
        .select("id")
        .eq("clerkId", teacherClerkId)
        .single();

      if (teacherUserError || !teacherUser) {
        failedEnrollments.push({ ...entry, reason: "Teacher user not found" });
        continue;
      }

      const internalTeacherId = teacherUser.id;

      // Check if enrollment already exists
      const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("userId", internalTeacherId)
        .eq("courseId", courseId)
        .single();

      if (existingEnrollmentError && existingEnrollmentError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("[API_ADMIN_BULK_ENROLL_POST] Error checking existing enrollment:", existingEnrollmentError);
        failedEnrollments.push({ ...entry, reason: "Error checking existing enrollment" });
        continue;
      }

      if (existingEnrollment) {
        failedEnrollments.push({ ...entry, reason: "Teacher already enrolled in this course" });
        continue;
      }

      // Insert new enrollment
      const { data: enrollment, error } = await supabase
        .from("enrollments")
        .insert([
          { userId: internalTeacherId, courseId: courseId }
        ])
        .select()
        .single();

      if (error) {
        console.error("[API_ADMIN_BULK_ENROLL_POST] Error creating enrollment:", error);
        failedEnrollments.push({ ...entry, reason: "Error creating enrollment" });
        continue;
      }
      successfulEnrollments.push(enrollment);
    }

    return NextResponse.json({ successfulEnrollments, failedEnrollments }, { status: 200 });
  } catch (error) {
    console.error("[API_ADMIN_BULK_ENROLL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
