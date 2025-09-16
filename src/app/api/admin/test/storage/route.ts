
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
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
      .single();

    if (requestingUserError || requestingUser?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Placeholder for testing storage connectivity
    console.log("Testing storage connectivity...");

    return NextResponse.json({ message: "Storage connection test successful (placeholder)" });
  } catch (error) {
    console.error("[API_ADMIN_TEST_STORAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
