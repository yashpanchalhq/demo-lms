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

    const { id, role } = await req.json(); // id is the Supabase User ID, role is the new role

    if (!id || !role) {
      return new NextResponse("Missing user ID or role", { status: 400 });
    }

    // Fetch the user's current role for audit logging
    const { data: userToUpdate, error: fetchUserError } = await supabase
      .from('User')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchUserError) {
      console.error("[API_ADMIN_USERS_ROLE_POST] Fetch User Error:", fetchUserError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    const previousRole = userToUpdate?.role;

    // Update the user's role in Supabase
    const { data: updatedUser, error: updateError } = await supabase
      .from('User')
      .update({ role: role })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error("[API_ADMIN_USERS_ROLE_POST] Update Error:", updateError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Log audit for role update
    await supabase.from('AdminAudit').insert({
      adminId: clerkUserId,
      action: 'user_role_updated',
      meta: { user_id: id, previous_role: previousRole, new_role: role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[API_ADMIN_USERS_ROLE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}