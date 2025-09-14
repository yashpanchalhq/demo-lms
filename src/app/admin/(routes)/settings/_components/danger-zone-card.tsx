import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

export const DangerZoneCard = () => {
  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="text-red-600">Danger Zone</CardTitle>
        <CardDescription>Irreversible actions for your organization.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Button variant="destructive">Reset Demo Data</Button>
        </div>
        <div className="space-y-1">
          <Button variant="destructive">Delete Organization</Button>
        </div>
      </CardContent>
    </Card>
  );
};