
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse("Not Allowed in Production", { status: 403 });
    }

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
      .single();

    if (requestingUserError || requestingUser?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Placeholder for resetting demo data
    console.log("Resetting demo data...");

    return NextResponse.json({ message: "Demo data reset successfully (placeholder)" });
  } catch (error) {
    console.error("[API_ADMIN_SETTINGS_RESET_DEMO_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
