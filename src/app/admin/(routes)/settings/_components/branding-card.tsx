
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";

interface BrandingCardProps {
  initialData: {
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    welcomeMessage: string;
    faviconUrl: string;
  };
}

export const BrandingCard = ({ initialData }: BrandingCardProps) => {
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialData.primaryColor);
  const [accentColor, setAccentColor] = useState(initialData.accentColor);
  const [welcomeMessage, setWelcomeMessage] = useState(initialData.welcomeMessage);
  const [faviconUrl, setFaviconUrl] = useState(initialData.faviconUrl);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedFields: Partial<BrandingCardProps['initialData']>) => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        logoUrl: updatedFields.logoUrl ?? logoUrl,
        primaryColor: updatedFields.primaryColor ?? primaryColor,
        accentColor: updatedFields.accentColor ?? accentColor,
        welcomeMessage: updatedFields.welcomeMessage ?? welcomeMessage,
        faviconUrl: updatedFields.faviconUrl ?? faviconUrl,
      };
      await axios.put("/api/admin/settings", updatedSettings);
      toast.success("Branding settings updated!");
    } catch (error) {
      console.error("Error saving branding settings:", error);
      toast.error("Failed to save branding settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Customize the look and feel of your portal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="logoUpload">Logo Upload (small square)</Label>
          <FileUpload
            endpoint="courseImage" // Reusing courseImage endpoint for now
            onChangeAction={(url) => {
              if (url) {
                setLogoUrl(url);
                handleSave({ logoUrl: url });
              }
            }}
          />
          {logoUrl && (
            <div className="relative aspect-video mt-2 w-[100px] h-[100px]">
              <Image
                alt="Logo Preview"
                fill
                className="object-cover rounded-md"
                src={logoUrl}
              />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="accentColor">Accent Color</Label>
          <Input id="accentColor" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          <Textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="faviconUpload">Favicon Upload (optional)</Label>
          <FileUpload
            endpoint="courseImage" // Reusing courseImage endpoint for now
            onChangeAction={(url) => {
              if (url) {
                setFaviconUrl(url);
                handleSave({ faviconUrl: url });
              }
            }}
          />
          {faviconUrl && (
            <div className="relative aspect-video mt-2 w-[50px] h-[50px]">
              <Image
                alt="Favicon Preview"
                fill
                className="object-cover rounded-md"
                src={faviconUrl}
              />
            </div>
          )}
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
