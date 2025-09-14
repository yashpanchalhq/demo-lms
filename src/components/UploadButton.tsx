"use client";

import { UploadButton } from "@/utils/uploadthing";

export default function CourseMaterialUploader() {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Upload Course Material</h2>

      <UploadButton
        endpoint="courseMaterial"
        onClientUploadComplete={(res) => {
          console.log("Files uploaded:", res);
          alert("Upload complete!");
        }}
        onUploadError={(error: Error) => {
          alert(`Upload error: ${error.message}`);
        }}
      />
    </div>
  );
}
