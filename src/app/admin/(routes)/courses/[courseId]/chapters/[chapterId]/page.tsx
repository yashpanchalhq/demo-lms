import { IconBadge } from "@/components/icon-badge";
import { getSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { ChapterTitleForm } from "../_components/chapter-title-form";
import { ChapterDescriptionForm } from "../_components/chapter-description-form";
import { ChapterAccessForm } from "../_components/chapter-access-form copy";
import { ChapterVideoForm } from "../_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { ChapterAction } from "../_components/chapter-action";

type Chapter = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  isPublished: boolean;
};

type MuxData = {
  id: string;
  chapterId: string;
  assetId: string;
  playbackId: string;
};

interface ChapterIdPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterIdPage = async ({ params }: ChapterIdPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { chapterId, courseId } = params;

  const supabase = getSupabaseClient();

  const { data: chapter, error: chapterError } = (await supabase
    .from("Chapter")
    .select("*")
    .eq("id", chapterId)
    .eq("courseId", courseId)
    .single()) as { data: Chapter | null; error: any };

  if (chapterError || !chapter) {
    return redirect("/");
  }

  const { data: muxData, error: muxDataError } = (await supabase
    .from("MuxData")
    .select("*")
    .eq("chapterId", chapterId)
    .single()) as { data: MuxData | null; error: any };

  const chapterWithMuxData = {
    ...(chapter as Chapter),
    muxData: muxData as MuxData | null,
  };

  const requiredFields = [
    chapterWithMuxData.title,
    chapterWithMuxData.description,
    chapterWithMuxData.videoUrl,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!chapterWithMuxData.isPublished && (
        <Banner
          variant="warning"
          label="This Chapter is Un-published. It'll not be visible in the course!"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/admin/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-slate-700">
                  Completed all fields {completionText}
                </span>
              </div>
              <ChapterAction
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapterWithMuxData.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customise Your Chapter</h2>
              </div>
              <ChapterTitleForm
                initialData={chapterWithMuxData}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapterWithMuxData}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Eye} />
              <h2 className="text-xl">Access Setting</h2>
            </div>
            <ChapterAccessForm
              initialData={chapterWithMuxData}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapterWithMuxData}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
