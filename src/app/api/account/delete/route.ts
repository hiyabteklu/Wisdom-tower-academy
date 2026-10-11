import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/account/delete
 *
 * Lets a signed-in student permanently delete their own account.
 * Required by Google Play (account deletion inside the app + on the web).
 *
 * Security rules:
 * - The user is read ONLY from the Bearer access token (never from the body).
 * - The body must contain { "confirm": "DELETE" }.
 * - Uses the service-role key (server env only) because the student cannot
 *   delete rows in every table or delete their own auth user with the public key.
 *
 * What happens (matches the database, checked 2026-10-11):
 * - Deleting the auth user cascades to: profiles, academic_results, exam_attempts,
 *   learning_progress, enrollments.
 * - These are removed explicitly here because they do NOT cascade (they only lose
 *   the link or have no link): user_device_tokens, access_grants, enrollments by e-mail,
 *   inquiries, talent_applications, and orders that are not verified.
 * - VERIFIED orders are kept as bookkeeping records (Privacy Policy section 09: five years).
 *   After the auth user is deleted they are no longer linked to any account.
 *
 * The steps are safe to repeat: if one fails, the account is NOT deleted and the
 * student can try again.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StepWork = PromiseLike<{ error: { message: string } | null }>;

async function step(label: string, work: StepWork): Promise<void> {
  const { error } = await work;
  if (error) throw new Error(`${label}: ${error.message}`);
}

const SUPPORT_EMAIL = "support@wisdomtower.tech";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: `Account deletion is not available right now. Please write to ${SUPPORT_EMAIL}.` },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Please sign in again to delete your account." },
        { status: 401 }
      );
    }

    let confirm = "";
    try {
      const body = (await req.json()) as { confirm?: unknown };
      confirm = typeof body?.confirm === "string" ? body.confirm : "";
    } catch {
      /* empty or invalid body */
    }
    if (confirm !== "DELETE") {
      return NextResponse.json(
        { success: false, error: "Confirmation missing. Type DELETE to confirm." },
        { status: 400 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Your session has expired. Please sign in again to delete your account." },
        { status: 401 }
      );
    }

    const userId = user.id;
    const emails = Array.from(
      new Set([user.email, user.email?.toLowerCase()].filter((e): e is string => Boolean(e)))
    );

    // 1. Rows that have no cascade (or only lose the link) when the auth user is deleted.
    await step("enrollments", admin.from("enrollments").delete().eq("user_id", userId));
    await step("access_grants", admin.from("access_grants").delete().eq("user_id", userId));
    await step("user_device_tokens", admin.from("user_device_tokens").delete().eq("user_id", userId));
    await step(
      "orders",
      admin.from("orders").delete().eq("user_id", userId).neq("status", "verified")
    );

    if (emails.length > 0) {
      await step("enrollments by e-mail", admin.from("enrollments").delete().in("email", emails));
      await step("access_grants by e-mail", admin.from("access_grants").delete().in("email", emails));
      await step(
        "orders by e-mail",
        admin.from("orders").delete().in("email", emails).neq("status", "verified")
      );
      await step("inquiries", admin.from("inquiries").delete().in("email", emails));
      await step("talent_applications", admin.from("talent_applications").delete().in("email", emails));
    }

    // 2. The sign-in account itself. This also cascades to profiles, academic_results,
    //    exam_attempts and learning_progress.
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) throw new Error(`auth user: ${deleteError.message}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    // Never send internal details to the client.
    console.error("[Account Delete Route] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        success: false,
        error: `We could not delete the account right now. Please try again, or write to ${SUPPORT_EMAIL}.`,
      },
      { status: 500 }
    );
  }
}
