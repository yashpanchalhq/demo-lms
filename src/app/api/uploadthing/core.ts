import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { auth as clerkAuth } from "@clerk/nextjs/server";

// simple local auth stub - replace with your real auth implementation if needed
export async function auth() {
  const { userId } = await clerkAuth();
  if (!userId) {
    return null;
  }
  return { user: { id: userId } };
}

const f = createUploadthing();

export const ourFileRouter = {
  courseMaterial: f({
    pdf: { maxFileSize: "16MB" },
    video: { maxFileSize: "512MB" },
  })
    .middleware(async ({ req }) => {
      // Example: verify teacher/admin is logged in
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file details in Neon via Prisma
      console.log("Upload complete", file.ufsUrl);

      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
  courseImage: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ courseId: z.string() }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { userId: session.user.id, courseId: input.courseId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      for (let i = 0; i < 3; i++) {
        try {
          const supabase = getSupabaseClient();
          
          // Fix: Use type assertion or explicit typing for the update
          const { data, error } = await supabase
            .from('Course')
            .update({ imageUrl: file.ufsUrl })
            .eq('id', metadata.courseId);

          if (error) {
            console.error("Error updating course image:", error);
            throw new Error("Failed to update course image");
          }

          console.log("Course image updated successfully", data);
          return { uploadedBy: metadata.userId };
        } catch (error) {
          console.error(`Upload complete error (attempt ${i + 1}):`, error);
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;