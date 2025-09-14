import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const courseIdFilter = searchParams.get('courseId');
    const teacherIdFilter = searchParams.get('teacherId');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) endDate = new Date(endDateParam);

    // 1. Fetch all relevant courses
    let coursesQuery = supabase.from('Course').select('id, title');
    if (courseIdFilter) coursesQuery = coursesQuery.eq('id', courseIdFilter);
    const { data: courses, error: coursesError } = await coursesQuery;
    if (coursesError) {
      console.error("[API_REPORTS_COMPLETION_BY_COURSE] Courses Error:", coursesError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const courseMap = new Map(courses.map(c => [c.id, c]));

    // 2. Fetch all relevant chapters
    let chaptersQuery = supabase.from('Chapter').select('id, courseId');
    if (courseIdFilter) chaptersQuery = chaptersQuery.in('courseId', courses.map(c => c.id)); // Filter chapters by fetched courses
    const { data: chapters, error: chaptersError } = await chaptersQuery;
    if (chaptersError) {
      console.error("[API_REPORTS_COMPLETION_BY_COURSE] Chapters Error:", chaptersError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const chapterCourseMap = new Map(chapters.map(ch => [ch.id, ch.courseId]));
    const courseChapterIdsMap = new Map<string, string[]>();
    chapters.forEach(ch => {
      if (!courseChapterIdsMap.has(ch.courseId)) {
        courseChapterIdsMap.set(ch.courseId, []);
      }
      courseChapterIdsMap.get(ch.courseId)?.push(ch.id);
    });

    // 3. Fetch all relevant user progress
    let userProgressQuery = supabase.from('UserProgress').select('isCompleted, chapterId, userId, createdAt');
    if (teacherIdFilter) userProgressQuery = userProgressQuery.eq('userId', teacherIdFilter);
    if (startDate) userProgressQuery = userProgressQuery.gte('createdAt', startDate.toISOString());
    if (endDate) userProgressQuery = userProgressQuery.lte('createdAt', endDate.toISOString());
    
    // Filter user progress by chapters that belong to the fetched courses
    const allChapterIds = chapters.map(ch => ch.id);
    if (allChapterIds.length > 0) {
        userProgressQuery = userProgressQuery.in('chapterId', allChapterIds);
    } else {
        // If no chapters, no progress can exist for these courses
        return NextResponse.json([]);
    }

    const { data: userProgress, error: userProgressError } = await userProgressQuery;
    if (userProgressError) {
      console.error("[API_REPORTS_COMPLETION_BY_COURSE] UserProgress Error:", userProgressError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Process data in memory
    const courseCompletionStats = new Map<string, { completed: number; total: number }>();

    userProgress.forEach(progress => {
      const courseId = chapterCourseMap.get(progress.chapterId);
      if (courseId) {
        if (!courseCompletionStats.has(courseId)) {
          courseCompletionStats.set(courseId, { completed: 0, total: 0 });
        }
        const stats = courseCompletionStats.get(courseId)!;
        stats.total++;
        if (progress.isCompleted) {
          stats.completed++;
        }
      }
    });

    const completionData = courses.map(course => {
      const stats = courseCompletionStats.get(course.id);
      const completion = stats && stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      return { course: course.title, completion: Math.round(completion) };
    });

    return NextResponse.json(completionData);
  } catch (error) {
    console.error("[API_REPORTS_COMPLETION_BY_COURSE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
