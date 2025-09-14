"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const BulkActions = () => {
  const handleExportCsv = async () => {
    try {
      // Get current search params from URL
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();

      const response = await axios.get(`/api/admin/teachers/export?${queryString}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'teachers.csv'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-100 dark:bg-zinc-900 rounded-md">
      <span className="font-medium text-sm mr-2">0 selected</span>
      <Button variant="outline" size="sm">Assign Course</Button>
      <Button variant="outline" size="sm">Send Reminder Email</Button>
      <Button variant="outline" size="sm" onClick={handleExportCsv}>Export CSV</Button>
      <Button variant="outline" size="sm">Make Admin</Button>
      <Button variant="outline" size="sm">Unenroll</Button>
    </div>
  );
};