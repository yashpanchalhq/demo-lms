"use client";
import * as React from "react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function ChartArea() {
  const [data, setData] = React.useState<
    Array<{ date: string; completions: number }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/teacher/course-progress", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!mounted) return;
        setData(json); // expect [{date, completions}]
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

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>My Progress</CardTitle>
          <CardDescription>Completions over time</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div>Loading chart...</div>
        ) : (
          <div className="h-[250px] w-full">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="teacherFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <Area
                dataKey="completions"
                stroke="var(--primary)"
                fill="url(#teacherFill)"
              />
            </AreaChart>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
