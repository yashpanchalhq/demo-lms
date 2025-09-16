
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const { userId } = getAuth(req);
    const { courseId } = context.params;
    const { url } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: courseOwner, error: courseError } = await supabase
      .from('Course')
      .select('id')
      .eq('id', courseId)
      .eq('userId', userId)
      .single();

    if (courseError || !courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from('Attachment')
      .insert([
        {
          url,
          name: url.split('/').pop(), // Extract file name from URL
          courseId,
        },
      ])
      .select()
      .single();

    if (attachmentError) {
      console.log("[ATTACHMENT_CREATE]", attachmentError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("[ATTACHMENT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
