
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

    const { logoUrl } = await req.json();

    if (!logoUrl) {
      return new NextResponse("Missing logoUrl", { status: 400 });
    }

    // Fetch current settings to update only the logoUrl within the config JSONB
    const { data: currentSettings, error: fetchError } = await supabase
      .from('Settings')
      .select('config')
      .eq('id', '00000000-0000-0000-0000-000000000000') // Use the fixed UUID
      .single();

    if (fetchError) {
      console.error("[API_ADMIN_SETTINGS_LOGO_POST] Fetch Error:", fetchError);
      return new NextResponse("Internal Error", { status: 500 });
    }

                const updatedConfig = typeof currentSettings.config === 'object' && currentSettings.config !== null
      ? { ...currentSettings.config, logoUrl: logoUrl }
      : { logoUrl: logoUrl };

    const { data: updatedSettings, error: updateError } = await supabase
      .from('Settings')
      .update({ config: updatedConfig })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single();

    if (updateError) {
      console.error("[API_ADMIN_SETTINGS_LOGO_POST] Update Error:", updateError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("[API_ADMIN_SETTINGS_LOGO_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
