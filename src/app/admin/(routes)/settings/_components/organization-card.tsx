
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface OrganizationCardProps {
  initialData: {
    organizationName: string;
    subdomain: string;
    contactEmail: string;
    phone: string;
    timezone: string;
  };
}

export const OrganizationCard = ({ initialData }: OrganizationCardProps) => {
  const [organizationName, setOrganizationName] = useState(initialData.organizationName);
  const [contactEmail, setContactEmail] = useState(initialData.contactEmail);
  const [phone, setPhone] = useState(initialData.phone);
  const [timezone, setTimezone] = useState(initialData.timezone);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        organizationName,
        subdomain: initialData.subdomain, // Subdomain is read-only
        contactEmail,
        phone,
        timezone,
      };
      await axios.put("/api/admin/settings", updatedSettings);
      toast.success("Organization settings updated!");
    } catch (error) {
      console.error("Error saving organization settings:", error);
      toast.error("Failed to save organization settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>Manage your organization's basic information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="subdomain">Subdomain / Portal URL</Label>
          <Input id="subdomain" defaultValue={initialData.subdomain} readOnly />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Select a timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};
