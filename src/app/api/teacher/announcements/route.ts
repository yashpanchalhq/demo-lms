import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseClient();

  // 1) fetch course ids the user is enrolled in
  const { data: enrolls } = await supabase
    .from("Enrollment")
    .select("course_id")
    .eq("user_id", userId);

  const courseIds = (enrolls ?? []).map((r: any) => r.course_id);

  // 2) fetch announcements that are global (course_id is null) OR match user's courses,
  // not expired
  const { data, error } = await supabase
    .from("announcements")
    .select("id, course_id, author_id, title, body, attachment_url, attachment_meta, expires_at, created_at, updated_at")
    .or(
      courseIds.length
        ? `course_id.is.null,course_id.in.(${courseIds.join(",")})`
        : `course_id.is.null`
    )
    .lte("expires_at", new Date().toISOString()) // include ones with expires_at <= now (optional)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("announcements fetch error", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { courseId = null, title, body: text, attachmentUrl = null, attachmentMeta = null, expiresAt = null } = body;

  if (!title || !text) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = getSupabaseClient();
  const { data, error } = await (supabase as any)
    .from("announcements")
    .insert([{
      course_id: courseId,
      author_id: userId,
      title,
      body: text,
      attachment_url: attachmentUrl,
      attachment_meta: attachmentMeta,
      expires_at: expiresAt
    }])
    .select()
    .single();

  if (error) {
    console.error("announcement insert error", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }

  return NextResponse.json(data);
}