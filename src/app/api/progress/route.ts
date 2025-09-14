
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";
import { markModuleComplete, isCourseCompletedByUser, createCertificate } from "@/lib/teacher";

const supabase = getSupabaseClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    const { moduleId } = await request.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!moduleId) {
      return new NextResponse("Module ID missing", { status: 400 });
    }

    // Mark the module as complete
    const progress = await markModuleComplete(userId, moduleId);

    // Check if the course is now completed
    const { data: moduleData } = await supabase
      .from("Chapter")
      .select("courseId")
      .eq("id", moduleId)
      .single();

    if (!moduleData) {
      return new NextResponse("Module not found", { status: 404 });
    }

    const { courseId } = moduleData;
    const courseCompleted = await isCourseCompletedByUser(courseId, userId);

    let certificate = null;
    if (courseCompleted) {
      // Check if a certificate already exists
      const { data: existingCert } = await supabase
        .from("Certificate")
        .select("id")
        .eq("userId", userId)
        .eq("courseId", courseId)
        .maybeSingle();

      if (!existingCert) {
        certificate = await createCertificate(userId, courseId, undefined, "System");
      }
    }

    return NextResponse.json({ progress, courseCompleted, certificate });
  } catch (error) {
    console.log("[PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
