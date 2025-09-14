"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import toast from "react-hot-toast";

interface FileUploadProps {
  onChangeAction: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
  onUploadError?: (error: Error) => void;
  input?: Record<string, any>;
}

export const FileUpload = ({
  onChangeAction,
  endpoint,
  onUploadError,
  input,
}: FileUploadProps) => {
  return (
    <>
      <UploadDropzone
        endpoint={endpoint}
        // @ts-ignore
        input={input}
        onClientUploadComplete={(res) => {
          onChangeAction(res?.[0].url);
          toast.success("File uploaded successfully");
          console.log("File uploaded successfully:", res);
        }}
        onUploadError={(error: Error) => {
          onUploadError?.(error);
          toast.error(`${error?.message}`);
        }}
      />
    </>
  );
};
