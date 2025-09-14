"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const ReportsActions = () => {
  const handleExportCsv = async () => {
    try {
      // Get current search params from URL
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();

      const response = await axios.get(`/api/admin/reports/export-csv?${queryString}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.csv'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("CSV exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV.");
    }
  };

  const handleSendReminder = async () => {
    try {
      // This action typically sends reminders to selected teachers or teachers lagging behind.
      // For now, we'll just send a generic reminder.
      // In a real scenario, you'd pass teacher IDs or filter criteria.
      await axios.post("/api/admin/reports/send-reminder-lagging", {
        teacherIds: ["mock_teacher_id_1", "mock_teacher_id_2"], // Placeholder
      });
      toast.success("Reminders sent successfully!");
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send reminders.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <Button variant="outline" onClick={handleExportCsv}>Export CSV</Button>
      <Button variant="outline">Schedule Export (Beta)</Button>
      <Button onClick={handleSendReminder}>Send Reminder to Lagging Teachers</Button>
    </div>
  );
};