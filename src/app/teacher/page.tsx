import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { SectionCards } from "./_components/section-cards";
import { ChartArea } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const user = await currentUser();
  if (!user?.id) {
    // redirect or show sign-in prompt as you prefer
    return <div className="p-6">Please sign in to see your dashboard.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome{user.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">
              Your training summary & next steps
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/courses"
              className="px-3 py-2 border rounded text-sm"
            >
              My Courses
            </Link>
            <Link
              href="/teacher/certificates"
              className="px-3 py-2 bg-sky-600 text-white rounded text-sm"
            >
              Certificates
            </Link>
          </div>
        </header>
      </div>

      <SectionCards />

      <div className="px-4 lg:px-6">
        <ChartArea />
      </div>

      <div className="px-4 lg:px-6">
        <DataTable />
      </div>
    </div>
  );
}
