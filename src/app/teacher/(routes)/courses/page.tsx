
import React from "react";
import { CourseList } from "./_components/course-list";

const TeacherDashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Courses</h1>
      <p className="text-gray-500">Here are the courses you are enrolled in.</p>
      <CourseList />
    </div>
  );
};

export default TeacherDashboardPage;
