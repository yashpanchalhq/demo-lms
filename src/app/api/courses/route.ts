import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { data: courses, error } = await supabase.from('Course').select('*');

    if (error) {
      console.error('API /courses error', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error('API /courses error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request){
    try {
        const { userId } = getAuth(req);
        const { title } = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const supabase = getSupabaseClient();
        const { data: course, error } = await supabase
            .from('Course')
            .insert([
                { title, userId }
            ])
            .select()
            .single();

        if (error) {
            console.log("[COURSES]", error);
            return new NextResponse("Internal Error", {status : 500})
        }

        return NextResponse.json(course);

    } catch (error) {
        console.log("[COURSES]",error);
        return new NextResponse("Internal Error", {status : 500})
    }
}