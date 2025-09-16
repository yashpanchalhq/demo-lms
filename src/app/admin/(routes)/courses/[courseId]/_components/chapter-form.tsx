type Course = {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
  chapter: ChapterWithAllDetails[];
};

"use client";
import { ChapterWithAllDetails } from "@/lib/teacher";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import ChapterList from "./chapters-list";
import { Textarea } from "@/components/ui/textarea";
const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

interface ChapterFormProps {
  initialData: Course & { chapter: ChapterWithAllDetails[] };
  courseId: string;
}
export const ChapterForm = ({ initialData, courseId }: ChapterFormProps) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapter`, values);
      toast.success("Chapter Created Succesfully");
      toggleCreating();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  console.log("Initial Data:", initialData);

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/courses/${courseId}/chapter/reorder`, {
        list: updateData,
      });
      toast.success("Chapters reordered");
      router.refresh();
    } catch {
      toast.error("Something Went Wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/admin/courses/${courseId}/chapters/${id}`);
  };

  return (
    <>
      <div className="relative mt-6 bg-slate-100 dark:bg-slate-800 rounded-md p-4">
        {isUpdating && (
          <div className="absolute h-full w-full bg-slate-500/20 dark:bg-slate-900/20 top-0 right-0 rounded-md flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-sky-700 dark:text-sky-300" />
          </div>
        )}
        <div className="font-medium flex items-center justify-between dark:text-white">
          Course Chapters
          <Button onClick={toggleCreating} variant="ghost">
            {isCreating ? (
              <>Cancel</>
            ) : (
              <>
                <PlusCircle className=" h-4 w-4 mr-2" />
                Add Chapter
              </>
            )}
          </Button>
        </div>
        {isCreating && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. 'Introduction to the course"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        disabled={isSubmitting}
                        placeholder="e.g. 'This chapter covers..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={!isValid || isSubmitting} type="submit">
                Create
              </Button>
            </form>
          </Form>
        )}
        {!isCreating && (
          <div
            className={cn(
              "text-sm mt-2",
              !initialData.chapter.length &&
                "text-slate-500 italic dark:text-slate-400"
            )}
          >
            {!initialData.chapter.length && "No Chapters"}
            <ChapterList
              onEdit={onEdit}
              onReorder={onReorder}
              items={initialData.chapter || []}
            />
          </div>
        )}
        {!isCreating && (
          <p className="text-xs text-muted-foreground mt-4 dark:text-slate-400">
            Drag & Drop to Re-Order the chapter
          </p>
        )}
      </div>
    </>
  );
};
