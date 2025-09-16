
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Check if the requesting user is an admin
    const { data: requestingUser, error: requestingUserError } = await supabase
      .from('User')
      .select('role')
      .eq('clerkId', clerkUserId)
      .single<{ role: string }>();

    if (requestingUserError || requestingUser?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: auditLogs, error: auditLogsError } = await supabase
      .from('ActivityLog')
      .select('*')
      .order('createdAt', { ascending: false });

    if (auditLogsError) {
      console.error("[API_ADMIN_AUDIT_GET]", auditLogsError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error("[API_ADMIN_AUDIT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
