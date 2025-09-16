import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getInProgressModules } from "@/lib/teacher";
import InProgressList from "./_components/InProgressList";

interface InProgressPageProps {
  searchParams?: { page?: string; q?: string; courseId?: string } & Promise<any>;
}

export default async function InProgressPage({
  searchParams,
}: InProgressPageProps) {
  const user = await currentUser();
  if (!user?.id) {
    return (
      <div className="p-6">
        Please sign in to view your in-progress modules.
      </div>
    );
  }

  const page = parseInt(searchParams?.page || "1");
  const limit = 100; // for demo; adjust if you want pagination
  const { total, items } = await getInProgressModules(user.id, page, limit);

  // server component passes initial items to client list
  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {total} pending module{total === 1 ? "" : "s"} across your courses
          </p>
        </div>
      </header>

      {/* Client component handles interactions (mark complete, filters) */}
      <InProgressList initialItems={items} total={total} userId={user.id} />
    </div>
  );
}
