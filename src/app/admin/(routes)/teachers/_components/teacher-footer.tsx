"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
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
import { Input } from "@/components/ui/input";

interface TeacherFooterProps {
  currentPage: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export const TeacherFooter = ({
  currentPage,
  perPage,
  totalCount,
  totalPages,
}: TeacherFooterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", newPage.toString());
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handleExportAllCsv = async () => {
    try {
      const response = await axios.get("/api/admin/teachers/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all-teachers.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("All teachers exported successfully!");
    } catch (error) {
      console.error("Error exporting all teachers CSV:", error);
      toast.error("Failed to export all teachers.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImportCsv = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import.");
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("/api/admin/teachers/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Teachers imported successfully!");
      router.refresh(); // Refresh the page to see the new teachers
    } catch (error) {
      console.error("Error importing teachers:", error);
      toast.error("Failed to import teachers.");
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Import Teachers (CSV)</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Teachers</DialogTitle>
              <DialogDescription>
                Select a CSV file to import teachers. The file should have
                columns for `email`, `name`, and `role`.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input type="file" accept=".csv" onChange={handleFileChange} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleImportCsv}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={handleExportAllCsv}>
          Export All to CSV
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalCount} teachers)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};