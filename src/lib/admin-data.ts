/**
 * Admin dashboard data helpers (client-side via anon key + RLS for authenticated).
 */
import { supabase } from "@/lib/supabase";
import type { ManualOrder, OrderStatus } from "@/lib/orders";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export type InquiryRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
};

export type EnrollmentRow = {
  id: string;
  package_id: string;
  package_name: string;
  email: string | null;
  user_id: string | null;
  created_at: string;
};

export type DayCount = { day: string; label: string; orders: number; verified: number };

export type AdminStats = {
  users: number;
  ordersTotal: number;
  ordersPending: number;
  ordersVerified: number;
  ordersRejected: number;
  revenueVerifiedEtb: number;
  /** Sum of pending_verification amounts */
  pipelineEtb: number;
  /** verified / total orders as 0–100 */
  conversionPct: number;
  /** average verified order value */
  avgOrderEtb: number;
  enrollments: number;
  inquiriesNew: number;
  inquiriesTotal: number;
  explanationsCached: number;
  academicResults: number;
  byPackage: { name: string; count: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  byMethod: { method: string; count: number }[];
  last7Days: DayCount[];
  recentOrders: ManualOrder[];
  recentUsers: ProfileRow[];
  recentInquiries: InquiryRow[];
  recentEnrollments: EnrollmentRow[];
};

function orderFromRow(row: Record<string, unknown>): ManualOrder {
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    packageName: String(row.package_name),
    amountEtb: Number(row.amount_etb),
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as ManualOrder["paymentMethod"],
    studentName: String(row.student_name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : undefined,
    transactionRef: String(row.transaction_ref),
    note: row.note ? String(row.note) : undefined,
    receiptUrl: row.receipt_url ? String(row.receipt_url) : undefined,
    createdAt: String(row.created_at),
    userId: row.user_id ? String(row.user_id) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedBy: row.verified_by ? String(row.verified_by) : null,
  };
}

function buildLast7Days(orders: ManualOrder[]): DayCount[] {
  const days: DayCount[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key);
    days.push({
      day: key,
      label,
      orders: dayOrders.length,
      verified: dayOrders.filter((o) => o.status === "verified").length,
    });
  }
  return days;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    users: 0,
    ordersTotal: 0,
    ordersPending: 0,
    ordersVerified: 0,
    ordersRejected: 0,
    revenueVerifiedEtb: 0,
    pipelineEtb: 0,
    conversionPct: 0,
    avgOrderEtb: 0,
    enrollments: 0,
    inquiriesNew: 0,
    inquiriesTotal: 0,
    explanationsCached: 0,
    academicResults: 0,
    byPackage: [],
    byStatus: [],
    byMethod: [],
    last7Days: buildLast7Days([]),
    recentOrders: [],
    recentUsers: [],
    recentInquiries: [],
    recentEnrollments: [],
  };

  try {
    const [
      profilesRes,
      ordersRes,
      enrollRes,
      inquiriesRes,
      explainRes,
      academicRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("enrollments")
        .select("id, package_id, package_name, email, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("question_explanations").select("question_id", { count: "exact", head: true }),
      supabase.from("academic_results").select("id", { count: "exact", head: true }),
    ]);

    const profiles = (profilesRes.data || []) as ProfileRow[];
    const orders = (ordersRes.data || []).map((r) =>
      orderFromRow(r as Record<string, unknown>)
    );
    const enrollments = (enrollRes.data || []) as EnrollmentRow[];
    const inquiries = (inquiriesRes.data || []) as InquiryRow[];

    const pending = orders.filter((o) => o.status === "pending_verification");
    const verified = orders.filter((o) => o.status === "verified");
    const rejected = orders.filter((o) => o.status === "rejected");

    const revenueVerifiedEtb = verified.reduce((s, o) => s + (o.amountEtb || 0), 0);
    const pipelineEtb = pending.reduce((s, o) => s + (o.amountEtb || 0), 0);
    const conversionPct =
      orders.length > 0 ? Math.round((verified.length / orders.length) * 1000) / 10 : 0;
    const avgOrderEtb =
      verified.length > 0 ? Math.round(revenueVerifiedEtb / verified.length) : 0;

    const pkgMap = new Map<string, number>();
    for (const o of orders) {
      pkgMap.set(o.packageName, (pkgMap.get(o.packageName) || 0) + 1);
    }
    const byPackage = Array.from(pkgMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const methodMap = new Map<string, number>();
    for (const o of orders) {
      const m = o.paymentMethod || "unknown";
      methodMap.set(m, (methodMap.get(m) || 0) + 1);
    }
    const byMethod = Array.from(methodMap.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    const statusKeys: OrderStatus[] = [
      "pending_verification",
      "verified",
      "rejected",
      "pending_payment",
    ];
    const byStatus = statusKeys.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    return {
      users: profiles.length,
      ordersTotal: orders.length,
      ordersPending: pending.length,
      ordersVerified: verified.length,
      ordersRejected: rejected.length,
      revenueVerifiedEtb,
      pipelineEtb,
      conversionPct,
      avgOrderEtb,
      enrollments: enrollments.length,
      inquiriesNew: inquiries.filter((i) => i.status === "new").length,
      inquiriesTotal: inquiries.length,
      explanationsCached: explainRes.count ?? 0,
      academicResults: academicRes.count ?? 0,
      byPackage,
      byStatus,
      byMethod,
      last7Days: buildLast7Days(orders),
      recentOrders: orders.slice(0, 10),
      recentUsers: profiles.slice(0, 10),
      recentInquiries: inquiries.slice(0, 8),
      recentEnrollments: enrollments.slice(0, 8),
    };
  } catch (e) {
    console.warn("[admin-stats]", e);
    return empty;
  }
}

export async function listProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.warn("[profiles]", error.message);
    return [];
  }
  return (data || []) as ProfileRow[];
}

export async function listInquiries(): Promise<InquiryRow[]> {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("[inquiries]", error.message);
    return [];
  }
  return (data || []) as InquiryRow[];
}

export async function updateInquiryStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = { status };
  if (adminNotes !== undefined) payload.admin_notes = adminNotes;
  const { error } = await supabase.from("inquiries").update(payload).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
