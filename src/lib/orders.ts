/**
 * Client-side order store (localStorage) for manual-payment flow.
 * Swap to Supabase `orders` table when ready — same shape.
 */

import type { PaymentMethodId } from "@/data/packages";

export type OrderStatus = "pending_payment" | "pending_verification" | "verified" | "rejected";

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
  /** Bank / Telebirr transaction id from student */
  transactionRef: string;
  note?: string;
  createdAt: string;
};

const STORAGE_KEY = "wt_manual_orders_v1";

function readAll(): ManualOrder[] {
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

function writeAll(orders: ManualOrder[]) {
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

export function listOrders(): ManualOrder[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id: string): ManualOrder | undefined {
  return readAll().find((o) => o.id === id);
}

export function saveOrder(order: ManualOrder) {
  const all = readAll().filter((o) => o.id !== order.id);
  all.unshift(order);
  writeAll(all);
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
