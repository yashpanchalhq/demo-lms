
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import React, { useState } from "react";
import toast from "react-hot-toast";

export const FileUploadSection = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (url: string | undefined) => {
    if (url) {
      setUploadedFiles((prev) => [...prev, url]);
      toast.success("File uploaded successfully!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Upload for Logs / Screenshots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUpload endpoint="courseMaterial" onChangeAction={handleFileUpload} />
        <p className="text-sm text-muted-foreground">
          Include timestamps and user ID in your logs for faster support.
        </p>
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="font-medium">Uploaded Files:</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {uploadedFiles.map((url, index) => (
                <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.split('/').pop()}</a></li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
