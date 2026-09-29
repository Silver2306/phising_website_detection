import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";

import Dashboard from "../../components/Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in
  if (!user) {
    redirect("/");
  }

  // Run dashboard queries together
  const [
    adminResult,
    totalScansResult,
    threatsBlockedResult,
  ] = await Promise.all([
    supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("scans")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id),

    supabase
      .from("scans")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("prediction", "phishing"),
  ]);

  const admin = adminResult.data;
  const totalScans = totalScansResult.count;
  const threatsBlocked = threatsBlockedResult.count;

  return (
    <Dashboard
      user={user}
      totalScans={totalScans ?? 0}
      threatsBlocked={threatsBlocked ?? 0}
      isAdmin={!!admin}
    />
  );
}