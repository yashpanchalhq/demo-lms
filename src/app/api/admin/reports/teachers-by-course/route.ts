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

    // 1. Fetch all relevant data
    const [
      { data: courses, error: coursesError },
      { data: users, error: usersError },
      { data: enrollments, error: enrollmentsError },
      { data: userProgress, error: userProgressError },
      { data: certificates, error: certificatesError },
      { data: chapters, error: chaptersError },
    ] = await Promise.all([
      (async () => {
        let q = supabase.from('Course').select('id, title');
        if (courseIdFilter) q = q.eq('id', courseIdFilter);
        return q.limit(1000); // Limit to avoid fetching too much data
      })(),
      (async () => {
        let q = supabase.from('User').select('id, email');
        if (teacherIdFilter) q = q.eq('id', teacherIdFilter);
        return q.limit(1000);
      })(),
      (async () => {
        let q = supabase.from('Enrollment').select('userId, courseId, status, createdAt');
        if (startDate) q = q.gte('createdAt', startDate.toISOString());
        if (endDate) q = q.lte('createdAt', endDate.toISOString());
        if (courseIdFilter) q = q.eq('courseId', courseIdFilter);
        if (teacherIdFilter) q = q.eq('userId', teacherIdFilter);
        if (statusFilter) q = q.eq('status', statusFilter);
        return q.limit(1000); // Limit to avoid fetching too much data
      })(),
      (async () => {
        let q = supabase.from('UserProgress').select('userId, chapterId, isCompleted, createdAt');
        if (startDate) q = q.gte('createdAt', startDate.toISOString());
        if (endDate) q = q.lte('createdAt', endDate.toISOString());
        if (teacherIdFilter) q = q.eq('userId', teacherIdFilter);
        return q.limit(1000); // Limit to avoid fetching too much data
      })(),
      (async () => {
        let q = supabase.from('Certificate').select('userId, courseId, issuedAt');
        if (startDate) q = q.gte('issuedAt', startDate.toISOString());
        if (endDate) q = q.lte('issuedAt', endDate.toISOString());
        if (courseIdFilter) q = q.eq('courseId', courseIdFilter);
        if (teacherIdFilter) q = q.eq('userId', teacherIdFilter);
        return q.limit(1000); // Limit to avoid fetching too much data
      })(),
      (async () => {
        let q = supabase.from('Chapter').select('id, courseId');
        if (courseIdFilter) q = q.eq('courseId', courseIdFilter);
        return q.limit(1000); // Limit to avoid fetching too much data
      })(),
    ]);

    if (coursesError || usersError || enrollmentsError || userProgressError || certificatesError || chaptersError) {
      console.error("[API_REPORTS_TEACHERS_BY_COURSE] Data Fetch Error:", coursesError || usersError || enrollmentsError || userProgressError || certificatesError || chaptersError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const courseMap = new Map(courses.map(c => [c.id, c]));
    const userMap = new Map(users.map(u => [u.id, u]));
    const chapterCourseMap = new Map(chapters.map(ch => [ch.id, ch.courseId]));

    const reportsData = [];

    if (groupBy === 'course') {
      for (const course of courses) {
        const courseEnrollments = enrollments.filter(e => e.courseId === course.id);
        const courseUserProgress = userProgress.filter(up => {
          const chapterCourseId = chapterCourseMap.get(up.chapterId);
          return chapterCourseId === course.id;
        });
        const courseCertificates = certificates.filter(cert => cert.courseId === course.id);

        // Enrolled Teachers
        const enrolledTeachers = new Set(courseEnrollments.map(e => e.userId)).size;

        // Avg Completion %
        let totalCompletion = 0;
        let totalProgressRecords = 0;
        courseUserProgress.forEach(up => {
          totalProgressRecords++;
          if (up.isCompleted) {
            totalCompletion++;
          }
        });
        const avgCompletion = totalProgressRecords > 0 ? (totalCompletion / totalProgressRecords) * 100 : 0;

        // Completed Count (users who completed all chapters of this course)
        const completedUsersInCourse = new Set<string>();
        const courseChapters = chapters.filter(ch => ch.courseId === course.id);
        const totalChaptersInCourse = courseChapters.length;

        if (totalChaptersInCourse > 0) {
          const usersWithProgressInCourse = new Set(courseUserProgress.map(up => up.userId));
          for (const userId of usersWithProgressInCourse) {
            const userCompletedChapters = courseUserProgress.filter(up => up.userId === userId && up.isCompleted);
            if (userCompletedChapters.length === totalChaptersInCourse) {
              completedUsersInCourse.add(userId);
            }
          }
        }
        const completedCount = completedUsersInCourse.size;

        // Certificates Issued
        const certificatesIssued = courseCertificates.length;

        // Last Activity (max createdAt from userProgress for this course)
        const lastActivity = courseUserProgress.length > 0
          ? new Date(Math.max(...courseUserProgress.map(up => new Date(up.createdAt).getTime()))).toISOString()
          : "N/A";

        reportsData.push({
          course: course.title,
          enrolledTeachers,
          avgCompletion: Math.round(avgCompletion),
          completedCount,
          certificatesIssued,
          lastActivity,
        });
      }
    } else if (groupBy === 'teacher') {
      for (const user of users) {
        const teacherEnrollments = enrollments.filter(e => e.userId === user.id);
        const teacherUserProgress = userProgress.filter(up => up.userId === user.id);
        const teacherCertificates = certificates.filter(cert => cert.userId === user.id);

        // Enrolled Courses
        const enrolledCourses = new Set(teacherEnrollments.map(e => e.courseId)).size;

        // Avg Completion % (for this teacher across all their enrollments)
        let teacherTotalCompletion = 0;
        let teacherTotalProgressRecords = 0;
        teacherUserProgress.forEach(up => {
          teacherTotalProgressRecords++;
          if (up.isCompleted) {
            teacherTotalCompletion++;
          }
        });
        const avgCompletion = teacherTotalProgressRecords > 0 ? (teacherTotalCompletion / teacherTotalProgressRecords) * 100 : 0;

        // Completed Courses Count (courses where this teacher completed all chapters) and Last Activity
        const completedCoursesCount = new Set<string>();
        const teacherEnrolledCourseIds = new Set(teacherEnrollments.map(e => e.courseId));

        for (const courseId of teacherEnrolledCourseIds) {
          const courseChapters = chapters.filter(ch => ch.courseId === courseId);
          const totalChaptersInCourse = courseChapters.length;

          if (totalChaptersInCourse > 0) {
            const userCompletedChaptersInCourse = teacherUserProgress.filter(up => {
              const chapterCourseId = chapterCourseMap.get(up.chapterId);
              return chapterCourseId === courseId && up.isCompleted;
            });
            if (userCompletedChaptersInCourse.length === totalChaptersInCourse) {
              completedCoursesCount.add(courseId);
            }
          }
        }
        const completedCoursesCountSize = completedCoursesCount.size;

        // Certificates Issued
        const certificatesIssued = teacherCertificates.length;

        // Last Activity (max createdAt from userProgress for this teacher)
        const lastActivity = teacherUserProgress.length > 0
          ? new Date(Math.max(...teacherUserProgress.map(up => new Date(up.createdAt).getTime()))).toISOString()
          : "N/A";

        reportsData.push({
          teacher: user.email,
          enrolledCourses,
          avgCompletion: Math.round(avgCompletion),
          completedCoursesCount: completedCoursesCountSize,
          certificatesIssued,
          lastActivity,
        });
      }
    }

    return NextResponse.json(reportsData);
  } catch (error) {
    console.error("[API_REPORTS_TEACHERS_BY_COURSE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
