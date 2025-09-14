
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React from "react";

export const AuditSafetyNotes = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit / Safety Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          For certain emergency actions (e.g., remote assistance, database rollbacks),
          we may request temporary access to your organization's data.
          All such access is logged and audited.
        </p>
        <div className="flex items-center space-x-2">
          <Checkbox id="consent" />
          <Label htmlFor="consent" className="text-sm">
            I understand and consent to temporary access for support purposes.
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
