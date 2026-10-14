import { NextRequest, NextResponse } from "next/server";
import { createAndPushNotification, type NotificationType } from "@/lib/notifications";
import { createServiceClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";

/**
 * POST /api/notifications/send
 *
 * ADMIN ONLY. The caller must send the signed-in admin's Supabase access
 * token as `Authorization: Bearer <token>` and the e-mail on that token must
 * be an admin e-mail (same rule as the /admin page, see src/lib/admin.ts).
 * Before 2026-10-15 this route had no check at all, so anyone who knew the
 * address could push a message to every device.
 */

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Who is calling? Read ONLY from the access token.
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Please sign in as an admin first." },
        { status: 401 }
      );
    }

    const verifier = createServiceClient();
    if (!verifier) {
      return NextResponse.json(
        { ok: false, error: "The server is not configured to verify admins." },
        { status: 500 }
      );
    }

    const { data: userData, error: userError } = await verifier.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json(
        { ok: false, error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const adminEmail = userData.user.email ?? null;
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json(
        { ok: false, error: "Only admins can send notifications." },
        { status: 403 }
      );
    }

    // 2. The request itself (unchanged behaviour from here on).
    const body = await req.json().catch(() => ({}));
    const { title, body: contentBody, type = "general", target = "all", url } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!contentBody || typeof contentBody !== "string" || !contentBody.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message body is required" },
        { status: 400 }
      );
    }

    const validTypes: NotificationType[] = ["material", "admin", "payment", "general"];
    const notifType: NotificationType = validTypes.includes(type) ? type : "general";

    const result = await createAndPushNotification({
      title,
      body: contentBody,
      type: notifType,
      target: target || "all",
      url: url || "/learning",
      // Taken from the verified token, not from the request body.
      createdBy: adminEmail || "admin",
    });

    return NextResponse.json({
      ok: true,
      notification: result.notification,
      fcm: result.fcm,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send notification";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
