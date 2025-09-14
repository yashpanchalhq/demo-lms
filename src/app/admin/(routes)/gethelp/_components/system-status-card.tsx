
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

interface SystemStatusCardProps {
  status: "OK" | "Degraded" | "Outage";
  lastUpdated: string;
  statusPageLink: string;
}

export const SystemStatusCard = ({
  status,
  lastUpdated,
  statusPageLink,
}: SystemStatusCardProps) => {
  const statusColor = {
    OK: "bg-green-500",
    Degraded: "bg-yellow-500",
    Outage: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current operational status of the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={`${statusColor[status]} text-white`}>{status}</Badge>
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        </div>
        <Link href={statusPageLink} className="text-blue-600 hover:underline text-sm">
          View Status Page
        </Link>
      </CardContent>
    </Card>
  );
};
