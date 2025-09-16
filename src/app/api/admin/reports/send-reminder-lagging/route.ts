import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
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

    const { teacherIds } = await req.json();

    console.log("Sending reminder to teachers:", teacherIds);

    // Placeholder for actual email sending logic
    // In a real application, you would integrate with an email service here

    return NextResponse.json({ message: "Reminders sent successfully (placeholder)" });
  } catch (error) {
    console.error("[API_REPORTS_SEND_REMINDER_LAGGING]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}