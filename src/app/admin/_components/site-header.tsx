"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
// import { UserButton } from "@clerk/nextjs"; // Clerk skipped for now
import { usePathname } from "next/navigation";

import { ModeToggle } from "@/components/theme-toggle";
import NotificationDrawer from "@/components/notifications/NotificationDrawer";

const getTitleFromPath = (path: string) => {
  const segments = path.split("/").filter(Boolean); // Filter out empty strings
  if (segments.length <= 1) return "Dashboard"; // Default for base dashboard
  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export function SiteHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  // const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY); // Clerk skipped for now
  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 transition-[height] ease-linear lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />
      <h1 className="text-base font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <NotificationDrawer />
        <ModeToggle />
        {/* {hasClerk && <UserButton afterSignOutUrl="/" />} */}
      </div>
    </header>
  );
}
