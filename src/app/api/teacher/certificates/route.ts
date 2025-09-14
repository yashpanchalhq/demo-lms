import { NextResponse, NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

// Type definitions to help TypeScript understand the data structure
type UserRow = {
  id: string;
};

type CertificateRow = {
  id: string;
  createdAt: string;
  fileUrl: string | null;
  course: {
    id: string;
    title: string;
    imageUrl: string | null;
  } | null;
};

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    // Fix 1: Use auth() instead of getAuth(request)
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the internal user ID from the User table based on the Clerk user ID
    const { data: user, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("clerkId", clerkUserId)
      .single();

    // Fix: Handle the case where user doesn't exist in database
    if (userError) {
      console.error("Error fetching user:", userError);
      
      // Check if it's a "no rows" error (user doesn't exist)
      if (userError.code === 'PGRST116') {
        console.log(`User with clerkId ${clerkUserId} not found in database`);
        return new NextResponse("User not found in database. Please contact support.", { status: 404 });
      }
      
      return new NextResponse("Internal Error", { status: 500 });
    }

    // Fix 2: Type assertion to help TypeScript understand the structure
    const typedUser = user as UserRow | null;

    if (!typedUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    console.log(`Fetching certificates for user ID: ${typedUser.id}`);

    const { data: certificates, error } = await supabase
      .from("Certificate")
      .select(
        `
        id,
        createdAt:issuedAt,
        fileUrl:certificateUrl,
        course:Course (id, title, imageUrl)
      `
      )
      .eq("userId", typedUser.id)
      .order("issuedAt", { ascending: false });

    if (error) {
      console.error("Error fetching certificates:", error);
      throw error;
    }

    // Fix 3: Type assertion for the certificates data
    const typedCertificates = certificates as CertificateRow[] | null;

    console.log(`Found ${typedCertificates?.length || 0} certificates`);
    return NextResponse.json(typedCertificates || []);
  } catch (error) {
    console.log("[TEACHER_CERTIFICATES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}