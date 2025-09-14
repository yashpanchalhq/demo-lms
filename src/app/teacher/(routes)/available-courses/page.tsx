"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

type EnrolledCourse = {
  course: Course;
  progressPercent: number;
  completedModulesCount: number;
  totalModules: number;
};

const AvailableCoursesPage = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all courses
        const allCoursesResponse = await axios.get<Course[]>("/api/courses");
        setAllCourses(allCoursesResponse.data);

        // Fetch enrolled courses for the current teacher
        const enrolledCoursesResponse = await axios.get<EnrolledCourse[]>("/api/teacher/courses");
        const enrolledIds = new Set(enrolledCoursesResponse.data.map(ec => ec.course.id));
        setEnrolledCourseIds(enrolledIds);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await axios.post("/api/enroll", { courseId });
      toast.success("Successfully enrolled in course!");
      // Update enrolled courses state and refresh router
      setEnrolledCourseIds(prev => new Set(prev).add(courseId));
      router.refresh();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error("You are already enrolled in this course.");
      } else {
        toast.error("Failed to enroll in course.");
      }
      console.error("Enrollment error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  const availableCourses = allCourses.filter(
    (course) => !enrolledCourseIds.has(course.id)
  );

  if (availableCourses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
        <p className="mt-4">No new courses available for enrollment.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {availableCourses.map((course) => (
          <Card key={course.id} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="truncate">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {course.description || "No description provided."}
              </p>
              <div className="mt-auto">
                <Button onClick={() => handleEnroll(course.id)} className="w-full">
                  Enroll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailableCoursesPage;
