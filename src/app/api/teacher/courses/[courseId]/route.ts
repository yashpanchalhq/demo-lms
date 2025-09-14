
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCourseWithModules } from "@/lib/teacher";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

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
