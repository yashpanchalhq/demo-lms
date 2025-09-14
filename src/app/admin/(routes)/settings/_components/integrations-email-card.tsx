"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";

interface IntegrationsEmailCardProps {
  initialData: {
    emailProvider: string;
    storageProvider: string;
  };
}

export const IntegrationsEmailCard = ({ initialData }: IntegrationsEmailCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations & Email</CardTitle>
        <CardDescription>Connect third-party services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="emailProvider">Email provider</Label>
          <Select defaultValue={initialData.emailProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select email provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMTP">SMTP</SelectItem>
              <SelectItem value="SendGrid">SendGrid</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="mt-2">Test Email Connection</Button>
        </div>
        <div className="space-y-1">
          <Label htmlFor="storageProvider">Storage provider</Label>
          <Select defaultValue={initialData.storageProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select storage provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UploadThing">UploadThing</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="mt-2">Test Storage Connection</Button>
        </div>
        <div className="space-y-1">
          <Label>SSO</Label>
          <p className="text-sm text-muted-foreground">SAML / Google Workspace (link to set up, not full flow in prototype)</p>
          <Button variant="outline" size="sm" className="mt-2">Set up SSO</Button>
        </div>
      </CardContent>
    </Card>
  );
};