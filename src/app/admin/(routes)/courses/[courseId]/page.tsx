import { IconBadge } from "@/components/icon-badge";
import { getSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import {
  CircleDollarSign,
  LayoutDashboard,
  ListCheck,
  File,
} from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { AttachmentForm } from "./_components/resource-attachment-form";
import { ChapterForm } from "./_components/chapter-form";
import { Banner } from "@/components/banner";
import { Action } from "./_components/action";

export default async function CourseIDPage({
  params,
}: {
  params: { courseId: string };
}) {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return redirect("/");
  }

  const supabase = getSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from('Course')
    .select('*')
    .eq('id', params.courseId)
    .eq('userId', userId)
    .single();

  if (courseError || !course) {
    return redirect("/");
  }

  const { data: chapters, error: chaptersError } = await supabase
    .from('Chapter')
    .select('*')
    .eq('courseId', params.courseId)
    .order('position', { ascending: true });

  const { data: attachments, error: attachmentsError } = await supabase
    .from('Attachment')
    .select('*')
    .eq('courseId', params.courseId)
    .order('createdAt', { ascending: 'desc' });

  const courseWithDetails = {
    ...course,
    chapter: chapters || [],
    attachments: attachments || [],
  };

  const { data: categories, error: categoriesError } = await supabase
    .from('Category')
    .select('*')
    .order('name', { ascending: true });

  if (!categories) {
    return redirect("/");
  }

  const requireFields = [
    courseWithDetails.title,
    courseWithDetails.description,
    courseWithDetails.imageUrl,
    courseWithDetails.categoryId,
    courseWithDetails.chapter.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requireFields.length; // number of require field
  const completedFields = requireFields.filter(Boolean).length; // number of completed fields

  const progress = `(${completedFields}/${totalFields})`;

  const isComplete = requireFields.every(Boolean);

  return (
    <>
      {!courseWithDetails.isPublished && (
        <Banner label="Course is Unpublished, It'll not be visible to the students" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course</h1>
            <span className="text-sm text-slate-700 dark:text-slate-400">
              Completed all fields {progress}
            </span>
          </div>
          <Action
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={courseWithDetails.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customise your course</h2>
            </div>
            <TitleForm initialData={courseWithDetails} courseId={courseWithDetails.id} />
            <DescriptionForm initialData={courseWithDetails} courseId={courseWithDetails.id} />
            <ImageForm initialData={courseWithDetails} courseId={courseWithDetails.id} />
            <CategoryForm
              initialData={courseWithDetails}
              courseId={courseWithDetails.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListCheck} />
                <h2 className="text-xl">Course Chapter</h2>
              </div>
              <ChapterForm initialData={courseWithDetails} courseId={courseWithDetails.id} />
            </div>
            {/* <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell you course</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </div> */}
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments</h2>
              </div>
              <AttachmentForm initialData={courseWithDetails} courseId={courseWithDetails.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}