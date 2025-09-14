// src/app/teacher/_components/teacher-section-cards.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

type Stats = {
  enrolledCourses: number;
  inProgressModules: number;
  avgCompletionPercent: number;
  certificatesCount: number;
  newCompletionsThisMonth?: number;
};

export function SectionCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/teacher/dashboard-stats", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!mounted) return;
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const display = [
    {
      title: "Enrolled Courses",
      value: loading ? "..." : stats?.enrolledCourses ?? 0,
      footer: loading ? "..." : `${stats?.enrolledCourses ?? 0} course(s)`,
    },
    {
      title: "In-progress Modules",
      value: loading ? "..." : stats?.inProgressModules ?? 0,
      footer: loading ? "..." : `${stats?.inProgressModules ?? 0} pending`,
    },
    {
      title: "Avg Completion",
      value: loading ? "..." : `${stats?.avgCompletionPercent ?? 0}%`,
      footer: loading ? "..." : `Avg across your courses`,
    },
    {
      title: "Certificates",
      value: loading ? "..." : stats?.certificatesCount ?? 0,
      footer: loading ? "..." : `${stats?.certificatesCount ?? 0} total`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      {display.map((d, i) => (
        <Card key={i}>
          <CardHeader>
            <CardDescription>{d.title}</CardDescription>
            <CardTitle className="text-2xl">{d.value}</CardTitle>
            <div className="mt-2">
              <Badge variant="outline">You</Badge>
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            {d.footer}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
