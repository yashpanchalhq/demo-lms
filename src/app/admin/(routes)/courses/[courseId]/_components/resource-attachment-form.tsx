"use client";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { File, Loader2, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/teacher";
import { FileUpload } from "@/components/file-upload";

// Define the Attachment type if not imported from elsewhere
type Attachment = {
  id: string;
  name: string;
  url: string;
};

const formSchema = z.object({
  url: z.string().min(1),
});

interface AttachementFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}
export const AttachmentForm = ({
  initialData,
  courseId,
}: AttachementFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setIsDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      formSchema.parse(values);
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success("Course Updated Successfully");
      toggleEdit();
      router.refresh();
    } catch {
      setError("Something went wrong");
      toast.error("Something went wrong");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success("Attachment deleted successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeletingId(null);
    }
  };

  console.log("Initial Data:", initialData);

  return (
    <>
      <div className=" mt-6 bg-slate-100 dark:bg-slate-800 rounded-md p-4">
        <div className="font-medium flex items-center justify-between dark:text-white">
          Course Attachment
          <Button onClick={toggleEdit} variant="ghost">
            {isEditing && <>Cancel</>}
            {!isEditing && (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add an file
              </>
            )}
          </Button>
        </div>
        {!isEditing && (
          <>
            {initialData.attachments.length === 0 && (
              <p className="text-sm mt-2 text-slate-500 italic dark:text-slate-400">
                No Attachments yet
              </p>
            )}
            {initialData.attachments.length > 0 && (
              <div className="space-y-2">
                {initialData.attachments.map((attachment: Attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-100 dark:bg-sky-900 border-sky-200 dark:border-sky-700 border text-sky-700 dark:text-sky-300 rounded-md"
                  >
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-xs line-clamp-1">{attachment.name}</p>
                    {deletingId === attachment.id && (
                      <div>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {deletingId !== attachment.id && (
                      <button
                        onClick={() => onDelete(attachment.id)}
                        className="ml-auto hover:opacity-75 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {isEditing && (
          <div>
            <FileUpload
              endpoint="courseMaterial"
              onChangeAction={async (url) => {
                if (url) {
                  try {
                    await onSubmit({ url: url });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to upload attachment");
                  }
                }
              }}
            />
            <div className="text-xs text-muted-foreground mt-4 dark:text-slate-400">
              Add attachment related to this course that might help your
              students!
            </div>
          </div>
        )}
        {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
      </div>
    </>
  );
};
