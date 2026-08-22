"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Dashboard({ user }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-4 text-gray-600">
          Logged in as {user.email}
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}