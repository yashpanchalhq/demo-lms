import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { headers } from "next/headers";
import { DataTable } from "./_components/data-table";
import { columns, Teacher } from "./_components/column";
import { TeacherHeader } from "./_components/teacher-header";
import { TeacherFilters } from "./_components/teacher-filters";
import { TeacherFooter } from "./_components/teacher-footer";
import { BulkActions } from "./_components/bulk-actions";

export const dynamic = "force-dynamic"; // Force dynamic rendering

const TeachersPage = async ({
  searchParams,
}: {
  searchParams: {
    q?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
  };
}) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  const sp = (await searchParams) ?? {}; // await the promise-like searchParams first

  // Use nullish coalescing and explicit parseInt base
  const q = (sp.q as string) ?? "";
  const sortBy = (sp.sortBy as string) ?? "createdAt";
  const sortOrder = (sp.sortOrder as string) ?? "desc";
  const page = Number.parseInt((sp.page as string) ?? "1", 10);
  const limit = Number.parseInt((sp.limit as string) ?? "10", 10);

  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  if (q) params.set("q", q);
  params.set("clerkUserId", userId);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const cookie = headersList.get("cookie") || "";

  const response = await fetch(`${baseUrl}/api/teachers?${params.toString()}`, {
    headers: {
      Cookie: cookie,
    },
  });

  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json")
  ) {
    const responseBody = await response.text();
    console.error(
      "API call to /api/teachers failed or returned non-JSON response. Status:",
      response.status
    );
    console.error("Response body:", responseBody);
    throw new Error(
      "Failed to fetch teacher data. Check server logs for details."
    );
  }

  const {
    data: fetchedUsers,
    totalCount,
    currentPage,
    perPage,
    totalPages,
  } = await response.json();

  // Debug logging to see what data we're getting
  console.log("🔍 Fetched users sample:", fetchedUsers?.[0]);

  const teachers: Teacher[] = (fetchedUsers || []).map((user: any) => {
    // Debug each user's data
    console.log("👤 Processing user:", {
      id: user.id,
      clerkId: user.clerkId,
      clerkUserId: user.clerkUserId, // Alternative field name
      userId: user.userId, // Another alternative
      email: user.email,
    });

    return {
      id: user.id,
      // Try multiple possible field names for the Clerk ID
      clerkId: user.clerkId || user.clerkUserId || user.userId || user.id,
      name: user.email, // Placeholder for name
      email: user.email,
      role: user.role,
      assignedCourses: ["Course X", "Course Y"], // Mock data
      progress: Math.floor(Math.random() * 101), // Mock data
      lastActivity: new Date(user.createdAt).toISOString(), // Placeholder
      certificates: Math.floor(Math.random() * 5), // Mock data
      createdAt: user.createdAt,
    };
  });

  // Filter out teachers without valid Clerk IDs and log warnings
  const validTeachers = teachers.filter((teacher) => {
    if (!teacher.clerkId || teacher.clerkId === teacher.id) {
      console.warn(
        `⚠️ Teacher ${teacher.email} (${teacher.id}) has no valid Clerk ID`
      );
      return false;
    }
    return true;
  });

  if (validTeachers.length !== teachers.length) {
    console.warn(
      `⚠️ ${
        teachers.length - validTeachers.length
      } teachers filtered out due to missing Clerk IDs`
    );
  }

  return (
    <div className="p-6">
      <TeacherHeader
        totalTeachers={totalCount}
        completedCoursesPercentage={0}
        certificatesIssued={0}
      />
      <div className="mt-6">
        <TeacherFilters />
      </div>
      <div className="mt-6">
        <BulkActions />
      </div>
      <div className="mt-6">
        {/* Use validTeachers instead of teachers */}
        <DataTable columns={columns} data={validTeachers} />
      </div>
      <div className="mt-6">
        <TeacherFooter
          currentPage={currentPage}
          perPage={perPage}
          totalCount={totalCount}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default TeachersPage;
