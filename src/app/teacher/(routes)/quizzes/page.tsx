import React from "react";
import QuizzesList, { QuizItem } from "./_components/quizzes-list";

async function QuizzesPage() {
  let quizzes: QuizItem[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/teacher/quizzes`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch quizzes");
    }
    quizzes = await res.json();
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    // Optionally, handle the error more gracefully in the UI
  }

  return (
    <div className="p-6">
      <QuizzesList initialQuizzes={quizzes} />
    </div>
  );
}

export default QuizzesPage;
