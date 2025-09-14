import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const AuditBackupsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit & Backups</CardTitle>
        <CardDescription>Review system activity and manage data backups.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Button variant="outline" asChild>
            <Link href="/admin/audit-logs">View Audit Logs</Link>
          </Button>
        </div>
        <div className="space-y-1">
          <Button variant="outline">Backup / Export DB (CSV Snapshot)</Button>
        </div>
      </CardContent>
    </Card>
  );
};