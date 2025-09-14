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

// Expanded Teacher type
export type Teacher = {
  id: string;
  name: string; // Placeholder for now, will use email or derive from Clerk
  email: string;
  role: string;
  assignedCourses: string[]; // Mock data for now
  progress: number; // Mock data for now (0-100)
  lastActivity: string; // Mock data for now (ISO string)
  certificates: number; // Mock data for now
  createdAt: string;
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
        <span>{row.original.email}</span>
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
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: "assignedCourses",
    header: "Assigned Courses",
    cell: ({ row }) => (
      <div>{row.original.assignedCourses.join(", ")}</div> // Placeholder
    ),
  },
  {
    accessorKey: "progress",
    header: "Progress %",
    cell: ({ row }) => (
      <div>{row.original.progress}%</div> // Placeholder
    ),
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => (
      <div>{row.original.lastActivity}</div> // Placeholder
    ),
  },
  {
    accessorKey: "certificates",
    header: "Certificates",
    cell: ({ row }) => (
      <div>{row.original.certificates}</div> // Placeholder
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original;
      const router = useRouter();

      const onPromoteToAdmin = async () => {
        try {
          await axios.post("/api/admin/users/role", {
            id: teacher.id,
            role: "ADMIN",
          });
          toast.success("Teacher promoted to Admin!");
          router.refresh();
        } catch (error) {
          toast.error("Failed to promote teacher to Admin.");
          console.error(error);
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
            <DropdownMenuItem onClick={() => console.log("View Profile", teacher.id)}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Assign Course", teacher.id)}>
              Assign Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Reset Progress", teacher.id)}>
              Reset Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {teacher.role !== "ADMIN" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Promote to Admin
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will promote {teacher.email} to an Admin. They will have full access to the admin dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onPromoteToAdmin}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <DropdownMenuItem onClick={() => console.log("Send Reminder", teacher.id)}>
              Send Reminder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];