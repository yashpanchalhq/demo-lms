
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getTeacherCourses } from "@/lib/teacher-courses";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courses = await getTeacherCourses(userId);

    return NextResponse.json(courses);
  } catch (error) {
    console.log("[TEACHER_COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
