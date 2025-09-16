"use client";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, VideoIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Chapter } from "@/lib/teacher";

interface MuxData {
  id: string;
  assetId: string;
  playbackId: string | null;
}
// import MuxPlayer from "@mux/mux-player-react";
import { FileUpload } from "@/components/file-upload";
import NextVideo from "next-video";

const formSchema = z.object({
  videoUrl: z.string().min(1, {
    message: "image is required",
  }),
});

interface VideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}
export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: VideoFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);
  const [error, setError] = useState<string | null>(null);

  // const { isSubmitting, setIsSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      formSchema.parse(values);
      await axios.patch(
        `/api/courses/${courseId}/chapter/${chapterId}`,
        values
      );
      toast.success("Chapter Updated Successfully");
      toggleEdit();
      router.refresh();
    } catch {
      setError("Something went wrong");
      toast.error("Something went wrong");
    }
  };

  console.log("Initial Data:", initialData);

  return (
    <>
      <div className=" mt-6 bg-slate-100 dark:bg-slate-800 rounded-md p-4">
        <div className="font-medium flex items-center justify-between dark:text-white">
          Course Video
          <Button onClick={toggleEdit} variant="ghost">
            {isEditing && <>Cancel</>}
            {!isEditing && !initialData.videoUrl && (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add an video
              </>
            )}
            {!isEditing && initialData.videoUrl && (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit video
              </>
            )}
          </Button>
        </div>
        {!isEditing &&
          (!initialData.videoUrl ? (
            <div className="flex items-center justify-center h-60">
              <VideoIcon className="h-10 w-10 text-slate-500 dark:text-slate-400" />
            </div>
          ) : (
            <div className="relative aspect-video mt-2">
              {/* <MuxPlayer playbackId={initialData?.muxData?.playbackId || ""} /> */}
              <NextVideo src={initialData.videoUrl} />
            </div>
          ))}

        {isEditing && (
          <div>
            <FileUpload
              endpoint="courseMaterial"
              onChangeAction={async (url) => {
                if (url) {
                  try {
                    await onSubmit({ videoUrl: url });
                  } catch (e) {
                    console.error(e);
                    toast.error("Failed to upload video");
                  }
                }
              }}
            />
            <div className="text-xs text-muted-foreground mt-4 dark:text-slate-400">
              Upload this chapter related video content
            </div>
          </div>
        )}
        {initialData.videoUrl && !isEditing && (
          <div className="text-sx text-muted-foreground mt-2 dark:text-slate-400">
            Videos can take a few minutes to process. Refresh the page if video
            does not appear.
          </div>
        )}
      </div>
    </>
  );
};
