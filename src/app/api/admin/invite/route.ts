
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
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

    const { email, role } = await req.json();

    if (!email || !role) {
      return new NextResponse("Missing email or role", { status: 400 });
    }

    // Placeholder for creating invite token and sending email
    console.log(`Inviting ${email} with role ${role}`);

    return NextResponse.json({ message: "Invite sent successfully (placeholder)" });
  } catch (error) {
    console.error("[API_ADMIN_INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
