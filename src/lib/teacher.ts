import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";
import { getSupabaseClient } from "./supabase";
export type Course = Database["public"]["Tables"]["Course"]["Row"];
export type Chapter = Database["public"]["Tables"]["Chapter"]["Row"];
export type ChapterWithAllDetails = Chapter & {
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};
type User = Database["public"]["Tables"]["User"]["Row"];
type ChapterIdSelect = { id: string };
type UserProgressChapterIdSelect = { chapterId: string };
type EnrollmentCourseIdSelect = { courseId: string };
type CourseChapterSelect = Chapter & {
  course: {
    id: string;
    title: string;
  };
};

const supabase = getSupabaseClient();

// Assuming table names are plural: courses, modules, enrollments, progress, certificates

export async function getEnrolledCourses(userId: string) {
  // 1. Get user's internal UUID
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId) // Assuming input userId is clerkId
    .single<User>();

  if (userError || !user) {
    return [];
  }
  const internalUserId = user.id;

  // 2. Define the expected shape
  type EnrollmentWithCourse = {
    course: Course & {
      modules: Chapter[];
    };
  };

  // 3. Get enrollments and join Course and Chapters
  const { data: enrollments, error } = await supabase
    .from("Enrollment")
    .select(`
      *,
      course:Course (
        *,
        modules:Chapter (*)
      )
    `)
    .eq("userId", internalUserId)
    .returns<EnrollmentWithCourse[]>();

  if (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
  if (!enrollments) return [];

  // 4. Calculate progress for each course
  const results = await Promise.all(
    enrollments.map(async (e) => {
      const course = e.course;
      if (!course) return null;

      const modules = course.modules || [];
      const totalModules = modules.length;
      let completed = 0;

      if (totalModules > 0) {
        const { count, error: countError } = await supabase
          .from("UserProgress")
          .select("chapterId", { count: "exact", head: true })
          .eq("userId", internalUserId)
          .eq("isCompleted", true)
          .in(
            "chapterId",
            modules.map((m) => m.id),
          );

        if (countError) {
          console.error("Error fetching progress count:", countError);
        } else {
          completed = count ?? 0;
        }
      }

      const percent =
        totalModules === 0 ? 0 : Math.round((completed / totalModules) * 100);

      return {
        course: course,
        progressPercent: percent,
        completedModulesCount: completed,
        totalModules,
      };
    }),
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function getCourseWithModules(courseId: string, userId: string) {
  // 1. Get user's internal UUID
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId)
    .single<User>();

  if (userError || !user) {
    console.error("Could not find user", userError);
    return null;
  }
  const internalUserId = user.id;

  // 2. Define the expected return type from the query
  type ChapterWithVideo = Chapter & {
    "videoUrl": string | null; // Add videoUrl to Chapter type
  };

  type CourseWithModules = Course & {
    modules: ChapterWithVideo[]; // Use ChapterWithVideo
  };

  // 3. Get course data with chapters, and explicitly type the result
  const { data: courseData, error: courseError } = await supabase
    .from("Course")
    .select(`
      *,
      modules:Chapter(
        id,
        title,
        description,
        "videoUrl",
        position,
        "isPublished",
        "isFree",
        "courseId",
        "createdAt",
        "updatedAt"
      )
    `)
    .eq("id", courseId)
    .single<CourseWithModules>();

  if (courseError) {
    console.error("Error fetching course:", courseError);
    return null;
  }
  if (!courseData) return null;

  // 4. Transform modules to match the expected Module type in CoursePlayerPage
  const modules = courseData.modules || [];
  modules.sort((a, b) => a.position - b.position);

  const transformedModules = modules.map(m => ({
    id: m.id,
    title: m.title,
    content: m.videoUrl, // Map videoUrl to content
    moduleType: m.videoUrl ? "VIDEO" : "TEXT", // Infer moduleType
    quizQuestions: null, // Placeholder, assuming no direct quiz questions in Chapter
    progress: null, // Will be populated later
  }));

  const moduleIds = transformedModules.map((m) => m.id);

  // 5. Get user progress for these modules
  type UserProgressSelect = {
    chapterId: string;
    isCompleted: boolean;
    updatedAt: string;
  };

  const { data: progress, error: progressError } = await supabase
    .from("UserProgress")
    .select("chapterId, isCompleted, updatedAt")
    .eq("userId", internalUserId)
    .in("chapterId", moduleIds)
    .returns<UserProgressSelect[]>();

  if (progressError) {
    console.error("Error fetching progress:", progressError);
  }

  const progressMap = new Map(progress?.map((p) => [p.chapterId, p]) ?? []);
  const modulesWithProgress = transformedModules.map((m) => ({
    ...m,
    progress: progressMap.get(m.id) ?? null,
  }));

  return { course: courseData, modules: modulesWithProgress };
}

export async function markModuleComplete(userId: string, moduleId: string) {
  // 1. Get user's internal UUID first (like in your other functions)
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId) // Assuming userId is the Clerk ID
    .single<User>();

  if (userError || !user) {
    console.error("Could not find user", userError);
    return null;
  }
  const internalUserId = user.id;

  // 2. Now use the internal userId for the UserProgress table
  const typedSupabase = supabase as SupabaseClient<Database>;

  const { data, error } = await typedSupabase
    .from("UserProgress")
    .upsert(
      {
        userId: internalUserId, // Use internal UUID instead of Clerk ID
        chapterId: moduleId,
        isCompleted: true,
      } as Database["public"]["Tables"]["UserProgress"]["Insert"],
      { onConflict: "userId,chapterId" },
    )
    .select();

  if (error) {
    console.error("Error upserting progress:", error);
    return null;
  }
  return data;
}

