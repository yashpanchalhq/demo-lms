"use client";

import { useEffect, useState } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KeyStatsData {
  totalTeachers: number;
  activeCourses: number;
  avgCompletionRate: number;
  certificatesIssued: number;
  teacherTrend: number;
  courseTrend: number;
  completionRateTrend: number;
  certificateTrend: number;
  newTeachers: number;
  newCourses: number;
  newCertificates: number;
}

export function SectionCards() {
  const [stats, setStats] = useState<KeyStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/dashboard-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const displayData = [
    {
      title: "Total Teachers",
      value: loading ? "..." : `${stats?.totalTeachers || 0} / 100`,
      trend: stats?.teacherTrend || 0,
      footerText: loading
        ? "..."
        : `${stats?.newTeachers || 0} new teachers joined this month.`,
    },
    {
      title: "Active Courses",
      value: loading ? "..." : stats?.activeCourses || 0,
      trend: stats?.courseTrend || 0,
      footerText: loading
        ? "..."
        : `${stats?.newCourses || 0} new courses created this month.`,
    },
    {
      title: "Avg. Completion Rate",
      value: loading ? "..." : `${stats?.avgCompletionRate || 0}%`,
      trend: stats?.completionRateTrend || 0,
      footerText: loading
        ? "..."
        : `Up by ${stats?.completionRateTrend || 0}% from last month.`,
    },
    {
      title: "Certificates Issued",
      value: loading ? "..." : stats?.certificatesIssued || 0,
      trend: stats?.certificateTrend || 0,
      footerText: loading
        ? "..."
        : `${stats?.newCertificates || 0} new certificates issued this month.`,
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {displayData.map((item, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{item.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {item.trend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                {item.trend}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.footerText}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
