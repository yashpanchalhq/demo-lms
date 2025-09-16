import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { checkRole } from "@/utils/roles";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Check if the requesting user is an admin
    if (!checkRole("admin")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: users, error } = await supabase
      .from("User")
      .select("clerkId, email, id, role"); // Include internal id and role

    if (error) {
      console.error("[API_ADMIN_USERS_GET] Error fetching users:", error);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("[API_ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
