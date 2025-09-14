"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const CertificatesActions = () => {
  const handleExportCsv = async () => {
    try {
      // Get current search params from URL
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();

      const response = await axios.get(`/api/admin/certificates/export?${queryString}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a blob from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificates.csv'); // Set the file name
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
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <Button variant="outline">Download Selected</Button>
      <Button variant="outline">Revoke Selected</Button>
      <Button variant="outline">Resend Selected</Button>
      <Button variant="outline" onClick={handleExportCsv}>Export CSV</Button>
    </div>
  );
};