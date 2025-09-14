import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

// Placeholder for admin check. In a real app, this would query your user roles.
async function checkIsAdmin(userId: string): Promise<boolean> {
  // For demo purposes, always return false or implement actual admin check
  return false; 
}

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("teacher_schedule") // Assuming a table named 'teacher_schedule'
    .select("*" )
    .eq("teacher_id", userId) // Assuming schedule entries are linked to teacher_id
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Schedule fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { title, description, start_time, end_time, location, mode } = body;

  if (!title || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing required fields: title, start_time, end_time" }, { status: 400 });
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("teacher_schedule")
    .insert([
      {
        teacher_id: userId, // Link to the admin user creating it
        title,
        description,
        start_time,
        end_time,
        location,
        mode,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Schedule insert error:", error);
    return NextResponse.json({ error: "Failed to create schedule entry" }, { status: 500 });
  }

  return NextResponse.json(data);
}
