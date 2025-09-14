"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Radio, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { Skeleton } from "@/components/ui/skeleton";

// Types based on API responses
type ModuleProgress = {
  completed: boolean;
  updatedAt: string;
};

type Module = {
  id: string;
  title: string;
  content: string | null; // Assuming content can be video URL, PDF URL, or markdown
  moduleType: "VIDEO" | "QUIZ" | "TEXT" | "PDF"; // Example types
  quizQuestions: any | null; // JSONB for questions
  progress: ModuleProgress | null;
};

type CourseData = {
  course: {
    id: string;
    title: string;
  };
  modules: Module[];
};

const CoursePlayerPage = () => {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const courseId = params.courseId as string;
  const confetti = useConfettiStore();

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/teacher/courses/${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch course data.");
        const data: CourseData = await response.json();
        setCourseData(data);
        setActiveModule(data.modules?.[0] || null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleModuleSelect = (module: Module) => {
    setActiveModule(module);
  };

  const handleMarkComplete = async (moduleId: string) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });
      if (!response.ok) throw new Error("Failed to update progress.");
      const { courseCompleted } = await response.json();

      // Refetch data to show updated progress
      const freshResponse = await fetch(`/api/teacher/courses/${courseId}`);
      const data: CourseData = await freshResponse.json();
      setCourseData(data);
      // Keep the current module active, but with updated progress
      const updatedActiveModule = data.modules.find(
        (m) => m.id === activeModule?.id
      );
      if (updatedActiveModule) setActiveModule(updatedActiveModule);

      if (courseCompleted) {
        confetti.onOpen();
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!courseData) return <div className="p-6">Course not found.</div>;

  return (
    <div className="flex h-screen">
      {/* Sidebar with Modules */}
      <div className="w-1/4 border-r overflow-y-auto">
        <h2 className="p-4 text-xl font-bold sticky top-0 bg-white dark:bg-gray-900">
          {courseData.course.title}
        </h2>
        <ul>
          {courseData.modules.map((module) => (
            <li key={module.id}>
              <button
                onClick={() => handleModuleSelect(module)}
                className={`w-full text-left p-4 flex items-center gap-2 ${
                  activeModule?.id === module.id
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {module.progress?.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Radio className="h-5 w-5 text-gray-400" />
                )}
                <span className="flex-1">{module.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        {activeModule ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">{activeModule.title}</h1>
            <Card>
              <CardContent className="p-6">
                {/* Render module content based on type */}
                {activeModule.moduleType === "TEXT" && (
                  <p>{activeModule.content}</p>
                )}
                {activeModule.moduleType === "VIDEO" &&
                  activeModule.content && (
                    <video
                      src={activeModule.content}
                      controls
                      className="w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                {/* Basic Quiz runner placeholder */}
                {activeModule.moduleType === "QUIZ" && (
                  <div>
                    <p>This is a quiz. Implement quiz UI here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-6">
              <Button
                onClick={() => handleMarkComplete(activeModule.id)}
                disabled={!!activeModule.progress?.completed}
              >
                {activeModule.progress?.completed
                  ? "Completed"
                  : "Mark as Complete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Select a module to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayerPage;
