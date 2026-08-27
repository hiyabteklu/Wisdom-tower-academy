/**
 * Orders: Supabase primary + localStorage fallback for offline/guest edge cases.
 */

import type { PaymentMethodId } from "@/data/packages";
import { supabase } from "@/lib/supabase";

export type OrderStatus =
  | "pending_payment"
  | "pending_verification"
  | "verified"
  | "rejected";

export type ManualOrder = {
  id: string;
  packageId: string;
  packageName: string;
  amountEtb: number;
  status: OrderStatus;
  paymentMethod: PaymentMethodId;
  studentName: string;
  phone: string;
  email?: string;
  transactionRef: string;
  note?: string;
  createdAt: string;
  userId?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
};

const STORAGE_KEY = "wt_manual_orders_v1";

function readLocal(): ManualOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ManualOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(orders: ManualOrder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/** Human-friendly order reference e.g. WT-A7K2M9 */
export function generateOrderRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "WT-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending_payment":
      return "Awaiting payment";
    case "pending_verification":
      return "Pending verification";
    case "verified":
      return "Verified · enrolled";
    case "rejected":
      return "Needs attention";
    default:
      return status;
  }
}

function rowToOrder(row: Record<string, unknown>): ManualOrder {
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    packageName: String(row.package_name),
    amountEtb: Number(row.amount_etb),
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as PaymentMethodId,
    studentName: String(row.student_name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : undefined,
    transactionRef: String(row.transaction_ref),
    note: row.note ? String(row.note) : undefined,
    createdAt: String(row.created_at),
    userId: row.user_id ? String(row.user_id) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedBy: row.verified_by ? String(row.verified_by) : null,
  };
}

/** Save order to Supabase + localStorage backup */
export async function saveOrder(order: ManualOrder): Promise<{ ok: boolean; error?: string }> {
  // Always keep local backup
  const all = readLocal().filter((o) => o.id !== order.id);
  all.unshift(order);
  writeLocal(all);

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? order.userId ?? null;

    const { error } = await supabase.from("orders").upsert(
      {
        id: order.id,
        user_id: userId,
        package_id: order.packageId,
        package_name: order.packageName,
        amount_etb: order.amountEtb,
        status: order.status,
        payment_method: order.paymentMethod,
        student_name: order.studentName,
        phone: order.phone,
        email: order.email || session?.user?.email || null,
        transaction_ref: order.transactionRef,
        note: order.note || null,
        created_at: order.createdAt,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("[orders] supabase save failed, local only:", error.message);
      return { ok: true, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[orders] save exception:", e);
    return { ok: true, error: e instanceof Error ? e.message : "offline" };
  }
}

export function listLocalOrders(): ManualOrder[] {
  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLocalOrder(id: string): ManualOrder | undefined {
  return readLocal().find((o) => o.id === id);
}

/** List orders from Supabase (admin or own). Falls back to local. */
export async function listOrdersFromDb(): Promise<ManualOrder[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.warn("[orders] list failed:", error.message);
      return listLocalOrders();
    }
    return (data || []).map((r) => rowToOrder(r as Record<string, unknown>));
  } catch {
    return listLocalOrders();
  }
}

/** Approve order + create enrollment */
export async function verifyOrder(
  orderId: string,
  adminEmail: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return { ok: false, error: fetchErr?.message || "Order not found" };
    }

    const { error: updErr } = await supabase
      .from("orders")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: adminEmail,
      })
      .eq("id", orderId);

    if (updErr) return { ok: false, error: updErr.message };

    // Enrollment (unique on user_id + package_id when user_id present)
    const enrollPayload: Record<string, unknown> = {
      order_id: orderId,
      package_id: order.package_id,
      package_name: order.package_name,
      email: order.email || null,
      user_id: order.user_id || null,
    };

    const { error: enrErr } = await supabase.from("enrollments").upsert(enrollPayload, {
      onConflict: order.user_id ? "user_id,package_id" : undefined,
      ignoreDuplicates: true,
    });

    if (enrErr) {
      // Still mark verified; enrollment may need manual fix
      console.warn("[orders] enrollment:", enrErr.message);
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function rejectOrder(
  orderId: string,
  adminEmail: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "rejected",
        verified_at: new Date().toISOString(),
        verified_by: adminEmail,
      })
      .eq("id", orderId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Enrollments for current user (My Learning) */
export async function listMyEnrollments(): Promise<
  { packageId: string; packageName: string; createdAt: string }[]
> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from("enrollments")
      .select("package_id, package_name, created_at")
      .or(
        `user_id.eq.${session.user.id},email.eq.${session.user.email}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[enrollments]", error.message);
      return [];
    }

    return (data || []).map((r) => ({
      packageId: String(r.package_id),
      packageName: String(r.package_name),
      createdAt: String(r.created_at),
    }));
  } catch {
    return [];
  }
}
