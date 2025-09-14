import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const teacherId = params.id;

    // Fetch teacher details
    const { data: teacher, error: teacherError } = await supabase
      .from('User')
      .select('id, email, role')
      .eq('id', teacherId)
      .single();

    if (teacherError || !teacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    // Fetch enrollments for this teacher
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('Enrollment')
      .select('courseId, status')
      .eq('userId', teacherId);

    if (enrollmentsError) {
      console.error("[API_REPORTS_TEACHER_PROGRESS] Enrollments Error:", enrollmentsError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const enrollmentsWithDetails = [];

    for (const enrollment of enrollments) {
      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from('Course')
        .select('id, title')
        .eq('id', enrollment.courseId)
        .single();

      if (courseError || !course) {
        console.warn(`Course ${enrollment.courseId} not found for enrollment.`);
        continue;
      }

      // Fetch chapters for the course
      const { data: chapters, error: chaptersError } = await supabase
        .from('Chapter')
        .select('id, title')
        .eq('courseId', course.id)
        .order('position', { ascending: true });

      if (chaptersError) {
        console.error("[API_REPORTS_TEACHER_PROGRESS] Chapters Error:", chaptersError);
        continue;
      }

      const modulesProgress = [];
      let completedChaptersCount = 0;

      for (const chapter of chapters) {
        // Fetch user progress for this chapter and teacher
        const { data: userProgress, error: userProgressError } = await supabase
          .from('UserProgress')
          .select('isCompleted')
          .eq('userId', teacherId)
          .eq('chapterId', chapter.id)
          .single();

        if (userProgressError && userProgressError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("[API_REPORTS_TEACHER_PROGRESS] UserProgress Error:", userProgressError);
          continue;
        }

        const isCompleted = userProgress?.isCompleted || false;
        if (isCompleted) {
          completedChaptersCount++;
        }

        modulesProgress.push({
          module: chapter.title, // Using chapter title as module name
          completion: isCompleted ? 100 : 0,
          quizAttempts: 0, // Placeholder
          quizScore: null, // Placeholder
        });
      }

      const courseProgress = chapters.length > 0 ? (completedChaptersCount / chapters.length) * 100 : 0;

      enrollmentsWithDetails.push({
        course: course.title,
        status: enrollment.status,
        progress: Math.round(courseProgress),
        modules: modulesProgress,
      });
    }

    return NextResponse.json({
      teacherId: teacher.id,
      name: teacher.email, // Using email as name
      email: teacher.email,
      role: teacher.role,
      enrollments: enrollmentsWithDetails,
    });
  } catch (error) {
    console.error("[API_REPORTS_TEACHER_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}