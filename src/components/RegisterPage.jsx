"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";


export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
  event.preventDefault();

  setError("");
  setMessage("");

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  setLoading(true);

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("SIGNUP DATA:", data);
  console.log("SIGNUP ERROR:", error);

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  if (data.user) {
    setMessage(
      "Account created successfully. Check your email if confirmation is required."
    );
  } else {
    setError("Account was not created.");
  }

  setLoading(false);
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-semibold">
          Create account
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded-lg p-3 mt-6"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg p-3 mt-3"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border rounded-lg p-3 mt-3"
        />

        {error && (
          <p className="text-red-600 text-sm mt-3">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-600 text-sm mt-3">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg mt-5 disabled:bg-red-400"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full mt-4 text-blue-600"
        >
          Back to login
        </button>
      </form>
    </div>
  );
}