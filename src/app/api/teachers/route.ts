import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clerkUserId = searchParams.get('clerkUserId');

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Temporarily commented out admin role check for debugging
    // const { data: user, error: userError } = await supabase
    //   .from('User')
    //   .select('role')
    //   .eq('clerkId', clerkUserId)
    //   .single();

    // if (userError || user?.role !== 'ADMIN') {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    const q = searchParams.get('q');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('User')
      .select('id, email, role, createdAt', { count: 'exact' })
      .or('role.eq.TEACHER,role.eq.ADMIN');

    if (q) {
      query = query.ilike('email', `%${q}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;
    query = query.range(startIndex, endIndex);

    const { data: teachers, error: teachersError, count } = await query;

    if (teachersError) {
      console.error("[API_TEACHERS_GET]", teachersError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    return NextResponse.json({
      data: teachers,
      totalCount: count,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("[API_TEACHERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}