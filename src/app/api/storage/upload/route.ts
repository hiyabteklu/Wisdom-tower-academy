import { NextRequest, NextResponse } from "next/server";
import { uploadFileToAppwrite } from "@/lib/appwrite-server";
import { createClient } from "@supabase/supabase-js";

// Simple admin check using the same logic as your existing admin page
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    // Optional: protect this route so only logged-in admins can upload
    // You can tighten this later using your existing isAdminEmail helper

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Optional size limit (e.g. 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    const result = await uploadFileToAppwrite(file, file.name);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Appwrite upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
