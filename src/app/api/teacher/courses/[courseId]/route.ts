
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCourseWithModules } from "@/lib/teacher";

export async function GET(
  request: Request,
  context: any // Using any as a temporary workaround
) {
  try {
    const { userId } = await auth();
    const { courseId } = context.params; // Corrected access to courseId

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseData = await getCourseWithModules(courseId, userId);

    if (!courseData) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(courseData);
  } catch (error) {
    console.log("[TEACHER_COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
