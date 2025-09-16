"use client";

import React, { useEffect, useState } from "react";
import QuizzesList, { QuizItem } from "./_components/quizzes-list";

function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/teacher/quizzes`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await res.json();
        setQuizzes(data);
      } catch (err: any) {
        console.error("Error fetching quizzes:", err);
        setError(err.message || "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="p-6">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <QuizzesList initialQuizzes={quizzes} />
    </div>
  );
}

export default QuizzesPage;
