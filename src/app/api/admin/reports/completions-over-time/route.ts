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

    let userProgressQuery = supabase
      .from('UserProgress')
      .select('createdAt, chapterId, userId')
      .eq('isCompleted', true);

    if (startDate) userProgressQuery = userProgressQuery.gte('createdAt', startDate.toISOString());
    if (endDate) userProgressQuery = userProgressQuery.lte('createdAt', endDate.toISOString());

    if (teacherIdFilter) {
      userProgressQuery = userProgressQuery.eq('userId', teacherIdFilter);
    }

    if (courseIdFilter) {
      const { data: chapters, error: chaptersError } = await supabase
        .from('Chapter')
        .select('id')
        .eq('courseId', courseIdFilter);

      if (chaptersError) {
        console.error("[API_REPORTS_COMPLETIONS_OVER_TIME] Chapters Error:", chaptersError);
        return new NextResponse("Internal Error", { status: 500 });
      }
      const chapterIds = chapters.map(c => c.id);
      if (chapterIds.length === 0) {
        return NextResponse.json([]); // No completions if no chapters
      }
      userProgressQuery = userProgressQuery.in('chapterId', chapterIds);
    }

    const { data: completedProgress, error: progressError } = await userProgressQuery;

    if (progressError) {
      console.error("[API_REPORTS_COMPLETIONS_OVER_TIME] Progress Error:", progressError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Group by date
    const completionsByDate: { [key: string]: number } = {};
    completedProgress.forEach(progress => {
      const date = new Date(progress.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      completionsByDate[date] = (completionsByDate[date] || 0) + 1;
    });

    const data = Object.keys(completionsByDate).map(date => ({
      date,
      completions: completionsByDate[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_REPORTS_COMPLETIONS_OVER_TIME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}