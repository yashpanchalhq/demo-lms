import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-client";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.publicMetadata.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { teacherId } = await req.json();

    if (!teacherId) {
      return new NextResponse("Teacher ID is required", { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("course_enrollments")
      .update({ progress: 0 })
      .eq("user_id", teacherId);

    if (error) {
      console.error("Error resetting progress:", error);
      return new NextResponse("Error resetting progress", { status: 500 });
    }

    return NextResponse.json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error("[TEACHERS_RESET_PROGRESS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}