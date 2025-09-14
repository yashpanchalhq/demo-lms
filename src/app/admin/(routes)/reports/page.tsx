import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { headers } from "next/headers";
import { ReportsHeader } from "./_components/reports-header";
import { StatCards } from "./_components/stat-cards";
import { KpiRow } from "./_components/kpi-row";
import { ReportsFilters } from "./_components/reports-filters";
import { CompletionByCourseChart } from "./_components/completion-by-course-chart";
import { CompletionsOverTimeChart } from "./_components/completions-over-time-chart";
import { ReportsTable } from "./_components/reports-table";
import { ReportsActions } from "./_components/reports-actions";

export const dynamic = "force-dynamic"; // Force dynamic rendering

const ReportsPage = async ({
  searchParams,
}: {
  searchParams: {
    timeRange?: string;
    startDate?: string;
    endDate?: string;
    courseId?: string;
    teacherId?: string;
    status?: string;
    groupBy?: string;
  };
}) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  const timeRange = searchParams.timeRange || "30d";
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  const courseId = searchParams.courseId;
  const teacherId = searchParams.teacherId;
  const status = searchParams.status;
  const groupBy = searchParams.groupBy || "course";

  // Construct query string for APIs
  const queryString = new URLSearchParams();
  if (startDate) queryString.set("startDate", startDate);
  if (endDate) queryString.set("endDate", endDate);
  if (courseId) queryString.set("courseId", courseId);
  if (teacherId) queryString.set("teacherId", teacherId);
  if (status) queryString.set("status", status);
  if (groupBy) queryString.set("groupBy", groupBy);

  // Dynamically construct URL and forward cookies
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const cookie = headersList.get("cookie") || "";

  const fetchOptions = {
    headers: {
      Cookie: cookie,
    },
  };

  // Fetch data from APIs
  const [
    dashboardStatsResponse,
    completionByCourseResponse,
    completionsOverTimeResponse,
    reportsTableResponse,
  ] = await Promise.all([
    fetch(
      `${baseUrl}/api/admin/dashboard-stats?${queryString.toString()}`,
      fetchOptions
    ),
    fetch(
      `${baseUrl}/api/admin/reports/completion-by-course?${queryString.toString()}`,
      fetchOptions
    ),
    fetch(
      `${baseUrl}/api/admin/reports/completions-over-time?${queryString.toString()}`,
      fetchOptions
    ),
    fetch(
      `${baseUrl}/api/admin/reports/teachers-by-course?${queryString.toString()}`,
      fetchOptions
    ),
  ]);

  const responses = [
    dashboardStatsResponse,
    completionByCourseResponse,
    completionsOverTimeResponse,
    reportsTableResponse,
  ];

  // Check all responses for errors
  for (const response of responses) {
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("application/json")
    ) {
      const responseBody = await response.text();
      console.error(
        "API call failed or returned non-JSON response. Status:",
        response.status,
        "URL:",
        response.url
      );
      console.error("Response body:", responseBody);
      throw new Error(
        "Failed to fetch report data. Check server logs for details."
      );
    }
  }

  const [
    dashboardStats,
    completionByCourseData,
    completionsOverTimeData,
    reportsTableData,
  ] = await Promise.all(responses.map((res) => res.json()));

  return (
    <div className="p-6">
      <ReportsHeader />
      <div className="mt-6">
        <StatCards
          totalTeachers={dashboardStats.totalTeachers}
          activeCourses={dashboardStats.activeCourses}
          avgCompletionPercentage={dashboardStats.avgCompletionRate}
          certificatesIssued={dashboardStats.certificatesIssued}
        />
      </div>
      <div className="mt-6">
        <KpiRow
          inProgressCount={dashboardStats.inProgressCount || 0}
          notStartedCount={dashboardStats.notStartedCount || 0}
          quizzesPassedRate={dashboardStats.quizzesPassedRate || 0}
          avgTimeToCompletion={dashboardStats.avgTimeToCompletion || "N/A"}
        />
      </div>
      <div className="mt-6">
        <ReportsFilters />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CompletionByCourseChart data={completionByCourseData} />
        <CompletionsOverTimeChart data={completionsOverTimeData} />
      </div>
      <div className="mt-6">
        <ReportsTable data={reportsTableData} />
      </div>
      <div className="mt-6">
        <ReportsActions />
      </div>
    </div>
  );
};

export default ReportsPage;
