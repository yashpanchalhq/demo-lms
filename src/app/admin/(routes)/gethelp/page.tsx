import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { GetHelpHeader } from "./_components/get-help-header";
import { SystemStatusCard } from "./_components/system-status-card";
import { QuickActionsRow } from "./_components/quick-actions-row";
import { FaqKbSection } from "./_components/faq-kb-section";
import { HowToVideosSection } from "./_components/how-to-videos-section";
import { FileUploadSection } from "./_components/file-upload-section";
import { CreateTicketForm } from "./_components/create-ticket-form";
import { RecentTicketsSection } from "./_components/recent-tickets-section";
import { ContactChannelsSection } from "./_components/contact-channels-section";
import { AuditSafetyNotes } from "./_components/audit-safety-notes";

const GetHelpPage = async () => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  // Mock Data for now
  const systemStatus = {
    status: "OK",
    lastUpdated: "2023-10-27T10:00:00Z",
    statusPageLink: "#",
  } as const;

  const faqs = [
    { question: "How do I reset my password?", answer: "..." },
    { question: "How to enroll in a course?", answer: "..." },
    { question: "Where can I find my certificates?", answer: "..." },
  ];

  const videos = [
    { title: "Onboarding Guide", url: "#" },
    { title: "Issuing Certificates", url: "#" },
    { title: "Bulk Enrollment", url: "#" },
  ];

  const recentTickets = [
    { id: "ticket1", title: "Login Issue", status: "open", createdAt: "2023-10-25T14:30:00Z" },
    { id: "ticket2", title: "Course Content Error", status: "resolved", createdAt: "2023-10-20T09:00:00Z" },
  ];

  return (
    <div className="p-6 space-y-6">
      <GetHelpHeader />
      <SystemStatusCard status={systemStatus.status} lastUpdated={systemStatus.lastUpdated} statusPageLink={systemStatus.statusPageLink} />
      <QuickActionsRow />
      <FaqKbSection faqs={faqs} />
      <HowToVideosSection videos={videos} />
      <FileUploadSection />
      <CreateTicketForm />
      <RecentTicketsSection tickets={recentTickets} />
      <ContactChannelsSection />
      <AuditSafetyNotes />
    </div>
  );
};

export default GetHelpPage;