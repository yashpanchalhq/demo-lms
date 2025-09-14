import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

type TeacherRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function GET(req: Request) {
  try {
    // Fix 1: Use auth() instead of getAuth(req)
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Temporarily commented out admin role check for debugging
    // const { data: requestingUser, error: requestingUserError } = await supabase
    //   .from('User')
    //   .select('role')
    //   .eq('clerkId', clerkUserId)
    //   .single();

    // if (requestingUserError || requestingUser?.role !== 'ADMIN') {
    //   return new NextResponse("Forbidden", { status: 403 });
    // }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('User')
      .select('id, email, role, createdAt'); // No count for export

    if (q) {
      query = query.ilike('email', `%${q}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // No pagination for export, fetch all filtered results

    const { data: teachers, error: teachersError } = await query;

    if (teachersError) {
      console.error("[API_ADMIN_TEACHERS_EXPORT]", teachersError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    if (!teachers || teachers.length === 0) {
      return new NextResponse("No data to export", { status: 204 });
    }

    // Fix 2: Type assertion to help TypeScript understand the structure
    const typedTeachers = teachers as TeacherRow[];

    // Format data for CSV
    const csvData = typedTeachers.map(teacher => ({
      "ID": teacher.id,
      "Email": teacher.email,
      "Role": teacher.role,
      "Created At": new Date(teacher.createdAt).toLocaleString(),
    }));

    // Generate CSV content
    const headers = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    const csvContent = [headers, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="teachers.csv"',
      },
    });
  } catch (error) {
    console.error("[API_ADMIN_TEACHERS_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }}