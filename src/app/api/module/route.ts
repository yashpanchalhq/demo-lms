
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { course_id, title, description, content_type, content_url, order_index, is_required } = body;
        if (!course_id || !title || !description || !content_type || !order_index) {
            return NextResponse.json({ error: 'missing fields' }, { status: 400 });
        }

        const supabase = getSupabaseClient();

        const { data: mod, error } = await supabase
            .from('Module')
            .insert([
                {
                    course_id,
                    title,
                    description,
                    content_type,
                    content_url,
                    order_index,
                    is_required,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('POST /api/module', error);
            return NextResponse.json({ error: 'internal_error' }, { status: 500 });
        }

        return NextResponse.json(mod, { status: 201 });
    } catch (err) {
        console.error('POST /api/module', err);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
