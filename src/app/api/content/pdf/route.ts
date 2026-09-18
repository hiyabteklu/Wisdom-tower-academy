import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  APPWRITE_PATH_PREFIX,
  isAppwriteStoragePath,
  parseAppwriteFileId,
} from "@/lib/content";

/**
 * Proxy a learning-content PDF through our origin so the in-app reader
 * can use a same-origin blob (mobile-friendly).
 * Query: ?path=<storage_path>
 *
 * Supports:
 * - appwrite:FILE_ID (all packages)
 * - legacy Supabase storage paths (if any remain)
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // --- Appwrite ---
  if (isAppwriteStoragePath(path) || path.startsWith(APPWRITE_PATH_PREFIX)) {
    const fileId = parseAppwriteFileId(path) || path.replace(/^appwrite:/i, "").trim();
    if (!fileId) {
      return NextResponse.json({ error: "Invalid Appwrite file id" }, { status: 400 });
    }

    const endpoint =
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
    const bucketId =
      process.env.APPWRITE_BUCKET_ID ||
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID ||
      "";

    if (!projectId || !bucketId) {
      return NextResponse.json(
        {
          error:
            "Appwrite env missing. Set NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_BUCKET_ID on the host.",
        },
        { status: 500 }
      );
    }

    const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

    try {
      const upstream = await fetch(viewUrl, {
        headers: { Accept: "application/pdf,*/*" },
        cache: "no-store",
      });

      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => "");
        return NextResponse.json(
          {
            error: `Appwrite file not readable (${upstream.status}). Check bucket id, file id, and that role "Any" has READ.`,
            detail: detail.slice(0, 200),
          },
          { status: upstream.status === 404 ? 404 : 502 }
        );
      }

      const buf = await upstream.arrayBuffer();
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(buf.byteLength),
          "Content-Disposition": 'inline; filename="document.pdf"',
          "Cache-Control": "private, max-age=300",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (e) {
      return NextResponse.json(
        {
          error: e instanceof Error ? e.message : "Failed to fetch Appwrite file",
        },
        { status: 502 }
      );
    }
  }

  // --- Legacy Supabase path (if any files remain) ---
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.storage
    .from("learning-content")
    .download(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Not found" },
      { status: 404 }
    );
  }

  const buf = await data.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.byteLength),
      "Content-Disposition": 'inline; filename="document.pdf"',
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
