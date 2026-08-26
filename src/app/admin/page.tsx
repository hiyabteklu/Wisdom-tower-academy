"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  Inbox,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  Shield,
} from "lucide-react";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchInquiries();
    };
    checkAuth();
  }, [router]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const client = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await client
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
      } else {
        setInquiries(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(supabaseUrl, supabaseKey);

    const { error } = await client
      .from("inquiries")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filtered = filter === "all"
    ? inquiries
    : inquiries.filter((i) => i.status === filter);

  const stats = {
    total: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
  };

  if (loading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-wisdom-cyan/10 text-wisdom-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-wisdom-muted">Manage inquiries from the contact form</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchInquiries}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: <Inbox className="w-5 h-5" />, color: "text-wisdom-cyan" },
            { label: "New", value: stats.new, icon: <Mail className="w-5 h-5" />, color: "text-green-400" },
            { label: "Read", value: stats.read, icon: <Clock className="w-5 h-5" />, color: "text-amber-400" },
            { label: "Replied", value: stats.replied, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-wisdom-card border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-sm text-wisdom-muted">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "new", "read", "replied"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                filter === f
                  ? "bg-wisdom-cyan text-wisdom-dark font-medium"
                  : "bg-wisdom-card border border-white/5 text-wisdom-muted hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="text-center py-20 text-wisdom-muted">Loading inquiries...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-4 opacity-50" />
            <p className="text-wisdom-muted">No inquiries found</p>
            <p className="text-sm text-wisdom-muted mt-1">Submissions from the contact form will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-5 rounded-xl bg-wisdom-card border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{inquiry.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        inquiry.status === "new"
                          ? "bg-green-500/10 text-green-400"
                          : inquiry.status === "read"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <a href={`mailto:${inquiry.email}`} className="text-sm text-wisdom-cyan hover:underline">
                      {inquiry.email}
                    </a>
                  </div>
                  <div className="text-xs text-wisdom-muted">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </div>
                </div>

                {inquiry.service && (
                  <div className="text-xs text-wisdom-muted mb-2">
                    Service: <span className="text-white">{inquiry.service}</span>
                  </div>
                )}

                <p className="text-sm text-wisdom-muted leading-relaxed mb-4 whitespace-pre-wrap">
                  {inquiry.message}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {inquiry.status !== "read" && (
                    <button
                      onClick={() => updateStatus(inquiry.id, "read")}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  {inquiry.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(inquiry.id, "replied")}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Mark as Replied
                    </button>
                  )}
                  <a
                    href={`mailto:${inquiry.email}?subject=Re: Your inquiry to Wisdom Tower`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-wisdom-cyan/10 text-wisdom-cyan hover:bg-wisdom-cyan/20 transition-colors"
                  >
                    Reply by Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
