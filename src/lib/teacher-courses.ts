
import { getSupabaseClient } from "./supabase";
import { Course, Module } from "@prisma/client";

const supabase = getSupabaseClient();

export async function getTeacherCourses(userId: string) {
  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      modules (*)
    `
    )
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching teacher courses:", error);
    return [];
  }

  const results = await Promise.all(
    courses.map(async (course) => {
      const totalModules = course.modules?.length ?? 0;
      
      // For teacher courses, we are not tracking progress of the teacher
      // but we might want to show aggregated progress of students.
      // For now, let's return 0 for progress.
      const completed = 0;
      const percent = 0;

      return {
        course: course,
        progressPercent: percent,
        completedModulesCount: completed,
        totalModules,
      };
    })
  );

  return results;
}
