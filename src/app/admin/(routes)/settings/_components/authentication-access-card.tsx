"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface AuthenticationAccessCardProps {
  initialData: {
    allowSelfRegistration: boolean;
    defaultRoleOnSignup: string;
    inviteOnlyMode: boolean;
  };
}

export const AuthenticationAccessCard = ({
  initialData,
}: AuthenticationAccessCardProps) => {
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(
    initialData.allowSelfRegistration
  );
  const [defaultRoleOnSignup, setDefaultRoleOnSignup] = useState(
    initialData.defaultRoleOnSignup
  );
  const [inviteOnlyMode, setInviteOnlyMode] = useState(
    initialData.inviteOnlyMode
  );
  const [isSaving, setIsSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Teacher");
  const [isInviting, setIsInviting] = useState(false);

  const handleSave = async (
    updatedFields: Partial<AuthenticationAccessCardProps["initialData"]>
  ) => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        allowSelfRegistration:
          updatedFields.allowSelfRegistration ?? allowSelfRegistration,
        defaultRoleOnSignup:
          updatedFields.defaultRoleOnSignup ?? defaultRoleOnSignup,
        inviteOnlyMode: updatedFields.inviteOnlyMode ?? inviteOnlyMode,
      };
      await axios.put("/api/admin/settings", updatedSettings);
      toast.success("Authentication settings updated!");
    } catch (error) {
      console.error("Error saving authentication settings:", error);
      toast.error("Failed to save authentication settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      await axios.post("/api/admin/invite", {
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success("Invite sent successfully!");
      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication & Access</CardTitle>
        <CardDescription>
          Configure user registration and roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="allowSelfRegistration">Allow self-registration</Label>
          <Switch
            id="allowSelfRegistration"
            checked={allowSelfRegistration}
            onCheckedChange={(checked) => {
              setAllowSelfRegistration(checked);
              handleSave({ allowSelfRegistration: checked });
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="defaultRoleOnSignup">Default role on signup</Label>
          <Select
            value={defaultRoleOnSignup}
            onValueChange={(value) => {
              setDefaultRoleOnSignup(value);
              handleSave({ defaultRoleOnSignup: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Teacher">Teacher</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="inviteOnlyMode">Invite-only mode</Label>
          <Switch
            id="inviteOnlyMode"
            checked={inviteOnlyMode}
            onCheckedChange={(checked) => {
              setInviteOnlyMode(checked);
              handleSave({ inviteOnlyMode: checked });
            }}
          />
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/roles">Role management</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Invite admins/teachers</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Invite User</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the email and select the role for the user you want to
                invite.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="User Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={() => handleSave({})} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};
