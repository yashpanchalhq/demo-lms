import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-client";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.publicMetadata.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { teacherId } = await req.json();

    if (!teacherId) {
      return new NextResponse("Teacher ID is required", { status: 400 });
    }

    const supabase = createClient();

    const { data: teacher, error } = await supabase
      .from("User")
      .select("email")
      .eq("id", teacherId)
      .single();

    if (error || !teacher) {
      console.error("Error fetching teacher:", error);
      return new NextResponse("Teacher not found", { status: 404 });
    }

    // Here you would implement your email sending logic.
    // For this example, we'll just log the email that would be sent.
    console.log(`Sending reminder email to ${teacher.email}`);

    return NextResponse.json({ message: "Reminder sent successfully" });
  } catch (error) {
    console.error("[TEACHERS_SEND_REMINDER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}