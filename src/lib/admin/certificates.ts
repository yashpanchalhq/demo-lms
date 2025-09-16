// src/lib/admin/certificates.ts
import { getSupabaseClient } from "@/lib/supabase";

export type CertQueryParams = {
  q?: string;
  from?: string;
  to?: string;
  courseId?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function getCertificates(params: CertQueryParams) {
  const {
    q,
    from,
    to,
    courseId,
    status,
    page = 1,
    limit = 10,
  } = params;

  const supabase = getSupabaseClient();

  let query = supabase
    .from('Certificate')
    .select(
      `
      id,
      issuedAt,
      status,
      userId,
      courseId,
      User (id, email),
      Course (id, title)
      `,
      { count: 'exact' }
    );

  // Apply filters
  if (q) {
    // Search by certificate ID, teacher email, or course title
    query = query.or(`id.ilike.%${q}%,User.email.ilike.%${q}%,Course.title.ilike.%${q}%`);
  }

  if (courseId) query = query.eq('courseId', courseId);
  if (status) query = query.eq('status', status);
  if (from) query = query.gte('issuedAt', from);
  if (to) query = query.lte('issuedAt', to);

  // Apply sorting (default to issuedAt desc)
  query = query.order('issuedAt', { ascending: false });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;
  query = query.range(startIndex, endIndex);

  const { data: certificates, error: certificatesError, count } = await query;

  if (certificatesError) {
    console.error("[getCertificates]", certificatesError);
    throw new Error("Failed to fetch certificates");
  }

  // Map data to a more usable format for the frontend
  const formattedCertificates = certificates.map(cert => ({
    id: cert.id,
    teacherId: cert.userId, // Use userId directly
    teacherName: cert.User?.email || 'N/A', // Use optional chaining
    teacherEmail: cert.User?.email || 'N/A',
    courseId: cert.courseId, // Use courseId directly
    courseTitle: cert.Course?.title || 'N/A', // Use optional chaining
    issuedAt: cert.issuedAt,
    status: cert.status,
  }));

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: formattedCertificates,
    totalCount,
    currentPage: page,
    perPage: limit,
    totalPages,
  };
}
