import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase-client";
import { parse } from "papaparse";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || user.publicMetadata.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const csvData = await file.text();

    const parsed = parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const teachers = parsed.data as { email: string; name: string; role: string }[];

    const supabase = createClient();

    const { data, error } = await supabase.from("User").insert(teachers);

    if (error) {
      console.error("Error importing teachers:", error);
      return new NextResponse("Error importing teachers", { status: 500 });
    }

    return NextResponse.json({ message: "Teachers imported successfully" });
  } catch (error) {
    console.error("[TEACHERS_IMPORT_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}