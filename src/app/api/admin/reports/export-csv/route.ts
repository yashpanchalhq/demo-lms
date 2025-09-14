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
    const statusFilter = searchParams.get('status');
    const groupBy = searchParams.get('groupBy') || 'course';

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) endDate = new Date(endDateParam);

    let reportsData: any[] = [];

    if (groupBy === 'course') {
      let coursesQuery = supabase.from('Course').select('id, title');
      if (courseIdFilter) coursesQuery = coursesQuery.eq('id', courseIdFilter);
      const { data: courses, error: coursesError } = await coursesQuery;
      if (coursesError) {
        console.error("[API_REPORTS_EXPORT_CSV] Courses Error:", coursesError);
        return new NextResponse("Internal Error", { status: 500 });
      }

      for (const course of courses) {
        // Enrolled Teachers
        let enrolledTeachersQuery = supabase.from('Enrollment').select('userId', { count: 'exact' }).eq('courseId', course.id);
        if (startDate) enrolledTeachersQuery = enrolledTeachersQuery.gte('createdAt', startDate.toISOString());
        if (endDate) enrolledTeachersQuery = enrolledTeachersQuery.lte('createdAt', endDate.toISOString());
        if (teacherIdFilter) enrolledTeachersQuery = enrolledTeachersQuery.eq('userId', teacherIdFilter);
        if (statusFilter) enrolledTeachersQuery = enrolledTeachersQuery.eq('status', statusFilter);
        const { count: enrolledTeachers } = await enrolledTeachersQuery;

        // Certificates Issued
        let certificatesIssuedQuery = supabase.from('Certificate').select('id', { count: 'exact' }).eq('courseId', course.id);
        if (startDate) certificatesIssuedQuery = certificatesIssuedQuery.gte('issuedAt', startDate.toISOString());
        if (endDate) certificatesIssuedQuery = certificatesIssuedQuery.lte('issuedAt', endDate.toISOString());
        if (teacherIdFilter) certificatesIssuedQuery = certificatesIssuedQuery.eq('userId', teacherIdFilter);
        const { count: certificatesIssued } = await certificatesIssuedQuery;

        // Placeholders for Avg Completion %, Completed Count, Last Activity
        const avgCompletion = 0;
        const completedCount = 0;
        const lastActivity = "N/A";

        reportsData.push({
          course: course.title,
          enrolledTeachers,
          avgCompletion,
          completedCount,
          certificatesIssued,
          lastActivity,
        });
      }
    } else if (groupBy === 'teacher') {
      // For groupBy teacher, fetch users and their relevant stats
      let usersQuery = supabase.from('User').select('id, email, role');
      if (teacherIdFilter) usersQuery = usersQuery.eq('id', teacherIdFilter);
      const { data: users, error: usersError } = await usersQuery;
      if (usersError) {
        console.error("[API_REPORTS_EXPORT_CSV] Users Error:", usersError);
        return new NextResponse("Internal Error", { status: 500 });
      }

      for (const user of users) {
        // Enrolled Courses for this teacher
        let enrolledCoursesQuery = supabase.from('Enrollment').select('courseId', { count: 'exact' }).eq('userId', user.id);
        if (startDate) enrolledCoursesQuery = enrolledCoursesQuery.gte('createdAt', startDate.toISOString());
        if (endDate) enrolledCoursesQuery = enrolledCoursesQuery.lte('createdAt', endDate.toISOString());
        if (courseIdFilter) enrolledCoursesQuery = enrolledCoursesQuery.eq('courseId', courseIdFilter);
        if (statusFilter) enrolledCoursesQuery = enrolledCoursesQuery.eq('status', statusFilter);
        const { count: enrolledCourses } = await enrolledCoursesQuery;

        // Certificates Issued for this teacher
        let certificatesIssuedQuery = supabase.from('Certificate').select('id', { count: 'exact' }).eq('userId', user.id);
        if (startDate) certificatesIssuedQuery = certificatesIssuedQuery.gte('issuedAt', startDate.toISOString());
        if (endDate) certificatesIssuedQuery = certificatesIssuedQuery.lte('issuedAt', endDate.toISOString());
        if (courseIdFilter) certificatesIssuedQuery = certificatesIssuedQuery.eq('courseId', courseIdFilter);
        const { count: certificatesIssued } = await certificatesIssuedQuery;

        // Placeholders for Avg Completion %, Completed Courses Count, Last Activity
        const avgCompletion = 0;
        const completedCoursesCount = 0;
        const lastActivity = "N/A";

        reportsData.push({
          teacher: user.email, // Using email as teacher name
          enrolledCourses,
          avgCompletion,
          completedCoursesCount,
          certificatesIssued,
          lastActivity,
        });
      }
    }

    // Generate CSV content
    if (reportsData.length === 0) {
      return new NextResponse("No data to export", { status: 204 });
    }

    const headers = Object.keys(reportsData[0]).join(',');
    const csvRows = reportsData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="reports.csv"',
      },
    });
  } catch (error) {
    console.error("[API_REPORTS_EXPORT_CSV]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}