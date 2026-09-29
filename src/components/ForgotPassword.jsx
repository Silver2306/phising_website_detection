"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

import { MdOutlineMailOutline } from "react-icons/md";
import { LiaFishSolid } from "react-icons/lia";
import { FaArrowLeft } from "react-icons/fa6";

function IconInput({ children, placeholder, type, value, onChange, autoComplete }) {
  return (
    <div className="flex justify-left items-center w-full relative h-12 border mt-3 rounded-lg border-gray-300 focus-within:border-red-600 transition">
      <div className="icon-wrapper w-14 absolute flex justify-center items-center">
        <span className="text-xl opacity-80 text-gray-500">
          {children}
        </span>
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full h-full pl-14 pr-4 outline-none rounded-lg text-black bg-transparent"
      />
    </div>
  );
}

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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset link sent! Please check your email inbox.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        {/* Logo */}
        <div className="logo flex justify-left gap-x-1 items-center mb-4">
          <LiaFishSolid className="text-red-600 text-4xl" />
          <span className="text-2xl font-semibold text-black">PhisSafe</span>
        </div>

        <h1 className="text-2xl font-bold text-black">
          Forgot Password?
        </h1>

        <p className="text-sm text-gray-500 mt-1 mb-4">
          Enter your registered email address and we'll send you a password reset link.
        </p>

        <IconInput
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        >
          <MdOutlineMailOutline />
        </IconInput>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mt-4">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-lg mt-6 text-base disabled:bg-red-400 transition"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
          >
            <FaArrowLeft /> Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}