// check if all modules completed for course and, if so, return true
export async function isCourseCompletedByUser(
  courseId: string,
  userId: string,
) {
  // 1. Get user's internal UUID first
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId)
    .single<User>();

  if (userError || !user) {
    console.error("Could not find user", userError);
    return false;
  }
  const internalUserId = user.id;

  // 2. Get total module count
  const { count: total, error: totalError } = await supabase
    .from("Chapter")
    .select("id", { count: "exact", head: true })
    .eq("courseId", courseId);

  if (totalError) {
    console.error("Error counting modules:", totalError);
    return false;
  }
  if (total === 0 || total === null) return false;

  // 3. Get module IDs
  const { data: modules, error: modulesError } = await supabase
    .from("Chapter")
    .select("id")
    .eq("courseId", courseId)
    .returns<ChapterIdSelect[]>();

  if (modulesError) {
    console.error("Error fetching module ids:", modulesError);
    return false;
  }
  const moduleIds = modules.map((m) => m.id);

  // 4. Count completed modules using internal user ID
  const { count: completed, error: completedError } = await supabase
    .from("UserProgress")
    .select("chapterId", { count: "exact", head: true })
    .eq("userId", internalUserId) // Use internal UUID
    .eq("isCompleted", true)
    .in("chapterId", moduleIds);

  if (completed === null) return false;

  return completed >= total;
}

// create certificate record (fileUrl can be created later)
export async function createCertificate(
  userId: string,
  courseId: string,
  fileUrl?: string,
  issuedBy?: string,
) {
  const { data, error } = await supabase
    .from("Certificate")
    .insert({
      userId,
      courseId,
      certificateUrl: fileUrl ?? null,
      issuedBy: issuedBy ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating certificate:", error);
    return null;
  }
  return data;
}

export async function getNextPendingModules(userId: string, limit: number) {
  // Placeholder: In a real application, this would query the database
  // to find modules that are not yet completed by the user.
  console.log(`Fetching next ${limit} pending modules for user ${userId}`);
  return [
    {
      id: "mod1",
      title: "Introduction to React",
      courseTitle: "Web Dev Basics",
    },
    { id: "mod2", title: "Advanced CSS", courseTitle: "Frontend Masterclass" },
    { id: "mod3", title: "Database Fundamentals", courseTitle: "Backend Dev" },
  ];
}

export async function getRecentActivity(userId: string, limit: number) {
  // Placeholder: In a real application, this would query recent progress, quiz attempts, etc.
  console.log(`Fetching last ${limit} recent activities for user ${userId}`);
  return [
    {
      id: "act1",
      description: "Completed 'Module 1' in 'Course A'",
      timestamp: new Date().toISOString(),
    },
    {
      id: "act2",
      description: "Attempted 'Quiz 2' in 'Course B'",
      timestamp: new Date().toISOString(),
    },
    {
      id: "act3",
      description: "Received certificate for 'Course C'",
      timestamp: new Date().toISOString(),
    },
  ];
}

export async function getInProgressModules(
  userId: string,
  page: number,
  limit: number,
) {
  const supabase = getSupabaseClient();

  // 1. Get the user's internal UUID from their Clerk ID
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("clerkId", userId)
    .single();

  if (userError || !user) {
    console.error("Could not find user", userError);
    return { total: 0, items: [] };
  }
  const internalUserId = user.id;

  // 2. Get all courses the user is enrolled in.
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("Enrollment")
    .select("courseId")
    .eq("userId", internalUserId)
    .returns<EnrollmentCourseIdSelect[]>();

  if (enrollmentsError) {
    console.error("Error fetching enrollments", enrollmentsError);
    return { total: 0, items: [] };
  }
  if (!enrollments || enrollments.length === 0) {
    return { total: 0, items: [] };
  }
  const courseIds = enrollments.map((e) => e.courseId);

  // 3. Get all chapters for those courses
  const { data: courseChapters, error: chaptersError } = await supabase
    .from("Chapter")
    .select(
      "id, title, type:content_type, ordering:order_index, storage_path:content_url, course:Course(id, title)",
    )
    .in("courseId", courseIds)
    .returns<CourseChapterSelect[]>();

  if (chaptersError) {
    console.error("Error fetching chapters", chaptersError);
    return { total: 0, items: [] };
  }

  // 4. Get all completed chapter IDs for the user
  const { data: userProgress, error: progressError } = await supabase
    .from("UserProgress")
    .select("chapterId")
    .eq("userId", internalUserId)
    .eq("isCompleted", true)
    .returns<UserProgressChapterIdSelect[]>();

  if (progressError) {
    console.error("Error fetching user progress", progressError);
    return { total: 0, items: [] };
  }
  const completedChapterIds = new Set(userProgress.map((p) => p.chapterId));

  // 5. Filter the course chapters to get the ones that are not completed
  const pendingModules = courseChapters.filter(
    (chapter) => !completedChapterIds.has(chapter.id),
  );

  // 6. Map to ModuleItem type and paginate the results
  const mappedItems = pendingModules.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    courseTitle: chapter.course.title, // Extract course title
  }));

  const start = (page - 1) * limit;
  const end = start + limit;
  const items = mappedItems.slice(start, end);

  return {
    total: pendingModules.length,
    items: items,
  };
}

export async function getAnnouncementViewReport() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("announcement_views")
    .select(
      `
      announcement_id,
      announcements ( 
        title
      ),
      count(id)
      `
    )
    .order("count", { ascending: false });

  if (error) {
    console.error("Error fetching announcement view report:", error);
    return [];
  }

  return data.map((row: any) => ({
    announcementId: row.announcement_id,
    announcementTitle: row.announcements?.title || "Unknown Title",
    viewCount: row.count,
  }));
}