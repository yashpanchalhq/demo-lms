import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

// Placeholder for admin check. In a real app, this would query your user roles.
async function checkIsAdmin(userId: string): Promise<boolean> {
  // For demo purposes, always return false or implement actual admin check
  return false; 
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  // Verify ownership or admin status
  const { data: existing, error: fetchError } = await supabase
    .from("teacher_schedule")
    .select("teacher_id")
    .eq("id", params.id)
    .single();

  if (fetchError || !existing) {
    console.error("Schedule entry fetch error:", fetchError);
    return NextResponse.json({ error: "Schedule entry not found" }, { status: 404 });
  }

  const isOwner = existing.teacher_id === userId;
  const isAdmin = await checkIsAdmin(userId);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updates: any = {};
  ["title", "description", "start_time", "end_time", "location", "mode"].forEach((key) => {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  });

  const { data, error } = await supabase
    .from("teacher_schedule")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("Schedule update error:", error);
    return NextResponse.json({ error: "Failed to update schedule entry" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  // Verify ownership or admin status
  const { data: existing, error: fetchError } = await supabase
    .from("teacher_schedule")
    .select("teacher_id")
    .eq("id", params.id)
    .single();

  if (fetchError || !existing) {
    console.error("Schedule entry fetch error:", fetchError);
    return NextResponse.json({ error: "Schedule entry not found" }, { status: 404 });
  }

  const isOwner = existing.teacher_id === userId;
  const isAdmin = await checkIsAdmin(userId);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("teacher_schedule")
    .delete()
    .eq("id", params.id);

  if (error) {
    console.error("Schedule delete error:", error);
    return NextResponse.json({ error: "Failed to delete schedule entry" }, { status: 500 });
  }

  return NextResponse.json({ message: "Schedule entry deleted" });
}
