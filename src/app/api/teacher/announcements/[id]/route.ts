import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

// Placeholder for admin check. In a real app, this would query your user roles.
async function checkIsAdmin(userId: string): Promise<boolean> {
  // For demo purposes, always return false or implement actual admin check
  // const supabase = getSupabaseClient();
  // const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").single();
  // return data !== null && error === null;
  return false; 
}

export async function PUT(req: NextRequest, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();
  const { data: existing } = await supabase.from("announcements").select("author_id").eq("id", context.params.id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // check permission: author or admin
  const isAuthor = (existing as any).author_id === userId;
  const isAdmin = await checkIsAdmin(userId); // implement or inline list for demo
  if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const updates: any = {};
  ["title", "body", "attachment_url", "attachment_meta", "expires_at", "course_id"].forEach((k) => {
    if (body[k] !== undefined) updates[k] = body[k];
  });

  const { data, error } = await (supabase as any).from("announcements")
    .update(updates)
    .eq("id", context.params.id)
    .select()
    .single();

  if (error) {
    console.error("announcement update error", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, context: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();
  const { data: existing } = await supabase.from("announcements").select("author_id").eq("id", context.params.id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // check permission: author or admin
  const isAuthor = (existing as any).author_id === userId;
  const isAdmin = await checkIsAdmin(userId); // Assuming checkIsAdmin is available
  if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", context.params.id);

  if (error) {
    console.error("announcement delete error", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ message: "Announcement deleted" });
}