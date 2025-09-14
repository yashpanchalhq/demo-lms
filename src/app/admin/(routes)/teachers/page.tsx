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

export const dynamic = 'force-dynamic'; // Force dynamic rendering

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

  const q = searchParams.q || '';
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');

  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  params.set('sortBy', sortBy);
  params.set('sortOrder', sortOrder);
  if (q) params.set('q', q);
  params.set('clerkUserId', userId);

  const headersList = headers();
  const host = headersList.get('host');
  const protocol = host?.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const cookie = headersList.get('cookie') || "";

  const response = await fetch(`${baseUrl}/api/teachers?${params.toString()}`, {
    headers: {
      'Cookie': cookie,
    }
  });

  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    const responseBody = await response.text();
    console.error("API call to /api/teachers failed or returned non-JSON response. Status:", response.status);
    console.error("Response body:", responseBody);
    throw new Error('Failed to fetch teacher data. Check server logs for details.');
  }
  const { data: fetchedUsers, totalCount, currentPage, perPage, totalPages } = await response.json();

  const teachers: Teacher[] = (fetchedUsers || []).map((user: any) => ({
    id: user.id,
    name: user.email, // Placeholder for name
    email: user.email,
    role: user.role,
    assignedCourses: ["Course X", "Course Y"], // Mock data
    progress: Math.floor(Math.random() * 101), // Mock data
    lastActivity: new Date(user.createdAt).toISOString(), // Placeholder
    certificates: Math.floor(Math.random() * 5), // Mock data
    createdAt: user.createdAt,
  }));

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
        <DataTable columns={columns} data={teachers} />
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
