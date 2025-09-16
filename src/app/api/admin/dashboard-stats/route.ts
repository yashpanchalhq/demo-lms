import { NextResponse } from 'next/server';
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    if (endDateParam) {
      endDate = new Date(endDateParam);
    }

    // Total counts
    let totalTeachersQuery = supabase.from('User').select('id', { count: 'exact' }).eq('role', 'TEACHER');
    if (startDate) totalTeachersQuery = totalTeachersQuery.gte('createdAt', startDate.toISOString());
    if (endDate) totalTeachersQuery = totalTeachersQuery.lte('createdAt', endDate.toISOString());
    const { count: totalTeachers } = await totalTeachersQuery;

    let activeCoursesQuery = supabase.from('Course').select('id', { count: 'exact' });
    if (startDate) activeCoursesQuery = activeCoursesQuery.gte('createdAt', startDate.toISOString());
    if (endDate) activeCoursesQuery = activeCoursesQuery.lte('createdAt', endDate.toISOString());
    const { count: activeCourses } = await activeCoursesQuery;

    // Certificates Issued (assuming 'Certificate' table exists and has 'issuedAt')
    let certificatesIssuedQuery = supabase.from('Certificate').select('id', { count: 'exact' });
    if (startDate) certificatesIssuedQuery = certificatesIssuedQuery.gte('issuedAt', startDate.toISOString());
    if (endDate) certificatesIssuedQuery = certificatesIssuedQuery.lte('issuedAt', endDate.toISOString());
    const { count: certificatesIssued } = await certificatesIssuedQuery;

    // KPI Row data
    let inProgressCountQuery = supabase.from('Enrollment').select('id', { count: 'exact' }).eq('status', 'in_progress');
    if (startDate) inProgressCountQuery = inProgressCountQuery.gte('createdAt', startDate.toISOString());
    if (endDate) inProgressCountQuery = inProgressCountQuery.lte('createdAt', endDate.toISOString());
    const { count: inProgressCount } = await inProgressCountQuery;

    let notStartedCountQuery = supabase.from('Enrollment').select('id', { count: 'exact' }).eq('status', 'not_started');
    if (startDate) notStartedCountQuery = notStartedCountQuery.gte('createdAt', startDate.toISOString());
    if (endDate) notStartedCountQuery = notStartedCountQuery.lte('createdAt', endDate.toISOString());
    const { count: notStartedCount } = await notStartedCountQuery;

    // Avg Completion Percentage
    let userProgressQuery = supabase.from('UserProgress').select('isCompleted', { count: 'exact' });
    if (startDate) userProgressQuery = userProgressQuery.gte('createdAt', startDate.toISOString());
    if (endDate) userProgressQuery = userProgressQuery.lte('createdAt', endDate.toISOString());
    const { data: userProgressData, count: totalUserProgress } = await userProgressQuery;

    const completedUserProgress = userProgressData?.filter(p => p.isCompleted).length || 0;
    const avgCompletionPercentage = (totalUserProgress !== null && totalUserProgress > 0) ? (completedUserProgress / totalUserProgress) * 100 : 0;

    // Trend data (new in the specified range)
    let newTeachersQuery = supabase.from('User').select('id', { count: 'exact' }).eq('role', 'TEACHER');
    if (startDate) newTeachersQuery = newTeachersQuery.gte('createdAt', startDate.toISOString());
    if (endDate) newTeachersQuery = newTeachersQuery.lte('createdAt', endDate.toISOString());
    const { count: newTeachers } = await newTeachersQuery;

    let newCoursesQuery = supabase.from('Course').select('id', { count: 'exact' });
    if (startDate) newCoursesQuery = newCoursesQuery.gte('createdAt', startDate.toISOString());
    if (endDate) newCoursesQuery = newCoursesQuery.lte('createdAt', endDate.toISOString());
    const { count: newCourses } = await newCoursesQuery;

    // Placeholder for quizzesPassedRate and avgTimeToCompletion
    const quizzesPassedRate = 85;
    const avgTimeToCompletion = "30 days";

    // Calculate percentage change for trends. Avoid division by zero.
    const actualNewTeachers = newTeachers ?? 0;
    const actualTotalTeachers = totalTeachers ?? 0;
    const denominator = actualTotalTeachers - actualNewTeachers;
    const teacherTrend = (actualTotalTeachers > 0 && denominator > 0)
      ? Math.round((actualNewTeachers / denominator) * 100)
      : 0;
    const actualNewCourses = newCourses ?? 0;
    const actualActiveCourses = activeCourses ?? 0;
    const courseDenominator = actualActiveCourses - actualNewCourses;
    const courseTrend = (actualActiveCourses > 0 && courseDenominator > 0)
      ? Math.round((actualNewCourses / courseDenominator) * 100)
      : 0;

    return NextResponse.json({
      totalTeachers,
      activeCourses,
      avgCompletionPercentage,
      certificatesIssued,
      inProgressCount,
      notStartedCount,
      quizzesPassedRate,
      avgTimeToCompletion,
      teacherTrend: isFinite(teacherTrend) ? teacherTrend : 100,
      courseTrend: isFinite(courseTrend) ? courseTrend : 100,
      completionRateTrend: 0, // Placeholder
      certificateTrend: 0, // Placeholder
      newTeachers,
      newCourses,
      newCertificates: 0, // Placeholder
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}