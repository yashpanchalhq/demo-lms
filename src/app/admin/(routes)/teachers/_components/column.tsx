"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import React, { useState, useEffect } from "react";

export type Teacher = {
  id: string; // This is the database UUID
  clerkId: string; // This should be the actual Clerk ID
  name: string;
  email: string;
  role: string;
  assignedCourses: string[]; // Changed from number to string[]
  progress: number;
  lastActivity: string;
  certificates: number;
  createdAt: string;
};

type Course = {
  id: string;
  title: string;
};

export const columns: ColumnDef<Teacher>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      // For now, using email as name placeholder
      return <div className="font-medium">{row.original.email}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <span>
          {row.original.email}
          {/* Show clerkId for debugging */}
          <br />
          <small className="text-muted-foreground">
            Clerk ID: {row.original.clerkId || "Missing"}
          </small>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(row.original.email);
            toast.success("Email copied!");
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
  },
  {
    accessorKey: "assignedCourses",
    header: "Assigned Courses",
    cell: ({ row }) => <div>{row.original.assignedCourses.join(", ")}</div>,
  },
  {
    accessorKey: "progress",
    header: "Progress %",
    cell: ({ row }) => <div>{row.original.progress}%</div>,
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => <div>{row.original.lastActivity}</div>,
  },
  {
    accessorKey: "certificates",
    header: "Certificates",
    cell: ({ row }) => <div>{row.original.certificates}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original;
      const router = useRouter();
      const [courses, setCourses] = useState<Course[]>([]);
      const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
        null
      );
      const [isAssigning, setIsAssigning] = useState(false);

      // Check if teacher has valid clerkId
      const hasValidClerkId = teacher.clerkId && teacher.clerkId.trim() !== "";

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

      const onPromoteToAdmin = async () => {
        if (!hasValidClerkId) {
          toast.error("Cannot promote teacher: Missing Clerk ID");
          return;
        }

        try {
          await axios.post("/api/admin/users/role", {
            id: teacher.clerkId,
            role: "ADMIN",
          });
          toast.success("Teacher promoted to Admin!");
          router.refresh();
        } catch (error) {
          toast.error("Failed to promote teacher to Admin.");
          console.error(error);
        }
      };

      const onAssignCourse = async () => {
        if (!selectedCourseId) {
          toast.error("Please select a course.");
          return;
        }

        if (!hasValidClerkId) {
          console.error("❌ No valid Clerk ID found for teacher:", {
            teacherId: teacher.id,
            teacherEmail: teacher.email,
            clerkId: teacher.clerkId,
          });
          toast.error(
            "Error: Teacher has no valid Clerk ID. They may need to sign up again."
          );
          return;
        }

        setIsAssigning(true);

        try {
          console.log("🚀 Attempting to assign course:", {
            teacherClerkId: teacher.clerkId,
            courseId: selectedCourseId,
            teacherEmail: teacher.email,
          });

          const response = await axios.post("/api/admin/enrollments", {
            teacherClerkId: teacher.clerkId,
            courseId: selectedCourseId,
          });

          console.log("✅ Assignment successful:", response.data);
          toast.success("Course assigned successfully!");
          router.refresh();
        } catch (error: any) {
          // More comprehensive error logging
          console.error("❌ Assignment failed - Full error object:", error);
          console.error("❌ Assignment failed - Error details:", {
            message: error?.message,
            response: error?.response,
            responseData: error?.response?.data,
            responseStatus: error?.response?.status,
            responseStatusText: error?.response?.statusText,
            teacherClerkId: teacher.clerkId,
            courseId: selectedCourseId,
            errorType: typeof error,
            errorConstructor: error?.constructor?.name,
          });

          if (axios.isAxiosError(error)) {
            console.error("❌ Axios error detected:", {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              headers: error.response?.headers,
            });

            if (error.response?.status === 409) {
              toast.error("Teacher is already enrolled in this course.");
            } else if (error.response?.status === 404) {
              toast.error(
                "Teacher not found in database. They may need to sign up first."
              );
            } else if (error.response?.status === 500) {
              toast.error(
                "Server error occurred. Please check the server logs."
              );
            } else if (error.code === "NETWORK_ERROR" || !error.response) {
              toast.error("Network error: Cannot reach the server.");
            } else {
              const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                `HTTP ${error.response?.status} Error`;
              toast.error(`Failed to assign course: ${errorMessage}`);
            }
          } else {
            console.error("❌ Non-Axios error:", error);
            toast.error(
              `Failed to assign course: ${error?.message || "Unknown error"}`
            );
          }
        } finally {
          setIsAssigning(false);
          setSelectedCourseId(null);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => console.log("View Profile", teacher.id)}
            >
              View Profile
            </DropdownMenuItem>

            {/* Disable course assignment if no valid clerkId */}
            {hasValidClerkId ? (
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Assign Course
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Course to {teacher.email}</DialogTitle>
                    <DialogDescription>
                      Select a course to enroll this teacher in.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select
                      onValueChange={setSelectedCourseId}
                      value={selectedCourseId || ""}
                    >
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
                      onClick={onAssignCourse}
                      disabled={!selectedCourseId || isAssigning}
                    >
                      {isAssigning ? "Assigning..." : "Assign"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <DropdownMenuItem
                disabled
                className="text-muted-foreground cursor-not-allowed"
              >
                Assign Course (Missing Clerk ID)
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => console.log("Reset Progress", teacher.id)}
            >
              Reset Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {teacher.role !== "ADMIN" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    disabled={!hasValidClerkId}
                    className={
                      !hasValidClerkId
                        ? "text-muted-foreground cursor-not-allowed"
                        : ""
                    }
                  >
                    {hasValidClerkId
                      ? "Promote to Admin"
                      : "Promote to Admin (Missing Clerk ID)"}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                {hasValidClerkId && (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will promote {teacher.email} to an Admin.
                        They will have full access to the admin dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onPromoteToAdmin}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>
            )}

            <DropdownMenuItem
              onClick={() => console.log("Send Reminder", teacher.id)}
            >
              Send Reminder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
