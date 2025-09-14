// src/app/api/admin/enrollments/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

const FALLBACK_ADMINS = (process.env.ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

async function callerIsAdmin(supabase: any, callerId: string) {
  if (!callerId) return false;

  try {
    // 1) First try your DB: lookup by clerkId (not id)
    const { data: u, error } = await supabase
      .from("User")
      .select("role, clerkId")
      .eq("clerkId", callerId)
      .limit(1)
      .maybeSingle();

    if (!error && u?.role && ["admin", "owner", "principal", "technical", "tech"].includes(String(u.role).toLowerCase())) {
      return true;
    }
  } catch (err) {
    console.warn("callerIsAdmin DB lookup failed", err);
  }

  // 2) Fallback to env list
  if (FALLBACK_ADMINS.includes(callerId)) return true;

  // 3) Optional: check Clerk user's publicMetadata/roles if you store roles in Clerk
  try {
    const clerkUser = await clerkClient.users.getUser(callerId);
    const publicMeta = (clerkUser?.publicMetadata ?? {}) as any;
    if (publicMeta?.role && ["admin","owner"].includes(String(publicMeta.role).toLowerCase())) {
      return true;
    }
  } catch (err) {
    /* noop */
  }

  return false;
}

export async function POST(req: Request) {
  console.log("📧 Enrollment request received");
  
  const { userId: callerId } = await auth();
  if (!callerId) {
    console.error("❌ No caller ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("👤 Caller ID:", callerId);

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("❌ No Supabase client available on server");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const isAdmin = await callerIsAdmin(supabase as any, callerId);
  if (!isAdmin) {
    console.error("❌ Not admin:", callerId);
    return NextResponse.json({ error: "Forbidden - not admin" }, { status: 403 });
  }

  console.log("✅ Admin access confirmed");

  const body = await req.json().catch(() => ({}));
  const { teacherClerkId, teacherDbId, teacherEmail, courseId } = body;

  console.log("📝 Request body:", { teacherClerkId, teacherDbId, teacherEmail, courseId });

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  let clerkId: string | null = teacherClerkId ?? null;
  let teacherDatabaseId: string | null = teacherDbId ?? null;

  // 1) If teacherDbId provided, try to read clerkId from your User table
  if (!clerkId && teacherDbId) {
    try {
      const { data: row, error } = await (supabase as any)
        .from("User")
        .select("clerkId, email, id")
        .eq("id", teacherDbId)
        .limit(1)
        .maybeSingle();

      console.log("🔍 DB lookup by teacherDbId:", { row, error });

      if (error) {
        console.warn("DB lookup for teacherDbId failed:", error);
      } else if (row) {
        if (row.clerkId) clerkId = row.clerkId;
        teacherDatabaseId = row.id;
        if (row.email && !teacherEmail) {
          (body as any).teacherEmail = row.email;
        }
      }
    } catch (err) {
      console.error("Error resolving teacherDbId:", err);
    }
  }

  // 2) If we have clerkId but no database ID, look up the database ID
  if (clerkId && !teacherDatabaseId) {
    try {
      const { data: row, error } = await (supabase as any)
        .from("User")
        .select("id, email")
        .eq("clerkId", clerkId)
        .limit(1)
        .maybeSingle();

      console.log("🔍 DB lookup by clerkId:", { row, error });

      if (!error && row) {
        teacherDatabaseId = row.id;
      }
    } catch (err) {
      console.error("Error looking up teacher by clerkId:", err);
    }
  }

  // 3) If still no clerkId and we have an email, try Clerk lookup by email
  if (!clerkId && (teacherEmail || (body as any).teacherEmail)) {
    const email = teacherEmail ?? (body as any).teacherEmail;
    try {
      const users = await clerkClient.users.getUserList({ emailAddress: [email] });
      console.log("🔍 Clerk lookup by email:", { email, foundUsers: users?.length });
      
      if (users?.length) {
        clerkId = users[0].id;
        
        // Also try to get the database ID
        if (clerkId && !teacherDatabaseId) {
          const { data: row, error } = await (supabase as any)
            .from("User")
            .select("id")
            .eq("clerkId", clerkId)
            .limit(1)
            .maybeSingle();
          
          if (!error && row) {
            teacherDatabaseId = row.id;
          }
        }
      } else {
        console.warn("No Clerk user found for email", email);
      }
    } catch (err) {
      console.error("Clerk lookup failed:", err);
    }
  }

  if (!clerkId) {
    console.error("❌ Could not resolve Clerk ID");
    return NextResponse.json({
      error: "Could not resolve Clerk user id for teacher. Provide `teacherClerkId` or ensure User.clerkId is populated or provide teacherEmail.",
    }, { status: 400 });
  }

  if (!teacherDatabaseId) {
    console.error("❌ Could not resolve database user ID");
    return NextResponse.json({
      error: "Could not resolve teacher's database ID. Teacher may not exist in the User table.",
    }, { status: 400 });
  }

  console.log("✅ Resolved IDs:", { clerkId, teacherDatabaseId });

  // 4) Check if course exists
  try {
    const { data: course, error: courseError } = await (supabase as any)
      .from("Course")
      .select("id, title")
      .eq("id", courseId)
      .limit(1)
      .maybeSingle();

    if (courseError || !course) {
      console.error("❌ Course not found:", { courseId, courseError });
      return NextResponse.json({
        error: "Course not found",
        courseId,
      }, { status: 404 });
    }

    console.log("✅ Course found:", course);
  } catch (err) {
    console.error("Error checking course:", err);
    return NextResponse.json({ error: "Error validating course" }, { status: 500 });
  }

  // 5) Insert (upsert) into course_enrollments
  // DECISION: Use database user ID instead of Clerk ID for foreign key relationships
  const payload = {
    user_id: teacherDatabaseId,  // <-- CHANGED: Use database ID instead of Clerk ID
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    status: "active",
  };

  console.log("📝 Enrollment payload:", payload);

  try {
    // use upsert with onConflict to avoid duplicate errors
    const { data, error } = await (supabase as any)
      .from("enrollments")
      .upsert([payload], { onConflict: "user_id,course_id" })
      .select();

    if (error) {
      console.error("❌ Enrollment insert/upsert error:", error);
      return NextResponse.json({ 
        error: error.message || error.toString(),
        details: error 
      }, { status: 500 });
    }

    const enrollment = Array.isArray(data) ? data[0] ?? null : data ?? null;
    
    console.log("✅ Enrollment successful:", enrollment);

    return NextResponse.json({ 
      success: true, 
      enrollment,
      teacher: {
        clerkId,
        databaseId: teacherDatabaseId
      }
    });
  } catch (err: any) {
    console.error("❌ Enrollment route unexpected error:", err);
    return NextResponse.json({ 
      error: String(err),
      stack: err?.stack 
    }, { status: 500 });
  }
}