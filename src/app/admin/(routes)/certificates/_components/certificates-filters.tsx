"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "axios";

interface Course {
  id: string;
  title: string;
}

export const CertificatesFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q");
  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");
  const currentCourseId = searchParams.get("courseId");
  const currentStatus = searchParams.get("status");

  const [qValue, setQValue] = useState(currentQ || "");
  const [fromValue, setFromValue] = useState(currentFrom || "");
  const [toValue, setToValue] = useState(currentTo || "");
  const [courseIdValue, setCourseIdValue] = useState(currentCourseId || "all");
  const [statusValue, setStatusValue] = useState(currentStatus || "all");
  const [courses, setCourses] = useState<Course[]>([]);

  const debouncedQValue = useDebounce(qValue, 500);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    debouncedQValue ? current.set("q", debouncedQValue) : current.delete("q");
    fromValue ? current.set("from", fromValue) : current.delete("from");
    toValue ? current.set("to", toValue) : current.delete("to");
    courseIdValue !== "all" ? current.set("courseId", courseIdValue) : current.delete("courseId");
    statusValue !== "all" ? current.set("status", statusValue) : current.delete("status");

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  }, [debouncedQValue, fromValue, toValue, courseIdValue, statusValue, router, pathname, searchParams]);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "ACTIVE" },
    { label: "Revoked", value: "REVOKED" },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by teacher name, email, or certificate ID..."
          className="w-full pl-9"
          value={qValue}
          onChange={(e) => setQValue(e.target.value)}
        />
      </div>

      <Input
        type="date"
        placeholder="Issued From"
        className="w-[180px]"
        value={fromValue}
        onChange={(e) => setFromValue(e.target.value)}
      />
      <Input
        type="date"
        placeholder="Issued To"
        className="w-[180px]"
        value={toValue}
        onChange={(e) => setToValue(e.target.value)}
      />

      <Select value={courseIdValue} onValueChange={setCourseIdValue}>
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

      <Select value={statusValue} onValueChange={setStatusValue}>
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

      <Button variant="outline">Apply Filters</Button>
    </div>
  );
};