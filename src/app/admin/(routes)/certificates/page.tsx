import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CertificatesActions } from "./_components/certificates-actions";
import { CertificatesFilters } from "./_components/certificates-filters";
import { CertificatesHeader } from "./_components/certificates-header";
import {
  type Certificate,
  CertificatesTable,
} from "./_components/certificates-table";

export const dynamic = "force-dynamic";

const CertificatesPage = async (props: {
  searchParams: Promise<{
    q?: string;
    from?: string;
    to?: string;
    courseId?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}) => {
  const { userId, getToken } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // IMPORTANT: Await searchParams before using its properties
  const searchParams = await props.searchParams;

  const q = searchParams.q || "";
  const from = searchParams.from;
  const to = searchParams.to;
  const courseId = searchParams.courseId;
  const status = searchParams.status;
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "10", 10);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const url = new URL(`${baseUrl}/api/admin/certificates`);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  if (q) url.searchParams.set("q", q);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  if (courseId) url.searchParams.set("courseId", courseId);
  if (status) url.searchParams.set("status", status);

  // fetch and handle non-JSON gracefully
  let fetchedCertificates: Certificate[] = [];
  let totalCount = 0;
  let _currentPage = page;
  let _perPage = limit;
  let _totalPages = 1;
  let serverError: string | null = null;

  try {
    const sessionToken = await getToken();

    const response = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    // If response not OK, try to read textual body for diagnostics
    if (!response.ok) {
      const text = await response.text();
      // log on server for debugging
      console.error(
        `API /api/admin/certificates returned ${response.status}:`,
        text
      );
      serverError = `Server error: ${response.status} — ${text}`;
    } else {
      // Try to parse JSON safely
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        // support both { data: ..., totalCount: ... } and plain array responses
        if (Array.isArray(payload)) {
          fetchedCertificates = payload;
          totalCount = payload.length;
        } else {
          fetchedCertificates = payload.data ?? payload.rows ?? [];
          totalCount =
            payload.totalCount ??
            payload.meta?.total ??
            (fetchedCertificates.length || 0);
          _currentPage = payload.currentPage ?? payload.page ?? _currentPage;
          _perPage = payload.perPage ?? payload.limit ?? _perPage;
          _totalPages =
            (payload.totalPages ?? Math.ceil(totalCount / _perPage)) || 1;
        }
      } else {
        const text = await response.text();
        console.error("API returned non-JSON:", text);
        serverError = `Unexpected server response: ${text}`;
      }
    }
  } catch (err: unknown) {
    console.error("Fetch /api/admin/certificates failed:", err);
    serverError = err instanceof Error ? err.message : "Unknown fetch error";
  }

  // Calculate stats for CertificatesHeader
  const totalIssued = totalCount;
  const revokedCount = fetchedCertificates.filter(
    (cert: Certificate) => cert.status === "REVOKED"
  ).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const issuedThisMonth = fetchedCertificates.filter((cert: Certificate) => {
    const issuedDate = new Date(cert.issuedAt);
    return (
      issuedDate.getMonth() === currentMonth &&
      issuedDate.getFullYear() === currentYear
    );
  }).length;

  return (
    <div className="p-6">
      <CertificatesHeader
        totalIssued={totalIssued}
        issuedThisMonth={issuedThisMonth}
        revokedCount={revokedCount}
      />

      {serverError ? (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-800">
          <strong>Couldn't load certificates:</strong>
          <div className="mt-2 whitespace-pre-wrap">{serverError}</div>
          <div className="mt-3 text-sm text-gray-600">
            Check server logs for details. If you recently changed the API,
            ensure it returns JSON:
            <code className="block bg-gray-100 p-1 rounded mt-1">
              NextResponse.json({`{ data, totalCount }`})
            </code>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CertificatesFilters />
          </div>

          <div className="mt-6">
            <CertificatesTable data={fetchedCertificates} />
          </div>

          <div className="mt-6">
            <CertificatesActions />
          </div>
        </>
      )}
    </div>
  );
};

export default CertificatesPage;
