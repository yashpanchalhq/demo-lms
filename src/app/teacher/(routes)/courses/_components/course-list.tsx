"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { unknown } from "zod";

// Matches the return type of getEnrolledCourses
type EnrolledCourse = {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  };
  progressPercent: number;
  completedModulesCount: number;
  totalModules: number;
};

export const CourseList = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/teacher/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses.");
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 mt-4">Error: {error}</div>;
  }

  if (courses.length === 0) {
    return <p className="mt-4">You are not enrolled in any courses yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {courses.map(
        ({ course, progressPercent, completedModulesCount, totalModules }) => (
          <Link href={`/teacher/courses/${course.id}`} key={course.id}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="truncate">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-2">
                  {completedModulesCount} / {totalModules} modules
                </div>
                <Progress value={progressPercent} className="w-full" />
                <p className="text-xs text-center mt-1">
                  {progressPercent}% complete
                </p>
              </CardContent>
            </Card>
          </Link>
        )
      )}
    </div>
  );
};
