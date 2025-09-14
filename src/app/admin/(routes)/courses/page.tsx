import { getSupabaseClient } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/column";
const CoursesPage = async () => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  const supabase = getSupabaseClient();
  const { data: courses, error } = await supabase
    .from('Course')
    .select('*')
    .eq('userId', userId) // Fetch only courses created by the current user
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    // Handle error appropriately, maybe return an empty array or show an error message
    return (
      <>
        <div className="p-6">
          <p>Error loading courses.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6">
        <DataTable columns={columns} data={courses || []} />
      </div>
    </>
  );
};
export default CoursesPage;