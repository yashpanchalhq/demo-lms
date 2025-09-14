
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface ResultsSummaryProps {
  totalResults: number;
  teachersCount: number;
  coursesCount: number;
  modulesCount: number;
  certificatesCount: number;
  ticketsCount: number;
  timeTaken: number; // in ms
}

export const ResultsSummary = ({
  totalResults,
  teachersCount,
  coursesCount,
  modulesCount,
  certificatesCount,
  ticketsCount,
  timeTaken,
}: ResultsSummaryProps) => {
  return (
    <Card>
      <CardContent className="p-4 text-sm text-muted-foreground">
        Showing {totalResults} results in {timeTaken} ms —
        Teachers: {teachersCount},
        Courses: {coursesCount},
        Modules: {modulesCount},
        Certificates: {certificatesCount},
        Tickets: {ticketsCount}
      </CardContent>
    </Card>
  );
};
