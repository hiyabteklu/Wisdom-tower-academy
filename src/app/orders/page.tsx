"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrders, statusLabel, type ManualOrder } from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import { ClipboardList } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ManualOrder[]>([]);

  useEffect(() => {
    setOrders(listOrders());
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <h1 className="font-display text-3xl font-extrabold text-white mb-2">My orders</h1>
      <p className="text-sm text-wisdom-muted mb-8">
        Manual payment requests from this device. After we verify, packages show in{" "}
        <Link href="/learning" className="text-cyan-400 hover:underline">
          My Learning
        </Link>
        .
      </p>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-10 text-center">
          <ClipboardList className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No orders yet</p>
          <Link href="/packages" className="text-sm text-cyan-400 hover:underline">
            Browse packages
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5"
            >
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-mono text-xs text-wisdom-muted">{o.id}</p>
                  <p className="font-semibold text-white">{o.packageName}</p>
                  <p className="text-sm text-amber-300">{formatEtb(o.amountEtb)}</p>
                </div>
                <span className="text-[11px] font-semibold rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200 px-2.5 py-1 h-fit">
                  {statusLabel(o.status)}
                </span>
              </div>
              <p className="text-xs text-wisdom-muted mt-2">
                {o.paymentMethod.toUpperCase()} · Tx {o.transactionRef} · {o.studentName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
