import { NextRequest, NextResponse } from "next/server";
import {
  listNotificationsForUser,
  listAllNotificationsForAdmin,
  deleteNotification,
} from "@/lib/notifications";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// 2026-10-15: listing ALL notifications (admin=true) and deleting one now need the admin's
// access token (Authorization: Bearer ...). Before, both were open to anyone who knew the address.
// The normal per-student list (no admin flag) is unchanged.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || undefined;
    const email = searchParams.get("email") || undefined;
    const isAdmin = searchParams.get("admin") === "true";

    if (isAdmin) {
      const check = await requireAdmin(req);
      if (!check.ok) return check.response;
      const items = await listAllNotificationsForAdmin();
      return NextResponse.json({ ok: true, notifications: items });
    }

    const items = await listNotificationsForUser(userId, email);
    return NextResponse.json({ ok: true, notifications: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load notifications";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const check = await requireAdmin(req);
    if (!check.ok) return check.response;

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing notification id" }, { status: 400 });
    }

    const ok = await deleteNotification(id);
    return NextResponse.json({ ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete notification";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
