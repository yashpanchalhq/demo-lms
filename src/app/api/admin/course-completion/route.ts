import { NextResponse } from 'next/server';
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    console.log('Fetching course completion data...');
    const supabase = getSupabaseClient();

    const { data: courses, error: coursesError } = await supabase
      .from('Course')
      .select('id, title, createdAt')
      .order('createdAt', { ascending: true });

    if (coursesError) throw coursesError;
    console.log('Courses fetched:', courses.length);

    const { data: chapters, error: chaptersError } = await supabase
      .from('Chapter')
      .select('id, courseId');

    if (chaptersError) throw chaptersError;

    const { data: userProgress, error: userProgressError } = await supabase
      .from('UserProgress')
      .select('chapterId, isCompleted');

    if (userProgressError) throw userProgressError;

    const courseChapters = new Map<string, string[]>();
    for (const chapter of chapters) {
        if (!courseChapters.has(chapter.courseId)) {
            courseChapters.set(chapter.courseId, []);
        }
        courseChapters.get(chapter.courseId)!.push(chapter.id);
    }

    const completionData = courses.map((course) => {
      const chaptersOfCourse = courseChapters.get(course.id) || [];
      const progressOfCourse = userProgress.filter(p => chaptersOfCourse.includes(p.chapterId));
      const completedCount = progressOfCourse.filter(p => p.isCompleted).length;
      const totalCount = progressOfCourse.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      return {
        date: new Date(course.createdAt).toISOString().split('T')[0], // Format as YYYY-MM-DD
        completion: Math.round(completionRate),
      };
    });

    console.log('Completion data processed:', completionData.length);

    return NextResponse.json(completionData);
  } catch (error: any) { // Use 'any' for error type to access message
    console.error('Error fetching course completion data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}