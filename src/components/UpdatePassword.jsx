"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

import { RiLockPasswordLine } from "react-icons/ri";
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

export default function UpdatePassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(event) {
    event.preventDefault();

    setError("");

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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        {/* Logo */}
        <div className="logo flex justify-left gap-x-1 items-center mb-4">
          <LiaFishSolid className="text-red-600 text-4xl" />
          <span className="text-2xl font-semibold text-black">PhisSafe</span>
        </div>

        <h1 className="text-2xl font-bold text-black">
          Set New Password
        </h1>

        <p className="text-sm text-gray-500 mt-1 mb-4">
          Choose a secure new password for your PhisSafe account.
        </p>

        <IconInput
          placeholder="New password (min 6 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        >
          <RiLockPasswordLine />
        </IconInput>

        <IconInput
          placeholder="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        >
          <RiLockPasswordLine />
        </IconInput>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mt-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-lg mt-6 text-base disabled:bg-red-400 transition"
        >
          {loading ? "Updating..." : "Update Password"}
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