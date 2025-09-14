import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

type CertificateRow = {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  certificateUrl: string | null;
  status: string | null;
  issuedby: string | null; // note: DB column is lowercase 'issuedby'
  User?: { id: string; email: string } | null;
  Course?: { id: string; title: string } | null;
};

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(req.url);

    // client-provided params (camelCase expected by frontend)
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const q = searchParams.get("q");
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const issuedByParam = searchParams.get("issuedBy"); // client may send camelCase
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const requestedSortBy = searchParams.get("sortBy") || "issuedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase();

    // Map API-facing field names (camelCase) to actual DB column names
    const COLUMN_MAP: Record<string, string> = {
      id: "id",
      issuedAt: "issuedAt",
      userId: "userId",
      courseId: "courseId",
      certificateUrl: "certificateUrl",
      status: "status",
      // map camelCase request 'issuedBy' to actual lowercase column 'issuedby'
      issuedBy: "issuedby",
    };

    // whitelist of allowed sort fields exposed to clients
    const ALLOWED_SORT_KEYS = new Set([
      "id",
      "issuedAt",
      "userId",
      "courseId",
      "certificateUrl",
      "status",
      "issuedBy",
    ]);

    const safeRequestedSortBy = ALLOWED_SORT_KEYS.has(requestedSortBy)
      ? requestedSortBy
      : "issuedAt";
    const mappedSortBy = COLUMN_MAP[safeRequestedSortBy] ?? COLUMN_MAP["issuedAt"];

    // log for debugging if things go wrong
    console.log("[API_ADMIN_CERTIFICATES_GET] params:", {
      from,
      to,
      q,
      courseId,
      status,
      issuedByParam,
      page,
      limit,
      requestedSortBy,
      mappedSortBy,
      sortOrder,
    });

    // Build base query selecting the actual DB columns plus relations
    let query = supabase
      .from("Certificate")
      .select(
        `
        id,
        issuedAt,
        certificateUrl,
        userId,
        courseId,
        status,
        issuedby,
        User (id, email),
        Course (id, title)
      `,
        { count: "exact" }
      );

    // Filters - use the actual DB column names (as strings)
    if (from) query = query.gte("issuedAt", from);
    if (to) query = query.lte("issuedAt", to);
    if (courseId) query = query.eq("courseId", courseId);
    if (status) query = query.eq("status", status);
    if (issuedByParam) {
      // client may send issuedBy (camelCase) so map to 'issuedby'
      query = query.eq("issuedby", issuedByParam);
    }

    // Search (q) — sanitize and search id, user email, course title, and status
    if (q) {
      const safeQ = String(q).replace(/[%,'"']/g, "").trim();
      const searchConds = [
        `id.ilike.%${safeQ}%`,
        `User.email.ilike.%${safeQ}%`,
        `Course.title.ilike.%${safeQ}%`,
        `status.ilike.%${safeQ}%`,
      ];
      query = query.or(searchConds.join(","));
    }

    // Sorting + pagination
    query = query.order(mappedSortBy, { ascending: sortOrder === "asc" });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;
    query = query.range(startIndex, endIndex);

    // Execute
    const { data, error, count } = await query;

    if (error) {
      console.error("[API_ADMIN_CERTIFICATES_GET] supabase error:", error);
      // if a 42703 still occurs, error.message / error.code will guide next step
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    // Map DB rows to the frontend shape (camelCase)
    const formatted = (data as CertificateRow[]).map((r) => ({
      id: r.id,
      teacherId: r.userId,
      teacherName: r.User?.email ?? "N/A",
      teacherEmail: r.User?.email ?? "N/A",
      courseId: r.courseId,
      courseTitle: r.Course?.title ?? "N/A",
      issuedAt: r.issuedAt,
      status: r.status ?? null,
      issuedBy: r.issuedby ?? null, // map lowercase DB column to camelCase response
      fileUrl: r.certificateUrl ?? null,
    }));

    return NextResponse.json({
      data: formatted,
      totalCount: count ?? formatted.length,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil((count ?? formatted.length) / limit),
    });
  } catch (err) {
    console.error("[API_ADMIN_CERTIFICATES_GET] catch:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}