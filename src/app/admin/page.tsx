import { ChartAreaInteractive } from "@/app/admin/_components/chart-area-interactive";
import { DataTable } from "@/app/admin/_components/data-table";
import { SectionCards } from "@/app/admin/_components/section-cards";
import { getSupabaseClient } from "@/lib/supabase";
import { Json } from "@/lib/database.types";

// Define the expected shape of an entry in the ActivityLog table.
// Note: This is an assumption based on common table structures for activity logs.
// If your table has different columns, you'll need to adjust this interface.
interface ActivityLog {
  id: string;
  action: string;
  details: { targetId?: string } | null;
  createdAt: string;
  userId: string;
}

async function getDashboardData() {
  const supabase = getSupabaseClient();

  const { data: activityLogs, error } = await supabase
    .from('ActivityLog')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(10); // Fetch latest 10 activities

  if (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }

  // Supabase client returns 'any[]' by default if no types are provided.
  // We cast the data to our ActivityLog type to get type safety.
  const typedActivityLogs = activityLogs as ActivityLog[];

  // Transform the ActivityLog data to the format expected by DataTable
  const transformedData = typedActivityLogs.map(log => ({
    id: log.id,
    header: log.action, // e.g., "COURSE_CREATED"
    type: log.action.split('_')[0], // e.g., "COURSE"
    status: 'Completed', // Assuming logged activities are completed
    target: log.details?.targetId || 'N/A', // Assuming targetId is in details
    limit: new Date(log.createdAt).toLocaleDateString(), // The date of the activity
    reviewer: log.userId || 'System', // The user who performed the action
  }));

  return transformedData;
}


export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}
