import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { SettingsHeader } from "./_components/settings-header";
import { OrganizationCard } from "./_components/organization-card";
import { BrandingCard } from "./_components/branding-card";
import { AuthenticationAccessCard } from "./_components/authentication-access-card";
import { PlatformFeaturesCard } from "./_components/platform-features-card";
import { IntegrationsEmailCard } from "./_components/integrations-email-card";
import { AdminsUserManagementCard } from "./_components/admins-user-management-card";
import { AuditBackupsCard } from "./_components/audit-backups-card";
import { DangerZoneCard } from "./_components/danger-zone-card";
import { getSupabaseClient } from "@/lib/supabase";

const SettingsPage = async () => {
  const { userId, getToken } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const sessionToken = await getToken();

  const supabase = getSupabaseClient();

  // Fetch settings from API
  const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`);
  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "API /api/admin/settings returned non-OK status:",
      response.status,
      errorText
    );
    throw new Error(
      `Failed to fetch settings: ${response.status} - ${errorText}`
    );
  }
  const responseText = await response.text();
  console.log("Raw response from /api/admin/settings:", responseText);
  const { config: fetchedConfig } = JSON.parse(responseText);

  // Fetch current admins
  const { data: admins, error: adminsError } = await supabase
    .from("User")
    .select("id, email, role")
    .eq("role", "ADMIN");

  if (adminsError) {
    console.error("Error fetching admins:", adminsError);
    // Handle error appropriately
  }

  // Merge fetched settings with default values to ensure all properties exist
  const settings = {
    organizationName: fetchedConfig.organizationName || "Your Organization",
    subdomain: fetchedConfig.subdomain || "your-portal",
    contactEmail: fetchedConfig.contactEmail || "contact@example.com",
    phone: fetchedConfig.phone || "",
    timezone: fetchedConfig.timezone || "Asia/Kolkata",
    logoUrl: fetchedConfig.logoUrl || "/next.svg",
    primaryColor: fetchedConfig.primaryColor || "#007bff",
    accentColor: fetchedConfig.accentColor || "#6c757d",
    welcomeMessage:
      fetchedConfig.welcomeMessage || "Welcome to our Teacher Training Portal!",
    faviconUrl: fetchedConfig.faviconUrl || "/favicon.ico",
    allowSelfRegistration: fetchedConfig.allowSelfRegistration ?? true,
    defaultRoleOnSignup: fetchedConfig.defaultRoleOnSignup || "Teacher",
    inviteOnlyMode: fetchedConfig.inviteOnlyMode ?? false,
    autoIssueCertificates: fetchedConfig.autoIssueCertificates ?? true,
    quizPassingThreshold: fetchedConfig.quizPassingThreshold || 75,
    allowVideoUploads: fetchedConfig.allowVideoUploads || "UploadThing",
    enableEmailReminders: fetchedConfig.enableEmailReminders ?? true,
    emailProvider: fetchedConfig.emailProvider || "None",
    storageProvider: fetchedConfig.storageProvider || "UploadThing",
    currentAdmins: admins || [],
  };

  return (
    <div className="p-6 space-y-6">
      <SettingsHeader orgIdentifier={settings.organizationName} />

      <OrganizationCard initialData={settings} />
      <BrandingCard initialData={settings} />
      <AuthenticationAccessCard initialData={settings} />
      <PlatformFeaturesCard initialData={settings} />
      <IntegrationsEmailCard initialData={settings} />
      <AdminsUserManagementCard initialData={settings} />
      <AuditBackupsCard />
      <DangerZoneCard />
    </div>
  );
};

export default SettingsPage;
