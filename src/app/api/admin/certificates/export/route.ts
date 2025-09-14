import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

type CertificateRow = {
    id: string;
    issuedAt: string;
    certificateUrl: string | null;
    status: string | null;
    issuedby: string | null;
    courseId: string; // Add courseId to the type
    User: {
        id: string;
        email: string;
    } | null;
    Course: {
        id: string;
        title: string;
    } | null;
}

type UserRow = {
  role: string;
};

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();

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

      const typedUser = requestingUser as UserRow | null;

    if (requestingUserError || typedUser?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const q = searchParams.get('q');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    // Remove the generic type parameter and let TypeScript infer
    let query = supabase
      .from('Certificate')
      .select(
        `
        id, 
        issuedAt,
        certificateUrl,
        status,
        issuedby,
        courseId,
        User (id, email),
        Course (id, title)
        `
      );

    if (from) query = query.gte('issuedAt', from);
    if (to) query = query.lte('issuedAt', to);
    if (courseId) query = query.eq('courseId', courseId);
    if (status) query = query.eq('status', status);

    // Basic search by teacher email or certificate ID
    if (q) {
      query = query.or(`id.ilike.%${q}%,User.email.ilike.%${q}%`);
    }

    const { data: certificates, error: certificatesError } = await query;

    if (certificatesError) {
      console.error("[API_ADMIN_CERTIFICATES_EXPORT]", certificatesError);
      return new NextResponse("Internal Error", { status: 500 });
    }

    if (!certificates || certificates.length === 0) {
      return new NextResponse("No data to export", { status: 204 });
    }

    // Format data for CSV
    const csvData = (certificates as CertificateRow[]).map(cert => ({
      "Certificate ID": cert.id,
      "Teacher Email": cert.User?.email || "",
      "Course Title": cert.Course?.title || "",
      "Issued At": new Date(cert.issuedAt).toLocaleString(),
      "File URL": cert.certificateUrl || "",
      "Status": cert.status || "",
      "Issued By": cert.issuedby || "",
    }));

    // Generate CSV content
    const headers = Object.keys(csvData[0]).join(',');
    const csvRows = csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','));
    const csvContent = [headers, ...csvRows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="certificates.csv"',
      },
    });
  } catch (error) {
    console.error("[API_ADMIN_CERTIFICATES_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}