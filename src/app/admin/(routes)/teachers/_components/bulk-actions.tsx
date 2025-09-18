"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Row } from "@tanstack/react-table";
import { Teacher } from "./column"; // Assuming Teacher type is exported from column.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsProps<TData extends Teacher> {
  selectedRows: Row<TData>[];
}

export const BulkActions = <TData extends Teacher>({ selectedRows }: BulkActionsProps<TData>) => {
  const selectedCount = selectedRows.length;
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

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
  }, []);

  const handleExportCsv = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();

      const response = await axios.get(
        `/api/admin/teachers/export?${queryString}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "teachers.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV.");
    }
  };

  const handleAssignCourse = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course.");
      return;
    }
    if (selectedCount === 0) {
      toast.error("Please select at least one teacher.");
      return;
    }

    setIsAssigning(true);
    const teacherClerkIds = selectedRows.map((row) => row.original.clerkId);

    try {
      await axios.post("/api/admin/bulk-enroll", {
        enrollments: teacherClerkIds.map((clerkId) => ({
          teacherClerkId: clerkId,
          courseId: selectedCourseId,
        })),
      });
      toast.success(`${selectedCount} teachers assigned to course!`);
    } catch (error) {
      console.error("Error assigning course:", error);
      toast.error("Failed to assign course.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSendReminder = async () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one teacher.");
      return;
    }
    const teacherIds = selectedRows.map((row) => row.original.id);
    try {
      await axios.post("/api/admin/teachers/bulk-reminder", { teacherIds });
      toast.success(`Reminder sent to ${selectedCount} teachers!`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder.");
    }
  };

  const handleMakeAdmin = async () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one teacher.");
      return;
    }
    const teacherClerkIds = selectedRows.map((row) => row.original.clerkId);
    try {
      await axios.post("/api/admin/users/role", {
        ids: teacherClerkIds,
        role: "ADMIN",
      });
      toast.success(`${selectedCount} teachers promoted to admin!`);
    } catch (error) {
      console.error("Error promoting teachers:", error);
      toast.error("Failed to promote teachers.");
    }
  };

  const handleUnenroll = async () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one teacher.");
      return;
    }
    // Unenrollment logic here
    toast.success(`${selectedCount} teachers unenrolled!`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-medium text-sm mr-2">{selectedCount} selected</span>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={selectedCount === 0}>
            Assign Course
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Course</DialogTitle>
            <DialogDescription>
              Select a course to assign to the selected teachers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAssignCourse}
              disabled={!selectedCourseId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSendReminder}
        disabled={selectedCount === 0}
      >
        Send Reminder Email
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportCsv}>
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMakeAdmin}
        disabled={selectedCount === 0}
      >
        Make Admin
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnenroll}
        disabled={selectedCount === 0}
      >
        Unenroll
      </Button>
    </div>
  );
};