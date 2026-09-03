"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password reset link sent. Check your email."
    );

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-semibold">
          Forgot password
        </h1>

        <p className="text-gray-500 mt-2">
          Enter your email and we'll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg p-3 mt-6"
        />

        {error && (
          <p className="text-red-600 mt-3 text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 mt-3 text-sm">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 mt-5 rounded-lg disabled:bg-red-400"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}