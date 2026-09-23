"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("NA");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitted");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-1">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter executive email"
        className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition"
      />
      <button
        type="submit"
        className="w-full bg-white text-slate-950 hover:bg-slate-100 font-semibold py-2 px-3 rounded-lg text-xs transition"
      >
        {status === "submitted" ? "Subscribed ✓" : "Subscribe to Bulletin"}
      </button>
    </form>
  );
}
