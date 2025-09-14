
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface PlatformFeaturesCardProps {
  initialData: {
    autoIssueCertificates: boolean;
    quizPassingThreshold: number;
    allowVideoUploads: string;
    enableEmailReminders: boolean;
  };
}

export const PlatformFeaturesCard = ({ initialData }: PlatformFeaturesCardProps) => {
  const [autoIssueCertificates, setAutoIssueCertificates] = useState(initialData.autoIssueCertificates);
  const [quizPassingThreshold, setQuizPassingThreshold] = useState(initialData.quizPassingThreshold);
  const [allowVideoUploads, setAllowVideoUploads] = useState(initialData.allowVideoUploads);
  const [enableEmailReminders, setEnableEmailReminders] = useState(initialData.enableEmailReminders);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedFields: Partial<PlatformFeaturesCardProps['initialData']>) => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        autoIssueCertificates: updatedFields.autoIssueCertificates ?? autoIssueCertificates,
        quizPassingThreshold: updatedFields.quizPassingThreshold ?? quizPassingThreshold,
        allowVideoUploads: updatedFields.allowVideoUploads ?? allowVideoUploads,
        enableEmailReminders: updatedFields.enableEmailReminders ?? enableEmailReminders,
      };
      await axios.put("/api/admin/settings", updatedSettings);
      toast.success("Platform features updated!");
    } catch (error) {
      console.error("Error saving platform features:", error);
      toast.error("Failed to save platform features.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform / Features</CardTitle>
        <CardDescription>Configure core platform functionalities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="autoIssueCertificates">Auto-issue certificates on completion</Label>
          <Switch id="autoIssueCertificates" checked={autoIssueCertificates} onCheckedChange={(checked) => { setAutoIssueCertificates(checked); handleSave({ autoIssueCertificates: checked }); }} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="quizPassingThreshold">Quiz passing threshold (%)</Label>
          <Input id="quizPassingThreshold" type="number" value={quizPassingThreshold} onChange={(e) => setQuizPassingThreshold(parseInt(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="allowVideoUploads">Allow video uploads</Label>
          <Select value={allowVideoUploads} onValueChange={(value) => { setAllowVideoUploads(value); handleSave({ allowVideoUploads: value }); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select video upload method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UploadThing">UploadThing</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="enableEmailReminders">Enable email reminders</Label>
          <Switch id="enableEmailReminders" checked={enableEmailReminders} onCheckedChange={(checked) => { setEnableEmailReminders(checked); handleSave({ enableEmailReminders: checked }); }} />
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={() => handleSave({})} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};
