
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
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

    // Hardcoded list of roles for prototype
    const roles = [
      { name: "ADMIN", description: "Full access to the admin dashboard." },
      { name: "TEACHER", description: "Can create and manage courses." },
      { name: "STUDENT", description: "Can enroll in and complete courses." },
    ];

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[API_ADMIN_ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
