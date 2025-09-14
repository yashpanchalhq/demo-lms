
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";

interface CompletionByCourseChartProps {
  data: { course: string; completion: number }[];
}

export const CompletionByCourseChart = ({
  data,
}: CompletionByCourseChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion % per Course</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="course" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="completion" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
