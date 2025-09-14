import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    // Removed all authentication and authorization checks for simplicity
    // const { userId: clerkUserId } = getAuth(req);
    // if (!clerkUserId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }
    const supabase = getSupabaseClient(); // Re-initialize supabase client here
    // const { data: requestingUser, error: requestingUserError } = await supabase
    //   .from('User')
    //   .select('role')
    //   .eq('clerkId', clerkUserId)
    //   .single();
    // if (requestingUserError || requestingUser?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { data: settings, error: settingsError } = await supabase
      .from('Settings')
      .select('config')
      .single();

    if (settingsError) {
      console.error("[API_ADMIN_SETTINGS_GET]", settingsError);
      // If no settings found, return a default empty config
      if (settingsError.code === 'PGRST116') { // No rows found
        return NextResponse.json({ config: {} });
      }
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[API_ADMIN_SETTINGS_GET] (Catch Block)", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId: clerkUserId } = auth();

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

    const updatedConfig = await req.json();

    // Fetch current settings for audit logging (previous value)
    const { data: currentSettings, error: fetchError } = await supabase
      .from('Settings')
      .select('config')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error("[API_ADMIN_SETTINGS_PUT] Fetch Error for Audit:", fetchError);
      // Continue without audit if fetch fails, but log the error
    }

    const previousConfig = currentSettings?.config || {};

    // Try to update the existing settings record
    const { data: settings, error: updateError } = await supabase
      .from('Settings')
      .update({ config: updatedConfig })
      .eq('id', '00000000-0000-0000-0000-000000000000') // Placeholder UUID for the single settings row
      .select()
      .single();

    if (updateError) {
      // If update fails, it might be because the row doesn't exist. Try inserting.
      if (updateError.code === 'PGRST116' || updateError.code === '22P02') { // PGRST116: no rows found, 22P02: invalid uuid format
        const { data: newSettings, error: insertError } = await supabase
          .from('Settings')
          .insert({ config: updatedConfig, id: '00000000-0000-0000-0000-000000000000' }) // Insert with fixed UUID
          .select()
          .single();

        if (insertError) {
          console.error("[API_ADMIN_SETTINGS_PUT] Insert Error:", insertError);
          return new NextResponse("Internal Error", { status: 500 });
        }
        // Log audit for insert
        await supabase.from('AdminAudit').insert({
          adminId: clerkUserId,
          action: 'settings_created',
          meta: { new_config: updatedConfig },
        });
        return NextResponse.json(newSettings);
      }
      console.error("[API_ADMIN_SETTINGS_PUT] Update Error:", updateError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Log audit for update
    await supabase.from('AdminAudit').insert({
      adminId: clerkUserId,
      action: 'settings_updated',
      meta: { previous_config: previousConfig, new_config: updatedConfig },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[API_ADMIN_SETTINGS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}