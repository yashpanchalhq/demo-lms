import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

const FALLBACK_ADMINS = (process.env.ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

/** helper: is caller an admin (checks your User table role first; fallback to env list) */
async function callerIsAdmin(supabase: any, callerId: string) {
  if (!callerId) return false;

  try {
    const { data: u, error } = await supabase
      .from("User")
      .select("role, id")
      .eq("clerkId", callerId)
      .limit(1)
      .maybeSingle();

    console.log("🔍 Admin check:", { callerId, foundUser: u, error });

    if (!error && u?.role && ["ADMIN", "admin", "owner", "principal", "technical", "tech"].includes(String(u.role))) {
      return true;
    }
  } catch (err) {
    console.warn("callerIsAdmin: DB lookup failed", err);
  }

  // fallback to env list
  if (FALLBACK_ADMINS.includes(callerId)) {
    console.log("✅ Admin access granted via FALLBACK_ADMINS");
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  console.log("📧 Role assignment request received");

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
  const { targetUserId, role } = body;

  if (!targetUserId || !role) {
    return NextResponse.json({ error: "Missing targetUserId or role" }, { status: 400 });
  }

  if (!["ADMIN", "TEACHER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'ADMIN' or 'TEACHER'" }, { status: 400 });
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.updateUser(targetUserId, {
      publicMetadata: {
        role: role,
      },
    });
    console.log(`✅ User ${targetUserId} role updated to ${role} in Clerk public metadata.`);
    return NextResponse.json({ success: true, user: { id: user.id, publicMetadata: user.publicMetadata } });
  } catch (error: any) {
    console.error(`❌ Error assigning role to user ${targetUserId}:`, error);
    return NextResponse.json({
      error: `Failed to update user role: ${error.message || error.toString()}`,
      stack: error?.stack,
    }, { status: 500 });
  }
}