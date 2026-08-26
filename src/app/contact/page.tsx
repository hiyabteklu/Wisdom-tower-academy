"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setErrorMsg("Configuration error. Please try again later.");
        setStatus("error");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("inquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        service: formData.service || null,
        message: formData.message.trim(),
        status: "new",
      });

      if (error) {
        console.error("Supabase insert error:", error);
        setErrorMsg(error.message || "Failed to submit. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", service: "", message: "" });
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Let&apos;s Build Together</h1>
          <p className="text-wisdom-muted text-lg">
            Tell us about your project. We&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium mb-2">Service Interest (optional)</label>
            <select
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
            >
              <option value="">Select a category...</option>
              <option value="graphic-print">Graphic & Print Design</option>
              <option value="writing">Writing & Editorial</option>
              <option value="academic">Academic & Research Support</option>
              <option value="data-tech">Data & Tech Solutions</option>
              <option value="web-marketing">Web & Digital Marketing</option>
              <option value="business">Business Strategy & Admin</option>
              <option value="education">Education & Multimedia</option>
              <option value="academy">Wisdom Tower Academy</option>
              <option value="other">Other / Custom</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">Project Details</label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors resize-none"
              placeholder="Tell us about your project, timeline, and any specific requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : (
              <>
                Send Message
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {status === "success" && (
            <p className="text-center text-green-400 text-sm">
              Thank you! Your message has been received. We&apos;ll be in touch soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-red-400 text-sm">
              {errorMsg || "Something went wrong. Please try again."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
