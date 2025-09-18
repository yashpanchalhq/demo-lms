"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { parse } from "papaparse";

const BulkEnrollPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{ successful: number; failed: number } | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses.");
      }
    };
    fetchCourses();
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleEnroll = async () => {
    if (!selectedFile && !selectedCourseId) {
      toast.error("Please select a file and a course.");
      return;
    }

    if (selectedFile) {
      // Handle CSV upload enrollment
      const csvData = await selectedFile.text();
      const parsed = parse(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      const enrollments = parsed.data as { teacherClerkId: string; courseId: string }[];
      try {
        setIsEnrolling(true);
        const response = await axios.post("/api/admin/bulk-enroll", { enrollments });
        setEnrollmentStatus({ successful: response.data.successfulEnrollments.length, failed: response.data.failedEnrollments.length });
        toast.success("Enrollment process completed!");
      } catch (error) {
        console.error("Error enrolling students:", error);
        toast.error("Failed to enroll students.");
      } finally {
        setIsEnrolling(false);
      }
    } else if (selectedCourseId) {
      // Handle enrolling all students in a course
      // This is just a placeholder, you would need to implement the API for this
      toast.success("Enrolling all students in the selected course...");
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Enroll Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="course">Select Course</label>
            <Select onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="file">Upload CSV</label>
            <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <Button onClick={handleEnroll} disabled={isEnrolling}>
            {isEnrolling ? "Enrolling..." : "Enroll"}
          </Button>
          {enrollmentStatus && (
            <div>
              <p>Successfully enrolled: {enrollmentStatus.successful}</p>
              <p>Failed to enroll: {enrollmentStatus.failed}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkEnrollPage;
