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

  // Get user's role
const { data: admin } = await supabase
  .from("admins")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();

if (admin) {
  redirect("/admin");
}

  // Total scans
  const { count: totalScans } = await supabase
    .from("scans")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  // Phishing scans
  const { count: threatsBlocked } = await supabase
    .from("scans")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("prediction", "phishing");

  return (
    <Dashboard
      user={user}
      totalScans={totalScans ?? 0}
      threatsBlocked={threatsBlocked ?? 0}
    />
  );
}