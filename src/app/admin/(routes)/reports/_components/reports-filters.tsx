
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "axios";

interface Course {
  id: string;
  title: string;
}

interface Teacher {
  id: string;
  email: string;
}

export const ReportsFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStartDate = searchParams.get("startDate");
  const currentEndDate = searchParams.get("endDate");
  const currentCourseFilter = searchParams.get("courseId");
  const currentTeacherFilter = searchParams.get("teacherId");
  const currentStatusFilter = searchParams.get("status");
  const currentGroupBy = searchParams.get("groupBy");

  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");
  const [courseFilter, setCourseFilter] = useState(currentCourseFilter || "all");
  const [teacherFilter, setTeacherFilter] = useState(currentTeacherFilter || "all");
  const [statusFilter, setStatusFilter] = useState(currentStatusFilter || "all");
  const [groupBy, setGroupBy] = useState(currentGroupBy || "course");

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [coursesResponse, teachersResponse] = await Promise.all([
          axios.get("/api/courses"),
          axios.get("/api/teachers"),
        ]);
        setCourses(coursesResponse.data);
        setTeachers(teachersResponse.data.data); // Assuming teachers API returns { data: [], ... }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    startDate ? current.set("startDate", startDate) : current.delete("startDate");
    endDate ? current.set("endDate", endDate) : current.delete("endDate");
    courseFilter !== "all" ? current.set("courseId", courseFilter) : current.delete("courseId");
    teacherFilter !== "all" ? current.set("teacherId", teacherFilter) : current.delete("teacherId");
    statusFilter !== "all" ? current.set("status", statusFilter) : current.delete("status");
    groupBy !== "all" ? current.set("groupBy", groupBy) : current.delete("groupBy");

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }, [
    startDate,
    endDate,
    courseFilter,
    teacherFilter,
    statusFilter,
    groupBy,
    router,
    pathname,
    searchParams,
  ]);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  const groupByOptions = [
    { label: "Course", value: "course" },
    { label: "Teacher", value: "teacher" },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Input
        type="date"
        placeholder="Start Date"
        className="w-[180px]"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        type="date"
        placeholder="End Date"
        className="w-[180px]"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <Select value={courseFilter} onValueChange={setCourseFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={teacherFilter} onValueChange={setTeacherFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Teacher" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teachers</SelectItem>
          {teachers.map((teacher) => (
            <SelectItem key={teacher.id} value={teacher.id}>
              {teacher.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={groupBy} onValueChange={setGroupBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Group by" />
        </SelectTrigger>
        <SelectContent>
          {groupByOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline">Apply Filters</Button>
    </div>
  );
};
