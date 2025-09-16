import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("announcement_views" as any)
    .insert([{ announcement_id: context.params.id, user_id: userId }])
    .select()
    .single();

  if (error) {
    // If the error is due to a unique constraint violation (user already viewed),
    // we can just return success, as the view is effectively logged.
    // Supabase error codes for unique constraint violation can vary, often '23505'.
    if (error.code === '23505') {
      return NextResponse.json({ message: "View already logged" }, { status: 200 });
    }
    console.error("Announcement view log error", error);
    return NextResponse.json({ error: "Failed to log view" }, { status: 500 });
  }

  return NextResponse.json(data);
}